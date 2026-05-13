import React from 'react';
import { Edit, Trash2, UserPlus, Eye, MapPin } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { SectionHeader, StatusBadge } from '../../../components/Shared';
import { driversData } from '../../../data/mockData';
import { Filter } from '../../../Filter/Filter';

export const DriverList = () => {
  const navigate = useNavigate();

  const handleView = (driver) => {
    const Id = driver.driver_id.replace('#', '');
    navigate(`view/${Id}`);
  };

  const [activeFilter, setActiveFilter] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleClear = () => {
    setActiveFilter('');
    setSearchQuery('');
  };

  const filteredData = driversData.filter(item => {
    const matchesSearch = !searchQuery || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.driver_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = !activeFilter || item.status.toLowerCase() === activeFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

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
          <Filter 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            onClear={handleClear}
            searchPlaceholder="Search drivers by name, ID, contact..."
            options={[
              { label: 'Active', value: 'active' },
              { label: 'Inactive', value: 'inactive' },
            ]}
          />

          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50/50 ">
              <th className="ps-6 px-1 md:px-2 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100">Sl No</th>
                <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100">Name</th>
                <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100">Contact</th>
                <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100 hidden lg:table-cell">Address</th>
                <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100">Status</th>
                <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((driver, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-1 md:px-2 py-4 text-xs md:text-sm font-medium text-slate-900">{idx + 1}</td>

                  <td className="px-4 md:px-6 py-4">
                    <div className="flex items-center gap-4">
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
