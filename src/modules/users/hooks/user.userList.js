import { useState, useCallback, useRef } from "react";
import { collection, getDocs, query, orderBy, doc, updateDoc, where } from "firebase/firestore";
import { db } from "../../../shared/services/firebase";

export const useUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const allUsersRef = useRef([]);
    const visibleCountRef = useRef(50);
    const prevParamsRef = useRef({ searchQuery: "", activeFilter: "", fromDate: "", toDate: "" });

    const fetchUsers = useCallback(async ({ searchQuery = "", activeFilter = "", fromDate = "", toDate = "", isLoadMore = false } = {}) => {
        setLoading(true);
        try {
            const paramsChanged = 
                searchQuery !== prevParamsRef.current.searchQuery ||
                activeFilter !== prevParamsRef.current.activeFilter ||
                fromDate !== prevParamsRef.current.fromDate ||
                toDate !== prevParamsRef.current.toDate;

            prevParamsRef.current = { searchQuery, activeFilter, fromDate, toDate };

            let rawData = allUsersRef.current;
            const isSearchActive = searchQuery && searchQuery.trim() !== "";

            if (paramsChanged || !isLoadMore || rawData.length === 0) {
                const usersCollection = collection(db, "users");

                if (isSearchActive) {
                    const searchVal = searchQuery.trim();
                    const queries = [];

                    // 1. Exact match variations (name in variations list)
                    const variations = Array.from(new Set([
                        searchVal,
                        searchVal.toLowerCase(),
                        searchVal.toUpperCase(),
                        searchVal.replace(/\b\w/g, c => c.toUpperCase()),
                        searchVal.charAt(0).toUpperCase() + searchVal.slice(1).toLowerCase()
                    ]));
                    queries.push(query(usersCollection, where("name", "in", variations)));

                    // 2. Prefix search on capitalized name (e.g. starts with "John")
                    const titleCased = searchVal.replace(/\b\w/g, c => c.toUpperCase());
                    queries.push(query(usersCollection, where("name", ">=", titleCased), where("name", "<=", titleCased + "\uf8ff")));

                    // 3. Prefix search on lowercase name (e.g. starts with "john")
                    const lowerCased = searchVal.toLowerCase();
                    queries.push(query(usersCollection, where("name", ">=", lowerCased), where("name", "<=", lowerCased + "\uf8ff")));

                    // 4. If search matches email format, query by email
                    if (searchVal.includes("@")) {
                        queries.push(query(usersCollection, where("email", "==", searchVal.toLowerCase())));
                    }

                    // 5. If search matches mobile digits, query by mobile (as string and number)
                    const mobileNum = Number(searchVal);
                    if (!isNaN(mobileNum)) {
                        queries.push(query(usersCollection, where("mobile", "==", searchVal)));
                        queries.push(query(usersCollection, where("mobile", "==", mobileNum)));
                    }

                    // 6. If search query is a valid date (e.g. "2026-07-01", "7/1/2026"), do a direct exact date range query
                    const parsedSearchDate = new Date(searchVal);
                    if (!isNaN(parsedSearchDate.getTime())) {
                        const datePattern = /^[0-9/\-\s,]+$|^[a-zA-Z]+\s+\d{1,2}/;
                        if (datePattern.test(searchVal)) {
                            const start = new Date(parsedSearchDate);
                            start.setHours(0, 0, 0, 0);
                            const end = new Date(parsedSearchDate);
                            end.setHours(23, 59, 59, 999);
                            queries.push(query(usersCollection, where("createdAt", ">=", start), where("createdAt", "<=", end)));
                        }
                    }

                    // Run all queries in parallel and de-duplicate results by doc ID
                    const snapshots = await Promise.all(queries.map(q => getDocs(q).catch(() => ({ docs: [] }))));
                    const docMap = new Map();

                    snapshots.forEach(snapshot => {
                        if (snapshot && snapshot.docs) {
                            snapshot.docs.forEach(doc => {
                                docMap.set(doc.id, {
                                    id: doc.id,
                                    ...doc.data(),
                                    docId: doc.id
                                });
                            });
                        }
                    });

                    rawData = Array.from(docMap.values());
                } else if (fromDate || toDate) {
                    // Direct date range query from Firebase
                    const constraints = [];
                    if (fromDate) {
                        const start = new Date(fromDate + "T00:00:00");
                        constraints.push(where("createdAt", ">=", start));
                    }
                    if (toDate) {
                        const end = new Date(toDate + "T23:59:59");
                        constraints.push(where("createdAt", "<=", end));
                    }
                    constraints.push(orderBy("createdAt", "desc"));
                    const q = query(usersCollection, ...constraints);
                    const querySnapshot = await getDocs(q);
                    rawData = querySnapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                        docId: doc.id
                    }));
                } else {
                    const q = query(usersCollection, orderBy("createdAt", "desc"));
                    const querySnapshot = await getDocs(q);
                    rawData = querySnapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                        docId: doc.id
                    }));
                }
                allUsersRef.current = rawData;
            }

            // Apply search filter
            let filtered = rawData;
            if (searchQuery && searchQuery.trim() !== "") {
                const s = searchQuery.toLowerCase();
                filtered = filtered.filter(user => 
                    (user.name && user.name.toLowerCase().includes(s)) ||
                    (user.mobile && String(user.mobile).toLowerCase().includes(s)) ||
                    (user.email && user.email.toLowerCase().includes(s))
                );
            }

            if (activeFilter && activeFilter.trim() !== "") {
                filtered = filtered.filter(user => 
                    user.status && user.status.toLowerCase() === activeFilter.toLowerCase()
                );
            }

            // Apply date filters client-side
            if (fromDate || toDate) {
                const fromTime = fromDate ? new Date(fromDate + "T00:00:00").getTime() : null;
                const toTime = toDate ? new Date(toDate + "T23:59:59").getTime() : null;

                filtered = filtered.filter(user => {
                    let userTime = null;
                    if (user.createdAt) {
                        if (typeof user.createdAt.toDate === 'function') {
                            userTime = user.createdAt.toDate().getTime();
                        } else if (user.createdAt.seconds !== undefined) {
                            userTime = user.createdAt.seconds * 1000;
                        } else {
                            userTime = new Date(user.createdAt).getTime();
                        }
                    }

                    if (!userTime) return false;
                    if (fromTime && userTime < fromTime) return false;
                    if (toTime && userTime > toTime) return false;
                    return true;
                });
            }

            if (!isLoadMore) {
                visibleCountRef.current = 50;
            } else {
                visibleCountRef.current += 50;
            }

            const sliced = filtered.slice(0, visibleCountRef.current);
            setUsers(sliced);
            setHasMore(visibleCountRef.current < filtered.length);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    const updateUserName = useCallback(async (userId, newName) => {
        try {
            const docRef = doc(db, "users", userId);
            await updateDoc(docRef, { name: newName });
            
            // Update local ref & state
            allUsersRef.current = allUsersRef.current.map((user) => 
                user.id === userId ? { ...user, name: newName } : user
            );
            setUsers((prevUsers) => 
                prevUsers.map((user) => 
                    user.id === userId ? { ...user, name: newName } : user
                )
            );
            return { success: true };
        } catch (error) {
            console.error("Error updating user name:", error);
            return { success: false, error };
        }
    }, []);

    return { users, loading, hasMore, fetchUsers, updateUserName };
};
