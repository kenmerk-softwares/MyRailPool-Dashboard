import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Eye, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { SectionHeader, StatusBadge } from '../../components/Shared';
import { Table } from '../../shared/Table/Table';
import { db } from '../../shared/services/firebase';

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
      <div className="pb-10">
        <Table
          headers={['Sl No', 'Route Name', 'Route Corridor', 'Operational Status']}
          data={filteredData}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          onClear={handleClear}
          searchPlaceholder="Search routes by name or locations..."
          filterOptions={[
            { label: 'All', value: '' },
            { label: 'Active', value: 'Active' },
            { label: 'Inactive', value: 'Inactive' },
          ]}
          renderRow={(route, idx) => (
            <>
              <td className="px-8 py-4 text-[13px] font-black text-slate-800">{idx + 1}</td>
              <td className="px-8 py-4">
                <div className="flex flex-col">
                  <span className="text-[13px] font-black text-slate-800">{route.name}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Corridor ID: {route.id}</span>
                </div>
              </td>
              <td className="px-8 py-4">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl group-hover:bg-primary-50 group-hover:border-primary-100 transition-colors">
                    <span className="text-[11px] font-black text-slate-700 group-hover:text-primary-700">{route.startingPoint}</span>
                    <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-primary-400" />
                    <span className="text-[11px] font-black text-slate-700 group-hover:text-primary-700">{route.endPoint}</span>
                  </div>
                </div>
              </td>
              <td className="px-8 py-4">
                <StatusBadge 
                  status={route.status} 
                  statusColor={route.status === 'Active' ? 'success' : 'slate'} 
                />
              </td>
            </>
          )}
          actions={(route) => (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => handleView(route)} 
                className="p-2 bg-white border border-green-200 text-green-500 hover:text-green-700 hover:border-green-100 rounded-xl transition-all hover:shadow-lg active:scale-95"
                title="Quick View"
              >
                <Eye className="w-4 h-4" />
              </button>
              <Link 
                to="/routes/add"
                state={{ route }}
                className="p-2 bg-white border border-yellow-100 text-yellow-500 hover:text-yellow-700 hover:border-yellow-100 rounded-xl transition-all hover:shadow-lg active:scale-95"
                title="Edit Corridor"
              >
                <Edit className="w-4 h-4" />
              </Link>
              <button 
                className="p-2 bg-white border border-red-100 text-red-500 hover:text-red-700 hover:border-red-100 rounded-xl transition-all hover:shadow-lg active:scale-95"
                title="Delete Route"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        />

        {hasMore && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => fetchRoutes(true)}
              disabled={loading}
              className="px-8 py-3 bg-white border border-slate-200 text-slate-500 font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Synchronizing...' : 'Load More Corridor Data'}
            </button>
          </div>
        )}
      </div>

    </>
  );
};
