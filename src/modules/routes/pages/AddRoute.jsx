import React, { useState } from 'react';
import {
  Save,
  MapPin,
  Clock,
  ArrowRightLeft,
  Route as RouteIcon,
  TrendingUp,
  X,
  Plus,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Calendar,
  ArrowRight,
  AlertTriangle,
  Activity,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import MapPlaces from '../../../shared/Components/Map_places';

import { app } from '../../../shared/services/firebase';
import { httpsCallable, getFunctions } from 'firebase/functions';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../../shared/hooks/ToastContext';
import { routeValidation } from '../../../shared/utils/Validations/RouteValidation';



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

export const AddRoute = () => {

  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const initialData = location.state?.route || null;
  const [loading, setLoading] = useState(false);
  const [routes, setRoutes] = useState(initialData?.routes || initialData?.droppingPoints || []);
  const [routesData, setRoutesData] = useState(initialData?.routesData || initialData?.droppingPointsDetails || []);
  const [fareMatrix, setFareMatrix] = useState(initialData?.fareMatrix || {});
  const [currentPoint, setCurrentPoint] = useState('');
  const [autocomplete, setAutocomplete] = useState(null);
  const functions = getFunctions(app, "asia-south1");
  const [errors, setErrors] = useState({});

  const [activationDate, setActivationDate] = useState(formatToInputDate(initialData?.activationDate));
  const [deactivationDate, setDeactivationDate] = useState(formatToInputDate(initialData?.deactivationDate));

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const payloadKey = name === 'routeName' ? 'name' : name;

    try {
      const { error } = routeValidation.extract(payloadKey).validate(value);
      setErrors(prev => ({
        ...prev,
        [payloadKey]: error ? error.details[0].message : null
      }));
    } catch (err) {
      console.log(err);
    }
  };





  // const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  // const [selectedDays, setSelectedDays] = useState(() => {
  //   if (initialData?.days_op) {
  //     if (initialData.days_op === 'Daily') return [...daysOfWeek];
  //     const selected = initialData.days_op.split(',').map(d => d.trim());
  //     return selected.map(s => {
  //       const full = daysOfWeek.find(d => d.startsWith(s));
  //       return full || s;
  //     });
  //   }
  //   return [];
  // });



  const [selectedDates, setSelectedDates] = useState(() => {
    const rawDates = initialData?.selectedDates || initialData?.operating_dates || initialData?.selected_dates || [];
    return rawDates.map(d => formatToInputDate(d)).filter(Boolean);
  });

  const handleAddDate = (e) => {
    const date = e.target.value;
    if (!date) return;
    const todayStr = formatToInputDate(new Date());
    if (date < todayStr) {
      showToast("Cannot add past dates as operating dates.", "error");
      e.target.value = '';
      return;
    }
    if (deactivationDate && date > deactivationDate) {
      showToast("Operating date cannot be after the deactivation date.", "error");
      e.target.value = '';
      return;
    }
    if (selectedDates.includes(date)) {
      showToast("This date is already in the operating dates list.", "error");
      e.target.value = '';
      return;
    }
    setSelectedDates([...selectedDates, date].sort());
    e.target.value = '';
  };

  const handleRemoveDate = (date) => {
    setSelectedDates(selectedDates.filter(d => d !== date));
  };

  const onLoad = (autocompleteInstance) => {
    setAutocomplete(autocompleteInstance);
  };

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      if (place.formatted_address) {
        handleAddPoint(place);
      }
    }
  };

  const handleAddPoint = (placeDetails = null) => {
    const pointName = placeDetails ? placeDetails.name || placeDetails.formatted_address : currentPoint.trim();

    if (pointName) {
      if (routes.includes(pointName)) {
        showToast("This geographical node is already added to the route corridor sequence.", "error");
        setCurrentPoint('');
        return;
      }
      setRoutes([...routes, pointName]);

      const details = placeDetails ? {
        formatted_address: placeDetails.formatted_address,
        lat: placeDetails.geometry?.location?.lat(),
        lng: placeDetails.geometry?.location?.lng(),
        place_id: placeDetails.place_id,
        name: placeDetails.name,
        distanceFromStart: 0
      } : { name: pointName, distanceFromStart: 0 };

      setRoutesData([...routesData, details]);
      setCurrentPoint('');
    }
  };

  const updatePointDistance = (index, value) => {
    const newDetails = [...routesData];
    newDetails[index].distanceFromStart = value;
    setRoutesData(newDetails);
  };

  const updateFare = (fromName, toName, value) => {
    setFareMatrix(prev => ({
      ...prev,
      [`${fromName}-${toName}`]: value
    }));
  };

  const handleRemovePoint = (index) => {
    const pointToRemove = routes[index];
    setRoutes(routes.filter((_, i) => i !== index));
    setRoutesData(routesData.filter((_, i) => i !== index));
    setFareMatrix(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(key => {
        const [from, to] = key.split('-');
        if (from === pointToRemove || to === pointToRemove) {
          delete updated[key];
        }
      });
      return updated;
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddPoint();
    }
  };

  const movePoint = (index, direction) => {
    const newPoints = [...routes];
    const newDetails = [...routesData];
    const targetIndex = index + direction;

    if (targetIndex >= 0 && targetIndex < newPoints.length) {
      [newPoints[index], newPoints[targetIndex]] = [newPoints[targetIndex], newPoints[index]];
      [newDetails[index], newDetails[targetIndex]] = [newDetails[targetIndex], newDetails[index]];
      setRoutes(newPoints);
      setRoutesData(newDetails);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData);
      const invalidNode = routesData.find((node, idx) =>
        idx > 0 && (node.distanceFromStart === undefined || node.distanceFromStart === null || isNaN(node.distanceFromStart))
      );

      if (invalidNode) {
        showToast(`Please specify the Gap (KM) for node: ${invalidNode.name}`, 'error');
        setLoading(false);
        return;
      }

      if (!hasFutureDate) {
        showToast("Cannot save: Operating dates must contain at least one future date.", "error");
        setLoading(false);
        return;
      }
      if (deactivationDate < todayStr) {
        showToast("Deactivation date must be in the future.", "error");
        setLoading(false);
        return;
      }
      if (isDeactBeforeActivation) {
        showToast("Deactivation date cannot be earlier than the activation date.", "error");
        setLoading(false);
        return;
      }
      if (hasOperationalDateAfterDeact) {
        showToast("One or more operating dates are after the selected deactivation date.", "error");
        setLoading(false);
        return;
      }
      if (hasMissingFares) {
        showToast("Please specify a valid positive fare for all point-to-point routes in the matrix.", 'error');
        setLoading(false);
        return;
      }
      const filteredFareMatrix = {};
      for (let i = 0; i < routes.length; i++) {
        for (let j = i + 1; j < routes.length; j++) {
          const key = `${routes[i]}-${routes[j]}`;
          if (fareMatrix[key] !== undefined) {
            filteredFareMatrix[key] = fareMatrix[key];
          }
        }
      }

      const payload = {
        action: initialData && initialData.id ? 'edit' : 'add',
        id: initialData?.id,
        name: data.routeName,
        status: data.status || 'Inactive',
        activationDate: data.activationDate,
        deactivationDate: data.deactivationDate,
        description: data.description,
        selectedDates: selectedDates,
        routes: routes,
        routesData: routesData,
        fareMatrix: filteredFareMatrix,
        start: routes[0] || '',
        end: routes[routes.length - 1] || '',
      };

      const { error } = routeValidation.validate(payload, { abortEarly: false });
      if (error) {
        const validationErrors = {};
        error.details.forEach(detail => {
          validationErrors[detail.path[0]] = detail.message;
        });
        setErrors(validationErrors);
        setLoading(false);
        showToast('Validation failed', 'error');
        return;
      }
      setErrors({});
      const addRouteFn = httpsCallable(functions, 'addRoute');
      const result = await addRouteFn(payload);

      if (result.data.success) {
        showToast(initialData && initialData.id ? 'Route corridor synchronized successfully' : 'New route corridor established', 'success');
        navigate('/routes');
      } else {
        showToast(result.data.error || 'Failed to save route corridor', 'error');
      }
    } catch (error) {
      console.error('Error saving route:', error);
      showToast('An unexpected error occurred while saving the route', 'error');
    } finally {
      setLoading(false);
    }
  };

  const todayStart = new Date().setHours(0, 0, 0, 0);
  const hasFutureDate = selectedDates.some(dateStr => {
    return new Date(dateStr).getTime() >= todayStart;
  });

  const todayStr = formatToInputDate(new Date());
  const isDeactBeforeActivation = deactivationDate && activationDate && deactivationDate < activationDate;
  const isDeactPast = deactivationDate && deactivationDate < todayStr;
  const hasOperationalDateAfterDeact = selectedDates.some(dateStr => {
    return deactivationDate && dateStr > deactivationDate;
  });

  let hasMissingFares = false;
  if (routes.length > 1) {
    for (let i = 0; i < routes.length; i++) {
      for (let j = i + 1; j < routes.length; j++) {
        const key = `${routes[i]}-${routes[j]}`;
        const fare = fareMatrix[key];
        if (fare === undefined || fare === null || fare === '' || isNaN(fare) || parseFloat(fare) <= 0) {
          hasMissingFares = true;
          break;
        }
      }
      if (hasMissingFares) break;
    }
  }

  return (
    <div className="w-full max-w-full mx-auto pb-12 px-2 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">

      </div>

      <form onSubmit={handleSave}>
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/60 overflow-hidden">

          {/* Section 1: Route Specifications */}
          <div className="border-b border-slate-100">
            <div className="px-6 py-4 bg-slate-50/50 flex items-center gap-3">

              <div className="p-2.5 bg-primary-50 rounded-xl">
                <RouteIcon className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">{initialData && initialData.id ? 'Edit Route' : 'Add Route'}</h3>
              </div>
            </div>

            <div className="px-8 py-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-2">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block">Route Identifier / Name</label>
                  <div className="relative group">
                    <input
                      type="text"
                      name="routeName"
                      className="w-full pl-4 pr-4 py-1.5  rounded-2xl border border-slate-200 bg-white text-slate-800 font-bold focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all placeholder:text-slate-500"
                      placeholder="Route Name"
                      defaultValue={initialData?.name}
                      onChange={handleInputChange}
                    />
                    {errors.name && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1 animate-in fade-in slide-in-from-top-1">{errors.name}</p>}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block">Activation Date</label>
                  <div className="relative group">
                    <Clock className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${errors.activationDate ? 'text-red-400' : 'text-slate-500 group-focus-within:text-amber-500'} transition-colors`} />
                    <input
                      type="date"
                      name="activationDate"
                      className="w-full pl-12 pr-4 py-1.5  rounded-2xl border border-slate-200 bg-white text-slate-800 font-medium focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all cursor-pointer"
                      value={activationDate}
                      onChange={(e) => {
                        setActivationDate(e.target.value);
                        handleInputChange(e);
                      }}
                    />
                    {errors.activationDate && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1 animate-in fade-in slide-in-from-top-1">{errors.activationDate}</p>}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block">Deactivation Date</label>
                  <div className="relative group">
                    <ArrowRightLeft className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${errors.deactivationDate ? 'text-red-400' : 'text-slate-500 group-focus-within:text-amber-500'} transition-colors`} />
                    <input
                      type="date"
                      name="deactivationDate"
                      className="w-full pl-12 pr-4 py-1.5  rounded-2xl border border-slate-200 bg-white text-slate-800 font-medium focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all cursor-pointer"
                      value={deactivationDate}
                      onChange={(e) => {
                        setDeactivationDate(e.target.value);
                        handleInputChange(e);
                      }}
                    />
                    {errors.deactivationDate && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1 animate-in fade-in slide-in-from-top-1">{errors.deactivationDate}</p>}
                    {isDeactBeforeActivation && (
                      <p className="text-red-500 text-[10px] font-bold mt-1 ml-1 animate-in fade-in">
                        Deactivation date cannot be earlier than the activation date ({activationDate}).
                      </p>
                    )}
                    {!isDeactBeforeActivation && isDeactPast && (
                      <p className="text-red-500 text-[10px] font-bold mt-1 ml-1 animate-in fade-in">
                        Deactivation date must be in the future.
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block">Operational Status</label>
                  <div className="relative group">
                    <Activity className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${errors.status ? 'text-red-400' : 'text-slate-500 group-focus-within:text-primary-500'} transition-colors`} />
                    <select
                      name="status"
                      className="w-full pl-12 pr-10 py-1.5 rounded-2xl border border-slate-200 bg-white text-slate-800 font-bold focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all cursor-pointer appearance-none"
                      defaultValue={initialData?.status || "Inactive"}
                      onChange={handleInputChange}
                    >
                      <option value="Active">🟢 Active Corridor</option>
                      <option value="Inactive">🔴 Inactive / Maintenance</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-focus-within:text-primary-500 transition-colors">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                      </svg>
                    </div>
                    {errors.status && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1 animate-in fade-in slide-in-from-top-1">{errors.status}</p>}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2 col-span-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block">Description</label>
                  <div className="relative group">
                    <textarea
                      type="text"
                      rows="2"
                      name="description"
                      className="w-full pl-4 pr-4 py-1.5  rounded-2xl border border-slate-200 bg-white text-slate-800 font-bold focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all placeholder:text-slate-500"
                      placeholder="Description"
                      defaultValue={initialData?.description}
                      onChange={handleInputChange}
                    />
                    {errors.description && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1 animate-in fade-in slide-in-from-top-1">{errors.description}</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Operating Schedule */}
          <div className="border-b border-slate-100">
            <div className="px-6 py-4 bg-slate-50/50 flex items-center gap-3">

              <div className="p-2.5 bg-amber-50 rounded-xl">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Operating Schedule</h3>
                <p className="text-xs text-slate-500 font-medium">Set the temporal availability and operating window.</p>
              </div>
            </div>

            <div className="px-8 py-2">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block">Active Calendar Dates <span className="text-red-500"> *</span></label>
                  <div className="relative group">
                    <input
                      type="date"
                      onChange={handleAddDate}
                      className="w-full pl-12 pr-4 py-1.5  rounded-2xl border border-slate-200 bg-white text-slate-800 font-medium focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all cursor-pointer"
                    />

                    {errors.selectedDates && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1 animate-in fade-in slide-in-from-top-1">{errors.selectedDates}</p>}

                    {!hasFutureDate && selectedDates.length > 0 && (
                      <div className="mt-4 p-3.5 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-2.5 text-rose-700 text-[11px] font-bold animate-in slide-in-from-top-1">
                        <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5 animate-bounce" />
                        <div>
                          <p className="font-extrabold uppercase tracking-tight text-[10px]">Activation Blocked</p>
                          <p className="font-medium text-[9px] text-rose-600 mt-0.5 leading-relaxed">At least one future operating date is required to activate this route corridor. Please select and append a future date.</p>
                        </div>
                      </div>
                    )}

                    {hasOperationalDateAfterDeact && (
                      <div className="mt-4 p-3.5 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-2.5 text-rose-700 text-[11px] font-bold animate-in slide-in-from-top-1">
                        <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5 animate-bounce" />
                        <div>
                          <p className="font-extrabold uppercase tracking-tight text-[10px]">Date Conflict</p>
                          <p className="font-medium text-[9px] text-rose-600 mt-0.5 leading-relaxed">One or more scheduled operating dates are after the selected deactivation date. Please extend the deactivation date or remove the conflicting dates.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-span-2 md:col-span-3 mt-2">
                  {selectedDates.length > 0 ? (
                    <div className="mt-4 flex items-center gap-3 px-5 py-1.5  border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/30">
                      <div className="flex flex-wrap gap-2">
                        {selectedDates.sort().map(date => {
                          const dateObj = new Date(date);
                          return (

                            <div key={date} className="group flex items-center gap-2.5 px-3 py-1.5 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md hover:border-amber-200 hover:bg-amber-50/30 transition-all duration-300 animate-in zoom-in duration-200">
                              <div className="flex flex-col items-center justify-center bg-slate-50 group-hover:bg-amber-100 rounded-lg px-2 py-0.5 transition-colors">
                                <span className="text-[10px] font-black text-slate-700 group-hover:text-amber-700 leading-none">{dateObj.getDate()}</span>
                                <span className="text-[7px] font-bold text-slate-500 group-hover:text-amber-500 uppercase tracking-tighter">{dateObj.toLocaleString('default', { month: 'short' })}</span>
                              </div>

                              <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-slate-800 leading-tight">{dateObj.toLocaleDateString('en-GB', { weekday: 'short' })}</span>
                                <span className="text-[8px] font-medium text-slate-500 leading-tight">{dateObj.getFullYear()}</span>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleRemoveDate(date)}
                                className="p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 flex items-center gap-3 px-5 py-1.5  border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/30">
                      <Calendar className="w-5 h-5 text-slate-200" />
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">No operating dates selected</span>
                    </div>
                  )}
                </div>


              </div>
            </div>
          </div>

          {/* Section 3: Dropping Points */}
          <div className="border-b border-slate-100">
            <div className="px-6 py-4 bg-slate-50/50 flex items-center justify-between">

              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 rounded-xl">
                  <MapPin className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Dropping Points & Sequence</h3>
                  <p className="text-xs text-slate-500 font-medium">Define the geographical nodes and travel order.</p>
                </div>
              </div>
              {routes.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full">
                  <span className="text-[10px] font-black uppercase tracking-widest">{routes.length} Nodes</span>
                </div>
              )}
            </div>

            <div className="p-6 space-y-6">

              <div className="max-w-2xl">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-3">Integrate New Location Node <span className="text-red-500"> *</span></label>
                <div className="relative flex gap-3">
                  <div className="relative flex-1 group">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
                    <MapPlaces onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
                      <input
                        type="text"
                        value={currentPoint}
                        onChange={(e) => setCurrentPoint(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="w-full pl-12 pr-4 py-1.5  rounded-2xl border border-slate-200 bg-white text-slate-800 font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-slate-300"
                        placeholder="Search for a geographical node..."
                      />
                    </MapPlaces>
                  </div>
                  {errors.routes && <p className="text-red-500 text-[10px] font-bold mt-2 ml-1 animate-in fade-in slide-in-from-top-1">{errors.routes}</p>}
                  <button
                    onClick={handleAddPoint}
                    type="button"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-1.5 rounded-2xl font-bold transition-all flex items-center gap-2 active:scale-95 shadow-lg shadow-indigo-200 hover:shadow-indigo-300/50"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Append</span>
                  </button>

                </div>
              </div>

              <div>
                {routes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 px-6 bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-100 animate-in fade-in zoom-in duration-700">
                    <div className="w-20 h-20 bg-white rounded-3xl shadow-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <MapPin className="w-10 h-10 text-slate-500" />
                    </div>
                    <h4 className="text-xl font-bold text-slate-800 mb-2">No Geographical Nodes Defined</h4>
                    <p className="text-slate-500 max-w-sm text-center font-medium leading-relaxed">
                      Begin by adding the primary origin point. Subsequent nodes will automatically form the corridor's travel sequence.
                    </p>
                  </div>
                ) : (
                  <div className="relative bg-slate-50/30 rounded-3xl p-6 border border-slate-100">

                    <div className="flex items-start gap-6 overflow-x-auto pb-10 hide-scrollbar pt-4">
                      {routes.map((point, index) => (
                        <div key={index} className="flex-shrink-0 relative group" style={{ width: '220px' }}>

                          {index !== routes.length - 1 && (
                            <div className="absolute left-[50%] top-[15px] w-full h-[4px] bg-gradient-to-r from-indigo-500 via-indigo-300 to-slate-100 z-0 opacity-20 group-hover:opacity-100 transition-opacity rounded-full" />
                          )}

                          <div className="relative z-10 flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full border-4 transition-all duration-500 flex items-center justify-center shadow-2xl ${index === 0 ? 'bg-primary-600 border-primary-100' :
                              index === routes.length - 1 ? 'bg-rose-600 border-rose-100' :
                                'bg-indigo-600 border-indigo-100'
                              } group-hover:scale-125 group-hover:rotate-[360deg]`}>
                              {index === 0 ? <div className="w-2 h-2 bg-white rounded-full shadow-inner" /> :
                                index === routes.length - 1 ? <div className="w-2 h-2 bg-white rounded-full shadow-inner" /> :
                                  <div className="w-1.5 h-1.5 bg-white rounded-full shadow-inner" />}
                            </div>

                            <span className="mt-3 text-[9px] font-black text-slate-500 uppercase tracking-[0.25em] drop-shadow-sm">
                              {index === 0 ? 'Origin Node' : index === routes.length - 1 ? 'Arrival Node' : `Waypoint #${index}`}
                            </span>
                          </div>

                          <div className="mt-3 px-3 w-full">
                            <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-lg shadow-slate-200/40 group-hover:shadow-2xl group-hover:shadow-indigo-500/10 group-hover:border-indigo-100 transition-all duration-500 relative overflow-hidden flex flex-col justify-between">
                              <div className={`absolute top-0 left-0 w-1.5 h-full opacity-30 ${index === 0 ? 'bg-primary-500' :
                                index === routes.length - 1 ? 'bg-rose-500' :
                                  'bg-indigo-500'
                                }`} />

                              <button
                                onClick={() => handleRemovePoint(index)}
                                type="button"
                                className="absolute top-3 right-3 p-1.5 bg-slate-50 hover:bg-rose-50 text-red-500 hover:text-red-600 rounded-xl transition-all active:scale-90 z-20"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>

                              <div className="relative z-10 space-y-2">
                                <div className="pr-4">
                                  <input
                                    type="text"
                                    className="w-full text-[13px] font-black text-slate-800 bg-transparent border-none outline-none focus:ring-0 p-0 truncate"
                                    value={point}
                                    onChange={(e) => {
                                      const newPoints = [...routes];
                                      newPoints[index] = e.target.value;
                                      setRoutes(newPoints);
                                    }}
                                  />
                                </div>
                              </div>

                              <div className="relative z-10 flex items-center justify-between pt-3 border-t border-slate-50">
                                <div className="flex items-center gap-2">
                                  <div className="flex flex-col">
                                    <span className="text-[12px] font-black text-slate-500 uppercase tracking-tighter">Gap (KM)</span>
                                    <input
                                      type="number"
                                      required
                                      disabled={index === 0}
                                      placeholder="0"
                                      className={`w-16 h-8 px-2 bg-slate-100 border border-slate-300 rounded-lg focus:bg-white focus:border-primary-700 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all text-[11px] font-black text-center placeholder:text-slate-500 placeholder:fond-bold
                                       ${index === 0 ? 'text-red-300 bg-red-100' :
                                          (index > 0 && !routesData[index].distanceFromStart ? 'text-rose-500 border-rose-100 bg-rose-50/50 animate-pulse' : 'text-primary-600')
                                        }`}

                                      value={index === 0 ? 0 : routesData[index].distanceFromStart}
                                      onChange={(e) => updatePointDistance(index, parseFloat(e.target.value))}
                                    />
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => movePoint(index, -1)}
                                    disabled={index === 0}
                                    type="button"
                                    className="p-1.5 bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 disabled:opacity-30 rounded-lg transition-all active:scale-90"
                                  >
                                    <ChevronLeft className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => movePoint(index, 1)}
                                    disabled={index === routes.length - 1}
                                    type="button"
                                    className="p-1.5 bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 disabled:opacity-30 rounded-lg transition-all active:scale-90"
                                  >
                                    <ChevronRight className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>

                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 4: Fare Configuration */}
          {routes.length > 1 && (
            <div>
              <div className="px-6 py-4 bg-slate-50/50 flex items-center gap-3">

                <div className="p-2.5 bg-emerald-50 rounded-xl">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Fare Configuration Matrix</h3>
                  <p className="text-xs text-slate-500 font-medium">Define algorithmic point-to-point pricing for this corridor.</p>
                </div>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {routes.map((fromPoint, i) => (
                    routes.slice(i + 1).map((toPoint, jOffset) => {
                      const j = i + 1 + jOffset;
                      const key = `${i}-${j}`;

                      return (
                        <div key={key} className="bg-white p-5 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-500/5 transition-all group max-w-[200px]">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4">
                              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-[10px] font-black text-slate-500">
                                {i + 1}
                              </div>
                              <ArrowRightLeft className="w-3 h-3 text-slate-600" />
                              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-[10px] font-black text-slate-500">
                                {j + 1}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter truncate">{fromPoint}</span>
                              <span className="text-[10px] font-black text-slate-600 leading-none my-0.5"><ArrowRight className="w-3 h-3" /></span>
                              <span className="text-[10px] font-bold text-slate-800 uppercase tracking-tighter truncate">{toPoint}</span>
                            </div>

                            <div className="relative group/price">
                              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 font-black text-sm group-focus-within/price:scale-110 transition-transform">£</div>
                              <input
                                type="number"
                                placeholder="0.00"
                                value={fareMatrix[`${fromPoint}-${toPoint}`] || ''}
                                onChange={(e) => updateFare(fromPoint, toPoint, e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-slate-100 rounded-xl border border-transparent focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-xs font-black text-slate-800 placeholder:text-slate-500"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ))}
                </div>
                {errors.fareMatrix && <p className="text-red-500 text-[10px] font-bold mt-4 ml-1 animate-in fade-in slide-in-from-top-1">{errors.fareMatrix}</p>}
                {hasMissingFares && (
                  <p className="text-red-500 text-[10px] font-bold mt-4 ml-1 animate-in fade-in">
                    * Please specify a valid positive fare for all point-to-point routes in the matrix.
                  </p>
                )}
              </div>
            </div>

          )}
          <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-center justify-end gap-4">
            <Link
              to="/routes"
              className="w-full sm:w-auto text-center px-8 py-3 rounded-2xl font-bold bg-slate-50 text-slate-500 border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all text-sm uppercase tracking-widest"
            >
              Discard Changes
            </Link>
            <button
              type="submit"
              disabled={loading || !hasFutureDate || isDeactBeforeActivation || isDeactPast || hasOperationalDateAfterDeact || hasMissingFares}
              className="w-full sm:w-auto justify-center bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black text-sm hover:bg-emerald-800 active:scale-[0.98] transition-all shadow-2xl shadow-slate-900/20 flex items-center gap-3 uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-5 h-5 text-primary-400" />
              )}
              {loading ? 'Processing...' : (initialData && initialData.id ? 'Synchronize Route' : 'Establish Corridor')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};