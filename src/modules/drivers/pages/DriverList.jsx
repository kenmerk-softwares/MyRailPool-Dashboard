import React, { useEffect } from 'react';
import { Edit, Trash2, UserPlus, Eye, MapPin } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { SectionHeader, StatusBadge } from '../../../components/Shared';
import { Table } from '../../../shared/Table/Table';
import { useDrivers } from '../hooks/driver.useDrivers';

export const DriverList = () => {
  const navigate = useNavigate();
  const { drivers, loading, hasMore, fetchDrivers } = useDrivers();

  const handleView = (driver) => {
    const Id = String(driver?.driver_id || driver?.id || '').replace('#', '');
    navigate(`view/${Id}`);
  };

  const [activeFilter, setActiveFilter] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleClear = () => {
    setActiveFilter('');
    setSearchQuery('');
  };

 useEffect(() => {
            fetchDrivers({ searchQuery, activeFilter });
        }, [searchQuery, activeFilter, fetchDrivers]);

  return (
    <>
      <SectionHeader
        title="Driver Management"
        subtitle="Comprehensive directory of drivers and compliance credentials."
        actionLabel="Add Driver"
        actionIcon={UserPlus}
        actionTo="/drivers/add"
      />

      <div className="pb-10">
        <Table
          headers={['Sl No', 'Driver Info', 'Contact Details', 'Location', 'Status']}
          data={drivers}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          onClear={handleClear}
          searchPlaceholder="Search drivers by name, ID, contact..."
          filterOptions={[
            { label: 'Active', value: 'active' },
            { label: 'Inactive', value: 'inactive' },
          ]}
          renderRow={(driver, idx) => (
            <>
              <td className="px-8 py-4 text-[13px] font-black text-slate-800">{idx + 1}</td>
              <td className="px-8 py-4">
                <div className="flex flex-col">
                  <span className="text-[13px] font-black text-slate-800">{driver.name}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{driver.driver_id}</span>
                </div>
              </td>
              <td className="px-8 py-4">
                <div className="flex flex-col">
                  <span className="text-[13px] font-black text-slate-800">{driver.phone}</span>
                  <span className="text-[10px] font-bold text-slate-400">{driver.email}</span>
                </div>
              </td>
              <td className="px-8 py-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="text-[13px] font-black text-slate-600">{driver.address}</span>
                </div>
              </td>
              <td className="px-8 py-4">
                <StatusBadge
                  status={driver?.status || 'N/A'}
                  statusColor={(driver?.status || '').toLowerCase() === 'active' ? 'success' : 'warning'}
                />
              </td>
            </>
          )}
          actions={(driver) => (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => handleView(driver)} 
                className="p-2 bg-white border border-slate-200 text-green-400 hover:text-green-700 hover:border-green-100 rounded-xl transition-all hover:shadow-lg active:scale-95"
                title="Quick View"
              >
                <Eye className="w-4 h-4" />
              </button>
              <Link 
                to={`/drivers/edit/${String(driver?.driver_id || driver?.id || '').replace('#', '')}`}
                className="p-2 bg-white border border-slate-200 text-yellow-400 hover:text-yellow-700 hover:border-yellow-100 rounded-xl transition-all hover:shadow-lg active:scale-95"
                title="Edit Driver"
              >
                <Edit className="w-4 h-4" />
              </Link>
              <button 
                className="p-2 bg-white border border-slate-200 text-red-400 hover:text-red-700 hover:border-red-100 rounded-xl transition-all hover:shadow-lg active:scale-95"
                title="Delete Driver"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        />
          {hasMore && (
                <div className="mt-8 flex justify-center">
                    <button
                        onClick={() => fetchDrivers({ searchQuery, activeFilter, isLoadMore: true })}
                        disabled={loading}
                        className="px-8 py-3 bg-white border border-slate-200 text-slate-500 font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                    >
                        {loading ? 'Synchronizing...' : 'Load More Booking Data'}
                    </button>
                </div>
            )}
      </div>
    </>
  );
};
