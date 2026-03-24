import React from 'react';
import { Plus, Edit, Trash2, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SectionHeader } from '../../components/Shared';
import { driversData } from '../../data/mockData';

export const DriverList = () => (
  <>
    <SectionHeader 
      title="Driver Management" 
      subtitle="Manage driver profiles, license details, and availability." 
      actionLabel="Add Driver"
      actionIcon={UserPlus}
      actionTo="/drivers/add"
    />

    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-8">
      <div className="p-4 md:p-6 border-b border-slate-100">
        <h3 className="text-base md:text-lg font-bold text-slate-800">Drivers Directory</h3>
      </div>
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100">Name</th>
              <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100">Phone & License</th>
              <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100 hidden sm:table-cell">Experience</th>
              <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100">Status</th>
              <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {driversData.map((driver, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-4 md:px-6 py-4 text-xs md:text-sm font-medium text-slate-900">{driver.name}</td>
                <td className="px-4 md:px-6 py-4">
                  <div className="text-xs md:text-sm text-slate-800">{driver.phone}</div>
                  <div className="text-[10px] md:text-xs text-slate-500 mt-0.5">{driver.license}</div>
                </td>
                 <td className="px-4 md:px-6 py-4 text-xs md:text-sm text-slate-600 hidden sm:table-cell">{driver.experience}</td>
                <td className="px-4 md:px-6 py-4 text-xs md:text-sm">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${driver.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    {driver.status}
                  </span>
                </td>
                <td className="px-4 md:px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link to={`/drivers/edit/${driver.id.replace('#','')}`} className="text-primary-600 hover:text-primary-800 p-1.5 rounded-lg hover:bg-primary-50 transition-colors">
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
