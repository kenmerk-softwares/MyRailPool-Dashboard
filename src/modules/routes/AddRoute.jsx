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
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useJsApiLoader, Autocomplete } from '@react-google-maps/api';
import { app, GOOGLE_MAPS_API_KEY } from '../../shared/services/firebase';
import { httpsCallable, getFunctions } from 'firebase/functions';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../shared/hooks/ToastContext';

const LIBRARIES = ['places'];

export const AddRoute = () => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
  });

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



  const [selectedDates, setSelectedDates] = useState(initialData?.operating_dates || []);

  const handleAddDate = (e) => {
    const date = e.target.value;
    if (date && !selectedDates.includes(date)) {
      setSelectedDates([...selectedDates, date].sort());
    }
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
    setRoutes(routes.filter((_, i) => i !== index));
    setRoutesData(routesData.filter((_, i) => i !== index));
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

      // Validation: Ensure all geographical nodes have a distance defined
      const invalidNode = routesData.find((node, idx) => 
        idx > 0 && (node.distanceFromStart === undefined || node.distanceFromStart === null || isNaN(node.distanceFromStart))
      );

      if (invalidNode) {
        showToast(`Please specify the Gap (KM) for node: ${invalidNode.name}`, 'error');
        setLoading(false);
        return;
      }
      
      const payload = {
        action: initialData ? 'edit' : 'add',
        id: initialData?.id,
        name: data.routeName,
        status: data.status,
        activationDate: data.activationDate,
        deactivationDate: data.deactivationDate,
        selectedDates: selectedDates,
        routes: routes,
        routesData: routesData,
        fareMatrix: fareMatrix,
        start: routes[0] || '',
        end: routes[routes.length - 1] || '',
      };

      const addRouteFn = httpsCallable(functions, 'addRoute');
      const result = await addRouteFn(payload);

      if (result.data.success) {
        showToast(initialData ? 'Route corridor synchronized successfully' : 'New route corridor established', 'success');
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

  return (
    <div className="w-full max-w-full mx-auto pb-12 px-2 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        
      </div>

      <form onSubmit={handleSave}>
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/60 overflow-hidden">
          {/* Section 1: Route Specifications */}
          <div className="border-b border-slate-100">
            <div className="px-8 py-5 bg-slate-50/50 flex items-center gap-3">
              <div className="p-2.5 bg-primary-50 rounded-xl">
                <RouteIcon className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Add Route</h3>
                
              </div>
            </div>
            
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block">Route Identifier / Name</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 p-1.5 bg-slate-50 rounded-lg group-focus-within:bg-primary-50 transition-colors">
                      <RouteIcon className="w-4 h-4 text-slate-400 group-focus-within:text-primary-500" />
                    </div>
                    <input
                      type="text"
                      name="routeName"
                      className="w-full pl-14 pr-4 py-1.5 rounded-2xl border border-slate-200 bg-white text-slate-800 font-bold focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all placeholder:text-slate-300"
                      placeholder="e.g., North-South Express Corridor"
                      defaultValue={initialData?.name}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block">Operational Status</label>
                  <select
                    name="status"
                    className="w-full px-5 py-1.5 rounded-2xl border border-slate-200 bg-white text-primary-700 font-bold focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all cursor-pointer appearance-none"
                    defaultValue={initialData?.status || "Active"}
                  >
                    <option value="Active">Active Corridor</option>
                    <option value="Inactive">Under Maintenance / Inactive</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Operating Schedule */}
          <div className="border-b border-slate-100">
            <div className="px-8 py-5 bg-slate-50/50 flex items-center gap-3">
              <div className="p-2.5 bg-amber-50 rounded-xl">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Operating Schedule</h3>
                <p className="text-xs text-slate-500 font-medium">Set the temporal availability and operating window.</p>
              </div>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block">Activation Date</label>
                  <div className="relative group">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
                    <input
                      type="date"
                      name="activationDate"
                      className="w-full pl-12 pr-4 py-1.5 rounded-2xl border border-slate-200 bg-white text-slate-800 font-medium focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all"
                      defaultValue={initialData?.activationDate}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block">Deactivation Date</label>
                  <div className="relative group">
                    <ArrowRightLeft className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
                    <input
                      type="date"
                      name="deactivationDate"
                      className="w-full pl-12 pr-4 py-1.5 rounded-2xl border border-slate-200 bg-white text-slate-800 font-medium focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all"
                      defaultValue={initialData?.deactivationDate}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block">Active Calendar Dates</label>
                  <div className="space-y-4">
                    <input
                      type="date"
                      onChange={handleAddDate}
                      className="w-full px-5 py-1.5 rounded-2xl border border-slate-200 bg-white text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                    />

                    {selectedDates.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedDates.map(date => (
                          <div key={date} className="flex items-center gap-2 px-3.5 py-2 bg-primary-50 border border-primary-100 rounded-xl group animate-in zoom-in duration-200">
                            <span className="text-[10px] font-black text-primary-700 tracking-tight">
                              {new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveDate(date)}
                              className="text-primary-300 hover:text-red-500 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="px-5 py-3 border-2 border-dashed border-slate-100 rounded-2xl text-center">
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">No specific dates selected</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Dropping Points */}
          <div className="border-b border-slate-100">
            <div className="px-8 py-5 bg-slate-50/50 flex items-center justify-between">
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

            <div className="p-8 space-y-8">
              <div className="max-w-2xl">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-3">Integrate New Location Node</label>
                <div className="relative flex gap-3">
                  <div className="relative flex-1 group">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    {isLoaded ? (
                      <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
                        <input
                          type="text"
                          value={currentPoint}
                          onChange={(e) => setCurrentPoint(e.target.value)}
                          onKeyDown={handleKeyDown}
                          className="w-full pl-12 pr-4 py-1.5 rounded-2xl border border-slate-200 bg-white text-slate-800 font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-slate-300"
                          placeholder="Search for a geographical node..."
                        />
                      </Autocomplete>
                    ) : (
                      <div className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-slate-400 font-medium animate-pulse">
                        Synchronizing Map Data...
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleAddPoint}
                    type="button"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-1.5 rounded-2xl font-bold transition-all flex items-center gap-2 active:scale-95 shadow-lg shadow-indigo-200 hover:shadow-indigo-300/50"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Append</span>
                  </button>
                </div>
              </div>

              <div>
                {routes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 px-6 bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-100 animate-in fade-in zoom-in duration-700">
                    <div className="w-20 h-20 bg-white rounded-3xl shadow-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <MapPin className="w-10 h-10 text-slate-300" />
                    </div>
                    <h4 className="text-xl font-bold text-slate-800 mb-2">No Geographical Nodes Defined</h4>
                    <p className="text-slate-500 max-w-sm text-center font-medium leading-relaxed">
                      Begin by adding the primary origin point. Subsequent nodes will automatically form the corridor's travel sequence.
                    </p>
                  </div>
                ) : (
                  <div className="relative bg-slate-50/30 rounded-[2rem] p-8 border border-slate-100">
                    <div className="flex items-start gap-6 overflow-x-auto pb-10 hide-scrollbar pt-4">
                      {routes.map((point, index) => (
                        <div key={index} className="flex-shrink-0 relative group" style={{ width: '220px' }}>
                          
                          {index !== routes.length - 1 && (
                            <div className="absolute left-[50%] top-[15px] w-full h-[4px] bg-gradient-to-r from-indigo-500 via-indigo-300 to-slate-100 z-0 opacity-20 group-hover:opacity-100 transition-opacity rounded-full" />
                          )}

                          <div className="relative z-10 flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full border-4 transition-all duration-500 flex items-center justify-center shadow-2xl ${
                              index === 0 ? 'bg-primary-600 border-primary-100' :
                              index === routes.length - 1 ? 'bg-rose-600 border-rose-100' :
                              'bg-indigo-600 border-indigo-100'
                            } group-hover:scale-125 group-hover:rotate-[360deg]`}>
                              {index === 0 ? <div className="w-2 h-2 bg-white rounded-full shadow-inner" /> :
                               index === routes.length - 1 ? <div className="w-2 h-2 bg-white rounded-full shadow-inner" /> :
                               <div className="w-1.5 h-1.5 bg-white rounded-full shadow-inner" />}
                            </div>

                            <span className="mt-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.25em] drop-shadow-sm">
                              {index === 0 ? 'Origin Node' : index === routes.length - 1 ? 'Arrival Node' : `Waypoint #${index}`}
                            </span>
                          </div>

                          <div className="mt-4 px-3 w-full">
                            <div className="bg-white border-2 border-slate-50 rounded-[1.5rem] p-4 shadow-xl shadow-slate-200/20 group-hover:shadow-2xl group-hover:shadow-indigo-500/10 group-hover:border-indigo-100 transition-all duration-500 relative overflow-hidden h-[180px] flex flex-col">
                              <div className={`absolute top-0 left-0 w-1.5 h-full opacity-30 ${
                                index === 0 ? 'bg-primary-500' : 
                                index === routes.length - 1 ? 'bg-rose-500' : 
                                'bg-indigo-500'
                              }`} />

                              <div className="relative z-10 flex flex-col h-full">
                                <h4 className="text-[11px] font-black text-slate-800 line-clamp-2 min-h-[32px] mb-4 leading-tight uppercase tracking-tight">
                                  {point}
                                </h4>

                                <div className="space-y-1">
                                  <div className="relative">
                                    <input
                                      type="text"
                                      className="w-full text-[13px] font-bold text-slate-800 bg-transparent border-none outline-none focus:ring-0 p-0"
                                      value={point}
                                      onChange={(e) => {
                                        const newPoints = [...routes];
                                        newPoints[index] = e.target.value;
                                        setRoutes(newPoints);
                                      }}
                                    />
                                  </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-50">
                                  <div className="flex items-center gap-1.5">
                                    <div className="p-1.5 bg-slate-50 rounded-lg">
                                      <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Gap (KM)</span>
                                      <input
                                        type="number"
                                        required
                                        disabled={index === 0}
                                        placeholder="0"
                                        className={`w-12 text-[11px] font-black bg-transparent border-none outline-none focus:ring-0 p-0 ${
                                          index === 0 ? 'text-slate-300' : 
                                          (index > 0 && !routesData[index].distanceFromStart ? 'text-rose-500 animate-pulse' : 'text-indigo-600')
                                        }`}
                                        value={index === 0 ? 0 : routesData[index].distanceFromStart}
                                        onChange={(e) => updatePointDistance(index, parseFloat(e.target.value))}
                                      />
                                    </div>
                                  </div>

                                  <button
                                    onClick={() => movePoint(index, -1)}
                                    disabled={index === 0}
                                    type="button"
                                    className="p-2 bg-slate-50 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 disabled:opacity-30 rounded-lg transition-all active:scale-90"
                                  >
                                    <ChevronLeft className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => movePoint(index, 1)}
                                    disabled={index === routes.length - 1}
                                    type="button"
                                    className="p-2 bg-slate-50 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 disabled:opacity-30 rounded-lg transition-all active:scale-90"
                                  >
                                    <ChevronRight className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleRemovePoint(index)}
                                    type="button"
                                    className="p-2 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-all active:scale-90"
                                  >
                                    <Trash2 className="w-4 h-4" />
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
              <div className="px-8 py-5 bg-slate-50/50 flex items-center gap-3">
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
                        <div key={key} className="bg-white p-5 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-500/5 transition-all group">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-[10px] font-black text-slate-400">
                                {i+1}
                              </div>
                              <ArrowRightLeft className="w-3 h-3 text-slate-300" />
                              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-[10px] font-black text-slate-400">
                                {j+1}
                              </div>
                            </div>
                            <div className="px-2.5 py-1 bg-emerald-50 rounded-lg">
                              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Link</span>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="flex flex-col">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter truncate">{fromPoint}</span>
                              <span className="text-[10px] font-black text-slate-200 leading-none my-0.5">↓</span>
                              <span className="text-[10px] font-bold text-slate-800 uppercase tracking-tighter truncate">{toPoint}</span>
                            </div>

                            <div className="relative group/price">
                              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 font-black text-sm group-focus-within/price:scale-110 transition-transform">£</div>
                              <input
                                type="number"
                                placeholder="0.00"
                                value={fareMatrix[`${fromPoint}-${toPoint}`] || ''}
                                onChange={(e) => updateFare(fromPoint, toPoint, e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50/50 rounded-xl border border-transparent focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-sm font-black text-slate-800 placeholder:text-slate-300"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ))}
                </div>
              </div>
            </div>
          )}
          <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-center justify-end gap-4">
            <Link
              to="/routes"
              className="w-full sm:w-auto text-center px-8 py-1.5 rounded-2xl font-bold bg-slate-50 text-slate-500 border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all text-sm uppercase tracking-widest"
            >
              Discard Changes
            </Link>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full sm:w-auto justify-center bg-slate-900 text-white px-12 py-1.5 rounded-2xl font-black text-sm hover:bg-primary-600 active:scale-[0.98] transition-all shadow-2xl shadow-slate-900/20 flex items-center gap-3 uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-5 h-5 text-primary-400" /> 
              )}
              {loading ? 'Processing...' : (initialData ? 'Synchronize Route' : 'Establish Corridor')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
