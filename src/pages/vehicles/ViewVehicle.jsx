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
} from 'lucide-react';
import { StatusBadge } from '../../components/Shared';
import { vehiclesData } from '../../data/mockData';

export const ViewVehicle = () => {
  const { id } = useParams();
  const vehicle = vehiclesData.find(v => v.id.replace('#', '') === id);

  if (!vehicle) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/60 shadow-sm animate-in zoom-in duration-300">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-slate-500" />
        </div>
        <h3 className="text-xl font-bold text-slate-800">Asset Not Located</h3>
        <p className="text-slate-500 mt-1 mb-6">The requested vehicle registry could not be found in the system.</p>
        <Link
          to="/vehicles"
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-primary-700 text-white rounded-xl font-bold text-sm hover:bg-primary-800 transition-all shadow-lg shadow-primary-600/20"
        >
          Return to Fleet
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-12 px-4 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4 text-sm">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{vehicle.make} {vehicle.model}</h2>
              <StatusBadge
                status={vehicle.status}
                statusColor={vehicle.status === 'Active' ? 'success' : vehicle.status === 'Maintenance' ? 'warning' : 'danger'}
              />
            </div>
            <p className="text-slate-500 font-medium mt-1 flex items-center gap-2">
              <Hash className="w-3.5 h-3.5 text-indigo-500" /> {vehicle.registration_no} &bull; {vehicle.type}
            </p>
          </div>
        </div>
        <Link
          to={`/vehicles/edit/${id}`}
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-primary-700 text-white rounded-xl font-bold text-sm hover:bg-primary-800 transition-all shadow-lg shadow-primary-600/20"
        >
          <Edit className="w-4 h-4" /> Update Vehicle
        </Link>
      </div>

      <div className="space-y-8 text-sm">
        {/* Section 1: Basic Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/30">
            <div className="p-2 bg-primary-50 rounded-lg">
              <Car className="w-4 h-4 text-primary-600" />
            </div>
            <h3 className="font-bold text-slate-800 tracking-tight">Vehicle Identity</h3>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Vehicle ID</label>
                <p className="px-4 py-3 rounded-xl bg-slate-50 text-slate-700 font-bold border border-slate-100">{vehicle.id}</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Make & Model</label>
                <div className="px-4 py-3 rounded-xl bg-white text-slate-800 font-bold border border-slate-200 shadow-sm flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center text-white text-[10px] font-bold">
                    {vehicle.make.charAt(0)}
                  </div>
                  <span>{vehicle.make} {vehicle.model}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Vehicle Type</label>
                <p className="px-4 py-3 rounded-xl bg-indigo-50 text-indigo-700 font-extrabold border border-indigo-100 uppercase">{vehicle.type}</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Colour</label>
                <p className="px-4 py-3 rounded-xl bg-slate-50 text-slate-700 font-bold border border-slate-100">{vehicle.colour}</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Seating Capacity</label>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-slate-200">
                  <User className="w-4 h-4 text-slate-500" />
                  <span className="font-bold text-slate-800">{vehicle.capacity}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Registration & Licensing */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/30">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Shield className="w-4 h-4 text-indigo-600" />
            </div>
            <h3 className="font-bold text-slate-800 tracking-tight">Registration & Licensing</h3>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Plate Number</label>
                <p className="px-4 py-3 rounded-xl bg-indigo-50 text-indigo-700 font-extrabold border border-indigo-100 uppercase tracking-widest">{vehicle.registration_no}</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">PH License No</label>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-slate-200">
                  <Award className="w-4 h-4 text-slate-500" />
                  <span className="font-bold text-slate-800">{vehicle.ph_vehicle_licence_no}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Licence Expiry</label>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-slate-200">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <span className="font-bold text-slate-800 font-mono text-xs">{vehicle.licence_expiry}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Insurance Intelligence */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/30">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="font-bold text-slate-800 tracking-tight">Insurance Intelligence</h3>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Provider</label>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-slate-200">
                  <Briefcase className="w-4 h-4 text-slate-500" />
                  <span className="font-bold text-slate-800">{vehicle.insurence_provider}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Policy Number</label>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-slate-200">
                  <CreditCard className="w-4 h-4 text-slate-500" />
                  <span className="font-bold text-slate-800">{vehicle.policy_no}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Policy Expiry</label>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-slate-200">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <span className="font-bold text-slate-800 font-mono text-xs">{vehicle.insurence_expiry}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Fleet Management */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/30">
            <div className="p-2 bg-amber-50 rounded-lg">
              <Activity className="w-4 h-4 text-amber-600" />
            </div>
            <h3 className="font-bold text-slate-800 tracking-tight">Fleet Management</h3>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Assigned Driver</label>
                <div className="px-4 py-3 rounded-xl bg-white text-slate-800 font-bold border border-slate-200 shadow-sm flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center text-white text-[10px] font-bold">
                    {vehicle.driver?.charAt(0)}
                  </div>
                  <span>{vehicle.driver}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Asset Status</label>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-100">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-emerald-700 uppercase">{vehicle.status}</span>
                </div>
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Asset Remarks</label>
                <div className="px-4 py-3 rounded-xl bg-yellow-50/30 text-slate-600 font-medium italic border border-yellow-100 min-h-[46px]">
                  {vehicle.notes || 'No maintenance logs or special remarks recorded for this vehicle asset.'}
                </div>
              </div>
            </div>

            {/* Performance Summary */}
            <div className="mt-8 pt-6 border-t border-slate-50 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Total Missions</label>
                <p className="text-2xl font-bold text-slate-800">142</p>
                <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
                  <CheckCircle2 className="w-3 h-3" /> All Successful
                </div>
              </div>
              <div className="px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Distance Logged</label>
                <p className="text-2xl font-bold text-slate-800">12,450 km</p>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Cumulative Odometer</p>
              </div>
              <div className="px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-100 space-y-0.5">
                <label className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block">Health Index</label>
                <p className="text-2xl font-bold text-emerald-700">98%</p>
                <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">Optimal Condition</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};