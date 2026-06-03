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
import { Link, useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../shared/services/firebase';
import { FunctionsAPI } from '../../../shared/services/functions.api';
import { useToast } from '../../../shared/hooks/ToastContext';
import { useDrivers } from '../../drivers/hooks/driver.useDrivers';
import { VehicleValidationSchema } from '../../../shared/utils/Validations/VehicleValidation';

export const EditVehicle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { drivers, fetchDrivers } = useDrivers();
  const dropdownRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [errors, setErrors] = useState({});
  const [driverSearch, setDriverSearch] = useState('');
  const [showDriverResults, setShowDriverResults] = useState(false);
  const [formData, setFormData] = useState(null);

  // Fetch Vehicle Registry Data
  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const docId = String(id || '').replace('#', '');
        const docRef = doc(db, "vehicles", docId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          // Map backend field names if they differ from frontend form state
          setFormData({
            make: data.make || '',
            model: data.model || '',
            colour: data.colour || '',
            type: data.type || 'Sedan',
            seatingCapacity: data.seatingCapacity || '',
            registrationNo: data.registrationNo || '',
            phVehicleLicence: data.phVehicleLicence || '',
            licenceExpiry: data.licenceExpiry || '',
            providerName: data.providerName || '',
            policyNumber: data.policyNumber || '',
            insuranceExpiry: data.insuranceExpiry || '',
            assignedDriver: data.assignedDriver || '',
            driverId: data.driverId || '',
            operationalStatus: data.operationalStatus || 'Active',
            notes: data.notes || ''
          });
          setDriverSearch(data.assignedDriver || '');
        } else {
          showToast("Asset not found in registry", "error");
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

  // Driver Search Logic
  useEffect(() => {
    const timer = setTimeout(() => {
      if (driverSearch.length > 0 && driverSearch !== formData?.assignedDriver) {
        fetchDrivers({ searchQuery: driverSearch });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [driverSearch, fetchDrivers, formData?.assignedDriver]);

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

    setUpdating(true);
    try {
      const docId = String(id || '').replace('#', '');
      const res = await FunctionsAPI.addVehicle({ 
        type: "edit", 
        id: docId,
        fields: {
          ...formData,
          searchKey: `${formData.make} ${formData.model} ${formData.registrationNo}`.toLowerCase()
        } 
      });

      if (res.success) {
        showToast("Asset updated successfully!", "success");
        navigate('/vehicles');
      } else {
        showToast(res.error || "Failed to update asset registry", "error");
      }
    } catch (error) {
      showToast(error.message || "An unexpected error occurred", "error");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Synchronizing Registry...</p>
      </div>
    );
  }

  const inputCls = (field) =>
    `w-full pl-11 pr-4 py-2.5 rounded-xl border ${errors[field] ? 'border-red-500 bg-red-50/10' : 'border-slate-200 bg-white'} text-slate-800 font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-sm`;

  return (
    <form onSubmit={handleSubmit} noValidate className="max-w-full mx-auto pb-12 px-2 animate-in fade-in duration-500">
      
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-6 px-2">
        <div className="flex items-center gap-4">
          <Link to="/vehicles" className="p-2 hover:bg-slate-100 rounded-xl transition-colors group">
            <ChevronLeft className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
          </Link>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Edit Asset Registry</h2>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Asset ID: {id}</p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              
              <div className="md:col-span-2 space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Make <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Car className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" name="make" value={formData.make} onChange={handleChange} className={inputCls('make')} />
                </div>
                {errors.make && <p className="text-xs text-red-500 mt-1">{errors.make}</p>}
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Model <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Info className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" name="model" value={formData.model} onChange={handleChange} className={inputCls('model')} />
                </div>
                {errors.model && <p className="text-xs text-red-500 mt-1">{errors.model}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Colour <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Activity className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" name="colour" value={formData.colour} onChange={handleChange} className={inputCls('colour')} />
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Category <span className="text-red-500">*</span></label>
                <select name="type" value={formData.type} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium outline-none">
                  <option value="Sedan">Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="Hatchback">Hatchback</option>
                  <option value="MPV">MPV</option>
                  <option value="Van">Van</option>
                </select>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Seating <span className="text-red-500">*</span></label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" name="seatingCapacity" value={formData.seatingCapacity} onChange={handleChange} className={inputCls('seatingCapacity')} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Status <span className="text-red-500">*</span></label>
                <select name="operationalStatus" value={formData.operationalStatus} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-indigo-700 font-bold text-sm outline-none">
                  <option value="Active">🟢 Active</option>
                  <option value="Maintenance">🟡 Maintenance</option>
                  <option value="Inactive">⚪ Inactive</option>
                </select>
              </div>

            </div>
          </div>
        </div>

        {/* ── Section 2: Licensing ── */}
        <div className="mt-6">
          <div className="px-6 py-2 border-b border-slate-100 flex items-center gap-3 bg-slate-50/30">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="font-bold text-slate-800 tracking-tight">Licensing & Registration</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              <div className="md:col-span-2 space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Registration No <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" name="registrationNo" value={formData.registrationNo} onChange={handleChange} className={inputCls('registrationNo') + ' uppercase font-black'} />
                </div>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">PH Licence <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Award className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" name="phVehicleLicence" value={formData.phVehicleLicence} onChange={handleChange} className={inputCls('phVehicleLicence')} />
                </div>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">Licence Expiry <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="date" name="licenceExpiry" value={formData.licenceExpiry} onChange={handleChange} className={inputCls('licenceExpiry')} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Section 3: Insurance ── */}
        <div className="mt-6">
          <div className="px-6 py-2 border-b border-slate-100 flex items-center gap-3 bg-slate-50/30">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Shield className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="font-bold text-slate-800 tracking-tight">Insurance Coverage</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              <div className="md:col-span-2 space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Provider <span className="text-red-500">*</span></label>
                <input type="text" name="providerName" value={formData.providerName} onChange={handleChange} className={inputCls('providerName')} />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Policy No <span className="text-red-500">*</span></label>
                <input type="text" name="policyNumber" value={formData.policyNumber} onChange={handleChange} className={inputCls('policyNumber')} />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider block">Insurance Expiry <span className="text-red-500">*</span></label>
                <input type="date" name="insuranceExpiry" value={formData.insuranceExpiry} onChange={handleChange} className={inputCls('insuranceExpiry')} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Section 4: Assignment & Notes ── */}
        <div className="mt-6">
          <div className="px-6 py-2 border-b border-slate-100 flex items-center gap-3 bg-slate-50/30">
            <div className="p-2 bg-amber-50 rounded-lg">
              <Activity className="w-4 h-4 text-amber-600" />
            </div>
            <h3 className="font-bold text-slate-800 tracking-tight">Assignment & Notes</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
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
              <div className="md:col-span-4 space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Internal Remarks</label>
                <textarea rows="1" name="notes" value={formData.notes} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none resize-none" placeholder="Notes..." />
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer Actions ── */}
        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 sm:gap-4 rounded-b-2xl">
          <Link to="/vehicles" className="w-full sm:w-auto text-center px-6 py-1.5 rounded-xl font-bold bg-slate-50 text-slate-500 border border-slate-200 hover:bg-rose-50 hover:text-rose-600 transition-all text-sm uppercase tracking-wider">Cancel</Link>
          <button type="submit" disabled={updating} className="w-full sm:w-auto justify-center bg-indigo-600 text-white px-10 py-1.5 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2.5">
            {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {updating ? "Saving..." : "Save Changes"}
          </button>
        </div>

      </div>
    </form>
  );
};
