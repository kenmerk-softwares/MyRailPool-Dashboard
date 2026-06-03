import { useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
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

    const fetchBookings = useCallback(async ({
        searchQuery = "",
        activeFilter = "",
        fromDate = "",
        toDate = "",
        isLoadMore = false
    } = {}) => {
        dispatch(setLoading(true));
        try {
            let rawData = allBookingsRef.current;

            if (!isLoadMore || rawData.length === 0) {
                const colRef = collection(db, "bookings");
                const q = query(colRef, orderBy("updatedAt", "desc"));
                const querySnapshot = await getDocs(q);
                rawData = serialize(querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data()
                })));
                allBookingsRef.current = rawData;
            }

            // Apply search filter client-side (case-insensitive)
            let filtered = rawData;
            if (searchQuery && searchQuery.trim() !== "") {
                const s = searchQuery.toLowerCase().trim();
                filtered = filtered.filter(booking => {
                    const tripNoStr = booking.tripNo !== undefined ? String(booking.tripNo) : "";
                    return (
                        tripNoStr.includes(s) ||
                        (booking.route_name && booking.route_name.toLowerCase().includes(s)) ||
                        (booking.driver_name && booking.driver_name.toLowerCase().includes(s)) ||
                        (booking.route_start && booking.route_start.toLowerCase().includes(s)) ||
                        (booking.route_end && booking.route_end.toLowerCase().includes(s)) ||
                        (booking.id && booking.id.toLowerCase().includes(s))
                    );
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

        } catch (error) {
            console.error("Error fetching bookings:", error);
        } finally {
            dispatch(setLoading(false));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch]);

    const setGlobalLoading = useCallback((val) => dispatch(setLoading(val)), [dispatch]);

    return { bookings, loading, hasMore, fetchBookings, setLoading: setGlobalLoading };
};