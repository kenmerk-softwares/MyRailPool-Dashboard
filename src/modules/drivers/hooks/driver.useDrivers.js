import { useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { collection, getDocs, query, where, limit, startAfter, orderBy } from "firebase/firestore";
import { db } from "../../../shared/services/firebase";
import { setDrivers, setLoading } from "../driver.slice";
import { serialize } from "../../../shared/utils/serialize";

export const useDrivers = () => {
    const dispatch = useDispatch();
    const drivers = useSelector((state) => state.driver.list);
    const loading = useSelector((state) => state.driver.loading);
    const [lastVisible, setLastVisible] = useState(null);
    const [hasMore, setHasMore] = useState(true);

    const fetchDrivers = useCallback(async ({ searchQuery = "", activeFilter = "", isLoadMore = false } = {}) => {
        dispatch(setLoading(true));
        try {
            const driversCollection = collection(db, "drivers");
            let q;
            if (searchQuery) {
                const searchLower = searchQuery.toLowerCase();
                q = query(driversCollection, 
                    where("searchKey", ">=", searchLower), 
                    where("searchKey", "<=", searchLower + "\uf8ff"),
                    orderBy("searchKey")
                );
            } else {
                q = query(driversCollection, orderBy("name"));
            }

            if (activeFilter && activeFilter !== "Active") {
                q = query(q, where("status", "==", activeFilter.toLowerCase()));
            }

            q = query(q, limit(50));

            if (isLoadMore && lastVisible) {
                q = query(q, startAfter(lastVisible));
            }

            const querySnapshot = await getDocs(q);
            const driversData = serialize(querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
                docId: doc.id
            })));

            if (isLoadMore) {
                dispatch(setDrivers([...drivers, ...driversData]));
            } else {
                dispatch(setDrivers(driversData));
                setLastVisible(null);
            }

            const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1] || null;
            setLastVisible(lastDoc);
            setHasMore(querySnapshot.docs.length === 50);
        } catch (error) {
            console.error("Error fetching drivers:", error);
        } finally {
            dispatch(setLoading(false));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, lastVisible]);

    const setGlobalLoading = useCallback((val) => dispatch(setLoading(val)), [dispatch]);

    return { drivers, loading, hasMore, fetchDrivers, setLoading: setGlobalLoading };
};
