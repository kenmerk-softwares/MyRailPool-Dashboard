import React, { useEffect } from 'react';
import { Plus, Edit, Eye, ArrowRight, RefreshCw, Calendar, AlertTriangle, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { SectionHeader, StatusBadge } from '../../../components/Shared';
import { Table } from '../../../shared/Table/Table';
import { useRoutes } from '../hooks/route.useRoute';
import { exportToExcel } from '../../../shared/utils/export';
import { useToast } from '../../../shared/hooks/ToastContext';
import { app } from '../../../shared/services/firebase';
import { httpsCallable, getFunctions } from 'firebase/functions';

const formatToInputDate = (d) => {
  if (!d) return '';
  if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) {
    return d;
  }
  let dateObj = null;
  if (d instanceof Date) {
    dateObj = d;
  } else if (typeof d === 'object' && d.toDate && typeof d.toDate === 'function') {
    dateObj = d.toDate();
  } else if (typeof d === 'object' && typeof d.seconds === 'number') {
    dateObj = new Date(d.seconds * 1000);
  } else if (typeof d === 'number') {
    dateObj = new Date(d);
  } else if (typeof d === 'string') {
    const parts = d.split('/');
    if (parts.length === 3 && parts[0].length <= 2 && parts[1].length <= 2 && parts[2].length === 4) {
      const day = parts[0].padStart(2, '0');
      const month = parts[1].padStart(2, '0');
      const year = parts[2];
      return `${year}-${month}-${day}`;
    }
    const parsed = new Date(d);
    if (parsed instanceof Date && !isNaN(parsed)) {
      dateObj = parsed;
    }
  }

  if (dateObj && !isNaN(dateObj.getTime())) {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  return '';
};

export const RouteList = () => {
  const { routes, loading, hasMore, fetchRoutes } = useRoutes();
  const [fromDate, setFromDate] = React.useState('');
  const [toDate, setToDate] = React.useState('');
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [reactivateRoute, setReactivateRoute] = React.useState(null);
  const [modalDeactivationDate, setModalDeactivationDate] = React.useState('');
  const [modalSelectedDates, setModalSelectedDates] = React.useState([]);
  const [dateToAdd, setDateToAdd] = React.useState('');
  const [isReactivating, setIsReactivating] = React.useState(false);

  const handleView = (route) => {
    const Id = String(route?.id || '').replace('#', '');
    navigate(`view/${Id}`);
  };

  const [activeFilter, setActiveFilter] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleClear = () => {
    setFromDate('');
    setToDate('');
    setActiveFilter('');
    setSearchQuery('');
  };

  useEffect(() => {
    fetchRoutes({ searchQuery, activeFilter, fromDate, toDate });
  }, [searchQuery, activeFilter, fromDate, toDate, fetchRoutes]);

  const handleExport = () => {
    exportToExcel(routes, {
      name: 'Route Name',
      startingPoint: 'Starting Point',
      endPoint: 'End Point',
      status: 'Status',
      createdAt: 'Created At'
    }, 'Routes');
  };

  const handleOpenReactivate = (route) => {
    setReactivateRoute(route);

    // Parse current selected dates
    const rawDates = route.selectedDates || route.operating_dates || route.selected_dates || [];
    const formattedDates = rawDates.map(d => formatToInputDate(d)).filter(Boolean);
    setModalSelectedDates(formattedDates);

    // Find a good default deactivation date (max date + 30 days, or today + 30 days)
    const today = new Date();
    let baseDate = today;

    formattedDates.forEach(dateStr => {
      const d = new Date(dateStr);
      if (d > baseDate) {
        baseDate = d;
      }
    });

    const defaultDeact = new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    setModalDeactivationDate(formatToInputDate(defaultDeact));
    setDateToAdd('');
  };

  const handleAddDate = () => {
    if (!dateToAdd) return;
    const todayStr = formatToInputDate(new Date());
    if (dateToAdd < todayStr) {
      showToast("Cannot add past dates as operating dates.", "error");
      return;
    }
    if (dateToAdd > modalDeactivationDate) {
      showToast("Operating date cannot be after the deactivation date.", "error");
      return;
    }
    if (modalSelectedDates.includes(dateToAdd)) {
      showToast("This date is already in the operating dates list.", "error");
      return;
    }

    const updated = [...modalSelectedDates, dateToAdd].sort();
    setModalSelectedDates(updated);
    setDateToAdd('');
  };

  const handleRemoveDate = (date) => {
    setModalSelectedDates(modalSelectedDates.filter(d => d !== date));
  };

  const handleReactivateSubmit = async () => {
    if (!hasFutureDate) {
      showToast("Cannot activate: Operating dates must contain at least one future date.", "error");
      return;
    }

    if (modalDeactivationDate < todayStr) {
      showToast("Deactivation date must be in the future.", "error");
      return;
    }

    if (isDeactBeforeActivation) {
      showToast("Deactivation date cannot be earlier than the activation date.", "error");
      return;
    }

    if (hasOperationalDateAfterDeact) {
      showToast("One or more operating dates are after the selected deactivation date.", "error");
      return;
    }

    setIsReactivating(true);
    try {
      const functions = getFunctions(app, "asia-south1");
      const addRouteFn = httpsCallable(functions, 'addRoute');

      const payload = {
        action: 'edit',
        id: reactivateRoute.id,
        name: reactivateRoute.name,
        status: 'Active',
        activationDate: formatToInputDate(reactivateRoute.activationDate) || todayStr,
        deactivationDate: modalDeactivationDate,
        selectedDates: modalSelectedDates,
        routes: reactivateRoute.routes || [],
        routesData: reactivateRoute.routesData || [],
        fareMatrix: reactivateRoute.fareMatrix || {},
        start: reactivateRoute.startingPoint || reactivateRoute.routes?.[0] || '',
        end: reactivateRoute.endPoint || reactivateRoute.routes?.[reactivateRoute.routes?.length - 1] || '',
      };

      const result = await addRouteFn(payload);
      if (result.data.success) {
        showToast(`Route corridor "${reactivateRoute.name}" successfully reactivated.`, "success");
        setReactivateRoute(null);
        fetchRoutes(); // refresh list
      } else {
        showToast(result.data.error || "Failed to reactivate route.", "error");
      }
    } catch (err) {
      console.error("Error reactivating route:", err);
      showToast(err.message || "An unexpected error occurred.", "error");
    } finally {
      setIsReactivating(false);
    }
  };

  const todayStart = new Date().setHours(0, 0, 0, 0);
  const hasFutureDate = modalSelectedDates.some(dateStr => {
    return new Date(dateStr).getTime() >= todayStart;
  });

  const todayStr = formatToInputDate(new Date());
  const activationDateStr = reactivateRoute ? formatToInputDate(reactivateRoute.activationDate) : '';
  const isDeactBeforeActivation = reactivateRoute && modalDeactivationDate && modalDeactivationDate < activationDateStr;
  const isDeactPast = reactivateRoute && modalDeactivationDate && modalDeactivationDate < todayStr;
  const hasOperationalDateAfterDeact = modalSelectedDates.some(dateStr => {
    return dateStr > modalDeactivationDate;
  });

  return (
    <>
      <SectionHeader
        title="Route Management"
        subtitle="Define templates for common routes and pricing."
        actionLabel="Create Route"
        actionIcon={Plus}
        actionTo="/routes/add"
        onExportClick={handleExport}
      />
      <div className="pb-10">
        <Table
          headers={['Sl No', 'Route Name', 'Route Corridor', 'Operational Status']}
          data={routes}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          onClear={handleClear}
          fromDate={fromDate}
          setFromDate={setFromDate}
          toDate={toDate}
          setToDate={setToDate}

          searchPlaceholder="Search routes by name or locations..."
          filterOptions={[
            // { label: 'All', value: '' },
            { label: 'Active', value: 'Active' },
            { label: 'Inactive', value: 'Inactive' },
          ]}
          renderRow={(route, idx) => (
            <>
              <td className="px-8 py-4 text-[13px] font-black text-slate-800">{idx + 1}</td>
              <td className="px-8 py-4">
                <div className="flex flex-col">
                  <span className="text-[13px] font-black text-slate-800">{route.name}</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Corridor ID: {route.id}</span>
                </div>
              </td>
              <td className="px-8 py-4">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl group-hover:bg-primary-50 group-hover:border-primary-100 transition-colors">
                    <span className="text-[11px] font-black text-slate-700 group-hover:text-primary-700">{route.startingPoint}</span>
                    <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-primary-400" />
                    <span className="text-[11px] font-black text-slate-700 group-hover:text-primary-700">{route.endPoint}</span>
                  </div>
                </div>
              </td>
              <td className="px-8 py-4">
                <StatusBadge
                  status={route.status}
                  statusColor={route.status === 'Active' ? 'success' : 'slate'}
                />
              </td>
            </>
          )}
          actions={(route) => (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleView(route)}
                className="p-2 bg-white border border-green-200 text-green-500 hover:text-green-700 hover:border-green-100 rounded-xl transition-all hover:shadow-lg active:scale-95"
                title="Quick View"
              >
                <Eye className="w-4 h-4" />
              </button>
              <Link
                to="/routes/add"
                state={{ route }}
                className="p-2 bg-white border border-yellow-100 text-yellow-500 hover:text-yellow-700 hover:border-yellow-100 rounded-xl transition-all hover:shadow-lg active:scale-95"
                title="Edit Corridor"
              >
                <Edit className="w-4 h-4" />
              </Link>
              {route.status === 'Inactive' && (
                <button
                  onClick={() => handleOpenReactivate(route)}
                  className="p-2 bg-white border border-indigo-200 text-indigo-500 hover:text-indigo-700 hover:border-indigo-100 rounded-xl transition-all hover:shadow-lg active:scale-95"
                  title="Reactivate Corridor"
                >
                  <RefreshCw className="w-4 h-4 animate-spin-hover" />
                </button>
              )}
            </div>
          )}
        />

        {hasMore && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => fetchRoutes(true)}
              disabled={loading}
              className="px-8 py-3 bg-white border border-slate-200 text-slate-500 font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Synchronizing...' : 'Load More Corridor Data'}
            </button>
          </div>
        )}
      </div>

      {reactivateRoute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-300">

            {/* Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl animate-pulse">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-base uppercase tracking-wider">Reactivate Route</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Restore Operational status & extend calendar</p>
                </div>
              </div>
              <button
                onClick={() => setReactivateRoute(null)}
                className="p-1.5 hover:bg-slate-100 rounded-xl transition-colors text-slate-500 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">

              {/* Corridor Details */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Route Corridor Name</span>
                <p className="font-extrabold text-slate-800 text-sm">{reactivateRoute.name}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                  {reactivateRoute.startingPoint} &rarr; {reactivateRoute.endPoint}
                </p>
              </div>

              {/* Deactivation Date Field */}
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">
                  New Deactivation Date (Expiration)
                </label>
                <div className="relative group">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 animate-in fade-in" />
                  <input
                    type="date"
                    value={modalDeactivationDate}
                    onChange={(e) => setModalDeactivationDate(e.target.value)}
                    className="w-full pl-12 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-800 font-bold focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-sm cursor-pointer"
                  />
                </div>
                <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                  Must be in the future. The background scheduler will automatically deactivate the route after this date.
                </p>
                {isDeactBeforeActivation && (
                  <p className="text-red-500 text-[10px] font-bold mt-1 animate-in fade-in">
                    Deactivation date cannot be earlier than the activation date ({activationDateStr}).
                  </p>
                )}
                {!isDeactBeforeActivation && isDeactPast && (
                  <p className="text-red-500 text-[10px] font-bold mt-1 animate-in fade-in">
                    Deactivation date must be in the future.
                  </p>
                )}
              </div>

              {/* Schedule List & Add Date */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
                    Operating Schedule Dates
                  </label>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[9px] font-black uppercase">
                    {modalSelectedDates.length} Dates
                  </span>
                </div>

                {/* Add Date Box */}
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={dateToAdd}
                    onChange={(e) => setDateToAdd(e.target.value)}
                    className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold outline-none focus:border-emerald-500 cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={handleAddDate}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl font-bold transition-all text-xs flex items-center gap-1 active:scale-95 shadow-md shadow-emerald-500/10"
                  >
                    <Plus className="w-3.5 h-3.5" /> Append
                  </button>
                </div>

                {/* Warning banner if no future dates */}
                {!hasFutureDate && (
                  <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-2.5 text-rose-700 text-[11px] font-bold animate-in slide-in-from-top-1">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5 animate-bounce" />
                    <div>
                      <p className="font-extrabold uppercase tracking-tight text-[10px]">Activation Blocked</p>
                      <p className="font-medium text-[9px] text-rose-600 mt-0.5 leading-relaxed">At least one future operating date is required to activate this route corridor. Please select and append a future date above.</p>
                    </div>
                  </div>
                )}

                {/* Warning banner if operational dates are after deactivation date */}
                {hasOperationalDateAfterDeact && (
                  <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-2.5 text-rose-700 text-[11px] font-bold animate-in slide-in-from-top-1">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5 animate-bounce" />
                    <div>
                      <p className="font-extrabold uppercase tracking-tight text-[10px]">Date Conflict</p>
                      <p className="font-medium text-[9px] text-rose-600 mt-0.5 leading-relaxed">One or more scheduled operating dates are after the selected deactivation date. Please extend the deactivation date or remove the conflicting dates.</p>
                    </div>
                  </div>
                )}

                {/* Dates list */}
                {modalSelectedDates.length > 0 ? (
                  <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 bg-slate-50/50 rounded-2xl border border-slate-100">
                    {modalSelectedDates.map(date => {
                      const dateObj = new Date(date);
                      const isPast = dateObj < todayStart;
                      return (
                        <div
                          key={date}
                          className={`flex items-center gap-2 px-2.5 py-1.5 border rounded-xl shadow-sm transition-all duration-200 ${isPast
                              ? 'bg-slate-100/70 border-slate-200 text-slate-500'
                              : 'bg-white border-emerald-100 text-slate-800 hover:border-emerald-200 hover:bg-emerald-50/10'
                            }`}
                        >
                          <div className="flex flex-col items-center justify-center">
                            <span className="text-[10px] font-black leading-none">{dateObj.getDate()}</span>
                            <span className="text-[7px] font-bold uppercase tracking-tighter">{dateObj.toLocaleString('default', { month: 'short' })}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[9px] font-bold leading-tight">{dateObj.toLocaleDateString('en-GB', { weekday: 'short' })}</span>
                            <span className="text-[7px] font-medium leading-none">{dateObj.getFullYear()} {isPast && <span className="text-slate-500 font-extrabold">(Past)</span>}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveDate(date)}
                            className="p-0.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-6 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-500">
                    <Calendar className="w-6 h-6 mb-1 text-slate-300" />
                    <span className="text-[10px] font-black uppercase tracking-wider">No operating dates</span>
                  </div>
                )}
              </div>

            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setReactivateRoute(null)}
                className="px-5 py-2.5 rounded-xl font-bold bg-white text-slate-500 border border-slate-200 hover:bg-slate-100 transition-all text-xs uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                onClick={handleReactivateSubmit}
                disabled={isReactivating || !hasFutureDate || isDeactBeforeActivation || isDeactPast || hasOperationalDateAfterDeact}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/10"
              >
                {isReactivating ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" />
                )}
                Reactivate Corridor
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

