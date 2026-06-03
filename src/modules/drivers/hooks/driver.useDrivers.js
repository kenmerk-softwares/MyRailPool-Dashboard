import { useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../../../shared/services/firebase";
import { setDrivers, setLoading } from "../driver.slice";
import { serialize } from "../../../shared/utils/serialize";

export const useDrivers = () => {
    const dispatch = useDispatch();
    const drivers = useSelector((state) => state.driver.list);
    const loading = useSelector((state) => state.driver.loading);
    const [hasMore, setHasMore] = useState(true);

    const allDriversRef = useRef([]);
    const visibleCountRef = useRef(50);

    const fetchDrivers = useCallback(async ({ searchQuery = "", activeFilter = "", fromDate = "", toDate = "", isLoadMore = false } = {}) => {
        dispatch(setLoading(true));
        try {
            let rawData = allDriversRef.current;

            if (!isLoadMore || rawData.length === 0) {
                const driversCollection = collection(db, "drivers");
                const q = query(driversCollection, orderBy("name"));
                const querySnapshot = await getDocs(q);
                rawData = serialize(querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                    docId: doc.id
                })));
                allDriversRef.current = rawData;
            }

            // Apply search filter client-side (case-insensitive)
            let filtered = rawData;
            if (searchQuery && searchQuery.trim() !== "") {
                const s = searchQuery.toLowerCase();
                filtered = filtered.filter(driver => 
                    (driver.name && driver.name.toLowerCase().includes(s)) ||
                    (driver.mobile && driver.mobile.toLowerCase().includes(s)) ||
                    (driver.email && driver.email.toLowerCase().includes(s)) ||
                    (driver.phLicenseNumber && driver.phLicenseNumber.toLowerCase().includes(s)) ||
                    (driver.dvlaLicenseNumber && driver.dvlaLicenseNumber.toLowerCase().includes(s)) ||
                    (driver.id && driver.id.toLowerCase().includes(s))
                );
            }

            // Apply status filter client-side (case-insensitive)
            if (activeFilter && activeFilter.trim() !== "") {
                filtered = filtered.filter(driver => 
                    driver.status && driver.status.toLowerCase() === activeFilter.toLowerCase()
                );
            }

            // Apply date filters client-side
            if (fromDate || toDate) {
                const fromTime = fromDate ? new Date(fromDate + "T00:00:00").getTime() : null;
                const toTime = toDate ? new Date(toDate + "T23:59:59").getTime() : null;

                filtered = filtered.filter(driver => {
                    let driverTime = null;
                    if (driver.createdAt) {
                        driverTime = new Date(driver.createdAt).getTime();
                    } else if (driver.serviceStartDate) {
                        // Check if serviceStartDate is in YYYY-MM-DD format or DD/MM/YYYY format
                        const dateStr = String(driver.serviceStartDate);
                        const parts = dateStr.split('/');
                        if (parts.length === 3) {
                            // Convert DD/MM/YYYY to YYYY-MM-DD
                            driverTime = new Date(`${parts[2]}-${parts[1]}-${parts[0]}T00:00:00`).getTime();
                        } else {
                            driverTime = new Date(dateStr + "T00:00:00").getTime();
                        }
                    }

                    if (!driverTime || isNaN(driverTime)) return true;
                    if (fromTime && driverTime < fromTime) return false;
                    if (toTime && driverTime > toTime) return false;
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
            dispatch(setDrivers(sliced));
            setHasMore(visibleCountRef.current < filtered.length);
        } catch (error) {
            console.error("Error fetching drivers:", error);
        } finally {
            dispatch(setLoading(false));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch]);

    const setGlobalLoading = useCallback((val) => dispatch(setLoading(val)), [dispatch]);

    return { drivers, loading, hasMore, fetchDrivers, setLoading: setGlobalLoading };
};
