import { useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { collection, getDocs, query, where, limit, startAfter, orderBy } from "firebase/firestore";
import { db } from "../../../shared/services/firebase";
import { setRoutes, setLoading } from "../route.slice";
import { serialize } from "../../../shared/utils/serialize";

export const useRoutes = () => {
	const dispatch = useDispatch();
	const routes = useSelector((state) => state.route.list);
	const loading = useSelector((state) => state.route.loading);
	const [lastVisible, setLastVisible] = useState(null);
	const [hasMore, setHasMore] = useState(true);

	const fetchRoutes = useCallback(async ({ searchQuery = "", activeFilter = "", isLoadMore = false } = {}) => {
		dispatch(setLoading(true));
		try {
			const routesCollection = collection(db, "routes");
			let q;
			if (searchQuery) {
				const searchLower = searchQuery.toLowerCase();
				q = query(routesCollection, 
					where("searchKey", ">=", searchLower), 
					where("searchKey", "<=", searchLower + "\uf8ff"),
					orderBy("searchKey")
				);
			} else {
				q = query(routesCollection, orderBy("name"));
			}

			if (activeFilter && activeFilter !== "Active") {
				q = query(q, where("status", "==", activeFilter.toLowerCase()));
			}

			q = query(q, limit(50));

			if (isLoadMore && lastVisible) {
				q = query(q, startAfter(lastVisible));
			}

			const querySnapshot = await getDocs(q);
			const routesData = serialize(querySnapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
				docId: doc.id
			})));

			if (isLoadMore) {
				dispatch(setRoutes([...routes, ...routesData]));
			} else {
				dispatch(setRoutes(routesData));
				setLastVisible(null);
			}

			const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1] || null;
			setLastVisible(lastDoc);
			setHasMore(querySnapshot.docs.length === 50);
		} catch (error) {
			console.error("Error fetching routes:", error);
		} finally {
			dispatch(setLoading(false));
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dispatch, lastVisible]);

	const setGlobalLoading = useCallback((val) => dispatch(setLoading(val)), [dispatch]);

	return { routes, loading, hasMore, fetchRoutes, setLoading: setGlobalLoading };
};
