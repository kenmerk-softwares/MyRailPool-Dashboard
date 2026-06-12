import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Clock,
  Navigation,
  TrendingUp,
  ArrowRightLeft,
  Edit,
  Route as RouteIcon,
  Globe,
  ArrowRight,
  AlertCircle,
  MapPin,
  Loader2,
  Milestone
} from 'lucide-react';
import { StatusBadge } from '../../../components/Shared';
import { useDocument } from '../../../shared/hooks/useDocument';

export default function ViewRoute() {
  const { id } = useParams();
  const docId = decodeURIComponent(id || '');

  const { data: route, loading, error, fetchDocument } = useDocument('routes');

  useEffect(() => {
    if (docId) {
      fetchDocument(docId);
    }
  }, [docId, fetchDocument]);

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center gap-4 min-h-[50vh] justify-center">
        <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
        <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Accessing Route Corridor Dossier...</p>
      </div>
    );
  }

  if (!route || error) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/60 shadow-sm max-w-xl mx-auto my-12 animate-in zoom-in duration-300">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-xl font-bold text-slate-800">Route Not Identified</h3>
        <p className="text-slate-500 mt-1 mb-6">
          {error || 'The specified Route ID does not exist in the active database.'}
        </p>
        <Link
          to="/routes"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-700 text-white rounded-xl font-bold text-sm hover:bg-primary-800 transition-all shadow-lg shadow-primary-600/20"
        >
          Back to Routes
        </Link>
      </div>
    );
  }

  const parseToDate = (d) => {
    if (!d) return null;
    if (d instanceof Date) return d;
    if (typeof d === 'object' && d.toDate && typeof d.toDate === 'function') {
      return d.toDate();
    }
    if (typeof d === 'object' && typeof d.seconds === 'number') {
      return new Date(d.seconds * 1000);
    }
    if (typeof d === 'number') return new Date(d);
    const parsed = new Date(d);
    if (parsed instanceof Date && !isNaN(parsed)) return parsed;
    return null;
  };

  const operatingDates = route.selectedDates || route.operating_dates || route.selected_dates || [];

  const parsedDates = operatingDates
    .map(d => parseToDate(d))
    .filter(Boolean)
    .sort((a, b) => a.getTime() - b.getTime());

  const droppingPoints = route.routes || route.droppingPoints || [];
  const routesDataList = route.routesData || route.droppingPointsDetails || [];
  const fareMatrix = route.fareMatrix || {};

  const totalDistance = routesDataList.reduce((sum, r) => sum + (Number(r.distanceFromStart) || 0), 0);

  const startEndKey = `${route.startingPoint}-${route.endPoint}`;
  const estPrice = fareMatrix[startEndKey] ? `£${fareMatrix[startEndKey]}` : '—';
  const fareEntries = Object.entries(fareMatrix).map(([key, value]) => {
    const [fromPoint, toPoint] = key.split('-');
    return { fromPoint, toPoint, value };
  });

  return (
    <div className="w-full max-w-full mx-auto pb-12 px-2 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4 text-sm">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{route.name}</h2>
              <StatusBadge status={route.status} statusColor={route.status === 'Active' ? 'success' : 'slate'} />
            </div>
          </div>
        </div>
        <Link
          to="/routes/add"
          state={{ route }}
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-primary-700 text-white rounded-xl font-bold text-sm hover:bg-primary-800 transition-all shadow-lg shadow-primary-600/20"
        >
          <Edit className="w-4.5 h-4.5" /> Edit Route
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
        <div className="space-y-8 mt-4">
          <div className="px-6 py-2 border-b border-slate-100 flex items-center gap-3 bg-slate-50/30">
            <div className="p-2 bg-primary-50 rounded-lg">
              <RouteIcon className="w-4 h-4 text-primary-600" />
            </div>
            <h3 className="font-bold text-slate-800 tracking-tight">Route Specifications</h3>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1.5 md:col-span-3">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Route Name</label>
                <p className="px-4 py-1.5 rounded-xl bg-white text-slate-800 font-bold border border-slate-200 shadow-sm">{route.name}</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Operational Status</label>
                <p className={`px-4 py-1.5 rounded-xl font-extrabold border uppercase ${route.status === 'Active'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                  : 'bg-slate-50 text-slate-500 border-slate-100'
                  }`}>
                  {route.status || 'Active'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-50">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Total Distance</label>
                <div className="flex items-center gap-3 px-4 py-1.5 rounded-xl bg-white border border-slate-200">
                  <Globe className="w-4 h-4 text-slate-500" />
                  <span className="font-bold text-slate-800">{totalDistance} KM</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Est. Start-to-End Fare</label>
                <div className="flex items-center gap-3 px-4 py-1.5 rounded-xl bg-emerald-50 border border-emerald-100">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-emerald-700">{estPrice}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Activation Date</label>
                <div className="flex items-center gap-3 px-4 py-1.5 rounded-xl bg-white border border-slate-200">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span className="font-bold text-slate-800">
                    {parseToDate(route.activationDate) ? parseToDate(route.activationDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Deactivation Date</label>
                <div className="flex items-center gap-3 px-4 py-1.5 rounded-xl bg-white border border-slate-200">
                  <ArrowRightLeft className="w-4 h-4 text-slate-500" />
                  <span className="font-bold text-slate-800">
                    {parseToDate(route.deactivationDate) ? parseToDate(route.deactivationDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 col-span-1 md:col-span-4 lg:col-span-4">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Operating Calendar Dates</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {parsedDates.length > 0 ? (
                    parsedDates.map((dateObj, idx) => {
                      const dateKey = dateObj.toISOString() + '-' + idx;
                      return (
                        <div key={dateKey} className="group flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl hover:shadow-sm hover:border-primary-200 hover:bg-primary-50/20 transition-all duration-300">
                          <div className="flex flex-col items-center justify-center bg-white rounded-lg px-2 py-0.5 border border-slate-200">
                            <span className="text-[11px] font-black text-slate-700 leading-none">{dateObj.getDate()}</span>
                            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">{dateObj.toLocaleString('default', { month: 'short' })}</span>
                          </div>
                          <div className="flex flex-col pr-1">
                            <span className="text-[10px] font-bold text-slate-800 leading-tight">{dateObj.toLocaleDateString('en-GB', { weekday: 'short' })}</span>
                            <span className="text-[8px] font-medium text-slate-500 leading-tight">{dateObj.getFullYear()}</span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <span className="text-slate-500 italic text-xs">No operating calendar dates defined</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="px-6 py-2 border-b border-slate-100 flex items-center gap-3 bg-slate-50/30 mt-6">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <Navigation className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="font-bold text-slate-800 tracking-tight">Geographical Nodes Sequence</h3>
          </div>

          <div className="p-6">
            <div className="mb-8 p-6 rounded-2xl bg-slate-50 border border-slate-100 relative">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Primary Origin</p>
                  <p className="text-lg font-bold text-slate-900">{route.startingPoint || '—'}</p>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="h-px w-24 sm:w-48 bg-gradient-to-r from-primary-200 via-primary-500 to-emerald-200 relative mb-2">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-1.5 bg-white border border-slate-200 rounded-full shadow-sm">
                      <ArrowRight className="w-3.5 h-3.5 text-primary-600" />
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{totalDistance} KM</span>
                </div>
                <div className="flex-1 text-right">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Termination Point</p>
                  <p className="text-lg font-bold text-slate-900">{route.endPoint || '—'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Sequence Flow & Gaps</label>
              {routesDataList.length > 0 ? (
                <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100 overflow-x-auto hide-scrollbar">
                  <div className="flex items-start gap-0 min-w-max py-4 px-2">
                    {routesDataList.map((node, idx) => (
                      <div key={idx} className="flex items-start">
                        <div className="flex flex-col items-center w-48 relative">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg border-2 transition-all duration-500 group hover:scale-110 ${idx === 0
                            ? 'bg-primary-600 border-primary-100 text-white'
                            : idx === routesDataList.length - 1
                              ? 'bg-rose-600 border-rose-100 text-white'
                              : 'bg-indigo-600 border-indigo-100 text-white'
                            }`}>
                            <MapPin className="w-5 h-5" />
                          </div>

                          <div className="mt-4 text-center px-2">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-1">
                              {idx === 0 ? 'Origin' : idx === routesDataList.length - 1 ? 'Arrival' : `Waypoint #${idx}`}
                            </span>
                            <p className="text-[12px] font-extrabold text-slate-800 uppercase tracking-tight truncate max-w-[170px]" title={node.name}>
                              {node.name}
                            </p>
                            {idx > 0 && (
                              <div className="mt-2.5 inline-flex items-center justify-center gap-1 px-2.5 py-1 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-700 text-[10px] font-black">
                                <Milestone className="w-3 h-3 text-indigo-500 shrink-0" />
                                + {node.distanceFromStart} KM
                              </div>
                            )}
                          </div>
                        </div>

                        {idx < routesDataList.length - 1 && (
                          <div className="pt-6">
                            <div className="w-16 h-[2px] bg-slate-200 rounded-full" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                  <MapPin className="w-6 h-6 text-slate-300 mb-2" />
                  <p className="text-slate-500 text-xs font-medium">No sequence flow nodes defined for this route corridor.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="px-6 py-2 border-b border-slate-100 flex items-center gap-3 bg-slate-50/30">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
            </div>
            <h3 className="font-bold text-slate-800 tracking-tight">Point-to-Point Algorithmic Fare Matrix</h3>
          </div>

          <div className="p-6">
            {fareEntries.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {fareEntries.map(({ fromPoint, toPoint, value }, idx) => (
                  <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-500/5 transition-all group">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-slate-50 text-[10px] font-black text-slate-500 rounded-full border border-slate-100">
                          {idx + 1}
                        </span>
                      </div>
                      <span className="text-emerald-700 font-extrabold text-sm px-2.5 py-1 bg-emerald-50 rounded-xl border border-emerald-100">
                        £{value}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1.5 mt-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-primary-500 shrink-0" />
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tighter truncate" title={fromPoint}>{fromPoint}</span>
                      </div>
                      <div className="w-px h-3 bg-slate-200 ml-1.5" />
                      <div className="flex items-center gap-2">
                        <Navigation className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span className="text-[11px] font-bold text-slate-800 uppercase tracking-tighter truncate" title={toPoint}>{toPoint}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <TrendingUp className="w-6 h-6 text-slate-300 mb-2" />
                <p className="text-slate-500 text-xs font-medium">No point-to-point fares defined for this route corridor.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
