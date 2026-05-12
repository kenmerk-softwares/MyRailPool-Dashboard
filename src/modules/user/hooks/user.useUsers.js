import { useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { collection, getDocs, query, where, limit, startAfter, orderBy } from "firebase/firestore";
import { db } from "../../../Config/Config";
import { setUsers, setLoading } from "../user.slice";
import { serialize } from "../../../shared/utils/serialize";

export const useUsers = () => {
    const dispatch = useDispatch();
    const users = useSelector((state) => state.user.list);
    const loading = useSelector((state) => state.user.loading);
    const [lastVisible, setLastVisible] = useState(null);
    const [hasMore, setHasMore] = useState(true);

    const fetchUsers = useCallback(async ({ searchQuery = "", activeFilter = "", isLoadMore = false } = {}) => {
        dispatch(setLoading(true));
        try {
            const usersCollection = collection(db, "admin-users");
            let q = query(usersCollection, orderBy("name"), limit(10));

            if (activeFilter && activeFilter !== "Active") {
                q = query(q, where("status", "==", activeFilter));
            }

            if (searchQuery) {
                q = query(q, 
                    where("name", ">=", searchQuery), 
                    where("name", "<=", searchQuery + "\uf8ff")
                );
            }

            if (isLoadMore && lastVisible) {
                q = query(q, startAfter(lastVisible));
            }

            const querySnapshot = await getDocs(q);
            const usersData = serialize(querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data()
            })));

            if (isLoadMore) {
                dispatch(setUsers([...users, ...usersData]));
            } else {
                dispatch(setUsers(usersData));
                setLastVisible(null);
            }

            const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1] || null;
            setLastVisible(lastDoc);
            setHasMore(querySnapshot.docs.length === 10);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            dispatch(setLoading(false));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, lastVisible]);

    const setGlobalLoading = useCallback((val) => dispatch(setLoading(val)), [dispatch]);

    return { users, loading, hasMore, fetchUsers, setLoading: setGlobalLoading };
};