import { useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { collection, getDocs, query, orderBy, where, limit } from "firebase/firestore";
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
	const prevParamsRef = useRef({ searchQuery: "", activeFilter: "", fromDate: "", toDate: "" });

	const fetchTrips = useCallback(async ({ searchQuery = "", activeFilter = "", fromDate = "", toDate = "", isLoadMore = false, limit: queryLimit = null } = {}) => {
		dispatch(setLoading(true));
		try {
			const paramsChanged = 
				searchQuery !== prevParamsRef.current.searchQuery ||
				activeFilter !== prevParamsRef.current.activeFilter ||
				fromDate !== prevParamsRef.current.fromDate ||
				toDate !== prevParamsRef.current.toDate;

			prevParamsRef.current = { searchQuery, activeFilter, fromDate, toDate };

			let rawData = allTripsRef.current;
			const isSearchActive = searchQuery && searchQuery.trim() !== "";

			if (paramsChanged || !isLoadMore || rawData.length === 0) {
				const tripsCollection = collection(db, "trips");

				if (isSearchActive) {
					const searchVal = searchQuery.trim();
					const queries = [];

					// 1. Exact match variations (driver_name, route_name, vehicle_reg, tripId)
					const variations = Array.from(new Set([
						searchVal,
						searchVal.toLowerCase(),
						searchVal.toUpperCase(),
						searchVal.replace(/\b\w/g, c => c.toUpperCase()),
						searchVal.charAt(0).toUpperCase() + searchVal.slice(1).toLowerCase()
					]));

					queries.push(query(tripsCollection, where("driver_name", "in", variations)));
					queries.push(query(tripsCollection, where("route_name", "in", variations)));
					queries.push(query(tripsCollection, where("vehicle_reg", "in", variations)));
					queries.push(query(tripsCollection, where("tripId", "in", variations)));

					// 2. Prefix search on driver_name, route_name
					const titleCased = searchVal.replace(/\b\w/g, c => c.toUpperCase());
					queries.push(query(tripsCollection, where("driver_name", ">=", titleCased), where("driver_name", "<=", titleCased + "\uf8ff")));
					queries.push(query(tripsCollection, where("route_name", ">=", titleCased), where("route_name", "<=", titleCased + "\uf8ff")));

					const lowerCased = searchVal.toLowerCase();
					queries.push(query(tripsCollection, where("driver_name", ">=", lowerCased), where("driver_name", "<=", lowerCased + "\uf8ff")));
					queries.push(query(tripsCollection, where("route_name", ">=", lowerCased), where("route_name", "<=", lowerCased + "\uf8ff")));

					// 3. Date string matching (if they search for exact date)
					const dateReg = /^\d{4}-\d{2}-\d{2}$/;
					if (dateReg.test(searchVal)) {
						queries.push(query(tripsCollection, where("selectedDates", "array-contains", searchVal)));
					}

					const snapshots = await Promise.all(queries.map(q => getDocs(q).catch(() => ({ docs: [] }))));
					const docMap = new Map();

					snapshots.forEach(snapshot => {
						if (snapshot && snapshot.docs) {
							snapshot.docs.forEach(doc => {
								docMap.set(doc.id, {
									id: doc.id,
									...doc.data()
								});
							});
						}
					});

					rawData = serialize(Array.from(docMap.values()));
				} else if (fromDate || toDate) {
					// Query by createdAt range in Firestore
					const constraints = [];
					if (fromDate) {
						const start = new Date(fromDate + "T00:00:00");
						constraints.push(where("createdAt", ">=", start));
					}
					if (toDate) {
						const end = new Date(toDate + "T23:59:59");
						constraints.push(where("createdAt", "<=", end));
					}
					constraints.push(orderBy("createdAt", "desc"));
					if (queryLimit) {
						constraints.push(limit(queryLimit));
					}
					const q = query(tripsCollection, ...constraints);
					const querySnapshot = await getDocs(q);
					rawData = serialize(querySnapshot.docs.map((doc) => ({
						id: doc.id,
						...doc.data()
					})));
				} else {
					let q = query(tripsCollection, orderBy("createdAt", "desc"));
					if (queryLimit) {
						q = query(tripsCollection, orderBy("createdAt", "desc"), limit(queryLimit));
					}
					const querySnapshot = await getDocs(q);
					rawData = serialize(querySnapshot.docs.map((doc) => ({
						id: doc.id,
						...doc.data()
					})));
				}
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