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
  ArrowLeft
} from 'lucide-react';
import { SectionHeader, StatusBadge } from '../../components/Shared';
import { driversData, tripsData } from '../../data/mockData';

export default function ViewDriver() {
    const { id } = useParams();
    const navigate = useNavigate();

    const selectedDriver = driversData.find(d => d.id.replace('#', '') === id);
    const driverTrips = selectedDriver ? tripsData.filter(t => t.driver === selectedDriver.name) : [];

    if (!selectedDriver) {
        return (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-100 shadow-sm animate-in fade-in duration-500">
                <h3 className="text-xl font-bold text-slate-800">Driver not found</h3>
                <Link
                    to="/drivers"
                    className="mt-4 inline-block px-6 py-2 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
                >
                    Back to List
                </Link>
            </div>
        );
    }

    const infoGroups = [
        {
            title: 'License & Security',
            icon: Shield,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50',
            fields: [
                { label: 'PH License', value: selectedDriver.ph_license, icon: Award },
                { label: 'PH Expiry', value: selectedDriver.ph_expiry, icon: Calendar, isDate: true },
                { label: 'DVLA license', value: selectedDriver.dvla_licence, icon: ShieldCheck },
                { label: 'DVLA Expiry', value: selectedDriver.dvla_licence_expiry, icon: Calendar, isDate: true },
                { label: 'DBS Cert No', value: selectedDriver.dbs_certificate_no, icon: FileText },
                { label: 'DBS Issue Date', value: selectedDriver.dbs_date_issue, icon: Calendar, isDate: true },
            ]
        },
        {
            title: 'Compliance & Training',
            icon: GraduationCap,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            fields: [
                { label: 'Medical Exemption', value: selectedDriver.medical_exemption, icon: Stethoscope, isBadge: true },
                { label: 'Training Status', value: selectedDriver.training_status, icon: CheckCircle2, isBadge: true },
                { label: 'Training Signed', value: selectedDriver.training_signed_date, icon: Calendar, isDate: true },
                { label: 'Work Verified', value: selectedDriver.work_verified_date, icon: Calendar, isDate: true },
                { label: 'Council Notified', value: selectedDriver.council_notified, icon: Bell, isBadge: true },
            ]
        },
        {
            title: 'Employment Lifecycle',
            icon: Briefcase,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
            fields: [
                { label: 'Start Date', value: selectedDriver.start_date, icon: Calendar, isDate: true },
                { label: 'End Date', value: selectedDriver.end_date, icon: Calendar, isDate: true },
                { label: 'Termination Reason', value: selectedDriver.termination_reason, icon: AlertCircle },
				{ label: 'Right to Work Verified Date', value: selectedDriver.rtw_notes, icon: Calendar, isDate: true },
				{ label: 'Notes', value: selectedDriver.notes, icon: FileText, isFullWidth: true },
            ]
        }
    ];

    return (
        <div className="animate-in fade-in duration-500 pb-12">
            <SectionHeader
                title="Driver Portfolio"
                subtitle={`Detailed profile and compliance records for ${selectedDriver.name}`}
                actionLabel="Edit Profile"
                actionIcon={Edit}
                actionTo={`/drivers/edit/${selectedDriver.id.replace('#', '')}`}
            />

            <div className="space-y-6">
                {/* Main Profile Card */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-center gap-6 md:gap-10 relative overflow-hidden">
                    <div className="relative shrink-0">
                        <div className="w-12 h-12 md:w-12 md:h-12 rounded-3xl bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center text-slate-900 font-bold text-4xl border border-slate-200 uppercase shadow-inner">
                            {selectedDriver.name.charAt(0)}
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-5 h-5 bg-emerald-500 rounded-2xl border-4 border-white flex items-center justify-center shadow-lg">
                            <ShieldCheck className="w-2 h-2 text-white" />
                        </div>
                    </div>

                    <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6 mb-4 justify-center md:justify-start">
                            <h3 className="text-xl md:text-xl font-bold text-slate-800 tracking-tight">{selectedDriver.name}</h3>
                            <StatusBadge status={selectedDriver.status} statusColor={selectedDriver.status.toLowerCase() === 'active' ? 'success' : 'warning'} />
                        </div>

                        <div className="flex gap-10 text-slate-600">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary-50 rounded-lg">
                                    <Phone className="w-4 h-4 text-primary-600" />
                                </div>
                                <span className="font-semibold">{selectedDriver.phone}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary-50 rounded-lg">
                                    <Mail className="w-4 h-4 text-primary-600" />
                                </div>
                                <span className="font-semibold">{selectedDriver.email}</span>
                            </div>
                            <div className="flex items-center gap-3 sm:col-span-2">
                                <div className="p-2 bg-primary-50 rounded-lg">
                                    <MapPin className="w-4 h-4 text-primary-600" />
                                </div>
                                <span className="font-medium text-slate-500">{selectedDriver.address}</span>
                            </div>
                        </div>
                    </div>

                    <div className="hidden lg:flex flex-col gap-3">
                        <div className="bg-slate-50/80 px-6 py-4 rounded-2xl border border-slate-100 text-center min-w-[140px] backdrop-blur-sm">
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Total Trips</p>
                            <p className="text-3xl font-bold text-slate-800">{driverTrips.length}</p>
                        </div>
                    </div>
                </div>

                {/* Detail Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {infoGroups.map((group, idx) => (
                        <div key={idx} className={`bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col ${group.title === 'Employment Lifecycle' ? 'lg:col-span-2' : ''}`}>
                            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/30 flex items-center gap-3">
                                <div className={`p-2 rounded-xl ${group.bg} ${group.color}`}>
                                    <group.icon className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold text-slate-800 tracking-tight">{group.title}</h3>
                            </div>
                            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {group.fields.map((field, fIdx) => (
                                    <div key={fIdx} className={`${field.isFullWidth ? 'sm:col-span-2' : ''} flex items-start gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50 hover:bg-white hover:border-slate-200 transition-all group`}>
                                        <div className="p-2 bg-white rounded-xl shadow-sm text-slate-400 group-hover:text-primary-500 transition-colors">
                                            <field.icon className="w-4 h-4 text-emerald-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{field.label}</p>
                                            {field.isBadge ? (
                                                <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide ${
                                                    field.value.toLowerCase() === 'yes' || field.value.toLowerCase() === 'completed' 
                                                    ? 'bg-emerald-100 text-emerald-700' 
                                                    : 'bg-slate-200 text-slate-700'
                                                }`}>
                                                    {field.value}
                                                </span>
                                            ) : (
                                                <p className={`text-sm font-bold text-slate-700 ${field.isDate ? 'font-mono' : ''}`}>
                                                    {field.value || 'N/A'}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Notes Sections */}
                {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <FileText className="w-16 h-16" />
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-primary-500" />
                            Right to Work Verified Date
                        </h4>
                        <div className="p-4 bg-primary-50/30 rounded-2xl border border-primary-100/50">
                            <p className="text-sm text-slate-600 italic leading-relaxed">
                                {selectedDriver.rtw_notes || 'No right to work notes recorded.'}
                            </p>
                        </div>
                    </div>
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Activity className="w-16 h-16" />
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-amber-500" />
                              Notes
                        </h4>
                        <div className="p-4 bg-amber-50/30 rounded-2xl border border-amber-100/50">
                            <p className="text-sm text-slate-600 italic leading-relaxed">
                                {selectedDriver.notes || 'No general notes available for this driver.'}
                            </p>
                        </div>
                    </div>
                </div> */}

                {/* Trips Table */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mt-8">
                    <div className="p-6 border-b border-slate-100 bg-white flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm">
                                <Car className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 tracking-tight">Trip Assignment History</h3>
                                <p className="text-xs text-slate-500 font-medium">Monitoring {driverTrips.length} previous journeys</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <div className="relative group flex-1 sm:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search logs..."
                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-primary-500 transition-all outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {driverTrips.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[600px]">
                                <thead>
                                    <tr className="bg-slate-50/50">
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">Trip ID</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">Route Details</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">Schedule</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {driverTrips.map((trip, idx) => (
                                        <tr key={idx} className="group hover:bg-slate-50/30 transition-colors">
                                            <td className="px-6 py-5">
                                                <span className="text-sm font-bold text-slate-800">{trip.id}</span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-1.5 bg-slate-100 rounded-lg">
                                                        <MapPin className="w-3 h-3 text-emerald-600" />
                                                    </div>
                                                    <span className="text-sm font-semibold text-slate-700">{trip.route}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                                                    <Clock className="w-3 h-3" />
                                                    {trip.date}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <StatusBadge status={trip.status} statusColor={trip.status === 'In Transit' ? 'primary' : 'success'} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 bg-slate-50/10">
                            <div className="w-20 h-20 rounded-3xl bg-white border border-slate-100 flex items-center justify-center text-slate-200 mb-4 shadow-sm">
                                <Car className="w-10 h-10" />
                            </div>
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No trip history</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
