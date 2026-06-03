import { useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../../../shared/services/firebase";
import { setUsers, setLoading } from "../user.slice";
import { serialize } from "../../../shared/utils/serialize";

export const useUsers = () => {
    const dispatch = useDispatch();
    const users = useSelector((state) => state.user.list);
    const loading = useSelector((state) => state.user.loading);
    const [hasMore, setHasMore] = useState(true);

    const allUsersRef = useRef([]);
    const visibleCountRef = useRef(10);

    const fetchUsers = useCallback(async ({ searchQuery = "", activeFilter = "", isLoadMore = false } = {}) => {
        dispatch(setLoading(true));
        try {
            let rawData = allUsersRef.current;

            if (!isLoadMore || rawData.length === 0) {
                const usersCollection = collection(db, "admin-users");
                const q = query(usersCollection, orderBy("name"));
                const querySnapshot = await getDocs(q);
                rawData = serialize(querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data()
                })));
                allUsersRef.current = rawData;
            }

            // Apply search filter client-side (case-insensitive)
            let filtered = rawData;
            if (searchQuery && searchQuery.trim() !== "") {
                const s = searchQuery.toLowerCase().trim();
                filtered = filtered.filter(user => 
                    (user.name && user.name.toLowerCase().includes(s)) ||
                    (user.email && user.email.toLowerCase().includes(s)) ||
                    (user.designation && user.designation.toLowerCase().includes(s))
                );
            }

            // Apply status filter client-side (case-insensitive)
            if (activeFilter && activeFilter.trim() !== "") {
                filtered = filtered.filter(user => 
                    // Admin users status is usually Active, check default or field
                    (user.status || "Active").toLowerCase() === activeFilter.toLowerCase()
                );
            }

            // Handle pagination slicing client-side
            if (!isLoadMore) {
                visibleCountRef.current = 10;
            } else {
                visibleCountRef.current += 10;
            }

            const sliced = filtered.slice(0, visibleCountRef.current);
            dispatch(setUsers(sliced));
            setHasMore(visibleCountRef.current < filtered.length);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            dispatch(setLoading(false));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch]);

    const setGlobalLoading = useCallback((val) => dispatch(setLoading(val)), [dispatch]);

    return { users, loading, hasMore, fetchUsers, setLoading: setGlobalLoading };
};