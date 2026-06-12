import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
  Clock,
  Info,
  ChevronLeft,
  Loader2,
  Search,
  MapPin,
  FileText
} from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../shared/services/firebase';
import { useToast } from '../../../shared/hooks/ToastContext';
import { StatusBadge } from '../../../components/Shared';

export const ViewVehicle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const docId = String(id || '').replace('#', '');
        const docRef = doc(db, "vehicles", docId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setVehicle({ ...docSnap.data(), docId: docSnap.id });
        } else {
          showToast("Asset dossier not found", "error");
          navigate('/vehicles');
        }
      } catch (error) {
        console.error("Fetch Error:", error);
        showToast("Access Denied: Unable to retrieve asset registry", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchVehicle();
  }, [id, navigate, showToast]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Accessing Asset Dossier...</p>
      </div>
    );
  }

  if (!vehicle) return null;

  const sections = [
    {
      title: 'Technical Configuration',
      icon: Car,
      fields: [
        { label: 'Manufacturer', value: vehicle.make, icon: Car },
        { label: 'Model Series', value: vehicle.model, icon: Info },
        { label: 'Asset Category', value: vehicle.type, icon: Hash },
        { label: 'Visual Specification', value: vehicle.colour, icon: Activity },
        { label: 'Seating Capacity', value: vehicle.seatingCapacity, icon: User },
        { label: 'Operational Registry', value: vehicle.operationalStatus, icon: CheckCircle2, isBadge: true },
      ]
    },
    {
      title: 'Compliance & Protection Registry',
      icon: Shield,
      fields: [
        { label: 'Registry Plate', value: vehicle.registrationNo, icon: Hash, isPlate: true },
        { label: 'PH Asset Licence', value: vehicle.phVehicleLicence, icon: Award },
        { label: 'Licence Expiry', value: vehicle.licenceExpiry, icon: Calendar, isDate: true },
        { label: 'Insurance Underwriter', value: vehicle.providerName, icon: Briefcase },
        { label: 'Protection Policy', value: vehicle.policyNumber, icon: CreditCard },
        { label: 'Insurance Expiry', value: vehicle.insuranceExpiry, icon: Calendar, isDate: true },
      ]
    }
  ];

  return (
    <div className="w-full max-w-full mx-auto pb-12 px-2 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* ── Asset Hero Header ── */}
      <header className="mb-6">
        <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          {/* Background Decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -mr-32 -mt-32 z-0"></div>

          <div className="flex items-center gap-6 relative z-10">
            <div className="w-20 h-20 bg-slate-900 text-white flex items-center justify-center rounded-2xl shadow-xl shadow-slate-200 ring-4 ring-slate-50 transition-transform hover:scale-105 duration-500">
              <Car className="w-10 h-10" />
            </div>

            <div>
              <div className="flex items-center gap-3">
                <Link to="/vehicles" className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                  <ChevronLeft className="w-4 h-4 text-slate-500" />
                </Link>
                <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">{vehicle.make} {vehicle.model}</h1>
                <StatusBadge
                  status={vehicle.operationalStatus}
                  statusColor={vehicle.operationalStatus === 'Active' ? 'success' : vehicle.operationalStatus === 'Maintenance' ? 'warning' : 'danger'}
                />
              </div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2">
                <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 rounded-lg border border-indigo-100">
                  <Hash className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="text-xs font-black text-indigo-700 font-mono tracking-wider">{vehicle.registrationNo}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <span className="text-[10px] font-black uppercase tracking-widest">Asset ID:</span>
                  <span className="text-xs font-bold text-slate-600 tracking-tight">{vehicle.id}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <Activity className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">{vehicle.type}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 relative z-10">
            <Link
              to={`/vehicles/edit/${vehicle.docId}`}
              className="px-8 py-3 bg-indigo-600 text-white font-black text-[11px] uppercase tracking-[0.15em] flex items-center gap-3 rounded-xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 active:scale-95"
            >
              <Edit className="w-4 h-4" /> Update Asset
            </Link>
          </div>
        </div>
      </header>

      {/* ── Asset Specifications ── */}
      <main className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column: Data Grids */}
          <div className="lg:col-span-2 space-y-6">
            {sections.map((section, sIdx) => (
              <div key={sIdx} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden group">
                <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-3 bg-slate-50/30 group-hover:bg-slate-50 transition-colors duration-500">
                  <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100 group-hover:scale-110 transition-transform duration-500">
                    <section.icon className="w-4 h-4 text-indigo-600" />
                  </div>
                  <h3 className="font-bold text-slate-800 tracking-tight uppercase text-xs">{section.title}</h3>
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {section.fields.map((field, fIdx) => (
                    <div key={fIdx} className="space-y-1.5 group/field">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block group-hover/field:text-indigo-400 transition-colors">
                        {field.label}
                      </span>
                      <div className="flex items-center gap-2">
                        {field.isBadge ? (
                          <div className="mt-1">
                            <StatusBadge status={field.value} statusColor={field.value === 'Active' ? 'success' : 'warning'} />
                          </div>
                        ) : (
                          <span className={`text-[15px] font-black text-slate-800 tracking-tight ${field.isPlate ? 'font-mono text-indigo-700' : ''}`}>
                            {field.value || '—'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Remarks Section */}
            <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 transition-transform duration-700">
                <FileText className="w-20 h-20 text-indigo-500" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <Activity className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Asset Operational Remarks</h3>
                </div>
                <p className="text-slate-300 font-medium text-sm leading-relaxed italic pr-20">
                  "{vehicle.notes || "No maintenance logs or special remarks recorded for this vehicle asset. All configurations are standard as per the registry."}"
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Assigned Entity & Quick Stats */}
          <div className="space-y-6">
            {/* Driver Assignment Card */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500 border-l-4 border-l-indigo-600">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                  <User className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-tight">Active Deployment</h3>
              </div>

              {vehicle.assignedDriver ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center text-white text-xl font-black shadow-lg uppercase">
                      {vehicle.assignedDriver.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-slate-800 tracking-tight leading-none">{vehicle.assignedDriver}</h4>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Verified Operator
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <Link to={`/drivers/edit/${vehicle.driverId}`} className="w-full py-2.5 bg-slate-50 text-slate-600 rounded-xl font-bold text-[10px] uppercase tracking-widest text-center border border-slate-100 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-all">
                      View Operator Dossier
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                  <User className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                  <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Unassigned Asset</p>
                </div>
              )}
            </div>

            {/* Quick Metrics */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                  <Activity className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-tight">Performance Summary</h3>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 group hover:bg-white hover:shadow-lg transition-all duration-300 cursor-default">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Missions Logged</p>
                      <h5 className="text-2xl font-black text-slate-800">0</h5>
                    </div>
                    <Clock className="w-8 h-8 text-slate-100 group-hover:text-indigo-100 transition-colors" />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── Deployment Logs ── */}
        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-xs uppercase tracking-widest">Historical Deployment Logs</h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">Asset Utilization Audit</p>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input type="text" placeholder="Filter deployment records..." className="pl-11 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-200 transition-all w-64" />
            </div>
          </div>

          <div className="p-20 text-center flex flex-col items-center gap-3">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-slate-200" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">No Deployment Logs Found</p>
              <p className="text-[10px] font-medium text-slate-300 uppercase mt-1">This asset has no recorded mission history in the central registry</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};