import { useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../../../shared/services/firebase";
import { setRoutes, setLoading } from "../route.slice";
import { serialize } from "../../../shared/utils/serialize";

export const useRoutes = () => {
	const dispatch = useDispatch();
	const routes = useSelector((state) => state.route.list);
	const loading = useSelector((state) => state.route.loading);
	const [hasMore, setHasMore] = useState(true);
	
	const allRoutesRef = useRef([]);
	const visibleCountRef = useRef(50);

	const fetchRoutes = useCallback(async ({ searchQuery = "", activeFilter = "", fromDate = "", toDate = "", isLoadMore = false } = {}) => {
		dispatch(setLoading(true));
		try {
			let rawData = allRoutesRef.current;

			if (!isLoadMore || rawData.length === 0) {
				const routesCollection = collection(db, "routes");
				const q = query(routesCollection, orderBy("name"));
				const querySnapshot = await getDocs(q);
				rawData = serialize(querySnapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
					docId: doc.id
				})));
				allRoutesRef.current = rawData;
			}

			// Apply search filter client-side
			let filtered = rawData;
			if (searchQuery && searchQuery.trim() !== "") {
				const s = searchQuery.toLowerCase();
				filtered = filtered.filter(route => 
					(route.name && route.name.toLowerCase().includes(s)) ||
					(route.startingPoint && route.startingPoint.toLowerCase().includes(s)) ||
					(route.endPoint && route.endPoint.toLowerCase().includes(s)) ||
					(route.id && route.id.toLowerCase().includes(s))
				);
			}

			// Apply status filter client-side (case-insensitive)
			if (activeFilter && activeFilter.trim() !== "") {
				filtered = filtered.filter(route => 
					route.status && route.status.toLowerCase() === activeFilter.toLowerCase()
				);
			}

			// Apply date filters client-side (match activation/deactivation range or createdAt)
			if (fromDate || toDate) {
				const fromTime = fromDate ? new Date(fromDate + "T00:00:00").getTime() : null;
				const toTime = toDate ? new Date(toDate + "T23:59:59").getTime() : null;

				filtered = filtered.filter(route => {
					// Use createdAt, or fallback to activationDate
					const routeTime = route.createdAt 
						? new Date(route.createdAt).getTime() 
						: (route.activationDate 
							? new Date(route.activationDate?.seconds ? route.activationDate.seconds * 1000 : route.activationDate).getTime() 
							: null);

					if (!routeTime) return false;
					if (fromTime && routeTime < fromTime) return false;
					if (toTime && routeTime > toTime) return false;
					return true;
				});
			}

			// Handle pagination slicing client-side
			if (!isLoadMore) {
				visibleCountRef.current = 50;
			} else {
				visibleCountRef.current += 50;
			}

			const sliced = filtered.slice(0, visibleCountRef.current);
			dispatch(setRoutes(sliced));
			setHasMore(visibleCountRef.current < filtered.length);
		} catch (error) {
			console.error("Error fetching routes:", error);
		} finally {
			dispatch(setLoading(false));
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dispatch]);

	const setGlobalLoading = useCallback((val) => dispatch(setLoading(val)), [dispatch]);

	return { routes, loading, hasMore, fetchRoutes, setLoading: setGlobalLoading };
};
