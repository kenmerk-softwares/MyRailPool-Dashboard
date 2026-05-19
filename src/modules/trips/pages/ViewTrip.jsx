import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Clock,
  Users,
  Navigation,
  Leaf,
  Edit,
  TrendingUp,
  Hash,
  Globe,
  Milestone,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  MapPin,
  ChevronLeft,
  Loader2,
  Calendar,
  Activity,
  Car,
  User,
  Shield,
  FileText
} from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../shared/services/firebase';
import { useToast } from '../../../shared/hooks/ToastContext';
import { StatusBadge } from '../../../components/Shared';

export const ViewTrip = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const docId = String(id || '').replace('#', '');
        const docRef = doc(db, "trips", docId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setTrip({ ...docSnap.data(), docId: docSnap.id });
        } else {
          showToast("Trip dossier not found", "error");
          navigate('/trips');
        }
      } catch (error) {
        console.error("Fetch Error:", error);
        showToast("Access Denied: Unable to retrieve trip registry", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchTrip();
  }, [id, navigate, showToast]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Accessing Operational Dossier...</p>
      </div>
    );
  }

  if (!trip) return null;

  const sections = [
    {
      title: 'Resource Allocation',
      icon: Shield,
      fields: [
        { label: 'Assigned Operator', value: trip.driver_name, icon: User },
        { label: 'Asset Registry', value: trip.vehicle_reg, icon: Car },
        { label: 'Service Type', value: trip.route_type, icon: Activity },
        { label: 'Fleet Capacity', value: `${trip.total_seats} Seats`, icon: Users },
      ]
    },
    {
      title: 'Trip Configuration',
      icon: Milestone,
      fields: [
        {
          label: 'Route Corridor',
          value: trip.route_name,
          icon: Globe,
          link: `/routes/view/${trip.route_id}`
        },
        { label: 'Registry ID', value: trip.tripId, icon: Hash },
        { label: 'Scheduled Dates', value: `${trip.selectedDates?.length || 0} Deployments`, icon: Calendar },
        { label: 'Operational Status', value: trip.status, icon: CheckCircle, isBadge: true },
      ]
    }
  ];

  return (
    <div className="w-full max-w-full mx-auto pb-12 px-2 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* ── Mission Hero Header ── */}
      <header className="mb-6">
        <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -mr-32 -mt-32 z-0"></div>

          <div className="flex items-center gap-6 relative z-10">
            <div className="w-20 h-20 bg-slate-900 text-white flex items-center justify-center rounded-2xl shadow-xl shadow-slate-200 ring-4 ring-slate-50 transition-transform hover:scale-105 duration-500">
              <Navigation className="w-10 h-10" />
            </div>

            <div>
              <div className="flex items-center gap-3">
                <Link to="/trips" className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                  <ChevronLeft className="w-4 h-4 text-slate-400" />
                </Link>
                <Link to={`/routes/view/${trip.route_id}`} className="hover:text-indigo-600 transition-colors">
                  <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">{trip.route_name}</h1>
                </Link>
                <StatusBadge
                  status={trip.status}
                  statusColor={trip.status === 'Active' ? 'success' : trip.status === 'Completed' ? 'primary' : 'danger'}
                />
              </div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2">
                <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 rounded-lg border border-indigo-100">
                  <Hash className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="text-xs font-black text-indigo-700 tracking-wider">TRIP ID: {trip.tripId}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">{trip.selectedDates?.length || 0} Scheduled Windows</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Activity className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">{trip.route_type} Service</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 relative z-10">
            <Link
              to={`/trips/edit/${trip.docId}`}
              className="px-8 py-3 bg-indigo-600 text-white font-black text-[11px] uppercase tracking-[0.15em] flex items-center gap-3 rounded-xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 active:scale-95"
            >
              <Edit className="w-4 h-4" /> Update
            </Link>
          </div>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column: Data Grids & Route Map */}
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
                  <div key={fIdx} className="space-y-1.5">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">
                      {field.label}
                    </span>
                    <div className="flex items-center gap-2">
                      {field.isBadge ? (
                        <StatusBadge status={String(field.value || '')} statusColor={field.value === 'Active' ? 'success' : 'primary'} />
                      ) : field.link ? (
                        <Link to={field.link} className="text-[15px] font-black text-indigo-600 hover:text-indigo-700 tracking-tight transition-colors">
                          {typeof field.value === 'string' || typeof field.value === 'number' ? field.value : '—'}
                        </Link>
                      ) : (
                        <span className="text-[15px] font-black text-slate-800 tracking-tight">
                          {typeof field.value === 'string' || typeof field.value === 'number' ? field.value : '—'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Route Visualizer */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-3">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-slate-800 tracking-tight uppercase text-xs">Route Execution Sequence</h3>
            </div>
            <div className="p-8 bg-slate-50/30">
              <div className="flex items-start overflow-x-auto pb-6 scrollbar-hide gap-0">
                {trip.routes?.map((stop, idx) => (
                  <div key={idx} className="flex items-start">
                    <div className="flex flex-col items-center w-40">
                      <div className="w-12 h-12 rounded-2xl bg-white border-2 border-slate-200 flex items-center justify-center shadow-lg group hover:border-indigo-500 transition-all duration-500">
                        <MapPin className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div className="mt-4 text-center px-2">
                        <p className="text-[11px] font-black text-slate-800 uppercase tracking-tighter">{stop}</p>
                        <div className="mt-2 flex items-center justify-center gap-1.5 px-3 py-1 bg-indigo-50 rounded-lg text-indigo-700 text-[10px] font-black">
                          <Clock className="w-3 h-3" />
                          {trip.routeTiming?.[stop] || '--:--'}
                        </div>
                      </div>
                    </div>
                    {idx < trip.routes.length - 1 && (
                      <div className="pt-6 px-1">
                        <div className="w-12 h-0.5 bg-slate-200"></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Remarks Section */}
          <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 transition-transform duration-700">
              <FileText className="w-20 h-20 text-indigo-500" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <Activity className="w-4 h-4 text-indigo-400" />
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Trip Operational Remarks</h3>
              </div>
              <p className="text-slate-300 font-medium text-sm leading-relaxed italic pr-20">
                "{trip.notes || "No specific operational notes or special remarks recorded for this trip."}"
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Execution Schedule & Quick Stats */}
        <div className="space-y-6">
          {/* Execution Windows Card */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 border-l-4 border-l-emerald-600">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                <Calendar className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-tight">Execution Windows</h3>
            </div>

            <div className="space-y-3">
              {Array.isArray(trip.selectedDates) && trip.selectedDates.map((date, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between hover:bg-white hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-lg flex flex-col items-center justify-center border border-slate-100 text-slate-800">
                      <span className="text-[12px] font-black leading-none">{typeof date === 'string' ? new Date(date).getDate() : '?'}</span>
                      <span className="text-[7px] font-bold uppercase">{typeof date === 'string' ? new Date(date).toLocaleString('default', { month: 'short' }) : '??'}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-black text-slate-700">{typeof date === 'string' ? new Date(date).toLocaleDateString('en-GB', { weekday: 'long' }) : 'Unknown Date'}</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{typeof date === 'string' ? new Date(date).getFullYear() : ''}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black text-indigo-600 uppercase">Available</span>
                    <span className="text-sm font-black text-slate-800">{trip.available_seats?.[date] || 0} Seats</span>
                  </div>
                </div>
              ))}
            </div>
          </div>



        </div>
      </main>
    </div>
  );
};
