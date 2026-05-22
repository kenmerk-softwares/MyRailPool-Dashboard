import { useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { collection, getDocs, query, where, limit, startAfter, orderBy, Timestamp } from "firebase/firestore";
import { db } from "../../../shared/services/firebase";
import { setRequests, setLoading } from "../request.slice";
import { serialize } from "../../../shared/utils/serialize";

export const useRequest = () => {
    const dispatch = useDispatch();
    const requests = useSelector((state) => state.request.list);
    const loading = useSelector((state) => state.request.loading);
    const [lastVisible, setLastVisible] = useState(null);
    const [hasMore, setHasMore] = useState(true);

    const fetchRequests = useCallback(async ({ searchQuery = "", activeFilter = "", fromDate = "", toDate = "", isLoadMore = false } = {}) => {
        dispatch(setLoading(true));
        try {
            const requestCollection = collection(db, "customer_request");
            let docs = [];
            let lastDoc = null;

            if (searchQuery) {
                const searchLower = searchQuery.toLowerCase();
                let q = query(requestCollection,
                    where("searchKey", ">=", searchLower),
                    where("searchKey", "<=", searchLower + "\uf8ff"),
                    orderBy("searchKey"),
                    limit(50)
                );

                const snapshot = await getDocs(q);
                docs = snapshot.docs.map((d) => serialize({ id: d.id, ...d.data(), docId: d.id }));

                if (activeFilter && activeFilter !== "Active" && activeFilter !== "All") {
                    docs = docs.filter(d => d.status === activeFilter || d.status === activeFilter.toLowerCase());
                }

                if (fromDate) {
                    const start = new Date(fromDate + "T00:00:00").getTime();
                    docs = docs.filter(d => d.createdAt && d.createdAt >= start);
                }
                if (toDate) {
                    const end = new Date(toDate + "T23:59:59").getTime();
                    docs = docs.filter(d => d.createdAt && d.createdAt <= end);
                }

                setHasMore(false);
                setLastVisible(null);

            } else {
                const constraints = [orderBy("createdAt", "desc")];
                if (isLoadMore && lastVisible) {
                    constraints.push(startAfter(lastVisible));
                }
                constraints.push(limit(100));

                const q = query(requestCollection, ...constraints);
                const snapshot = await getDocs(q);

                docs = snapshot.docs.map((d) => serialize({ id: d.id, ...d.data(), docId: d.id }));
                lastDoc = snapshot.docs[snapshot.docs.length - 1] || null;

                if (activeFilter && activeFilter !== "Active" && activeFilter !== "All") {
                    docs = docs.filter(d => d.status === activeFilter || d.status === activeFilter.toLowerCase());
                }

                if (fromDate) {
                    const start = new Date(fromDate + "T00:00:00").getTime();
                    docs = docs.filter(d => d.createdAt && d.createdAt >= start);
                }
                if (toDate) {
                    const end = new Date(toDate + "T23:59:59").getTime();
                    docs = docs.filter(d => d.createdAt && d.createdAt <= end);
                }

                setLastVisible(lastDoc);
                setHasMore(snapshot.docs.length === 100);
            }

            if (isLoadMore && !searchQuery) {
                dispatch(setRequests([...requests, ...docs]));
            } else {
                dispatch(setRequests(docs));
            }

        } catch (error) {
            console.error("Error fetching requests:", error);
        } finally {
            dispatch(setLoading(false));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, lastVisible]);

    const setGlobalLoading = useCallback((val) => dispatch(setLoading(val)), [dispatch]);

    return { requests, loading, hasMore, fetchRequests, setLoading: setGlobalLoading };
};
