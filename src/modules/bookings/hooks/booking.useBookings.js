import { useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { collection, getDocs, query, where, limit, startAfter, orderBy, Timestamp } from "firebase/firestore";
import { db } from "../../../shared/services/firebase";
import { setBookings, setLoading } from "../booking.slice";
import { serialize } from "../../../shared/utils/serialize";

// this hook fetches bookings from firestore
// each doc = one trip on one date, and passengers are inside a users[] array

export const useBookings = () => {
    const dispatch = useDispatch();
    const bookings = useSelector((state) => state.booking.list);
    const loading = useSelector((state) => state.booking.loading);
    const [lastVisible, setLastVisible] = useState(null);
    const [hasMore, setHasMore] = useState(true);

    const fetchBookings = useCallback(async ({
        searchQuery = "",
        activeFilter = "",
        fromDate = "",
        toDate = "",
        isLoadMore = false
    } = {}) => {
        dispatch(setLoading(true));
        try {
            const colRef = collection(db, "bookings");
            let docs = [];
            let lastDoc = null;

            // if user typed something in the search box
            if (searchQuery && searchQuery.trim() !== "") {
                const s = searchQuery.trim();

                // run 3 queries at the same time for route name and driver name
                const queryPromises = [
                    getDocs(query(
                        colRef,
                        where("route_name", ">=", s),
                        where("route_name", "<=", s + "\uf8ff"),
                        limit(15)
                    )),
                    getDocs(query(
                        colRef,
                        where("driver_name", ">=", s),
                        where("driver_name", "<=", s + "\uf8ff"),
                        limit(15)
                    )),
                ];

                // also search by trip number if the input looks like a number
                if (!isNaN(s) && s !== "") {
                    queryPromises.push(
                        getDocs(query(
                            colRef,
                            where("tripNo", "==", Number(s)),
                            limit(5)
                        ))
                    );
                }

                const snapshots = await Promise.all(queryPromises);

                // merge all results and remove duplicates
                const seen = new Set();
                snapshots.forEach((snap) => {
                    snap.docs.forEach((d) => {
                        if (!seen.has(d.id)) {
                            const data = serialize({ id: d.id, ...d.data() });

                            // check status filter — status is inside users[] so we do it here
                            if (activeFilter) {
                                const users = data.users || [];
                                const hasPending = users.some((u) => u.status === "Pending");
                                const docStatus = hasPending ? "Pending" : "Confirmed";
                                if (docStatus !== activeFilter) return;
                            }

                            seen.add(d.id);
                            docs.push(data);
                        }
                    });
                });

                // no pagination when searching
                setHasMore(false);
                setLastVisible(null);

            // normal browse — just fetch latest bookings
            } else {
                const constraints = [orderBy("updatedAt", "desc")];

                // filter by date range if the user picked dates
                if (fromDate) {
                    constraints.push(where("updatedAt", ">=", Timestamp.fromDate(new Date(fromDate + "T00:00:00"))));
                }
                if (toDate) {
                    constraints.push(where("updatedAt", "<=", Timestamp.fromDate(new Date(toDate + "T23:59:59"))));
                }

                // load more uses cursor to continue from where we left off
                if (isLoadMore && lastVisible) {
                    constraints.push(startAfter(lastVisible));
                }
                constraints.push(limit(15));

                const snapshot = await getDocs(query(colRef, ...constraints));
                docs = snapshot.docs.map((d) => serialize({ id: d.id, ...d.data() }));

                // status is inside users[] so we filter it here manually
                if (activeFilter) {
                    docs = docs.filter((d) => {
                        const users = d.users || [];
                        if (users.length === 0) return false;
                        const hasPending = users.some((u) => u.status === "Pending");
                        return (hasPending ? "Pending" : "Confirmed") === activeFilter;
                    });
                }

                lastDoc = snapshot.docs[snapshot.docs.length - 1] || null;
                setLastVisible(lastDoc);
                setHasMore(snapshot.docs.length === 15);
            }

            // if loading more, add to existing list, else replace
            if (isLoadMore && !searchQuery) {
                dispatch(setBookings([...bookings, ...docs]));
            } else {
                dispatch(setBookings(docs));
            }

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