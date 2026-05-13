import React from 'react';
import { Plus, Edit, Trash2, Car, Eye } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { SectionHeader, StatusBadge } from '../../../components/Shared';
import { vehiclesData } from '../../../data/mockData';
import { Filter } from '../../../Filter/Filter';

export const VehicleList = () => {
  const navigate = useNavigate();

  const handleView = (vehicle) => {
    const Id = vehicle.id.replace('#', '');
    navigate(`view/${Id}`);
  };

  const [activeFilter, setActiveFilter] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleClear = () => {
    setActiveFilter('');
    setSearchQuery('');
  };

  const filteredData = vehiclesData.filter(item => {
    const matchesSearch = !searchQuery || 
      item.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.registration_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = !activeFilter || item.status.toLowerCase() === activeFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <SectionHeader
        title="Fleet Management"
        subtitle="Manage your vehicle inventory, compliance status, and operational capacity."
        actionLabel="Add Vehicle"
        actionIcon={Plus}
        actionTo="/vehicles/add"
      />

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden pb-10">
        <div className="overflow-x-auto w-full">
          <Filter 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            onClear={handleClear}
            searchPlaceholder="Search fleet assets (Plate, Model)..."
            options={[
              { label: 'Active', value: 'active' },
              { label: 'Maintenance', value: 'maintenance' },
              { label: 'Inactive', value: 'inactive' },
            ]}
          />

          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50/50">
              <th className='px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100'>Sl No</th>
                <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100">Asset Identity</th>
                <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100 hidden sm:table-cell">Specifications</th>
                <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100 hidden md:table-cell">Assigned Driver</th>
                <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100">Status</th>
                <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((vehicle, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-4 md:px-6 py-4 text-xs md:text-sm font-medium text-slate-900">{idx + 1}</td>
                  <td className="px-4 md:px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="text-xs md:text-sm font-medium text-slate-900">{vehicle.make} {vehicle.model}</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] text-slate-500">{vehicle.id}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300 inline-block"></span>
                          <span className="text-[10px] text-primary-600 font-medium font-mono">{vehicle.registration_no}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4 hidden sm:table-cell">
                    <div className="text-xs md:text-sm font-medium text-slate-800">{vehicle.type}</div>
                    <div className="text-[10px] md:text-xs text-slate-500 mt-0.5">{vehicle.capacity} Capacity</div>
                  </td>
                  <td className="px-4 md:px-6 py-4 hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 text-[10px] font-bold border border-indigo-100">
                        {vehicle.driver.charAt(0)}
                      </div>
                      <span className="text-xs md:text-sm text-slate-600">{vehicle.driver}</span>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <StatusBadge
                      status={vehicle.status}
                      statusColor={
                        vehicle.status === 'Active' ? 'success' :
                        vehicle.status === 'Maintenance' ? 'warning' : 'danger'
                      }
                    />
                  </td>
                  <td className="px-4 md:px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleView(vehicle)}
                        className="text-primary-600 hover:text-primary-800 p-1.5 rounded-lg hover:bg-primary-50 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <Link
                        to={`/vehicles/edit/${vehicle.id.replace('#', '')}`}
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

          {vehiclesData.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 bg-slate-50/10">
              <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-200 mb-4 shadow-sm">
                <Car className="w-8 h-8" />
              </div>
              <p className="text-slate-500 font-medium text-xs uppercase tracking-wider">Fleet Registry is empty</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
