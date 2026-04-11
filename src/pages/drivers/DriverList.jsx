import React from 'react';
import { Plus, Edit, Trash2, UserPlus, Search, Eye, MapPin, Tablet } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { SectionHeader, StatusBadge } from '../../components/Shared';
import { driversData } from '../../data/mockData';

export const DriverList = () => {
  const navigate = useNavigate();

  const handleView = (driver) => {
    const Id = driver.driver_id.replace('#', '');
    navigate(`view/${Id}`);
  };

  return (
    <>
      <SectionHeader
        title="Driver Management"
        subtitle="Comprehensive directory of drivers and compliance credentials."
        actionLabel="Add Driver"
        actionIcon={UserPlus}
        actionTo="/drivers/add"
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
                  placeholder="Search drivers..."
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <select className="border border-slate-200 rounded-xl px-4 py-2 text-xs md:text-sm bg-white outline-none focus:border-primary-500 transition-all">
                <option value="">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <button className="bg-red-500 text-white px-4 py-2 rounded-xl text-xs md:text-sm" onClick={() => {}}>Clear</button>
            </div>
          </div>

          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100">Name</th>
                <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100">Contact</th>
                <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100 hidden lg:table-cell">Address</th>
                <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100">Status</th>
                <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {driversData.map((driver, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-4 md:px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-50 to-primary-100/50 flex items-center justify-center text-primary-700 font-bold text-sm border border-primary-100/50 shadow-sm uppercase">
                        {driver.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-xs md:text-sm font-medium text-slate-900">{driver.name}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wider">{driver.driver_id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <div className="text-xs md:text-sm font-medium text-slate-800">{driver.phone}</div>
                    <div className="text-[10px] md:text-xs text-slate-500 mt-0.5">{driver.email}</div>
                  </td>
                  <td className="px-4 md:px-6 py-4 hidden lg:table-cell">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-xs md:text-sm text-slate-600">{driver.address}</span>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <StatusBadge
                      status={driver.status}
                      statusColor={driver.status.toLowerCase() === 'active' ? 'success' : 'warning'}
                    />
                  </td>
                  <td className="px-4 md:px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        className="text-primary-600 hover:text-primary-800 p-1.5 rounded-lg hover:bg-primary-50 transition-colors"
                        onClick={() => handleView(driver)}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <Link
                        to={`/drivers/edit/${driver.driver_id.replace('#', '')}`}
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

          {driversData.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 bg-slate-50/10">
              <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-200 mb-4 shadow-sm">
                <UserPlus className="w-8 h-8" />
              </div>
              <p className="text-slate-500 font-medium text-xs uppercase tracking-wider">Registry is currently empty</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
