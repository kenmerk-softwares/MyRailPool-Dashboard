import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Award,
  Briefcase,
  Edit,
  Phone,
  Activity,
  MapPin,
  Calendar,
  Car,
  ShieldCheck,
  Search,
  Mail,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  Shield,
  Stethoscope,
  GraduationCap,
  Bell,
  UserCheck
} from 'lucide-react';
import { SectionHeader, StatusBadge } from '../../components/Shared';
import { driversData, tripsData } from '../../data/mockData';

export default function ViewDriver() {
  const { id } = useParams();
  const navigate = useNavigate();

  const selectedDriver = driversData.find(d => d.driver_id.replace('#', '') === id);
  const driverTrips = selectedDriver ? tripsData.filter(t => t.driver === selectedDriver.name) : [];

  if (!selectedDriver) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/60 shadow-sm animate-in zoom-in duration-300">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-slate-500" />
        </div>
        <h3 className="text-xl font-bold text-slate-800">Operator Profile Not Found</h3>
        <p className="text-slate-500 mt-1 mb-6">The specified driver ID does not exist in the database.</p>
        <Link
          to="/drivers"
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-primary-700 text-white rounded-xl font-bold text-sm hover:bg-primary-800 transition-all shadow-lg shadow-primary-600/20"
        >
          Return to Fleet Index
        </Link>
      </div>
    );
  }

  const infoGroups = [
    {
      title: 'Licensing Jurisdictions',
      icon: Shield,
      iconBg: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
      fields: [
        { label: 'PH License', value: selectedDriver.ph_lic, icon: Award },
        { label: 'PH Expiry', value: selectedDriver.ph_exp, icon: Calendar, isDate: true },
        { label: 'DVLA License', value: selectedDriver.dvla_lic, icon: ShieldCheck },
        { label: 'DVLA Expiry', value: selectedDriver.dvla_exp, icon: Calendar, isDate: true },
        { label: 'DBS Cert No', value: selectedDriver.dbs_no, icon: FileText },
        { label: 'DBS Issue Date', value: selectedDriver.dbs_date, icon: Calendar, isDate: true },
      ]
    },
    {
      title: 'Operative Compliance',
      icon: GraduationCap,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      fields: [
        { label: 'Medical Exemption', value: selectedDriver.medical_ex, icon: Stethoscope, isBadge: true },
        { label: 'Training Status', value: selectedDriver.training_done, icon: CheckCircle2, isBadge: true },
        { label: 'Training Date', value: selectedDriver.training_date, icon: Calendar, isDate: true },
        { label: 'RTW Verified', value: selectedDriver.rtw_date, icon: Clock, isDate: true },
        { label: 'RTW Note', value: selectedDriver.rtw_note, icon: UserCheck },
        { label: 'Council Notified', value: selectedDriver.council_notified, icon: Bell, isBadge: true },
      ]
    },
    {
      title: 'Fleet Lifecycle & Metrics',
      icon: Briefcase,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      fields: [
        { label: 'Service Start', value: selectedDriver.start_date, icon: Calendar, isDate: true },
        { label: 'Contract End', value: selectedDriver.end_date, icon: Calendar, isDate: true },
        { label: 'Termination Reason', value: selectedDriver.termination_reason, icon: AlertCircle },
        { label: 'Confidential Notes', value: selectedDriver.notes, icon: Activity, isFullWidth: true },
      ]
    }
  ];

  return (
    <div className="max-w-6xl mx-auto pb-12 px-4 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4 text-sm">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Driver Profile</h2>
              <StatusBadge
                status={selectedDriver.status}
                statusColor={selectedDriver.status.toLowerCase() === 'active' ? 'success' : 'warning'}
              />
            </div>
            <p className="text-slate-500 font-medium mt-1">
              Operational record and compliance analytics for {selectedDriver.name}
            </p>
          </div>
        </div>
        <Link
          to={`/drivers/edit/${selectedDriver.driver_id.replace('#', '')}`}
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-primary-700 text-white rounded-xl font-bold text-sm hover:bg-primary-800 transition-all shadow-lg shadow-primary-600/20"
        >
          <Edit className="w-4 h-4" /> Update Profile
        </Link>
      </div>

      <div className="space-y-8 text-sm">
        {/* Identity Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/30">
            <div className="p-2 bg-primary-50 rounded-lg">
              <UserCheck className="w-4 h-4 text-primary-600" />
            </div>
            <h3 className="font-bold text-slate-800 tracking-tight">Identity & Contact</h3>
          </div>

          <div className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-10">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100/50 flex items-center justify-center text-primary-800 font-bold text-2xl border border-primary-100 uppercase shadow-inner">
                  {selectedDriver.name.charAt(0)}
                </div>
                <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-emerald-500 rounded-xl border-4 border-white flex items-center justify-center shadow-lg">
                  <ShieldCheck className="w-3.5 h-3.5 text-white" />
                </div>
              </div>

              {/* Details */}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <h3 className="text-xl font-bold text-slate-800 tracking-tight">{selectedDriver.name}</h3>
                  <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-semibold text-slate-500 uppercase tracking-wider border border-slate-200">
                    {selectedDriver.driver_id}
                  </span>
                </div>
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2.5 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100">
                    <Phone className="w-4 h-4 text-primary-600" />
                    <span className="font-bold text-sm text-slate-700">{selectedDriver.phone}</span>
                  </div>
                  <div className="flex items-center gap-2.5 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100">
                    <Mail className="w-4 h-4 text-primary-600" />
                    <span className="font-bold text-sm text-slate-700">{selectedDriver.email}</span>
                  </div>
                  <div className="flex items-center gap-2.5 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100">
                    <MapPin className="w-4 h-4 text-primary-600" />
                    <span className="font-bold text-sm text-slate-700">{selectedDriver.address}</span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="shrink-0 px-6 py-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Trips</p>
                <p className="text-3xl font-bold text-slate-800">{driverTrips.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Info Groups */}
        {infoGroups.map((group, idx) => (
          <div key={idx} className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/30">
              <div className={`p-2 ${group.iconBg} rounded-lg`}>
                <group.icon className={`w-4 h-4 ${group.iconColor}`} />
              </div>
              <h3 className="font-bold text-slate-800 tracking-tight">{group.title}</h3>
            </div>

            <div className={`p-6 grid grid-cols-1 gap-6 ${
              group.title === 'Fleet Lifecycle & Metrics'
                ? 'sm:grid-cols-2 lg:grid-cols-4'
                : 'sm:grid-cols-2 lg:grid-cols-3'
            }`}>
              {group.fields.map((field, fIdx) => (
                <div
                  key={fIdx}
                  className={`space-y-1.5 ${
                    field.isFullWidth
                      ? (group.title === 'Fleet Lifecycle & Metrics' ? 'sm:col-span-2 lg:col-span-4' : 'sm:col-span-2 lg:col-span-3')
                      : ''
                  }`}
                >
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    {field.label}
                  </label>
                  {field.isBadge ? (
                    <div className="px-4 py-3 rounded-xl bg-white border border-slate-200 flex items-center gap-3">
                      <field.icon className="w-4 h-4 text-slate-400" />
                      <span className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                        field.value?.toLowerCase() === 'yes' || field.value?.toLowerCase() === 'completed'
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {field.value || 'N/A'}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-slate-200">
                      <field.icon className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className={`font-bold text-slate-800 truncate ${field.isDate ? 'font-mono text-xs' : ''}`}>
                        {field.value || '---'}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Trip History */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/30">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <Car className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 tracking-tight">Trip History</h3>
                <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">
                  {driverTrips.length} historical deployments
                </p>
              </div>
            </div>
            <div className="relative group w-full sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
              <input
                type="text"
                placeholder="Search logs..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none"
              />
            </div>
          </div>

          {driverTrips.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-6 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">Deployment ID</th>
                    <th className="px-6 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">Operative Path</th>
                    <th className="px-6 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">Timestamp</th>
                    <th className="px-6 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {driverTrips.map((trip, idx) => (
                    <tr key={idx} className="group hover:bg-slate-50/40 transition-colors">
                      <td className="px-6 py-5">
                        <span className="font-bold text-slate-800">{trip.trip_id}</span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-100 rounded-xl group-hover:bg-white transition-colors">
                            <MapPin className="w-3.5 h-3.5 text-primary-600" />
                          </div>
                          <span className="font-bold text-slate-700">{trip.route}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 font-mono text-slate-500 text-xs">
                          <Clock className="w-3.5 h-3.5" />
                          {trip.trip_date}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <StatusBadge status={trip.status} statusColor={trip.status === 'COMPLETED' ? 'success' : 'primary'} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-slate-50/10">
              <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-300 mb-4 shadow-sm">
                <Activity className="w-8 h-8" />
              </div>
              <p className="text-slate-400 font-semibold uppercase tracking-widest text-[11px]">Zero historical deployments</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
