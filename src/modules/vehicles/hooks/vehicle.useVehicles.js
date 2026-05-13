import { useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { collection, getDocs, query, where, limit, startAfter, orderBy } from "firebase/firestore";
import { db } from "../../../shared/services/firebase";
import { setVehicles, setLoading } from "../vehicle.slice";
import { serialize } from "../../../shared/utils/serialize";

export const useVehicles = () => {
    const dispatch = useDispatch();
    const vehicles = useSelector((state) => state.vehicle.list);
    const loading = useSelector((state) => state.vehicle.loading);
    const [lastVisible, setLastVisible] = useState(null);
    const [hasMore, setHasMore] = useState(true);

    const fetchVehicles = useCallback(async ({ searchQuery = "", isLoadMore = false } = {}) => {
        dispatch(setLoading(true));
        try {
            const vehiclesCollection = collection(db, "vehicles");
            let q;
            if (searchQuery) {
                // Assuming we search by registration number or similar
                const searchUpper = searchQuery.toUpperCase();
                q = query(vehiclesCollection, 
                    where("registrationNo", ">=", searchUpper), 
                    where("registrationNo", "<=", searchUpper + "\uf8ff"),
                    orderBy("registrationNo")
                );
            } else {
                q = query(vehiclesCollection, orderBy("registrationNo"));
            }

            q = query(q, limit(50));

            if (isLoadMore && lastVisible) {
                q = query(q, startAfter(lastVisible));
            }

            const querySnapshot = await getDocs(q);
            const vehiclesData = serialize(querySnapshot.docs.map((doc) => ({
                ...doc.data(),
                docId: doc.id
            })));

            if (isLoadMore) {
                dispatch(setVehicles([...vehicles, ...vehiclesData]));
            } else {
                dispatch(setVehicles(vehiclesData));
                setLastVisible(null);
            }

            const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1] || null;
            setLastVisible(lastDoc);
            setHasMore(querySnapshot.docs.length === 50);
        } catch (error) {
            console.error("Error fetching vehicles:", error);
        } finally {
            dispatch(setLoading(false));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, lastVisible]);

    const setGlobalLoading = useCallback((val) => dispatch(setLoading(val)), [dispatch]);

    return { vehicles, loading, hasMore, fetchVehicles, setLoading: setGlobalLoading };
};
