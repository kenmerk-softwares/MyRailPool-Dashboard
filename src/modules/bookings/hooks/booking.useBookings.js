import { useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { collection, getDocs, query, orderBy, where, limit } from "firebase/firestore";
import { db } from "../../../shared/services/firebase";
import { setBookings, setLoading } from "../booking.slice";
import { serialize } from "../../../shared/utils/serialize";

// this hook fetches bookings from firestore
// each doc = one trip on one date, and passengers are inside a users[] array

export const useBookings = () => {
    const dispatch = useDispatch();
    const bookings = useSelector((state) => state.booking.list);
    const loading = useSelector((state) => state.booking.loading);
    const [hasMore, setHasMore] = useState(true);

    const allBookingsRef = useRef([]);
    const visibleCountRef = useRef(15);
    const allFilteredBookingsRef = useRef([]);
    const prevParamsRef = useRef({ searchQuery: "", activeFilter: "", fromDate: "", toDate: "" });

    const fetchBookings = useCallback(async ({
        searchQuery = "",
        activeFilter = "",
        fromDate = "",
        toDate = "",
        isLoadMore = false,
        limit: queryLimit = null
    } = {}) => {
        dispatch(setLoading(true));
        try {
            const paramsChanged = 
                searchQuery !== prevParamsRef.current.searchQuery ||
                activeFilter !== prevParamsRef.current.activeFilter ||
                fromDate !== prevParamsRef.current.fromDate ||
                toDate !== prevParamsRef.current.toDate;

            prevParamsRef.current = { searchQuery, activeFilter, fromDate, toDate };

            let rawData = allBookingsRef.current;
            const isSearchActive = searchQuery && searchQuery.trim() !== "";

            if (paramsChanged || !isLoadMore || rawData.length === 0) {
                const colRef = collection(db, "bookings");

                if (isSearchActive) {
                    const searchVal = searchQuery.trim();
                    const queries = [];

                    // 1. Exact match variations (driver_name, route_name, route_start, route_end, name)
                    const variations = Array.from(new Set([
                        searchVal,
                        searchVal.toLowerCase(),
                        searchVal.toUpperCase(),
                        searchVal.replace(/\b\w/g, c => c.toUpperCase()),
                        searchVal.charAt(0).toUpperCase() + searchVal.slice(1).toLowerCase()
                    ]));
                    queries.push(query(colRef, where("driver_name", "in", variations)));
                    queries.push(query(colRef, where("route_name", "in", variations)));
                    queries.push(query(colRef, where("route_start", "in", variations)));
                    queries.push(query(colRef, where("route_end", "in", variations)));

                    // 2. Prefix search on driver_name and route_name
                    const titleCased = searchVal.replace(/\b\w/g, c => c.toUpperCase());
                    queries.push(query(colRef, where("driver_name", ">=", titleCased), where("driver_name", "<=", titleCased + "\uf8ff")));
                    queries.push(query(colRef, where("route_name", ">=", titleCased), where("route_name", "<=", titleCased + "\uf8ff")));

                    const lowerCased = searchVal.toLowerCase();
                    queries.push(query(colRef, where("driver_name", ">=", lowerCased), where("driver_name", "<=", lowerCased + "\uf8ff")));
                    queries.push(query(colRef, where("route_name", ">=", lowerCased), where("route_name", "<=", lowerCased + "\uf8ff")));

                    // 3. Trip number search (if numerical)
                    const tripNoNum = Number(searchVal);
                    if (!isNaN(tripNoNum)) {
                        queries.push(query(colRef, where("tripNo", "==", tripNoNum)));
                    }

                    // 4. Exact selectedDate search if matches YYYY-MM-DD
                    const dateReg = /^\d{4}-\d{2}-\d{2}$/;
                    if (dateReg.test(searchVal)) {
                        queries.push(query(colRef, where("selectedDate", "==", searchVal)));
                    }

                    // 5. Look up users by name in the users collection, and find bookings by their userIds array
                    try {
                        const usersCollection = collection(db, "users");
                        const userQueries = [];
                        userQueries.push(query(usersCollection, where("name", "in", variations)));
                        userQueries.push(query(usersCollection, where("name", ">=", titleCased), where("name", "<=", titleCased + "\uf8ff")));
                        userQueries.push(query(usersCollection, where("name", ">=", lowerCased), where("name", "<=", lowerCased + "\uf8ff")));

                        const userSnapshots = await Promise.all(userQueries.map(uq => getDocs(uq).catch(() => ({ docs: [] }))));
                        const matchingUserIds = [];
                        userSnapshots.forEach(snap => {
                            if (snap && snap.docs) {
                                snap.docs.forEach(doc => {
                                    matchingUserIds.push(doc.id);
                                });
                            }
                        });

                        const uniqueUserIds = Array.from(new Set(matchingUserIds)).slice(0, 10);
                        if (uniqueUserIds.length > 0) {
                            queries.push(query(colRef, where("userIds", "array-contains-any", uniqueUserIds)));
                        }
                    } catch (err) {
                        console.error("Error performing sub-query for users in bookings search:", err);
                    }
                    const snapshots = await Promise.all(queries.map(q => getDocs(q).catch(() => ({ docs: [] }))));
                    const docMap = new Map();

                    snapshots.forEach(snapshot => {
                        if (snapshot && snapshot.docs) {
                            snapshot.docs.forEach(doc => {
                                docMap.set(doc.id, {
                                    id: doc.id,
                                    ...doc.data()
                                });
                            });
                        }
                    });

                    rawData = serialize(Array.from(docMap.values()));
                } else if (fromDate || toDate) {
                    const queries = [];

                    // Query 1: by updatedAt range (Timestamp comparison)
                    const constraints1 = [];
                    if (fromDate) {
                        const start = new Date(fromDate + "T00:00:00");
                        constraints1.push(where("updatedAt", ">=", start));
                    }
                    if (toDate) {
                        const end = new Date(toDate + "T23:59:59");
                        constraints1.push(where("updatedAt", "<=", end));
                    }
                    constraints1.push(orderBy("updatedAt", "desc"));
                    if (queryLimit) {
                        constraints1.push(limit(queryLimit));
                    }
                    queries.push(query(colRef, ...constraints1));

                    // Query 2: by selectedDate range (string YYYY-MM-DD comparison)
                    const constraints2 = [];
                    if (fromDate) {
                        constraints2.push(where("selectedDate", ">=", fromDate));
                    }
                    if (toDate) {
                        constraints2.push(where("selectedDate", "<=", toDate));
                    }
                    if (queryLimit) {
                        constraints2.push(limit(queryLimit));
                    }
                    queries.push(query(colRef, ...constraints2));

                    const snapshots = await Promise.all(queries.map(q => getDocs(q).catch(() => ({ docs: [] }))));
                    const docMap = new Map();

                    snapshots.forEach(snapshot => {
                        if (snapshot && snapshot.docs) {
                            snapshot.docs.forEach(doc => {
                                docMap.set(doc.id, {
                                    id: doc.id,
                                    ...doc.data()
                                });
                            });
                        }
                    });

                    // Sort merged results by updatedAt desc in memory
                    const mergedData = Array.from(docMap.values()).sort((a, b) => {
                        const timeA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
                        const timeB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
                        return timeB - timeA;
                    });

                    rawData = serialize(mergedData);
                } else {
                    let q = query(colRef, orderBy("updatedAt", "desc"));
                    if (queryLimit) {
                        q = query(colRef, orderBy("updatedAt", "desc"), limit(queryLimit));
                    }
                    const querySnapshot = await getDocs(q);
                    rawData = serialize(querySnapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data()
                    })));
                }
                allBookingsRef.current = rawData;
            }

            // Apply search filter client-side (case-insensitive)
            let filtered = rawData;
            if (searchQuery && searchQuery.trim() !== "") {
                const s = searchQuery.toLowerCase().trim();
                filtered = filtered.filter(booking => {
                    const tripNoStr = booking.tripNo !== undefined ? String(booking.tripNo) : "";
                    const matchesBookingInfo = (
                        tripNoStr.includes(s) ||
                        (booking.route_name && booking.route_name.toLowerCase().includes(s)) ||
                        (booking.driver_name && booking.driver_name.toLowerCase().includes(s)) ||
                        (booking.route_start && booking.route_start.toLowerCase().includes(s)) ||
                        (booking.route_end && booking.route_end.toLowerCase().includes(s)) ||
                        (booking.id && booking.id.toLowerCase().includes(s))
                    );

                    if (matchesBookingInfo) return true;

                    // Search by passenger/user name & mobile within the booking users and sub-passengers
                    const matchesUserOrPassenger = Array.isArray(booking.users) && booking.users.some(u => {
                        if (!u) return false;
                        const userName = String(u.name || u.displayName || "").toLowerCase();
                        const userMobile = String(u.mobile || u.phone || u.phoneNumber || "").toLowerCase();
                        if (userName.includes(s) || userMobile.includes(s)) return true;

                        return Array.isArray(u.passengers) && u.passengers.some(p => {
                            if (!p) return false;
                            const pName = String(p.name || "").toLowerCase();
                            const pMobile = String(p.mobile || p.phone || "").toLowerCase();
                            return pName.includes(s) || pMobile.includes(s);
                        });
                    });

                    return matchesUserOrPassenger;
                });
            }

            // Apply status filter client-side
            if (activeFilter && activeFilter.trim() !== "") {
                filtered = filtered.filter((booking) => {
                    const users = booking.users || [];
                    const hasPending = users.some((u) => u.status === "Pending");
                    const docStatus = hasPending ? "Pending" : "Confirmed";
                    return docStatus.toLowerCase() === activeFilter.toLowerCase();
                });
            }

            // Apply date filters client-side
            if (fromDate || toDate) {
                const fromTime = fromDate ? new Date(fromDate + "T00:00:00").getTime() : null;
                const toTime = toDate ? new Date(toDate + "T23:59:59").getTime() : null;

                filtered = filtered.filter(booking => {
                    let bookingTime = null;
                    if (booking.updatedAt) {
                        bookingTime = new Date(booking.updatedAt).getTime();
                    } else if (booking.createdAt) {
                        bookingTime = new Date(booking.createdAt).getTime();
                    }

                    const timeMatches = bookingTime && (!fromTime || bookingTime >= fromTime) && (!toTime || bookingTime <= toTime);

                    const selectedMatches = booking.selectedDate && (() => {
                        const dTime = new Date(booking.selectedDate + "T00:00:00").getTime();
                        return (!fromTime || dTime >= fromTime) && (!toTime || dTime <= toTime);
                    })();

                    return timeMatches || selectedMatches;
                });
            }

            // Handle pagination slicing client-side
            if (!isLoadMore) {
                visibleCountRef.current = 15;
            } else {
                visibleCountRef.current += 15;
            }

            const sliced = filtered.slice(0, visibleCountRef.current);
            dispatch(setBookings(sliced));
            setHasMore(visibleCountRef.current < filtered.length);
            allFilteredBookingsRef.current = filtered;

        } catch (error) {
            console.error("Error fetching bookings:", error);
        } finally {
            dispatch(setLoading(false));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch]);

    const setGlobalLoading = useCallback((val) => dispatch(setLoading(val)), [dispatch]);

    return { bookings, loading, hasMore, fetchBookings, setLoading: setGlobalLoading, allFilteredBookingsRef };
};