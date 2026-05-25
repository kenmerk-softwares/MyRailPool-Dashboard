import React, { useEffect } from 'react';
import { Edit, Trash2, UserPlus, Eye, MapPin, Phone, Mail, Shield, Award, Calendar } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { SectionHeader, StatusBadge } from '../../../components/Shared';
import { Table } from '../../../shared/Table/Table';
import { useDrivers } from '../hooks/driver.useDrivers';

export const DriverList = () => {
  const navigate = useNavigate();
  const { drivers, loading, hasMore, fetchDrivers } = useDrivers();
  const [activeFilter, setActiveFilter] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [fromDate, setFromDate] = React.useState('');
  const [toDate, setToDate] = React.useState('');

  const handleView = (driver) => {
    const Id = String(driver?.docId || '').replace('#', '');
    navigate(`view/${Id}`);
  };

  const handleClear = () => {
    setFromDate('');
    setToDate('');
    setActiveFilter('');
    setSearchQuery('');
  };

  useEffect(() => {
    fetchDrivers({ searchQuery, activeFilter, fromDate, toDate });
  }, [searchQuery, activeFilter, fromDate, toDate, fetchDrivers]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <SectionHeader
        title="Driver Management"
        subtitle="Manage your fleet drivers, monitor compliance, and track performance metrics."
        actionLabel="Add New Driver"
        actionIcon={UserPlus}
        actionTo="/drivers/add"
      />

      <div className="pb-10">
        <Table
          headers={['Sl No', 'Driver Profile', 'Compliance & IDs', 'Status', 'Joined Date']}
          data={drivers}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          onClear={handleClear}
          fromDate={fromDate}
          setFromDate={setFromDate}
          toDate={toDate}
          setToDate={setToDate}
          searchPlaceholder="Search by name, email, or license..."
          filterOptions={[
            { label: 'Active', value: 'active' },
            { label: 'Inactive', value: 'inactive' },
            { label: 'On Leave', value: 'on_leave' },
            { label: 'Suspended', value: 'suspended' },
          ]}
          renderRow={(driver, idx) => (
            <>
              <td className="px-6 py-5 text-[13px] font-black text-slate-400/80">{(idx + 1).toString().padStart(2, '0')}</td>
              <td className="px-6 py-5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold border border-slate-200">
                    {driver.name?.charAt(0) || 'D'}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[14px] font-black text-slate-800 leading-tight">{driver.name}</span>
                    <div className="flex items-center gap-3 text-[11px] font-bold text-slate-400">
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {driver.mobile}</span>
                      <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {driver.email}</span>
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-5">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Award className="w-3.5 h-3.5 text-indigo-500" />
                    <span className="text-[12px] font-bold text-slate-600 uppercase tracking-tight">PH: {driver.phLicenseNumber}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-[12px] font-bold text-slate-600 uppercase tracking-tight">DVLA: {driver.dvlaLicenseNumber}</span>
                  </div>
                </div>
              </td>
              <td className="px-6 py-5">
                <StatusBadge
                  status={driver?.status || 'active'}
                  statusColor={
                    driver?.status === 'active' ? 'success' :
                      driver?.status === 'inactive' ? 'warning' :
                        'danger'
                  }
                />
              </td>
              <td className="px-6 py-5">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-300" />
                  <span className="text-[13px] font-black text-slate-500">{driver.serviceStartDate || 'N/A'}</span>
                </div>
              </td>
            </>
          )}
          actions={(driver) => (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleView(driver)}
                className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 hover:bg-indigo-50/30 rounded-xl transition-all duration-300 hover:shadow-md active:scale-95 group"
                title="View Full Profile"
              >
                <Eye className="w-4 h-4 transition-transform group-hover:scale-110" />
              </button>
              <Link
                to={`/drivers/edit/${driver.docId}`}
                className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-amber-600 hover:border-amber-100 hover:bg-amber-50/30 rounded-xl transition-all duration-300 hover:shadow-md active:scale-95 group"
                title="Edit Records"
              >
                <Edit className="w-4 h-4 transition-transform group-hover:scale-110" />
              </Link>
              <button
                className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-100 hover:bg-rose-50/30 rounded-xl transition-all duration-300 hover:shadow-md active:scale-95 group"
                title="Remove Driver"
              >
                <Trash2 className="w-4 h-4 transition-transform group-hover:scale-110" />
              </button>
            </div>
          )}
        />

        {hasMore && (
          <div className="mt-10 flex justify-center">
            <button
              onClick={() => fetchDrivers({ searchQuery, activeFilter, isLoadMore: true })}
              disabled={loading}
              className="group relative px-10 py-3.5 bg-white border border-slate-200 text-slate-500 font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl hover:border-indigo-300 hover:text-indigo-600 transition-all duration-300 shadow-sm active:scale-95 disabled:opacity-50 overflow-hidden"
            >
              <span className="relative z-10">{loading ? 'Synchronizing Data...' : 'Load More Records'}</span>
              <div className="absolute inset-0 bg-indigo-50 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

