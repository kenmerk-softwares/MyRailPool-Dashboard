import { DriverValidationSchema } from '../../../shared/utils/Validations/DriverValidation';
import React, { useState } from 'react';
import {
  Save,
  User,
  Phone,
  Mail,
  MapPin,
  Award,
  Calendar,
  Shield,
  ShieldCheck,
  FileText,
  Stethoscope,
  GraduationCap,
  Bell,
  Activity,
  UserCheck,
  Briefcase,
  AlertCircle,
  Clock,
  Loader2,
  ChevronLeft
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { FunctionsAPI } from '../../../shared/services/functions.api';
import { useToast } from '../../../shared/hooks/ToastContext';

export const AddDriver = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    status: 'active',
    mobile: '',
    email: '',
    address: '',
    phLicenseNumber: '',
    phExpiryDate: '',
    dvlaLicenseNumber: '',
    dvlaExpiryDate: '',
    dbsCertificateNumber: '',
    dbsDateOfIssue: '',
    medicalExemption: 'No',
    trainingStatus: 'No',
    trainingSignedDate: '',
    councilNotified: 'Yes',
    rtwVerifiedDate: '',
    rtwNote: '',
    serviceStartDate: '',
    contractEndDate: '',
    terminationReason: '',
    confidentialNotes: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const { error } = DriverValidationSchema.validate(formData, { abortEarly: false });
    if (error) {
      const newErrors = {};
      error.details.forEach(err => { newErrors[err.path[0]] = err.message; });
      setErrors(newErrors);
      showToast("Verification failed. Please review mandatory fields.", "error");
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      const res = await FunctionsAPI.addDriver({
        type: "add", 
        fields: {
          ...formData,
          searchKey: formData.name ? formData.name.toLowerCase() : ""
        }
      });
      
      if (res.success) {
        showToast("Driver profile created successfully!", "success");
        navigate('/drivers');
      } else {
        showToast(res.error || "Failed to create driver profile", "error");
      }
    } catch (error) {
      showToast(error.message || "An unexpected error occurred", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-12 px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <Link to="/drivers" className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-slate-600 rounded-xl transition-all hover:shadow-md">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Onboard New Driver</h2>
            <p className="text-slate-500 font-medium mt-1">Register a new driver and initialize their compliance dossier.</p>
          </div>
        </div>
      </div>

      <form noValidate onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Identity & Contact */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
              <div className="px-8 py-5 border-b border-slate-100 flex items-center gap-3 bg-slate-50/30">
                <div className="p-2 bg-indigo-50 rounded-xl">
                  <User className="w-4 h-4 text-indigo-600" />
                </div>
                <h3 className="font-black text-slate-800 tracking-tight uppercase text-xs">Identity & Contact Profile</h3>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block">Full Legal Name</label>
                    <div className="relative group">
                      <UserCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                      <input 
                        type="text" name="name" value={formData.name} onChange={handleChange}
                        className={`w-full pl-11 pr-4 py-3.5 rounded-2xl border ${errors.name ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200 bg-white'} text-slate-800 font-bold focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all placeholder:text-slate-300`} 
                        placeholder="e.g. Alexander Hamilton" 
                      />
                    </div>
                    {errors.name && <p className="text-[10px] font-bold text-rose-500 mt-1.5 flex items-center gap-1.5 px-1"><AlertCircle className="w-3 h-3" /> {errors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block">Primary Mobile</label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                      <input 
                        type="tel" name="mobile" value={formData.mobile} onChange={handleChange}
                        className={`w-full pl-11 pr-4 py-3.5 rounded-2xl border ${errors.mobile ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200 bg-white'} text-slate-800 font-bold focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all placeholder:text-slate-300`} 
                        placeholder="+44 7000 000000" 
                      />
                    </div>
                    {errors.mobile && <p className="text-[10px] font-bold text-rose-500 mt-1.5 flex items-center gap-1.5 px-1"><AlertCircle className="w-3 h-3" /> {errors.mobile}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block">Email Address</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                      <input 
                        type="email" name="email" value={formData.email} onChange={handleChange}
                        className={`w-full pl-11 pr-4 py-3.5 rounded-2xl border ${errors.email ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200 bg-white'} text-slate-800 font-bold focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all placeholder:text-slate-300`} 
                        placeholder="driver@myrailpool.com" 
                      />
                    </div>
                    {errors.email && <p className="text-[10px] font-bold text-rose-500 mt-1.5 flex items-center gap-1.5 px-1"><AlertCircle className="w-3 h-3" /> {errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block">Account Status</label>
                    <select 
                      name="status" value={formData.status} onChange={handleChange}
                      className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 bg-white text-indigo-700 font-black focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all cursor-pointer appearance-none shadow-sm"
                    >
                      <option value="active">🟢 Active Deployment</option>
                      <option value="inactive">⚪ Inactive Profile</option>
                      <option value="on_leave">🟡 Seasonal Leave</option>
                      <option value="suspended">🔴 Suspended Duty</option>
                    </select>
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block">Residential Address</label>
                    <div className="relative group">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                      <input 
                        type="text" name="address" value={formData.address} onChange={handleChange}
                        className={`w-full pl-11 pr-4 py-3.5 rounded-2xl border ${errors.address ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200 bg-white'} text-slate-800 font-bold focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all placeholder:text-slate-300`} 
                        placeholder="Street, City, Postcode" 
                      />
                    </div>
                    {errors.address && <p className="text-[10px] font-bold text-rose-500 mt-1.5 flex items-center gap-1.5 px-1"><AlertCircle className="w-3 h-3" /> {errors.address}</p>}
                  </div>
                </div>
              </div>
              {errors.address && <p className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.address}</p>}
            </div>

            {/* Compliance Documentation */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
              <div className="px-8 py-5 border-b border-slate-100 flex items-center gap-3 bg-slate-50/30">
                <div className="p-2 bg-emerald-50 rounded-xl">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </div>
                <h3 className="font-black text-slate-800 tracking-tight uppercase text-xs">Licensing & Regulatory Compliance</h3>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  {/* PH License */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block">PH License Number</label>
                      <div className="relative group">
                        <Award className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                        <input 
                          type="text" name="phLicenseNumber" value={formData.phLicenseNumber} onChange={handleChange}
                          className={`w-full pl-11 pr-4 py-3.5 rounded-2xl border ${errors.phLicenseNumber ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200 bg-white'} text-slate-800 font-bold focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all`} 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block text-emerald-600">PH Expiry Date</label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          type="date" name="phExpiryDate" value={formData.phExpiryDate} onChange={handleChange}
                          className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-white text-slate-800 font-bold focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* DVLA License */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block">DVLA License Number</label>
                      <div className="relative group">
                        <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                        <input 
                          type="text" name="dvlaLicenseNumber" value={formData.dvlaLicenseNumber} onChange={handleChange}
                          className={`w-full pl-11 pr-4 py-3.5 rounded-2xl border ${errors.dvlaLicenseNumber ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200 bg-white'} text-slate-800 font-bold focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all`} 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block text-emerald-600">DVLA Expiry Date</label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          type="date" name="dvlaExpiryDate" value={formData.dvlaExpiryDate} onChange={handleChange}
                          className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-white text-slate-800 font-bold focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2 border-t border-slate-100 pt-6 mt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block">DBS Certificate Number</label>
                        <div className="relative group">
                          <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                          <input 
                            type="text" name="dbsCertificateNumber" value={formData.dbsCertificateNumber} onChange={handleChange}
                            className={`w-full pl-11 pr-4 py-3.5 rounded-2xl border ${errors.dbsCertificateNumber ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200 bg-white'} text-slate-800 font-bold focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all`} 
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block text-emerald-600">DBS Date of Issue</label>
                        <div className="relative">
                          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input 
                            type="date" name="dbsDateOfIssue" value={formData.dbsDateOfIssue} onChange={handleChange}
                            className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-white text-slate-800 font-bold focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all" 
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Section */}
          <div className="space-y-6">
            {/* Operational Metrics */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
              <div className="px-8 py-5 border-b border-slate-100 flex items-center gap-3 bg-slate-50/30">
                <div className="p-2 bg-amber-50 rounded-xl">
                  <Activity className="w-4 h-4 text-amber-600" />
                </div>
                <h3 className="font-black text-slate-800 tracking-tight uppercase text-xs">Deployment Metrics</h3>
              </div>
              <div className="p-8 space-y-5">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block text-amber-600">Service Start Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="date" name="serviceStartDate" value={formData.serviceStartDate} onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-white text-slate-800 font-bold focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 outline-none transition-all" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block">Contract End Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="date" name="contractEndDate" value={formData.contractEndDate} onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-white text-slate-800 font-bold focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 outline-none transition-all" 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Compliance Checklist */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
              <div className="px-8 py-5 border-b border-slate-100 flex items-center gap-3 bg-slate-50/30">
                <div className="p-2 bg-rose-50 rounded-xl">
                  <GraduationCap className="w-4 h-4 text-rose-600" />
                </div>
                <h3 className="font-black text-slate-800 tracking-tight uppercase text-xs">Safety Checklist</h3>
              </div>
              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[12px] font-black text-slate-700">Medical Exemption</p>
                    <p className="text-[10px] font-bold text-slate-400">Validated by authorities</p>
                  </div>
                  <select name="medicalExemption" value={formData.medicalExemption} onChange={handleChange} className="bg-slate-50 border-none rounded-lg text-[11px] font-black text-slate-600 py-1.5 pl-3 pr-8 cursor-pointer">
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[12px] font-black text-slate-700">Training Status</p>
                    <p className="text-[10px] font-bold text-slate-400">Safety & Protocol induction</p>
                  </div>
                  <select name="trainingStatus" value={formData.trainingStatus} onChange={handleChange} className="bg-slate-50 border-none rounded-lg text-[11px] font-black text-slate-600 py-1.5 pl-3 pr-8 cursor-pointer">
                    <option value="No">Pending</option>
                    <option value="Yes">Inducted</option>
                  </select>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[12px] font-black text-slate-700">Council Notified</p>
                    <p className="text-[10px] font-bold text-slate-400">Formal registration sent</p>
                  </div>
                  <select name="councilNotified" value={formData.councilNotified} onChange={handleChange} className="bg-slate-50 border-none rounded-lg text-[11px] font-black text-slate-600 py-1.5 pl-3 pr-8 cursor-pointer">
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-4 pt-6 border-t border-slate-100">
          <Link to="/drivers" className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all text-center">
            Discard Profile
          </Link>
          <button 
            type="submit" disabled={loading} 
            className="w-full sm:w-auto px-12 py-3.5 bg-indigo-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-3 disabled:opacity-70"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {loading ? "Initializing..." : "Finalize Profile"}
          </button>
        </div>
      </form>
    </div>
  );
};

