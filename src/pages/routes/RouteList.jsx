import React from 'react';
import { Plus, Edit, Trash2, Search, Eye } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { SectionHeader, StatusBadge } from '../../components/Shared';
import { routesData } from '../../data/mockData';

export const RouteList = () => {
  const navigate = useNavigate();
  const handleView = (route) => {
    const Id = route.id.replace('#', '');
    navigate(`view/${Id}`);
  };
  
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
          <div className="flex items-center justify-between m-4">
            {/* Search Bar */}
            <div className="hidden sm:flex flex-1 max-w-xl ml-4 lg:ml-0">
              <div className="relative group w-full">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-500 transition-colors">
                  <Search className="h-4 w-4 md:h-5 md:w-5" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 md:pl-11 pr-4 py-2 md:py-2.5 bg-slate-50 border border-transparent rounded-xl text-xs md:text-sm placeholder-slate-400 focus:border-primary-500 focus:bg-white focus:ring focus:ring-primary-500/20 transition-all duration-200"
                  placeholder="Search routes"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <select name="" id="" className="border border-slate-200 rounded-xl px-4 py-2 text-xs md:text-sm">
                <option value="">All</option>
                <option value="">Active</option>
                <option value="">Inactive</option>
              </select>
              <button className="bg-red-500 text-white px-4 py-2 rounded-xl text-xs md:text-sm" onClick={() => {}}>Clear</button>
            </div>
          </div>
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100">Route Name</th>
                <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100">Start location</th>
                <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100 hidden sm:table-cell">End location</th>
                <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100 hidden md:table-cell">Est. Dist / Price</th>
                <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100">Status</th>
                <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {routesData.map((route, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 md:px-6 py-4 text-xs md:text-sm font-medium text-slate-900">{route.name}</td>
                  <td className="px-4 md:px-6 py-4 text-xs md:text-sm text-slate-600 max-w-[150px] truncate">{route.start}</td>
                  <td className="px-4 md:px-6 py-4 text-xs md:text-sm text-slate-600 hidden sm:table-cell max-w-[150px] truncate">{route.end}</td>
                  <td className="px-4 md:px-6 py-4 hidden md:table-cell">
                    <div className="text-xs md:text-sm font-medium text-slate-800">{route.estPrice}</div>
                    <div className="text-[10px] md:text-xs text-slate-500">{route.distance}</div>
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
                        to={`/routes/edit/${route.id.replace('#','')}`} 
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
        </div>
      </div>
    </>
  );
};
