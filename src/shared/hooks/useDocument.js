import { useState, useCallback } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../Config/Config';

/**
 * 
 * @param {string} collectionName - collection name
 * @returns {Object} - { data, loading, error, fetchDocument, setData }
 */
export const useDocument = (collectionName) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * @param {string} docId - Doc Id
     */
    const fetchDocument = useCallback(async (docId) => {
        if (!docId) {
            setError("Document ID is required");
            return { success: false, error: "Document ID is required" };
        }

        setLoading(true);
        setError(null);
        
        try {
            const docRef = doc(db, collectionName, docId);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                const docData = { 
                    id: docSnap.id, 
                    ...docSnap.data() 
                };
                setData(docData);
                return { success: true, data: docData };
            } else {
                const errorMsg = "Document does not exist";
                setError(errorMsg);
                setData(null);
                return { success: false, error: errorMsg };
            }
        } catch (err) {
            console.error(`Error fetching document ${docId} from ${collectionName}:`, err);
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    }, [collectionName]);

    return { 
        data, 
        loading, 
        error, 
        fetchDocument, 
        setData 
    };
};
