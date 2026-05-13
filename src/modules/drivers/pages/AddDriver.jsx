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
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { FunctionsAPI } from '../../../shared/services/functions.api';
import { useToast } from '../../../shared/hooks/ToastContext';

export const AddDriver = () => {
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
    
    const { error } = DriverValidationSchema.validate(formData, { abortEarly: false });
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
      const res = await FunctionsAPI.addDriver({
        type: "add", 
        fields: {
          ...formData,
          searchKey: formData.name ? formData.name.toLowerCase() : ""
        }
      });
      if (res.status === "success") {
        showToast("Driver added successfully!", "success");
        setFormData({
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
      } else {
        showToast(res.message, "error");
      }
    } catch (error) {
      showToast(error.message || "Error adding driver!", "error");
    } finally {
      setLoading(false);
    }
  };
  return (
    <form noValidate onSubmit={handleSubmit} className="max-w-full mx-auto pb-12 px-2 animate-in fade-in duration-500">
      

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
        <div className="space-y-4 mt-4">
          <div className="px-6 py-2 border-b border-slate-100 flex items-center gap-3 bg-slate-50/30">
            <div className="p-2 bg-primary-50 rounded-lg">
              <User className="w-4 h-4 text-primary-600" />
            </div>
            <h3 className="font-bold text-slate-800 tracking-tight">Add Driver</h3>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              <div className="md:col-span-2 space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Full Name <span className="text-red-500 text-sm">*</span></label>
                <div className="relative">
                  <UserCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-2.5 rounded-xl border ${errors.name ? 'border-red-500 bg-red-50/10' : 'border-slate-200 bg-white'} text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all`} 
                    placeholder="Full name" 
                  />
                </div>
                {errors.name && <p className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.name}</p>}
              </div>


              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Account Status <span className="text-red-500 text-sm">*</span></label>
                <select 
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={`w-full px-4 py-1.5 rounded-xl border ${errors.status ? 'border-red-500 bg-red-50/10' : 'border-slate-200 bg-white'} text-primary-700 font-bold focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all cursor-pointer`}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="on_leave">On Leave</option>
                  <option value="suspended">Suspended</option>
                </select>
                {errors.status && <p className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.status}</p>}
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Mobile Number <span className="text-red-500 text-sm">*</span></label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="tel" 
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-2.5 rounded-xl border ${errors.mobile ? 'border-red-500 bg-red-50/10' : 'border-slate-200 bg-white'} text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all`} 
                    placeholder="Enter Mobile Number" 
                  />
                </div>
                {errors.mobile && <p className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.mobile}</p>}
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Email Address <span className="text-red-500 text-sm">*</span></label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-2.5 rounded-xl border ${errors.email ? 'border-red-500 bg-red-50/10' : 'border-slate-200 bg-white'} text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all`} 
                    placeholder="Enter Email Address" 
                  />
                </div>
                {errors.email && <p className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.email}</p>}
              </div>

              <div className="md:col-span-3 space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Residential Address <span className="text-red-500 text-sm">*</span></label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-2.5 rounded-xl border ${errors.address ? 'border-red-500 bg-red-50/10' : 'border-slate-200 bg-white'} text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all`} 
                    placeholder="Enter Address" 
                  />
                </div>
                {errors.address && <p className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.address}</p>}
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/30">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Shield className="w-4 h-4 text-indigo-600" />
            </div>
            <h3 className="font-bold text-slate-800 tracking-tight">Licensing Jurisdictions</h3>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              <div className="md:col-span-2 space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">PH License Number <span className="text-red-500 text-sm">*</span></label>
                <div className="relative">
                  <Award className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    name="phLicenseNumber"
                    value={formData.phLicenseNumber}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-2.5 rounded-xl border ${errors.phLicenseNumber ? 'border-red-500 bg-red-50/10' : 'border-slate-200 bg-white'} text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all`} 
                    placeholder="Enter PH License Number" 
                  />
                </div>
                {errors.phLicenseNumber && <p className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.phLicenseNumber}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">PH Expiry Date <span className="text-red-500 text-sm">*</span></label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="date" 
                    name="phExpiryDate"
                    value={formData.phExpiryDate}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-2.5 rounded-xl border ${errors.phExpiryDate ? 'border-red-500 bg-red-50/10' : 'border-slate-200 bg-white'} text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all`} 
                  />
                </div>
                {errors.phExpiryDate && <p className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.phExpiryDate}</p>}
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">DVLA License Number <span className="text-red-500 text-sm">*</span></label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    name="dvlaLicenseNumber"
                    value={formData.dvlaLicenseNumber}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-2.5 rounded-xl border ${errors.dvlaLicenseNumber ? 'border-red-500 bg-red-50/10' : 'border-slate-200 bg-white'} text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all`} 
                    placeholder="Enter DVLA License Number" 
                  />
                </div>
                {errors.dvlaLicenseNumber && <p className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.dvlaLicenseNumber}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">DVLA Expiry Date <span className="text-red-500 text-sm">*</span></label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="date" 
                    name="dvlaExpiryDate"
                    value={formData.dvlaExpiryDate}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-2.5 rounded-xl border ${errors.dvlaExpiryDate ? 'border-red-500 bg-red-50/10' : 'border-slate-200 bg-white'} text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all`} 
                  />
                </div>
                {errors.dvlaExpiryDate && <p className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.dvlaExpiryDate}</p>}
              </div>

              <div className="md:col-span-3 space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">DBS Certificate Number <span className="text-red-500 text-sm">*</span></label>
                <div className="relative">
                  <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    name="dbsCertificateNumber"
                    value={formData.dbsCertificateNumber}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-2.5 rounded-xl border ${errors.dbsCertificateNumber ? 'border-red-500 bg-red-50/10' : 'border-slate-200 bg-white'} text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all`} 
                    placeholder="Enter DBS Certificate Number" 
                  />
                </div>
                {errors.dbsCertificateNumber && <p className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.dbsCertificateNumber}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">DBS Date of Issue <span className="text-red-500 text-sm">*</span></label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="date" 
                    name="dbsDateOfIssue"
                    value={formData.dbsDateOfIssue}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-2.5 rounded-xl border ${errors.dbsDateOfIssue ? 'border-red-500 bg-red-50/10' : 'border-slate-200 bg-white'} text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all`} 
                  />
                </div>
                {errors.dbsDateOfIssue && <p className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.dbsDateOfIssue}</p>}
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="px-6 py-2 border-b border-slate-100 flex items-center gap-3 bg-slate-50/30">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <GraduationCap className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="font-bold text-slate-800 tracking-tight">Operative Compliance</h3>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Medical Exemption <span className="text-red-500 text-sm">*</span></label>
                <div className="relative">
                  <Stethoscope className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select 
                    name="medicalExemption"
                    value={formData.medicalExemption}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-2.5 rounded-xl border ${errors.medicalExemption ? 'border-red-500 bg-red-50/10' : 'border-slate-200 bg-white'} text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all cursor-pointer appearance-none`}
                  >
                    <option value="No">No Exemption</option>
                    <option value="Yes">Exemption Active</option>
                  </select>
                </div>
                {errors.medicalExemption && <p className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.medicalExemption}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Training Status <span className="text-red-500 text-sm">*</span></label>
                <div className="relative">
                  <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select 
                    name="trainingStatus"
                    value={formData.trainingStatus}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-2.5 rounded-xl border ${errors.trainingStatus ? 'border-red-500 bg-red-50/10' : 'border-slate-200 bg-white'} text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all cursor-pointer appearance-none`}
                  >
                    <option value="No">Pending</option>
                    <option value="Yes">Completed</option>
                  </select>
                </div>
                {errors.trainingStatus && <p className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.trainingStatus}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Training Signed Date <span className="text-red-500 text-sm">*</span></label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="date" 
                    name="trainingSignedDate"
                    value={formData.trainingSignedDate}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-2.5 rounded-xl border ${errors.trainingSignedDate ? 'border-red-500 bg-red-50/10' : 'border-slate-200 bg-white'} text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all`} 
                  />
                </div>
                {errors.trainingSignedDate && <p className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.trainingSignedDate}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Council Notified <span className="text-red-500 text-sm">*</span></label>
                <div className="relative">
                  <Bell className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select 
                    name="councilNotified"
                    value={formData.councilNotified}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-2.5 rounded-xl border ${errors.councilNotified ? 'border-red-500 bg-red-50/10' : 'border-slate-200 bg-white'} text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all cursor-pointer appearance-none`}
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                {errors.councilNotified && <p className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.councilNotified}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Right to Work Verified Date <span className="text-red-500 text-sm">*</span></label>
                <div className="relative">
                  <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="date" 
                    name="rtwVerifiedDate"
                    value={formData.rtwVerifiedDate}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-2.5 rounded-xl border ${errors.rtwVerifiedDate ? 'border-red-500 bg-red-50/10' : 'border-slate-200 bg-white'} text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all`} 
                  />
                </div>
                {errors.rtwVerifiedDate && <p className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.rtwVerifiedDate}</p>}
              </div>

              <div className="md:col-span-5 space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Right to Work Note</label>
                <div className="relative">
                  <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    name="rtwNote"
                    value={formData.rtwNote}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" 
                    placeholder="Enter Right to Work Note" 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="px-6 py-2 border-b border-slate-100 flex items-center gap-3 bg-slate-50/30">
            <div className="p-2 bg-amber-50 rounded-lg">
              <Briefcase className="w-4 h-4 text-amber-600" />
            </div>
            <h3 className="font-bold text-slate-800 tracking-tight">Lifecycle Management</h3>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Service Start Date <span className="text-red-500 text-sm">*</span></label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="date" 
                    name="serviceStartDate"
                    value={formData.serviceStartDate}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-2.5 rounded-xl border ${errors.serviceStartDate ? 'border-red-500 bg-red-50/10' : 'border-slate-200 bg-white'} text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all`} 
                  />
                </div>
                {errors.serviceStartDate && <p className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.serviceStartDate}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Contract End Date <span className="text-red-500 text-sm">*</span></label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="date" 
                    name="contractEndDate"
                    value={formData.contractEndDate}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-2.5 rounded-xl border ${errors.contractEndDate ? 'border-red-500 bg-red-50/10' : 'border-slate-200 bg-white'} text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all`} 
                  />
                </div>
                {errors.contractEndDate && <p className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.contractEndDate}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Termination Reason</label>
                <div className="relative">
                  <AlertCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    name="terminationReason"
                    value={formData.terminationReason}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" 
                    placeholder="Enter Termination Reason" 
                  />
                </div>
              </div>

              <div className="md:col-span-5 space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Confidential Notes</label>
                <div className="relative">
                  <Activity className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <textarea 
                    rows="3" 
                    name="confidentialNotes"
                    value={formData.confidentialNotes}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all resize-none" 
                    placeholder="Enter Confidential Notes"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 sm:gap-4">
          <Link to="/drivers" className="w-full sm:w-auto text-center px-6 py-1.5 rounded-xl font-bold bg-slate-50 text-slate-500 border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all text-sm uppercase tracking-wider">
            Cancel
          </Link>
          <button type="submit" disabled={loading} className="w-full sm:w-auto justify-center bg-primary-600 text-white px-10 py-1.5 rounded-xl font-bold text-sm hover:bg-primary-700 active:scale-[0.98] transition-all shadow-lg shadow-primary-600/20 flex items-center gap-2.5 disabled:opacity-70 disabled:cursor-not-allowed">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {loading ? "Adding..." : "Add Driver"}
          </button>
        </div>
      </div>
    </form>
  );
};
