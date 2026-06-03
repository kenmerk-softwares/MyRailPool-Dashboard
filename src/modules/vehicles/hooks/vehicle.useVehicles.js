import { useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../../../shared/services/firebase";
import { setVehicles, setLoading } from "../vehicle.slice";
import { serialize } from "../../../shared/utils/serialize";

export const useVehicles = () => {
    const dispatch = useDispatch();
    const vehicles = useSelector((state) => state.vehicle.list);
    const loading = useSelector((state) => state.vehicle.loading);
    const [hasMore, setHasMore] = useState(true);

    const allVehiclesRef = useRef([]);
    const visibleCountRef = useRef(50);

    const fetchVehicles = useCallback(async ({ searchQuery = "", activeFilter = "", fromDate = "", toDate = "", isLoadMore = false } = {}) => {
        dispatch(setLoading(true));
        try {
            let rawData = allVehiclesRef.current;

            if (!isLoadMore || rawData.length === 0) {
                const vehiclesCollection = collection(db, "vehicles");
                const q = query(vehiclesCollection, orderBy("registrationNo"));
                const querySnapshot = await getDocs(q);
                rawData = serialize(querySnapshot.docs.map((doc) => ({
                    ...doc.data(),
                    docId: doc.id
                })));
                allVehiclesRef.current = rawData;
            }

            // Apply search filter client-side (case-insensitive)
            let filtered = rawData;
            if (searchQuery && searchQuery.trim() !== "") {
                const s = searchQuery.toLowerCase();
                filtered = filtered.filter(vehicle => 
                    (vehicle.registrationNo && vehicle.registrationNo.toLowerCase().includes(s)) ||
                    (vehicle.model && vehicle.model.toLowerCase().includes(s)) ||
                    (vehicle.make && vehicle.make.toLowerCase().includes(s)) ||
                    (vehicle.type && vehicle.type.toLowerCase().includes(s)) ||
                    (vehicle.assignedDriver && vehicle.assignedDriver.toLowerCase().includes(s)) ||
                    (vehicle.id && vehicle.id.toLowerCase().includes(s))
                );
            }

            // Apply status filter client-side (operationalStatus, case-insensitive)
            if (activeFilter && activeFilter.trim() !== "") {
                filtered = filtered.filter(vehicle => 
                    vehicle.operationalStatus && vehicle.operationalStatus.toLowerCase() === activeFilter.toLowerCase()
                );
            }

            // Apply date filters client-side
            if (fromDate || toDate) {
                const fromTime = fromDate ? new Date(fromDate + "T00:00:00").getTime() : null;
                const toTime = toDate ? new Date(toDate + "T23:59:59").getTime() : null;

                filtered = filtered.filter(vehicle => {
                    const vehicleTime = vehicle.createdAt 
                        ? new Date(vehicle.createdAt).getTime() 
                        : (vehicle.updatedAt ? new Date(vehicle.updatedAt).getTime() : null);

                    if (!vehicleTime) return true; // keep if no date is set or fallback
                    if (fromTime && vehicleTime < fromTime) return false;
                    if (toTime && vehicleTime > toTime) return false;
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
            dispatch(setVehicles(sliced));
            setHasMore(visibleCountRef.current < filtered.length);
        } catch (error) {
            console.error("Error fetching vehicles:", error);
        } finally {
            dispatch(setLoading(false));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch]);

    const setGlobalLoading = useCallback((val) => dispatch(setLoading(val)), [dispatch]);

    return { vehicles, loading, hasMore, fetchVehicles, setLoading: setGlobalLoading };
};
