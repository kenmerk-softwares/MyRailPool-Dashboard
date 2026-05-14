import React from 'react';
import { useParams, Link } from 'react-router-dom';
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
import { driversData, tripsData } from '../../../data/mockData';

export default function ViewDriver() {
  const { id } = useParams();
  const selectedDriver = driversData.find(d => d.driver_id.replace('#', '') === id);
  const driverTrips = selectedDriver ? tripsData.filter(t => t.driver === selectedDriver.name) : [];

  if (!selectedDriver) {
    return (
      <div className="p-10 text-center bg-white border border-slate-200 max-w-md mx-auto mt-20 rounded-xl shadow-sm">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-800">Operator Not Found</h3>
        <p className="text-slate-500 text-sm mt-1">The requested driver profile could not be located.</p>
        <Link to="/drivers" className="mt-6 inline-block px-6 py-2 bg-emerald-600 text-white rounded-lg font-bold text-sm shadow-sm">Return Index</Link>
      </div>
    );
  }

  const sections = [
    {
      title: 'Licensing & Operative Compliance',
      icon: Shield,
      fields: [
        { label: 'PH License', value: selectedDriver.ph_lic, icon: Award },
        { label: 'PH Expiry', value: selectedDriver.ph_exp, icon: Calendar, isDate: true },
        { label: 'DVLA License', value: selectedDriver.dvla_lic, icon: ShieldCheck },
        { label: 'DVLA Expiry', value: selectedDriver.dvla_exp, icon: Calendar, isDate: true },
        { label: 'DBS Cert No', value: selectedDriver.dbs_no, icon: FileText },
        { label: 'DBS Issue Date', value: selectedDriver.dbs_date, icon: Calendar, isDate: true },
        { label: 'Medical Exemption', value: selectedDriver.medical_ex, icon: Stethoscope, isBadge: true },
        { label: 'Training Status', value: selectedDriver.training_done, icon: CheckCircle2, isBadge: true },
        { label: 'Training Date', value: selectedDriver.training_date, icon: Calendar, isDate: true },
        { label: 'Council Notified', value: selectedDriver.council_notified, icon: Bell, isBadge: true },
      ]
    },
    {
      title: 'Employment Lifecycle & Onboarding',
      icon: Briefcase,
      fields: [
        { label: 'Service Start', value: selectedDriver.start_date, icon: Calendar, isDate: true },
        { label: 'Contract End', value: selectedDriver.end_date, icon: Calendar, isDate: true },
        { label: 'RTW Verified', value: selectedDriver.rtw_date, icon: Clock, isDate: true },
        { label: 'RTW Note', value: selectedDriver.rtw_note, icon: UserCheck },
        { label: 'Termination Reason', value: selectedDriver.termination_reason || 'N/A', icon: AlertCircle },
      ]
    }
  ];

  return (
    <div className="w-full max-w-full mx-auto pb-10 px-2 animate-in fade-in duration-300">
      {/* Header Bar */}
      <header className="flex items-center justify-between mb-4 bg-white p-4 border border-slate-200 rounded-xl shadow-sm">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-emerald-600 text-white flex items-center justify-center font-bold text-2xl rounded-lg">
            {selectedDriver.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight uppercase">{selectedDriver.name}</h1>
              <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-tight border rounded-full ${
                selectedDriver.status.toLowerCase() === 'active' 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm' 
                : 'bg-amber-50 text-amber-700 border-amber-100 shadow-sm'
              }`}>
                {selectedDriver.status}
              </span>
            </div>
            <div className="flex items-center gap-6 text-xs font-bold text-slate-500 mt-1.5">
              <span className="text-emerald-700 font-bold">{selectedDriver.driver_id}</span>
              <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-emerald-600" /> {selectedDriver.phone}</span>
              <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-emerald-600" /> {selectedDriver.email}</span>
              <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-emerald-600" /> {selectedDriver.address}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right border-r pr-5 border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mb-0.5">Total Trips</p>
            <p className="text-xl font-bold text-emerald-600 leading-none">{driverTrips.length}</p>
          </div>
          <Link
            to={`/drivers/edit/${selectedDriver.driver_id.replace('#', '')}`}
            className="px-6 py-3 bg-slate-900 text-white font-bold text-xs uppercase tracking-tight flex items-center gap-2 rounded-lg hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
          >
            <Edit className="w-4 h-4" /> Update Profile
          </Link>
        </div>
      </header>

     
      <main className="bg-white border border-slate-200 rounded-xl shadow-sm divide-y divide-slate-100 overflow-hidden">
        
  
        <div className="p-6 space-y-10">
          {sections.map((section, sIdx) => (
            <section key={sIdx}>
              <div className="flex items-center gap-2 mb-4 border-b border-slate-50 pb-2">
                <section.icon className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-tight">{section.title}</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-8 gap-y-6">
                {section.fields.map((field, fIdx) => (
                  <div key={fIdx} className="flex flex-col">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight mb-1">
                      {field.label}
                    </span>
                    <div className="flex items-center gap-2">
                      {field.isBadge ? (
                        <span className={`text-sm font-bold uppercase tracking-tight ${
                          field.value?.toLowerCase() === 'yes' || field.value?.toLowerCase() === 'completed'
                            ? 'text-emerald-600'
                            : field.value?.toLowerCase() === 'no' || field.value?.toLowerCase() === 'pending'
                            ? 'text-red-600'
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

          {/* Notes Section */}
          <section className="pt-2">
            <div className="flex items-center gap-2 mb-3 border-b border-slate-50 pb-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-tight">Confidential Notes</h3>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
              <p className="text-sm font-medium text-slate-600 leading-relaxed italic">
                {selectedDriver.notes || "Secure digital record initialized. No additional operational annotations recorded for this cycle."}
              </p>
            </div>
          </section>
        </div>

        {/* History Table */}
        <section className="bg-slate-50/20">
          <div className="p-5 flex items-center justify-between bg-white border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-100 text-emerald-700 flex items-center justify-center rounded-lg shadow-sm">
                <Car className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">Deployment Logs</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-0.5">
                  {driverTrips.length} Historical entries recorded
                </p>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Filter deployment history..."
                className="pl-9 pr-4 py-2 bg-white border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none rounded-lg w-64 shadow-sm"
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
                {driverTrips.length > 0 ? (
                  driverTrips.map((trip, idx) => (
                    <tr key={idx} className="hover:bg-emerald-50/30 transition-colors group">
                      <td className="pl-6 pr-4 py-4 text-sm font-bold text-slate-800">{trip.trip_id}</td>
                      <td className="px-4 py-4 text-sm font-bold text-slate-700 group-hover:text-emerald-700 transition-colors">{trip.route}</td>
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
                      No deployment logs found for this operator
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
}



