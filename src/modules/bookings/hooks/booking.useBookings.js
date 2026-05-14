import { useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { collection, getDocs, query, where, limit, startAfter, orderBy } from "firebase/firestore";
import { db } from "../../../shared/services/firebase";
import { setBookings, setLoading } from "../booking.slice";
import { serialize } from "../../../shared/utils/serialize";

export const useBookings = () => {
    const dispatch = useDispatch();
    const bookings = useSelector((state) => state.booking.list);
    const loading = useSelector((state) => state.booking.loading);
    const [lastVisible, setLastVisible] = useState(null);
    const [hasMore, setHasMore] = useState(true);

    const fetchBookings = useCallback(async ({ searchQuery = "", activeFilter = "", isLoadMore = false } = {}) => {
        dispatch(setLoading(true));
        try {
            const bookingsCollection = collection(db, "bookings");
            let q = query(bookingsCollection, orderBy("req_date", "desc"), limit(10));

            if (activeFilter && activeFilter !== "" && activeFilter !== "All Status") {
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
            const bookingsData = serialize(querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data()
            })));

            if (isLoadMore) {
                dispatch(setBookings([...bookings, ...bookingsData]));
            } else {
                dispatch(setBookings(bookingsData));
                setLastVisible(null);
            }

            const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1] || null;
            setLastVisible(lastDoc);
            setHasMore(querySnapshot.docs.length === 10);
        } catch (error) {
            console.error("Error fetching bookings:", error);
        } finally {
            dispatch(setLoading(false));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, lastVisible]);

    const setGlobalLoading = useCallback((val) => dispatch(setLoading(val)), [dispatch]);

    return { bookings, loading, hasMore, fetchBookings, setLoading: setGlobalLoading };
};