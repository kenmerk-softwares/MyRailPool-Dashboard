import { useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../../../shared/services/firebase";
import { setRequests, setLoading } from "../request.slice";
import { serialize } from "../../../shared/utils/serialize";

export const useRequest = () => {
    const dispatch = useDispatch();
    const requests = useSelector((state) => state.request.list);
    const loading = useSelector((state) => state.request.loading);
    const [hasMore, setHasMore] = useState(true);

    const allRequestsRef = useRef([]);
    const visibleCountRef = useRef(100);

    const fetchRequests = useCallback(async ({ searchQuery = "", activeFilter = "", fromDate = "", toDate = "", isLoadMore = false } = {}) => {
        dispatch(setLoading(true));
        try {
            let rawData = allRequestsRef.current;

            if (!isLoadMore || rawData.length === 0) {
                const requestCollection = collection(db, "customer_request");
                const q = query(requestCollection, orderBy("createdAt", "desc"));
                const querySnapshot = await getDocs(q);
                rawData = serialize(querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                    docId: doc.id
                })));
                allRequestsRef.current = rawData;
            }

            // Apply search filter client-side (case-insensitive)
            let filtered = rawData;
            if (searchQuery && searchQuery.trim() !== "") {
                const s = searchQuery.toLowerCase().trim();
                filtered = filtered.filter(req => 
                    (req.fullName && req.fullName.toLowerCase().includes(s)) ||
                    (req.commutingStation && req.commutingStation.toLowerCase().includes(s)) ||
                    (req.mobileNumber && req.mobileNumber.toLowerCase().includes(s)) ||
                    (req.id && req.id.toLowerCase().includes(s))
                );
            }

            // Apply status filter client-side (case-insensitive)
            if (activeFilter && activeFilter.trim() !== "" && activeFilter !== "All") {
                filtered = filtered.filter(req => 
                    req.status && req.status.toLowerCase() === activeFilter.toLowerCase()
                );
            }

            // Apply date filters client-side
            if (fromDate || toDate) {
                const fromTime = fromDate ? new Date(fromDate + "T00:00:00").getTime() : null;
                const toTime = toDate ? new Date(toDate + "T23:59:59").getTime() : null;

                filtered = filtered.filter(req => {
                    const reqTime = req.createdAt 
                        ? (req.createdAt.seconds ? req.createdAt.seconds * 1000 : new Date(req.createdAt).getTime())
                        : null;

                    if (!reqTime || isNaN(reqTime)) return true;
                    if (fromTime && reqTime < fromTime) return false;
                    if (toTime && reqTime > toTime) return false;
                    return true;
                });
            }

            // Handle pagination slicing client-side
            if (!isLoadMore) {
                visibleCountRef.current = 100;
            } else {
                visibleCountRef.current += 100;
            }

            const sliced = filtered.slice(0, visibleCountRef.current);
            dispatch(setRequests(sliced));
            setHasMore(visibleCountRef.current < filtered.length);

        } catch (error) {
            console.error("Error fetching requests:", error);
        } finally {
            dispatch(setLoading(false));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch]);

    const setGlobalLoading = useCallback((val) => dispatch(setLoading(val)), [dispatch]);

    return { requests, loading, hasMore, fetchRequests, setLoading: setGlobalLoading };
};
