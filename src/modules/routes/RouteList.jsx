import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { SectionHeader, StatusBadge } from '../../components/Shared';
import { Filter } from '../../Filter/Filter';
import { db } from '../../Config/Config';
import { collection, getDocs, query, where, limit, startAfter, orderBy } from 'firebase/firestore';

export const RouteList = () => {
  const navigate = useNavigate();
  const handleView = (route) => {
    const Id = route.id.replace('#', '');
    navigate(`view/${Id}`);
  };

  const [activeFilter, setActiveFilter] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleClear = () => {
    setActiveFilter('');
    setSearchQuery('');
  };

  const [loading, setLoading] = useState(false);
  const [routesList, setRoutesList] = useState([]);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchRoutes = async (isLoadMore = false) => {
    setLoading(true);
    try {
      const routesRef = collection(db, 'routes');
      let q = query(routesRef, orderBy("createdAt", "desc"), limit(10));

      if (activeFilter) {
        q = query(q, where('status', '==', activeFilter));
      }

      if (searchQuery) {
        // Simple prefix search for name
        q = query(q, 
          where('name', '>=', searchQuery), 
          where('name', '<=', searchQuery + '\uf8ff')
        );
      }

      if (isLoadMore && lastVisible) {
        q = query(q, startAfter(lastVisible));
      }

      const snapshot = await getDocs(q);
      const routesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      if (isLoadMore) {
        setRoutesList(prev => [...prev, ...routesData]);
      } else {
        setRoutesList(routesData);
      }

      setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === 10);
    } catch (error) {
      console.error("Error fetching routes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilter, searchQuery]);

  const filteredData = routesList;
  
  return (
    <>
      <SectionHeader 
        title="Route Management" 
        subtitle="Define templates for common routes and pricing." 
        actionLabel="Create Route"
        actionIcon={Plus}
        actionTo="/routes/add"
      />
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden pb-10">
        <div className="overflow-x-auto w-full">
          <Filter 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            onClear={handleClear}
            searchPlaceholder="Search routes by name or locations..."
            options={[
              { label: 'Active', value: 'Active' },
              { label: 'Inactive', value: 'Inactive' },
            ]}
          />
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50/50">
               <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100">Sl No </th>
                <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100">Route Name</th>
                <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100">Route</th>
                <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100">Status</th>
                <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((route, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                   <td className="px-4 md:px-6 py-4 text-xs md:text-sm font-medium text-slate-900">{idx + 1}</td>
                  <td className="px-4 md:px-6 py-4 text-xs md:text-sm font-medium text-slate-900">{route.name}</td>
                  <td className="px-4 md:px-6 py-4 text-xs md:text-sm text-slate-600">
                    <span className="font-semibold text-slate-700">{route.startingPoint}</span>
                    <span className="mx-2 text-slate-300">→</span>
                    <span className="font-semibold text-slate-700">{route.endPoint}</span>
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <StatusBadge 
                      status={route.status} 
                      statusColor={route.status === 'Active' ? 'success' : 'slate'} 
                    />
                  </td>
                  <td className="px-4 md:px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleView(route)} 
                        className="text-primary-600 hover:text-primary-800 p-1.5 rounded-lg hover:bg-primary-50 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <Link 
                        to="/routes/add"
                        state={{ route }}
                        className="text-yellow-600 hover:text-yellow-800 p-1.5 rounded-lg hover:bg-yellow-50 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {hasMore && (
            <div className="p-4 flex justify-center border-t border-slate-100">
              <button
                onClick={() => fetchRoutes(true)}
                disabled={loading}
                className="px-6 py-2 text-sm font-semibold text-primary-600 hover:text-primary-800 hover:bg-primary-50 rounded-xl transition-all disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Load More Routes'}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
