import React, { useEffect } from 'react';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { SectionHeader, StatusBadge } from '../../../components/Shared';
import { Table } from '../../../shared/Table/Table';
import { useVehicles } from '../hooks/vehicle.useVehicles';

export const VehicleList = () => {
  const { vehicles, loading, hasMore, fetchVehicles } = useVehicles();
  const navigate = useNavigate();

  const handleView = (vehicle) => {
    const Id = String(vehicle?.id || '').replace('#', '');
    navigate(`view/${Id}`);
  };

  const [activeFilter, setActiveFilter] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleClear = () => {
    setActiveFilter('');
    setSearchQuery('');
  };

  useEffect(() => {
            fetchVehicles({ searchQuery, activeFilter });
        }, [searchQuery, activeFilter, fetchVehicles]);
  return (
    <>
      <SectionHeader
        title="Fleet Management"
        subtitle="Manage your vehicle inventory, compliance status, and operational capacity."
        actionLabel="Add Vehicle"
        actionIcon={Plus}
        actionTo="/vehicles/add"
      />

  <div className="pb-10">
        <Table
          headers={['Sl No', 'Asset Identity', 'Specifications', 'Assigned Driver', 'Status']}
          data={vehicles}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          onClear={handleClear}
          searchPlaceholder="Search fleet assets (Plate, Model)..."
          filterOptions={[
            { label: 'Active', value: 'Active' },
            { label: 'Maintenance', value: 'Maintenance' },
            { label: 'Inactive', value: 'Inactive' },
          ]}
          renderRow={(vehicle, idx) => (
            <>
              <td className="px-8 py-4 text-[13px] font-black text-slate-800">{idx + 1}</td>
              <td className="px-8 py-4">
                <div className="flex flex-col">
                  <span className="text-[13px] font-black text-slate-800">{vehicle.make} {vehicle.model}</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] text-slate-500">{vehicle.id}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300 inline-block"></span>
                    <span className="text-[10px] text-primary-600 font-medium font-mono">{vehicle.registration_no}</span>
                  </div>
                </div>
              </td>
              <td className="px-8 py-4">
                <div className="flex flex-col">
                  <span className="text-[13px] font-black text-slate-800">{vehicle.type}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{vehicle.capacity} Capacity</span>
                </div>
              </td>
              <td className="px-8 py-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 text-[11px] font-black border border-indigo-100">
                    {(vehicle?.driver || '?').charAt(0)}
                  </div>
                  <span className="text-[13px] font-black text-slate-700">{vehicle?.driver || 'Unassigned'}</span>
                </div>
              </td>
              <td className="px-8 py-4">
                <StatusBadge 
                  status={vehicle.status} 
                  statusColor={vehicle.status === 'Active' ? 'success' : vehicle.status === 'Maintenance' ? 'warning' : 'danger'} 
                />
              </td>
            </>
          )}
          actions={(vehicle) => (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => handleView(vehicle)} 
                className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-primary-600 hover:border-primary-100 rounded-xl transition-all hover:shadow-lg active:scale-95"
                title="Quick View"
              >
                <Eye className="w-4 h-4" />
              </button>
              <Link 
                to={`/vehicles/edit/${String(vehicle?.id || '').replace('#', '')}`}
                className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-amber-600 hover:border-amber-100 rounded-xl transition-all hover:shadow-lg active:scale-95"
                title="Edit Vehicle"
              >
                <Edit className="w-4 h-4" />
              </Link>
              <button 
                className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-100 rounded-xl transition-all hover:shadow-lg active:scale-95"
                title="Delete Vehicle"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        />
        {hasMore && (
                <div className="mt-8 flex justify-center">
                    <button
                        onClick={() => fetchVehicles({ searchQuery, activeFilter, isLoadMore: true })}
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
