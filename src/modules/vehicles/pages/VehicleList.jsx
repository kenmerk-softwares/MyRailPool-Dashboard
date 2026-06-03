import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Eye, Car, Hash, User, Activity, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { SectionHeader, StatusBadge } from '../../../components/Shared';
import { Table } from '../../../shared/Table/Table';
import { useVehicles } from '../hooks/vehicle.useVehicles';
import { exportToExcel } from '../../../shared/utils/export';

export const VehicleList = () => {
  const { vehicles, loading, hasMore, fetchVehicles } = useVehicles();
  const navigate = useNavigate();

  const [activeFilter, setActiveFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    fetchVehicles({ searchQuery, activeFilter, fromDate, toDate });
  }, [searchQuery, activeFilter, fromDate, toDate, fetchVehicles]);

  const handleClear = () => {
    setFromDate('');
    setToDate('');
    setActiveFilter('');
    setSearchQuery('');
  };

  const handleView = (vehicle) => {
    const docId = String(vehicle?.docId || '').replace('#', '');
    navigate(`view/${docId}`);
  };

  const handleEdit = (vehicle) => {
    const docId = String(vehicle?.docId || '').replace('#', '');
    navigate(`edit/${docId}`);
  };

  const handleExport = () => {
    exportToExcel(vehicles, {
      registrationNo: 'Registration No',
      make: 'Make',
      model: 'Model',
      colour: 'Colour',
      seatingCapacity: 'Seating Capacity',
      phVehicleLicence: 'PH Licence',
      licenceExpiry: 'Licence Expiry',
      driverName: 'Assigned Driver',
      status: 'Status',
      createdAt: 'Added Date'
    }, 'Vehicles');
  };

  return (
    <div className="animate-in fade-in duration-700">
      <SectionHeader
        title="Fleet Management"
        subtitle="Manage your vehicle inventory, compliance status, and operational capacity."
        actionLabel="Add Vehicle"
        actionIcon={Plus}
        actionTo="/vehicles/add"
        onExportClick={handleExport}
      />

      <div className="pb-10">
        <Table
          headers={['Asset Identity', 'Category & Capacity', 'Assigned Driver', 'Compliance Status', 'Operational Status']}
          data={vehicles}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          onClear={handleClear}
          fromDate={fromDate}
          setFromDate={setFromDate}
          toDate={toDate}
          setToDate={setToDate}
          searchPlaceholder="Search fleet assets (Plate, Model, Make)..."
          filterOptions={[
            { label: 'Active', value: 'Active' },
            { label: 'Maintenance', value: 'Maintenance' },
            { label: 'Inactive', value: 'Inactive' },
          ]}
          renderRow={(vehicle, idx) => (
            <>
              {/* Asset Identity */}
              <td className="px-8 py-4">
                <div className="flex items-center gap-3">

                  <div className="flex flex-col">
                    <span className="text-[14px] font-black text-slate-800 tracking-tight uppercase">
                      {vehicle.make} {vehicle.model}
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] font-bold text-indigo-600 font-mono tracking-wider">
                        {vehicle.registrationNo}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-slate-300 inline-block"></span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {vehicle.id}
                      </span>
                    </div>
                  </div>
                </div>
              </td>

              {/* Category & Capacity */}
              <td className="px-8 py-4">
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[13px] font-black text-slate-700 uppercase tracking-tight">{vehicle.type}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">
                      {vehicle.seatingCapacity} Seats
                    </span>
                  </div>
                </div>
              </td>

              {/* Assigned Driver */}
              <td className="px-8 py-4">
                {vehicle.assignedDriver ? (
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 text-[11px] font-black border border-indigo-100 uppercase">
                      {vehicle.assignedDriver.charAt(0)}
                    </div>
                    <span className="text-[13px] font-black text-slate-700 tracking-tight">{vehicle.assignedDriver}</span>
                  </div>
                ) : (
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest italic">Unassigned</span>
                )}
              </td>

              {/* Compliance Status */}
              <td className="px-8 py-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between gap-4 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Licence</span>
                    <span className="text-[10px] font-black text-slate-700">{vehicle.licenceExpiry}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Insurance</span>
                    <span className="text-[10px] font-black text-slate-700">{vehicle.insuranceExpiry}</span>
                  </div>
                </div>
              </td>

              {/* Operational Status */}
              <td className="px-8 py-4">
                <StatusBadge
                  status={vehicle.operationalStatus}
                  statusColor={
                    vehicle.operationalStatus === 'Active' ? 'success' :
                      vehicle.operationalStatus === 'Maintenance' ? 'warning' : 'danger'
                  }
                />
              </td>
            </>
          )}
          actions={(vehicle) => (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleView(vehicle)}
                className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 rounded-xl transition-all hover:shadow-lg active:scale-95"
                title="View Dossier"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleEdit(vehicle)}
                className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-amber-600 hover:border-amber-100 rounded-xl transition-all hover:shadow-lg active:scale-95"
                title="Edit Registry"
              >
                <Edit className="w-4 h-4" />
              </button>
              {/* <button
                className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-100 rounded-xl transition-all hover:shadow-lg active:scale-95"
                title="Remove Asset"
              >
                <Trash2 className="w-4 h-4" />
              </button> */}
            </div>
          )}
        />

        {hasMore && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => fetchVehicles({ searchQuery, activeFilter, fromDate, toDate, isLoadMore: true })}
              disabled={loading}
              className="px-10 py-3 bg-white border border-slate-200 text-slate-500 font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-95 disabled:opacity-50 flex items-center gap-3"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />}
              {loading ? 'Synchronizing...' : 'Load More Asset Records'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
