import { useState, useCallback, useRef } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../../../shared/services/firebase";

export const useUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const allUsersRef = useRef([]);
    const visibleCountRef = useRef(50);

    const fetchUsers = useCallback(async ({ searchQuery = "", activeFilter = "", isLoadMore = false } = {}) => {
        setLoading(true);
        try {
            let rawData = allUsersRef.current;

            if (!isLoadMore || rawData.length === 0) {
                const usersCollection = collection(db, "users");
                const q = query(usersCollection, orderBy("createdAt", "desc"));
                const querySnapshot = await getDocs(q);
                rawData = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                    docId: doc.id
                }));
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

    return { users, loading, hasMore, fetchUsers };
};
