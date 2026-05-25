import { useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { collection, getDocs, query, where, limit, startAfter, orderBy } from "firebase/firestore";
import { db } from "../../../shared/services/firebase";
import { setTrips, setLoading } from "../trip.slice";
import { serialize } from "../../../shared/utils/serialize";

export const useTrips = () => {
	const dispatch = useDispatch();
	const trips = useSelector((state) => state.trip.list);
	const loading = useSelector((state) => state.trip.loading);
	const [hasMore, setHasMore] = useState(true);
	const lastVisibleRef = useRef(null);

	const fetchTrips = useCallback(async ({ searchQuery = "", activeFilter = "", fromDate = "", toDate = "", isLoadMore = false } = {}) => {
		dispatch(setLoading(true));
		try {
			const tripsCollection = collection(db, "trips");
			let q = query(tripsCollection, orderBy("createdAt", "desc"), limit(10));

			if (activeFilter && activeFilter !== "" && activeFilter !== "All Status") {
				q = query(q, where("status", "==", activeFilter));
			}

			if (searchQuery) {
				q = query(q,
					where("route_name", ">=", searchQuery),
					where("route_name", "<=", searchQuery + "\uf8ff")
				);
			}

			if (isLoadMore && lastVisibleRef.current) {
				q = query(q, startAfter(lastVisibleRef.current));
			}

			const querySnapshot = await getDocs(q);
			let tripsData = serialize(querySnapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data()
			})));

			if (fromDate || toDate) {
				tripsData = tripsData.filter((trip) => {
					let tripDate = null;
					if (trip.createdAt) {
						tripDate = new Date(trip.createdAt);
					}

					if (!tripDate || isNaN(tripDate.getTime())) return true;

					const tripTime = tripDate.getTime();
					const fromTime = fromDate ? new Date(fromDate).setHours(0, 0, 0, 0) : null;
					const toTime = toDate ? new Date(toDate).setHours(23, 59, 59, 999) : null;

					if (fromTime && tripTime < fromTime) return false;
					if (toTime && tripTime > toTime) return false;

					return true;
				});
			}

			if (isLoadMore) {
				dispatch(setTrips([...trips, ...tripsData]));
			} else {
				dispatch(setTrips(tripsData));
			}

			const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1] || null;
			lastVisibleRef.current = lastDoc;
			setHasMore(querySnapshot.docs.length === 10);
		} catch (error) {
			console.error("Error fetching trips:", error);
		} finally {
			dispatch(setLoading(false));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dispatch, trips]);

	const setGlobalLoading = useCallback((val) => dispatch(setLoading(val)), [dispatch]);

	return { trips, loading, hasMore, fetchTrips, setLoading: setGlobalLoading };
};