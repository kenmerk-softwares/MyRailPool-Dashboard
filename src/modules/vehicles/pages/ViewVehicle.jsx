import React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Car,
  Shield,
  Calendar,
  User,
  CheckCircle2,
  AlertCircle,
  Edit,
  CreditCard,
  ShieldCheck,
  Briefcase,
  Hash,
  Activity,
  Award,
  Phone,
  Mail,
  MapPin,
  Search,
  Clock,
  Info
} from 'lucide-react';
import { StatusBadge } from '../../../components/Shared';
import { vehiclesData, tripsData } from '../../../data/mockData';

export const ViewVehicle = () => {
  const { id } = useParams();
  const vehicle = vehiclesData.find(v => v.id.replace('#', '') === id);
  const vehicleTrips = vehicle ? tripsData.filter(t => t.vehicle_id === vehicle.id) : [];

  if (!vehicle) {
    return (
      <div className="p-10 text-center bg-white border border-slate-200 max-w-md mx-auto mt-20 rounded-xl shadow-sm">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-800">Asset Not Located</h3>
        <p className="text-slate-500 text-sm mt-1">The requested vehicle registry could not be found in the system.</p>
        <Link to="/vehicles" className="mt-6 inline-block px-6 py-2 bg-primary-700 text-white rounded-lg font-bold text-sm shadow-sm">Return Index</Link>
      </div>
    );
  }

  const sections = [
    {
      title: 'Asset Configuration & Management',
      icon: Car,
      fields: [
        { label: 'Vehicle Make', value: vehicle.make, icon: Car },
        { label: 'Vehicle Model', value: vehicle.model, icon: Info },
        { label: 'Vehicle Type', value: vehicle.type, icon: Hash },
        { label: 'Colour', value: vehicle.colour, icon: Activity },
        { label: 'Seating Capacity', value: vehicle.capacity, icon: User },
        { label: 'Assigned Driver', value: vehicle.driver, icon: User },
        { label: 'Asset Status', value: vehicle.status, icon: CheckCircle2, isBadge: true },
      ]
    },
    {
      title: 'Compliance & Coverage Details',
      icon: Shield,
      fields: [
        { label: 'Registration No', value: vehicle.registration_no, icon: Hash },
        { label: 'PH Vehicle Licence', value: vehicle.ph_vehicle_licence_no, icon: Award },
        { label: 'Licence Expiry', value: vehicle.licence_expiry, icon: Calendar, isDate: true },
        { label: 'Insurance Provider', value: vehicle.insurence_provider, icon: Briefcase },
        { label: 'Policy Number', value: vehicle.policy_no, icon: CreditCard },
        { label: 'Insurance Expiry', value: vehicle.insurence_expiry, icon: Calendar, isDate: true },
      ]
    }
  ];

  return (
    <div className="w-full max-w-full mx-auto pb-10 px-2 animate-in fade-in duration-300">
      {/* Header Bar */}
      <header className="flex items-center justify-between mb-4 bg-white p-4 border border-slate-200 rounded-xl shadow-sm">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-primary-700 text-white flex items-center justify-center font-bold text-2xl rounded-lg">
            {vehicle.make.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight uppercase">{vehicle.make} {vehicle.model}</h1>
              <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-tight border rounded-full ${
                vehicle.status.toLowerCase() === 'active' 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm' 
                : 'bg-amber-50 text-amber-700 border-amber-100 shadow-sm'
              }`}>
                {vehicle.status}
              </span>
            </div>
            <div className="flex items-center gap-6 text-xs font-bold text-slate-500 mt-1.5">
              <span className="text-primary-700 font-bold">{vehicle.id}</span>
              <span className="flex items-center gap-1.5"><Hash className="w-3.5 h-3.5 text-primary-600" /> {vehicle.registration_no}</span>
              <span className="flex items-center gap-1.5"><Car className="w-3.5 h-3.5 text-primary-600" /> {vehicle.type}</span>
              <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-primary-600" /> {vehicle.capacity} Seats</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right border-r pr-5 border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mb-0.5">Total Missions</p>
            <p className="text-xl font-bold text-primary-700 leading-none">{vehicleTrips.length || 0}</p>
          </div>
          <Link
            to={`/vehicles/edit/${id}`}
            className="px-6 py-3 bg-slate-900 text-white font-bold text-xs uppercase tracking-tight flex items-center gap-2 rounded-lg hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
          >
            <Edit className="w-4 h-4" /> Update Asset
          </Link>
        </div>
      </header>

      
      <main className="bg-white border border-slate-200 rounded-xl shadow-sm divide-y divide-slate-100 overflow-hidden">
        
        
        <div className="p-6 space-y-10">
          {sections.map((section, sIdx) => (
            <section key={sIdx}>
              <div className="flex items-center gap-2 mb-4 border-b border-slate-50 pb-2">
                <section.icon className="w-4 h-4 text-primary-700" />
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-tight">{section.title}</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-6">
                {section.fields.map((field, fIdx) => (
                  <div key={fIdx} className="flex flex-col">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight mb-1">
                      {field.label}
                    </span>
                    <div className="flex items-center gap-2">
                      {field.isBadge ? (
                        <span className={`text-sm font-bold uppercase tracking-tight ${
                          field.value?.toLowerCase() === 'active' || field.value?.toLowerCase() === 'yes'
                            ? 'text-emerald-600'
                            : field.value?.toLowerCase() === 'maintenance'
                            ? 'text-amber-600'
                            : 'text-slate-500'
                        }`}>
                          {field.value || 'N/A'}
                        </span>
                      ) : (
                        <span className={`text-[15px] font-bold text-slate-800 leading-tight truncate ${field.isDate ? 'text-sm' : ''}`}>
                          {field.value || '---'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}


          <section className="pt-2">
            <div className="flex items-center gap-2 mb-3 border-b border-slate-50 pb-2">
              <Activity className="w-4 h-4 text-primary-700" />
              <h3 className="text-xs font-bold text-slate-400 uppercase ">Asset Remarks</h3>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
              <p className="text-sm font-medium text-slate-600 leading-relaxed italic">
                {vehicle.notes || "No maintenance logs or special remarks recorded for this vehicle asset."}
              </p>
            </div>
          </section>
        </div>

        <section className="bg-slate-50/20">
          <div className="p-5 flex items-center justify-between bg-white border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary-100 text-primary-700 flex items-center justify-center rounded-lg shadow-sm">
                <Car className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">Deployment Logs</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-0.5">
                  {vehicleTrips.length} Historical entries recorded
                </p>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Filter deployment history..."
                className="pl-9 pr-4 py-2 bg-white border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none rounded-lg w-64 shadow-sm"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="pl-6 pr-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-tight">Trip ID</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-tight">Route Details</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-tight">Timestamp</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-tight text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {vehicleTrips.length > 0 ? (
                  vehicleTrips.map((trip, idx) => (
                    <tr key={idx} className="hover:bg-primary-50/30 transition-colors group">
                      <td className="pl-6 pr-4 py-4 text-sm font-bold text-slate-800">{trip.trip_id}</td>
                      <td className="px-4 py-4 text-sm font-bold text-slate-700 group-hover:text-primary-700 transition-colors">{trip.route}</td>
                      <td className="px-4 py-4 text-xs font-bold text-slate-400 italic">{trip.trip_date}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight border shadow-sm ${
                          trip.status === 'COMPLETED' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                        }`}>
                          {trip.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-sm font-bold text-slate-400 uppercase tracking-tight">
                      No missions logged for this asset
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};