import { useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../../../shared/services/firebase";
import { setTrips, setLoading } from "../trip.slice";
import { serialize } from "../../../shared/utils/serialize";

export const useTrips = () => {
	const dispatch = useDispatch();
	const trips = useSelector((state) => state.trip.list);
	const loading = useSelector((state) => state.trip.loading);
	const [hasMore, setHasMore] = useState(true);

	const allTripsRef = useRef([]);
	const visibleCountRef = useRef(10);

	const fetchTrips = useCallback(async ({ searchQuery = "", activeFilter = "", fromDate = "", toDate = "", isLoadMore = false } = {}) => {
		dispatch(setLoading(true));
		try {
			let rawData = allTripsRef.current;

			if (!isLoadMore || rawData.length === 0) {
				const tripsCollection = collection(db, "trips");
				const q = query(tripsCollection, orderBy("createdAt", "desc"));
				const querySnapshot = await getDocs(q);
				rawData = serialize(querySnapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data()
				})));
				allTripsRef.current = rawData;
			}

			// Apply search filter client-side (case-insensitive)
			let filtered = rawData;
			if (searchQuery && searchQuery.trim() !== "") {
				const s = searchQuery.toLowerCase();
				filtered = filtered.filter(trip => 
					(trip.tripId && String(trip.tripId).toLowerCase().includes(s)) ||
					(trip.driver_name && String(trip.driver_name).toLowerCase().includes(s)) ||
					(trip.vehicle_reg && String(trip.vehicle_reg).toLowerCase().includes(s)) ||
					(trip.route_name && String(trip.route_name).toLowerCase().includes(s)) ||
					(trip.id && String(trip.id).toLowerCase().includes(s))
				);
			}

			// Apply status filter client-side (case-insensitive)
			if (activeFilter && activeFilter.trim() !== "" && activeFilter !== "All Status") {
				filtered = filtered.filter(trip => 
					trip.status && trip.status.toLowerCase() === activeFilter.toLowerCase()
				);
			}

			// Apply date filters client-side (check only scheduled dates)
			if (fromDate || toDate) {
				const fromTime = fromDate ? new Date(fromDate + "T00:00:00").getTime() : null;
				const toTime = toDate ? new Date(toDate + "T23:59:59").getTime() : null;

				filtered = filtered.filter(trip => {
					// Check if any selected dates fall in range
					const selectedDateMatches = Array.isArray(trip.selectedDates) && trip.selectedDates.some(d => {
						const dTime = new Date(d + "T00:00:00").getTime();
						return (!fromTime || dTime >= fromTime) && (!toTime || dTime <= toTime);
					});

					return selectedDateMatches;
				});
			}

			// Handle pagination slicing client-side
			if (!isLoadMore) {
				visibleCountRef.current = 10;
			} else {
				visibleCountRef.current += 10;
			}

			const sliced = filtered.slice(0, visibleCountRef.current);
			dispatch(setTrips(sliced));
			setHasMore(visibleCountRef.current < filtered.length);
		} catch (error) {
			console.error("Error fetching trips:", error);
		} finally {
			dispatch(setLoading(false));
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dispatch]);

	const setGlobalLoading = useCallback((val) => dispatch(setLoading(val)), [dispatch]);

	return { trips, loading, hasMore, fetchTrips, setLoading: setGlobalLoading };
};