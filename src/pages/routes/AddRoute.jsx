import React, { useState } from 'react';
import {
  Save,
  MapPin,
  Clock,
  ArrowRightLeft,
  User,
  Car,
  Route as RouteIcon,
  TrendingUp,
  Map,
  Clock1,
  X,
  Plus,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useJsApiLoader, Autocomplete } from '@react-google-maps/api';
import { GOOGLE_MAPS_API_KEY } from '../../Config/Config';
import { driversData, vehiclesData } from '../../data/mockData';

const LIBRARIES = ['places'];

export const AddRoute = () => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
  });

  const location = useLocation();
  const initialData = location.state?.route || null;
  const [droppingPoints, setDroppingPoints] = useState(initialData?.droppingPoints || []);
  const [droppingPointsDetails, setDroppingPointsDetails] = useState(initialData?.droppingPointsDetails || []);
  const [fareMatrix, setFareMatrix] = useState(initialData?.fareMatrix || {});
  const [currentPoint, setCurrentPoint] = useState('');
  const [autocomplete, setAutocomplete] = useState(null);

  const parseNumeric = (val) => {
    if (!val) return '';
    return val.replace(/[^0-9.]/g, '');
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const [selectedDays, setSelectedDays] = useState(() => {
    if (initialData?.days_op) {
      if (initialData.days_op === 'Daily') return [...daysOfWeek];
      const selected = initialData.days_op.split(',').map(d => d.trim());
      return selected.map(s => {
        const full = daysOfWeek.find(d => d.startsWith(s));
        return full || s;
      });
    }
    return [];
  });

  const toggleDay = (day) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

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

  const [timeSlots, setTimeSlots] = useState(() => {
    if (initialData?.time_slots) {
      return initialData.time_slots.split(',').map(t => t.trim());
    }
    return [];
  });
  const [currentTime, setCurrentTime] = useState('');

  const handleAddTime = () => {
    if (currentTime && !timeSlots.includes(currentTime)) {
      setTimeSlots([...timeSlots, currentTime].sort());
      setCurrentTime('');
    }
  };

  const handleRemoveTime = (time) => {
    setTimeSlots(timeSlots.filter(t => t !== time));
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
      setDroppingPoints([...droppingPoints, pointName]);

      const details = placeDetails ? {
        formatted_address: placeDetails.formatted_address,
        lat: placeDetails.geometry?.location?.lat(),
        lng: placeDetails.geometry?.location?.lng(),
        place_id: placeDetails.place_id,
        name: placeDetails.name,
        distanceFromStart: 0
      } : { name: pointName, distanceFromStart: 0 };

      setDroppingPointsDetails([...droppingPointsDetails, details]);
      setCurrentPoint('');
    }
  };

  const updatePointDistance = (index, value) => {
    const newDetails = [...droppingPointsDetails];
    newDetails[index].distanceFromStart = value;
    setDroppingPointsDetails(newDetails);
  };

  const updateFare = (fromIdx, toIdx, value) => {
    setFareMatrix(prev => ({
      ...prev,
      [`${fromIdx}-${toIdx}`]: value
    }));
  };

  const handleRemovePoint = (index) => {
    setDroppingPoints(droppingPoints.filter((_, i) => i !== index));
    setDroppingPointsDetails(droppingPointsDetails.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddPoint();
    }
  };

  const movePoint = (index, direction) => {
    const newPoints = [...droppingPoints];
    const newDetails = [...droppingPointsDetails];
    const targetIndex = index + direction;

    if (targetIndex >= 0 && targetIndex < newPoints.length) {
      [newPoints[index], newPoints[targetIndex]] = [newPoints[targetIndex], newPoints[index]];
      [newDetails[index], newDetails[targetIndex]] = [newDetails[targetIndex], newDetails[index]];
      setDroppingPoints(newPoints);
      setDroppingPointsDetails(newDetails);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    data.selectedDays = selectedDays;
    data.selectedDates = selectedDates;
    data.timeSlots = timeSlots;
    data.droppingPointsNames = droppingPoints;
    data.droppingPointsDetails = droppingPointsDetails;
    data.fareMatrix = fareMatrix;
    data.start = droppingPoints[0] || '';
    data.end = droppingPoints[droppingPoints.length - 1] || '';
    console.log("=== Saved Route Data ===");
    console.log(data);
  };

  return (
    <div className="max-w-6xl mx-auto pb-12 px-4 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              {initialData ? 'Edit Route' : 'Create New Route'}
            </h2>
            <p className="text-slate-500 font-medium mt-1">
              {initialData
                ? `  ${initialData.name}. Modify operational parameters and assign initial assets.`
                : 'Define a new standard travel corridor and assign initial assets.'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave}>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="space-y-8 mt-4">
            <div className="px-6 py-2 border-b border-slate-100 flex items-center gap-3 bg-slate-50/30 rounded-t-2xl">
              <div className="p-2 bg-primary-50 rounded-lg">
                <RouteIcon className="w-4 h-4 text-primary-600" />
              </div>
              <h3 className="font-bold text-slate-800 tracking-tight">Route Specifications</h3>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className=" col-span-2 space-y-2">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Route Name</label>
                  <input
                    type="text"
                    name="routeName"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-bold focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                    placeholder="Enter Route Name"
                    defaultValue={initialData?.name}
                  />
                </div>

                {/* <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Route Type</label>
                <select
                  name="routeType"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-bold focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all cursor-pointer"
                  defaultValue={initialData?.route_type || "one_way"}
                >
                  <option value="one_way">Core route</option>
                  <option value="circuit">Flexi route</option>
                </select>
              </div> */}

                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Status</label>
                  <select
                    name="status"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-primary-700 font-bold focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all cursor-pointer"
                    defaultValue={initialData?.status || "Active"}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

              </div>

              {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pt-6 border-t border-slate-50">
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Total Route Distance (km)</label>
                <div className="relative">
                  <Map className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="number"
                    name="distance"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                    placeholder="0"
                    defaultValue={parseNumeric(initialData?.distance)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Base Est. Price (£)</label>
                <div className="relative">
                  <TrendingUp className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                  <input
                    type="number"
                    name="estPrice"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-emerald-700 font-bold focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                    placeholder="0.00"
                    defaultValue={parseNumeric(initialData?.estPrice)}
                  />
                </div>
              </div>
            </div> */}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6 pt-6 border-t border-slate-50">
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Start Date & Time</label>
                  <div className="relative">
                    <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="datetime-local"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">End Date & Time</label>
                  <div className="relative">
                    <ArrowRightLeft className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="datetime-local"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2 col-span-1 md:col-span-2 lg:col-span-1">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Days Operating</label>
                  {/* <div className="flex flex-wrap gap-1.5 mt-1">
                  {daysOfWeek.map(day => {
                    const isSelected = selectedDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`px-3 py-2 rounded-xl text-[10px] font-bold transition-all duration-200 border ${isSelected
                          ? 'bg-primary-600 border-primary-600 text-white shadow-md shadow-primary-100'
                          : 'bg-white border-slate-200 text-slate-500 hover:border-primary-300 hover:text-primary-600'
                          }`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    );
                  })}
                </div> */}
                  <div className="space-y-3">
                    <input
                      type="date"
                      onChange={handleAddDate}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                    />

                    {selectedDates.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {selectedDates.map(date => (
                          <div key={date} className="flex items-center gap-2 px-3 py-1.5 bg-primary-50 border border-primary-100 rounded-lg group animate-in zoom-in duration-200">
                            <span className="text-[10px] font-bold text-primary-700">
                              {new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveDate(date)}
                              className="text-primary-400 hover:text-red-500 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2 col-span-1 md:col-span-2 lg:col-span-1">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Trip Starting Times</label>
                  <div className="space-y-3">
                    <div className="relative flex gap-2">
                      <div className="relative flex-1">
                        <Clock1 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="time"
                          value={currentTime}
                          onChange={(e) => setCurrentTime(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleAddTime}
                        className="bg-primary-50 text-primary-600 p-2.5 rounded-xl hover:bg-primary-100 transition-all active:scale-95 border border-primary-100"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>

                    {timeSlots.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {timeSlots.map(time => (
                          <div key={time} className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg group animate-in zoom-in duration-200">
                            <span className="text-xs font-bold text-slate-700">{time}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveTime(time)}
                              className="text-slate-500 hover:text-red-500 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <MapPin className="w-4 h-4 text-indigo-600" />
                </div>
                <h3 className="font-bold text-slate-800 tracking-tight">Dropping Points</h3>
              </div>
              {droppingPoints.length > 0 && (
                <span className="text-[10px] font-bold px-2 py-1 bg-indigo-50 text-indigo-600 rounded-full uppercase tracking-wider">
                  {droppingPoints.length} Locations
                </span>
              )}
            </div>

            <div className="p-6 space-y-6">
              <div className="max-w-md">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">Add New Location</label>
                <div className="relative flex gap-2">
                  <div className="relative flex-1">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    {isLoaded ? (
                      <Autocomplete
                        onLoad={onLoad}
                        onPlaceChanged={onPlaceChanged}
                      >
                        <input
                          type="text"
                          value={currentPoint}
                          onChange={(e) => setCurrentPoint(e.target.value)}
                          onKeyDown={handleKeyDown}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                          placeholder="Search for a location..."
                        />
                      </Autocomplete>
                    ) : (
                      <input
                        type="text"
                        value={currentPoint}
                        onChange={(e) => setCurrentPoint(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all animate-pulse"
                        placeholder="Loading maps..."
                        disabled
                      />
                    )}
                  </div>
                  <button
                    onClick={handleAddPoint}
                    type="button"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-bold transition-all flex items-center gap-2 active:scale-95 shadow-md shadow-indigo-200"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Route Sequence</label>
                {droppingPoints.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/20">
                    <div className="p-3 bg-white rounded-2xl shadow-sm mb-3">
                      <MapPin className="w-6 h-6 text-slate-300" />
                    </div>
                    <p className="text-slate-500 font-semibold text-sm">No points added to the route yet</p>
                    <p className="text-slate-300 text-xs mt-1">Search and add locations above to build your route</p>
                  </div>
                ) : (
                  <div className="relative pt-8 pb-4">
                    <div className="flex items-start gap-0 overflow-x-auto pb-8 hide-scrollbar">
                      {droppingPoints.map((point, index) => (
                        <div key={index} className="flex-shrink-0 flex flex-col items-center group relative" style={{ width: '200px' }}>

                          {index !== droppingPoints.length - 1 && (
                            <div className="absolute left-[50%] top-[12px] w-full h-[3px] bg-gradient-to-r from-emerald-500 to-emerald-200 z-0 opacity-40 group-hover:opacity-100 transition-opacity" />
                          )}

                          <div className="relative z-10 flex flex-col items-center">
                            <div className={`w-6 h-6 rounded-full border-4 transition-all duration-300 flex items-center justify-center ${index === 0 ? 'bg-primary-600 border-primary-100 shadow-lg shadow-primary-200 scale-110' :
                                index === droppingPoints.length - 1 ? 'bg-red-600 border-red-100 shadow-lg shadow-red-200 scale-110' :
                                  'bg-emerald-600 border-emerald-100 shadow-lg shadow-emerald-200'
                              } group-hover:scale-125`}>
                              {index === 0 ? <div className="w-1.5 h-1.5 bg-white rounded-full" /> :
                                index === droppingPoints.length - 1 ? <div className="w-1.5 h-1.5 bg-white rounded-full" /> :
                                  <div className="w-1 h-1 bg-white rounded-full" />}
                            </div>

                            <span className="mt-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                              {index === 0 ? 'Start' : `Stop ${index}`}
                            </span>
                          </div>
                          <div className="mt-2 px-2 w-full">
                            <div className="bg-white border border-slate-100 rounded-xl p-3 shadow-sm group-hover:shadow-md group-hover:border-primary-100 transition-all duration-300 relative overflow-hidden">
                              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 opacity-20" />

                              <div className="relative z-10">
                                <p className="text-[10px] font-bold text-slate-800 line-clamp-2 min-h-[24px] mb-2 leading-relaxed uppercase tracking-tight">
                                  {point}
                                </p>

                                <div className="mb-2">
                                  <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1">Dist. (km)</label>
                                  <div className="relative">
                                    <input
                                      type="number"
                                      value={index === 0 ? 0 : (droppingPointsDetails[index]?.distanceFromStart || 0)}
                                      onChange={(e) => updatePointDistance(index, e.target.value)}
                                      disabled={index === 0}
                                      className={`w-full border border-slate-100 rounded-lg px-2 py-1.5 text-[10px] font-bold outline-none transition-all ${index === 0
                                          ? 'bg-slate-100 text-slate-500 cursor-not-allowed'
                                          : 'bg-slate-50 text-emerald-700 focus:border-emerald-500 focus:bg-white'
                                        }`}
                                    />
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-500">KM</span>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => movePoint(index, -1)}
                                      disabled={index === 0}
                                      type="button"
                                      className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-primary-900 disabled:opacity-30 rounded-lg transition-all active:scale-90"
                                      title="Move Left"
                                    >
                                      <ChevronLeft className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => movePoint(index, 1)}
                                      disabled={index === droppingPoints.length - 1}
                                      type="button"
                                      className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-primary-900 disabled:opacity-30 rounded-lg transition-all active:scale-90"
                                      title="Move Right"
                                    >
                                      <ChevronRight className="w-3.5 h-3.5" />
                                    </button>
                                  </div>

                                  <button
                                    onClick={() => handleRemovePoint(index)}
                                    type="button"
                                    className="p-2 hover:bg-red-100 text-red-600 hover:text-red-900 rounded-lg transition-all active:scale-90"
                                    title="Remove Point"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
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

          
          {droppingPoints.length > 1 && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/30">
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                </div>
                <h3 className="font-bold text-slate-800 tracking-tight">Fare Configuration</h3>
              </div>
              <div className="p-6">
                <p className="text-xs text-slate-500 mb-6">Configure fares for all possible travel combinations between your route points.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {droppingPoints.map((fromPoint, i) => (
                    droppingPoints.slice(i + 1).map((toPoint, jOffset) => {
                      const j = i + 1 + jOffset;
                      const key = `${i}-${j}`;
                      return (
                        <div key={key} className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-emerald-200 transition-all">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Combination</span>
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">£ Fixed</span>
                          </div>
                          <div className="flex items-center gap-2 mb-4">
                            <div className="flex-1 text-[11px] font-bold text-slate-700 truncate">{fromPoint}</div>
                            <ChevronRight className="w-3 h-3 text-slate-300 flex-shrink-0" />
                            <div className="flex-1 text-[11px] font-bold text-slate-700 truncate">{toPoint}</div>
                          </div>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">£</span>
                            <input
                              type="number"
                              value={fareMatrix[key] || ''}
                              onChange={(e) => updateFare(i, j, e.target.value)}
                              className="w-full pl-7 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 outline-none focus:border-emerald-500 transition-all"
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                      );
                    })
                  ))}
                </div>
              </div>
            </div>
          )}

          <div>
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/30">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <User className="w-4 h-4 text-indigo-600" />
              </div>
              <h3 className="font-bold text-slate-800 tracking-tight">Primary Asset Allocation</h3>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Default Corridor Driver</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <select
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all cursor-pointer appearance-none"
                      defaultValue={initialData?.driver}
                    >
                      <option value="">Select Operator</option>
                      {driversData.map(d => (
                        <option key={d.id} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Default Service Vehicle</label>
                  <div className="relative">
                    <Car className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <select
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all cursor-pointer appearance-none"
                      defaultValue={initialData?.vehicle}
                    >
                      <option value="">Select Asset</option>
                      {vehiclesData.map(v => (
                        <option key={v.id} value={`${v.make} ${v.model} (${v.registration_no})`}>
                          {v.make} {v.model} - {v.registration_no}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="m-8 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 sm:gap-4 px-4">
              <Link
                to="/routes"
                className="w-full sm:w-auto text-center px-6 py-3 rounded-xl font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all text-sm"
              >
                Cancel
              </Link>
              <button type="submit" className="w-full sm:w-auto justify-center bg-primary-600 text-white px-10 py-3.5 rounded-xl font-bold text-sm hover:bg-primary-700 active:scale-[0.98] transition-all shadow-lg shadow-primary-600/20 flex items-center gap-2.5">
                <Save className="w-4.5 h-4.5" /> {initialData ? 'Save Route' : 'Add Route'}
              </button>
            </div>
          </div>
        </div></form>
    </div>
  );
};
