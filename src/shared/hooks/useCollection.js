import { useState, useCallback, useRef } from 'react';
import { collection, getDocs, query, limit, startAfter } from 'firebase/firestore';
import { db } from '../services/firebase';

/**
 * 
 * @param {string} collectionName - The name of the Firestore collection.
 * @param {Object} options - Configuration options.
 * @param {number} options.pageSize - Number of documents per page (default: 10).
 * @returns {Object} - { data, loading, hasMore, fetchData, error }
 */
export const useCollection = (collectionName, options = {}) => {
    const { pageSize = 10, dbInstance = db } = options;

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const lastVisibleRef = useRef(null);
    const [error, setError] = useState(null);

    /**
     * Fetches data from the collection.
     * @param {Object} params - Fetch parameters.
     * @param {Array} params.constraints - Array of Firestore query constraints (where, orderBy, etc.).
     * @param {number} params.pageSize - Number of documents to fetch (overrides default).
     */
    const fetchData = useCallback(async ({ constraints = [], isLoadMore = false, pageSize: customPageSize } = {}) => {
        setLoading(true);
        setError(null);
        
        const currentLimit = customPageSize || pageSize;
        
        try {
            const colRef = collection(dbInstance, collectionName);
            const queryConstraints = [...constraints];

            if (isLoadMore && lastVisibleRef.current) {
                queryConstraints.push(startAfter(lastVisibleRef.current));
            }

            queryConstraints.push(limit(currentLimit));

            const q = query(colRef, ...queryConstraints);
            const snapshot = await getDocs(q);
            
            const result = snapshot.docs.map(doc => ({ 
                id: doc.id, 
                ...doc.data() 
            }));

            if (isLoadMore) {
                setData(prev => [...prev, ...result]);
            } else {
                setData(result);
                lastVisibleRef.current = null; 
            }

            const lastDoc = snapshot.docs[snapshot.docs.length - 1] || null;
            lastVisibleRef.current = lastDoc;
            setHasMore(snapshot.docs.length === currentLimit);
            
            return { success: true, data: result };
        } catch (err) {
            console.error(`Error fetching collection ${collectionName}:`, err);
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    }, [collectionName, pageSize, dbInstance]);

    return { 
        data, 
        loading, 
        hasMore, 
        fetchData, 
        error,
        setData
    };
};