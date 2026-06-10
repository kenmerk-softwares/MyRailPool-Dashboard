import { useState, useCallback } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../shared/services/firebase";

export const usePassengers = (userId) => {
    const [passengers, setPassengers] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchPassengers = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const passengersRef = collection(db, "users", userId, "passengers");
            const snapshot = await getDocs(passengersRef);
            const data = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data()
            }));
            setPassengers(data);
        } catch (error) {
            console.error("Error fetching passengers:", error);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    return { passengers, loading, fetchPassengers };
};
