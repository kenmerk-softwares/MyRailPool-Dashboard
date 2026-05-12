/**
 * Utility to serialize Firestore data (converts Timestamps to milliseconds)
 * to avoid Redux non-serializable errors.
 */
export const serialize = (data) => {
    if (!data) return data;
        if (Array.isArray(data)) {
        return data.map(item => (item && typeof item === 'object') ? serialize(item) : item);
    }

    const serialized = { ...data };
    Object.keys(serialized).forEach(key => {
        const val = serialized[key];
        if (val && typeof val.toDate === 'function') {
            serialized[key] = val.toDate().getTime();
        } 
        else if (val !== null && typeof val === 'object' && !(val instanceof Date)) {
            serialized[key] = serialize(val);
        }
    });
    
    return serialized;
};
