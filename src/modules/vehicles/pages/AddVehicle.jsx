import React, { useState, useEffect, useRef } from 'react';
import {
  Save,
  Car,
  Info,
  Shield,
  ShieldCheck,
  Calendar,
  Briefcase,
  CreditCard,
  User,
  Hash,
  FileText,
  Activity,
  Award,
  AlertCircle,
  Loader2,
  ChevronLeft
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { FunctionsAPI } from '../../../shared/services/functions.api';
import { useToast } from '../../../shared/hooks/ToastContext';
import { useDrivers } from '../../drivers/hooks/driver.useDrivers';
import { VehicleValidationSchema } from '../../../shared/utils/Validations/VehicleValidation';

export const AddVehicle = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { drivers, fetchDrivers } = useDrivers();
  const dropdownRef = useRef(null);
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [driverSearch, setDriverSearch] = useState('');
  const [showDriverResults, setShowDriverResults] = useState(false);

  const [formData, setFormData] = useState({
    make: '',
    model: '',
    colour: '',
    type: 'Sedan',
    seatingCapacity: '',
    registrationNo: '',
    phVehicleLicence: '',
    licenceExpiry: '',
    providerName: '',
    policyNumber: '',
    insuranceExpiry: '',
    assignedDriver: '',
    driverId: '',
    operationalStatus: 'Active',
    notes: ''
  });

  // Fetch drivers for the autocomplete search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (driverSearch.length > 0) {
        fetchDrivers({ searchQuery: driverSearch });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [driverSearch, fetchDrivers]);

  // Click outside listener for driver dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDriverResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { error } = VehicleValidationSchema.validate(formData, { abortEarly: false });
    if (error) {
      const newErrors = {};
      error.details.forEach(err => { newErrors[err.path[0]] = err.message; });
      setErrors(newErrors);
      showToast("Please check mandatory fields", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await FunctionsAPI.addVehicle({ 
        type: "add", 
        fields: {
          ...formData,
          searchKey: `${formData.make} ${formData.model} ${formData.registrationNo}`.toLowerCase()
        } 
      });
      
      if (res.success) {
        showToast("Vehicle registered successfully!", "success");
        navigate('/vehicles');
      } else {
        showToast(res.error || "Failed to register vehicle", "error");
      }
    } catch (error) {
      showToast(error.message || "An unexpected error occurred", "error");
    } finally {
      setLoading(false);
    }
  };

  // Shared input class builder for consistency
  const inputCls = (field) =>
    `w-full pl-11 pr-4 py-2.5 rounded-xl border-[1.5px] ${errors[field] ? 'border-red-500 bg-red-50/10' : 'border-slate-200 bg-white'} text-slate-800 font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-sm`;

  return (
    <form onSubmit={handleSubmit} noValidate className="max-w-full mx-auto pb-12 px-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-6 px-2">
        <div className="flex items-center gap-4">
          <Link to="/vehicles" className="p-2 hover:bg-slate-100 rounded-xl transition-colors group">
            <ChevronLeft className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
          </Link>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Register Vehicle</h2>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Asset Onboarding & Compliance Entry</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60">
        
        {/* ── Section 1: Asset Identity ── */}
        <div className="space-y-4 mt-4">
          <div className="px-6 py-2 border-b border-slate-100 flex items-center gap-3 bg-slate-50/30">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Car className="w-4 h-4 text-indigo-600" />
            </div>
            <h3 className="font-bold text-slate-800 tracking-tight">Vehicle Identity</h3>
          </div>

          <div className="px-6 pb-2">
          <div className="px-6 pb-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Make */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Manufacturer / Make <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Car className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text" name="make" value={formData.make} onChange={handleChange}
                    className={inputCls('make')} placeholder="e.g. Toyota"
                  />
                </div>
                {errors.make && <p className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.make}</p>}
              </div>

              {/* Model */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Model Series <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Info className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text" name="model" value={formData.model} onChange={handleChange}
                    className={inputCls('model')} placeholder="e.g. Prius Business Edition"
                  />
                </div>
                {errors.model && <p className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.model}</p>}
              </div>

              {/* Colour */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Colour <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Activity className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text" name="colour" value={formData.colour} onChange={handleChange}
                    className={inputCls('colour')} placeholder="e.g. Silver Metallic"
                  />
                </div>
                {errors.colour && <p className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.colour}</p>}
              </div>

              {/* Type */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Vehicle Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="type" value={formData.type} onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border-[1.5px] border-slate-200 bg-white text-slate-800 font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all cursor-pointer text-sm"
                >
                  <option value="Sedan">Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="Hatchback">Hatchback</option>
                  <option value="MPV">MPV</option>
                  <option value="Van">Van</option>
                </select>
              </div>

              {/* Seating */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Seating Capacity <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text" name="seatingCapacity" value={formData.seatingCapacity} onChange={handleChange}
                    className={inputCls('seatingCapacity')} placeholder="e.g. 4+1"
                  />
                </div>
                {errors.seatingCapacity && <p className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.seatingCapacity}</p>}
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Fleet Status <span className="text-red-500">*</span>
                </label>
                <select
                  name="operationalStatus" value={formData.operationalStatus} onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border-[1.5px] border-slate-200 bg-white text-indigo-700 font-bold focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all cursor-pointer text-sm"
                >
                  <option value="Active">🟢 Active</option>
                  <option value="Maintenance">🟡 Maintenance</option>
                  <option value="Inactive">⚪ Inactive</option>
                </select>
              </div>

            </div>
          </div>
        </div>

        {/* ── Section 2: Licensing & Registration ── */}
        <div className="mt-6">
          <div className="px-6 py-2 border-b border-slate-100 flex items-center gap-3 bg-slate-50/30">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="font-bold text-slate-800 tracking-tight">Licensing & Registration</h3>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Registration */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Registration No <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text" name="registrationNo" value={formData.registrationNo} onChange={handleChange}
                    className={inputCls('registrationNo') + ' uppercase font-black'} placeholder="e.g. LX20 ABC"
                  />
                </div>
                {errors.registrationNo && <p className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.registrationNo}</p>}
              </div>

              {/* PH License */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  PH Vehicle Licence <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Award className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text" name="phVehicleLicence" value={formData.phVehicleLicence} onChange={handleChange}
                    className={inputCls('phVehicleLicence')} placeholder="e.g. PH-12345"
                  />
                </div>
                {errors.phVehicleLicence && <p className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.phVehicleLicence}</p>}
              </div>

              {/* Licence Expiry */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">
                  Licence Expiry Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="date" name="licenceExpiry" value={formData.licenceExpiry} onChange={handleChange}
                    className={inputCls('licenceExpiry')}
                  />
                </div>
                {errors.licenceExpiry && <p className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.licenceExpiry}</p>}
              </div>

            </div>
          </div>
        </div>

        {/* ── Section 3: Insurance Coverage ── */}
        <div className="mt-6">
          <div className="px-6 py-2 border-b border-slate-100 flex items-center gap-3 bg-slate-50/30">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Shield className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="font-bold text-slate-800 tracking-tight">Insurance Coverage</h3>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Provider */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Insurance Provider <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text" name="providerName" value={formData.providerName} onChange={handleChange}
                    className={inputCls('providerName')} placeholder="e.g. Allianz Insurance"
                  />
                </div>
                {errors.providerName && <p className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.providerName}</p>}
              </div>

              {/* Policy No */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Policy Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text" name="policyNumber" value={formData.policyNumber} onChange={handleChange}
                    className={inputCls('policyNumber')} placeholder="e.g. POL-987654321"
                  />
                </div>
                {errors.policyNumber && <p className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.policyNumber}</p>}
              </div>

              {/* Insurance Expiry */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider block">
                  Insurance Expiry <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="date" name="insuranceExpiry" value={formData.insuranceExpiry} onChange={handleChange}
                    className={inputCls('insuranceExpiry')}
                  />
                </div>
                {errors.insuranceExpiry && <p className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.insuranceExpiry}</p>}
              </div>

            </div>
          </div>
        </div>

        {/* ── Section 4: Fleet Assignment & Notes ── */}
        <div className="mt-6">
          <div className="px-6 py-2 border-b border-slate-100 flex items-center gap-3 bg-slate-50/30">
            <div className="p-2 bg-amber-50 rounded-lg">
              <Activity className="w-4 h-4 text-amber-600" />
            </div>
            <h3 className="font-bold text-slate-800 tracking-tight">Fleet Assignment & Notes</h3>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Assigned Driver */}
              <div className="md:col-span-2 space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Assigned Driver
                </label>
                <div className="relative" ref={dropdownRef}>
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search active drivers..."
                    value={driverSearch}
                    onChange={(e) => {
                      setDriverSearch(e.target.value);
                      setShowDriverResults(true);
                      if (!e.target.value) {
                        setFormData(prev => ({ ...prev, assignedDriver: '', driverId: '' }));
                      }
                    }}
                    onFocus={() => setShowDriverResults(true)}
                    className={inputCls('assignedDriver')}
                  />
                  {showDriverResults && drivers.length > 0 && (
                    <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto py-2">
                      {drivers.map(driver => (
                        <button
                          key={driver.id}
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ 
                              ...prev, 
                              assignedDriver: driver.name,
                              driverId: driver.docId
                            }));
                            setDriverSearch(driver.name);
                            setShowDriverResults(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-indigo-50 transition-colors flex flex-col gap-0.5 border-b border-slate-50 last:border-0"
                        >
                          <span className="font-bold text-slate-800 text-sm">{driver.name}</span>
                          <span className="text-[10px] text-slate-500 font-medium uppercase tracking-tight">{driver.mobile || 'No Mobile'}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Notes */}
              <div className="md:col-span-4 space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Additional Asset Notes</label>
                <div className="relative">
                  <FileText className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                  <textarea
                    rows="2" name="notes" value={formData.notes} onChange={handleChange}
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border-[1.5px] border-slate-200 bg-white text-slate-800 font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all resize-none text-sm"
                    placeholder="Enter any specific maintenance or status remarks..."
                  />
                </div>
              </div>

            </div>

            </div>
          </div>
        </div>

        {/* ── Footer Actions ── */}
        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 sm:gap-4 rounded-b-2xl">
          <Link
            to="/vehicles"
            className="w-full sm:w-auto text-center px-6 py-1.5 rounded-xl font-bold bg-slate-50 text-slate-500 border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all text-sm uppercase tracking-wider"
          >
            Cancel
          </Link>
          <button
            type="submit" disabled={loading}
            className="w-full sm:w-auto justify-center bg-indigo-600 text-white px-10 py-1.5 rounded-xl font-bold text-sm hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2.5 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {loading ? "Registering..." : "Register Vehicle"}
          </button>
        </div>

      </div>
    </form>
  );
};
