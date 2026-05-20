import { useState, useCallback, useRef } from "react";
import { collection, getDocs, query, where, limit, startAfter, orderBy, doc, updateDoc } from "firebase/firestore";
import { db } from "../../../shared/services/firebase";
import { serialize } from "../../../shared/utils/serialize";

export const useRouteReqs = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const lastVisibleRef = useRef(null);

    const fetchRequests = useCallback(async ({
        searchTerm = "",
        statusFilter = "All Status",
        dateFilter = "",
        isLoadMore = false
    } = {}) => {
        setLoading(true);
        setError(null);
        try {
            const colRef = collection(db, "route_request");
            const constraints = [];

            // Apply status filter if it is not "All Status"
            if (statusFilter && statusFilter !== "All Status") {
                constraints.push(where("status", "==", statusFilter));
            }

            // Order by createdAt descending
            constraints.push(orderBy("createdAt", "desc"));

            if (isLoadMore && lastVisibleRef.current) {
                constraints.push(startAfter(lastVisibleRef.current));
            }

            const pageLimit = 15;
            constraints.push(limit(pageLimit));

            const q = query(colRef, ...constraints);
            const snapshot = await getDocs(q);

            let docs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Client-side filtering for search term to support contains searches
            if (searchTerm && searchTerm.trim() !== "") {
                const term = searchTerm.toLowerCase().trim();
                docs = docs.filter(req =>
                    req.id.toLowerCase().includes(term) ||
                    (req.customerName && req.customerName.toLowerCase().includes(term))
                );
            }

            // Client-side filtering for date
            if (dateFilter) {
                const parts = dateFilter.split("-");
                if (parts.length === 3) {
                    const formattedDateFilter = `${parts[2]}-${parts[1]}-${parts[0]}`;
                    docs = docs.filter(req =>
                        req.schedules && req.schedules.some(s => s.date === formattedDateFilter)
                    );
                }
            }

            const serializedDocs = serialize(docs);

            if (isLoadMore) {
                setRequests(prev => [...prev, ...serializedDocs]);
            } else {
                setRequests(serializedDocs);
            }

            const lastDoc = snapshot.docs[snapshot.docs.length - 1] || null;
            lastVisibleRef.current = lastDoc;
            setHasMore(snapshot.docs.length === pageLimit);
        } catch (err) {
            console.error("Error fetching route requests:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const updateRequestStatus = useCallback(async (requestId, status, additionalData = {}) => {
        try {
            const docRef = doc(db, "route_request", requestId);
            const updatePayload = {
                status,
                updatedAt: new Date().toISOString(),
                ...additionalData
            };
            await updateDoc(docRef, updatePayload);

            setRequests(prev => prev.map(req =>
                req.id === requestId
                    ? { ...req, ...updatePayload }
                    : req
            ));

            return { success: true };
        } catch (err) {
            console.error("Error updating request status:", err);
            return { success: false, error: err.message };
        }
    }, []);

    return {
        requests,
        loading,
        error,
        hasMore,
        fetchRequests,
        updateRequestStatus
    };
};
