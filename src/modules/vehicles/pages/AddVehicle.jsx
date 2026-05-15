import React, { useState } from 'react';
import {VehicleValidationSchema} from '../../../shared/utils/Validations/VehicleValidation';
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
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { FunctionsAPI } from '../../../shared/services/functions.api';
import { useToast } from '../../../shared/hooks/ToastContext';
import { useDrivers } from '../../drivers/hooks/driver.useDrivers';
import { useEffect, useRef } from 'react';

export const AddVehicle = () => {
  const { showToast } = useToast();
  const { drivers, fetchDrivers } = useDrivers();
  const dropdownRef = useRef(null);
  const [errors, setErrors] = useState({});
  const [driverSearch, setDriverSearch] = useState('');
  const [showDriverResults, setShowDriverResults] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDrivers({ searchQuery: driverSearch });
    }, 400);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driverSearch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDriverResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
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

    setErrors({});
    setLoading(true);
    try {
      const res = await FunctionsAPI.addVehicle({ type: "add", fields: formData });
      if (res.success) {
        showToast("Vehicle added successfully!", "success");
        setFormData({
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
        setDriverSearch('');
      } else {
        showToast(res.error || res.message, "error");
      }
    } catch (error) {
      showToast(error.message || "Error adding vehicle!", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-full mx-auto pb-12 px-2 animate-in fade-in duration-500">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
        <div className="space-y-4 mt-4">
          <div className="px-6 py-2 border-b border-slate-100 flex items-center gap-3 bg-slate-50/30">
            <div className="p-2 bg-primary-50 rounded-lg">
              <Car className="w-4 h-4 text-primary-600" />
            </div>
            <h3 className="font-bold text-slate-800 tracking-tight">Add New Vehicle</h3>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Vehicle ID</label>
                <div className="relative">
                  <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 font-semibold outline-none cursor-not-allowed text-sm" placeholder="Auto-gen" disabled />
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Vehicle Make <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Car className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    name="make"
                    value={formData.make}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-2.5 rounded-xl border ${errors.make ? 'border-red-500 bg-red-50/10' : 'border-slate-200 bg-white'} text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all text-sm`} 
                    placeholder="e.g. Toyota" 
                  />
                </div>
                {errors.make && <p className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.make}</p>}
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Vehicle Model <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Info className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-2.5 rounded-xl border ${errors.model ? 'border-red-500 bg-red-50/10' : 'border-slate-200 bg-white'} text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all text-sm`} 
                    placeholder="e.g. Prius" 
                  />
                </div>
                {errors.model && <p className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.model}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Colour <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-slate-300 bg-white"></div>
                  <input 
                    type="text" 
                    name="colour"
                    value={formData.colour}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-2.5 rounded-xl border ${errors.colour ? 'border-red-500 bg-red-50/10' : 'border-slate-200 bg-white'} text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all text-sm`} 
                    placeholder="Silver" 
                  />
                </div>
                {errors.colour && <p className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.colour}</p>}
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Vehicle Type
                  <span className='text-red-500'>*</span>
                </label>
                <select 
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all cursor-pointer text-sm"
                >
                  <option value="Sedan">Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="Hatchback">Hatchback</option>
                  <option value="MPV">MPV</option>
                  <option value="Van">Van</option>
                </select>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Seating Capacity <span className="text-red-500">*</span></label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    name="seatingCapacity"
                    value={formData.seatingCapacity}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-2.5 rounded-xl border ${errors.seatingCapacity ? 'border-red-500 bg-red-50/10' : 'border-slate-200 bg-white'} text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all text-sm`} 
                    placeholder="4+1" 
                  />
                </div>
                {errors.seatingCapacity && <p className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.seatingCapacity}</p>}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="px-6 py-2 border-b border-slate-100 flex items-center gap-3 bg-slate-50/30">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Shield className="w-4 h-4 text-indigo-600" />
            </div>
            <h3 className="font-bold text-slate-800 tracking-tight">Licensing & Registration</h3>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              <div className="md:col-span-2 space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Registration No <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    name="registrationNo"
                    value={formData.registrationNo}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-2.5 rounded-xl border ${errors.registrationNo ? 'border-red-500 bg-red-50/10' : 'border-slate-200 bg-white'} text-slate-800 font-bold uppercase focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all text-sm`} 
                    placeholder="REG-000" 
                  />
                </div>
                {errors.registrationNo && <p className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.registrationNo}</p>}
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">PH Vehicle Licence <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Award className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    name="phVehicleLicence"
                    value={formData.phVehicleLicence}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-2.5 rounded-xl border ${errors.phVehicleLicence ? 'border-red-500 bg-red-50/10' : 'border-slate-200 bg-white'} text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all text-sm`} 
                    placeholder="PH-LIC-000" 
                  />
                </div>
                {errors.phVehicleLicence && <p className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.phVehicleLicence}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Licence Expiry <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="date" 
                    name="licenceExpiry"
                    value={formData.licenceExpiry}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-2.5 rounded-xl border ${errors.licenceExpiry ? 'border-red-500 bg-red-50/10' : 'border-slate-200 bg-white'} text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all text-sm`} 
                  />
                </div>
                {errors.licenceExpiry && <p className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.licenceExpiry}</p>}
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="px-6 py-2 border-b border-slate-100 flex items-center gap-3 bg-slate-50/30">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="font-bold text-slate-800 tracking-tight">Insurance Coverage</h3>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              <div className="md:col-span-2 space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Provider Name <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    name="providerName"
                    value={formData.providerName}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-2.5 rounded-xl border ${errors.providerName ? 'border-red-500 bg-red-50/10' : 'border-slate-200 bg-white'} text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all text-sm`} 
                    placeholder="Provider Name" 
                  />
                </div>
                {errors.providerName && <p className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.providerName}</p>}
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Policy Number <span className="text-red-500">*</span></label>
                <div className="relative">
                  <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    name="policyNumber"
                    value={formData.policyNumber}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-2.5 rounded-xl border ${errors.policyNumber ? 'border-red-500 bg-red-50/10' : 'border-slate-200 bg-white'} text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all text-sm`} 
                    placeholder="POL-000" 
                  />
                </div>
                {errors.policyNumber && <p className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.policyNumber}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Insurance Expiry <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="date" 
                    name="insuranceExpiry"
                    value={formData.insuranceExpiry}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-2.5 rounded-xl border ${errors.insuranceExpiry ? 'border-red-500 bg-red-50/10' : 'border-slate-200 bg-white'} text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all text-sm`} 
                  />
                </div>
                {errors.insuranceExpiry && <p className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.insuranceExpiry}</p>}
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="px-6 py-2 border-b border-slate-100 flex items-center gap-3 bg-slate-50/30">
            <div className="p-2 bg-amber-50 rounded-lg">
              <Activity className="w-4 h-4 text-amber-600" />
            </div>
            <h3 className="font-bold text-slate-800 tracking-tight">Fleet Management</h3>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Assigned Driver <span className="text-red-500">*</span></label>
                <div className="relative" ref={dropdownRef}>
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text"
                    placeholder="Search driver..."
                    value={driverSearch}
                    onChange={(e) => {
                      setDriverSearch(e.target.value);
                      setShowDriverResults(true);
                      if (!e.target.value) {
                        setFormData(prev => ({ ...prev, assignedDriver: '', driverId: '' }));
                      }
                    }}
                    onFocus={() => setShowDriverResults(true)}
                    className={`w-full pl-11 pr-4 py-2.5 rounded-xl border ${errors.assignedDriver ? 'border-red-500 bg-red-50/10' : 'border-slate-200 bg-white'} text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all text-sm`}
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
                          className="w-full text-left px-4 py-2 hover:bg-primary-50 transition-colors flex flex-col gap-0.5 border-b border-slate-50 last:border-0"
                        >
                          <span className="font-bold text-slate-800 text-sm">{driver.name}</span>
                          <span className="text-[10px] text-slate-500 font-medium uppercase tracking-tight">{driver.mobile || 'No Mobile'}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {errors.assignedDriver && <p className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.assignedDriver}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Operational Status <span className="text-red-500">*</span></label>
                <select 
                  name="operationalStatus"
                  value={formData.operationalStatus}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 rounded-xl border ${errors.operationalStatus ? 'border-red-500 bg-red-50/10' : 'border-slate-200 bg-white'} text-primary-700 font-bold focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all cursor-pointer text-sm`}
                >
                  <option value="Active">Active</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Inactive">Inactive</option>
                </select>
                {errors.operationalStatus && <p className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.operationalStatus}</p>}
              </div>

              <div className="md:col-span-3 space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Additional Notes</label>
                <div className="relative">
                  <FileText className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <textarea 
                    rows="1" 
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all resize-none text-sm" 
                    placeholder="Notes..."
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 sm:gap-4">
          <Link to="/vehicles" className="w-full sm:w-auto text-center px-6 py-1.5 rounded-xl font-bold bg-slate-50 text-slate-500 border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all text-sm uppercase tracking-wider">
            Cancel
          </Link>
          <button type="submit" disabled={loading} className="w-full sm:w-auto justify-center bg-primary-600 text-white px-10 py-1.5 rounded-xl font-bold text-sm hover:bg-primary-700 active:scale-[0.98] transition-all shadow-lg shadow-primary-600/20 flex items-center gap-2.5 disabled:opacity-70 disabled:cursor-not-allowed">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {loading ? "Adding..." : "Add Vehicle"}
          </button>
        </div>
      </div>
    </form>
  );
};
