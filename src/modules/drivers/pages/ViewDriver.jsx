import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Award,
  Briefcase,
  Edit,
  Phone,
  Activity,
  MapPin,
  Calendar,
  Car,
  ShieldCheck,
  Search,
  Mail,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  Shield,
  Stethoscope,
  GraduationCap,
  Bell,
  UserCheck,
  ChevronLeft,
  Loader2
} from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../shared/services/firebase';
import { useToast } from '../../../shared/hooks/ToastContext';

export default function ViewDriver() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDriver = async () => {
      try {
        const docId = String(id || '').replace('#', '').trim();
        const docRef = doc(db, "drivers", docId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setDriver({ id: docSnap.id, ...docSnap.data() });
        } else {
          showToast("Dossier not found in registry", "error");
          navigate('/drivers');
        }
      } catch (error) {
        showToast("Access Denied: Unable to retrieve driver dossier", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchDriver();
  }, [id, navigate, showToast]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        <p className="text-slate-500 font-bold text-xs uppercase tracking-widest text-center">Synchronizing Records...</p>
      </div>
    );
  }

  if (!driver) return null;

  const sections = [
    {
      title: 'Licensing & Operative Compliance',
      icon: Shield,
      fields: [
        { label: 'PH License', value: driver.phLicenseNumber, icon: Award },
        { label: 'PH Expiry', value: driver.phExpiryDate, icon: Calendar, isDate: true },
        { label: 'DVLA License', value: driver.dvlaLicenseNumber, icon: ShieldCheck },
        { label: 'DVLA Expiry', value: driver.dvlaExpiryDate, icon: Calendar, isDate: true },
        { label: 'DBS Cert No', value: driver.dbsCertificateNumber, icon: FileText },
        { label: 'DBS Issue Date', value: driver.dbsDateOfIssue, icon: Calendar, isDate: true },
        { label: 'Medical Exemption', value: driver.medicalExemption, icon: Stethoscope, isBadge: true },
        { label: 'Training Status', value: driver.trainingStatus, icon: CheckCircle2, isBadge: true },
        { label: 'Training Date', value: driver.trainingSignedDate, icon: Calendar, isDate: true },
        { label: 'Council Notified', value: driver.councilNotified, icon: Bell, isBadge: true },
      ]
    },
    {
      title: 'Employment Lifecycle & Onboarding',
      icon: Briefcase,
      fields: [
        { label: 'Service Start', value: driver.serviceStartDate, icon: Calendar, isDate: true },
        { label: 'Contract End', value: driver.contractEndDate, icon: Calendar, isDate: true },
        { label: 'RTW Verified', value: driver.rtwVerifiedDate, icon: Clock, isDate: true },
        { label: 'RTW Note', value: driver.rtwNote, icon: UserCheck },
        { label: 'Termination Reason', value: driver.terminationReason || 'N/A', icon: AlertCircle },
      ]
    }
  ];

  return (
    <div className="w-full max-w-full mx-auto pb-10 px-2 animate-in fade-in duration-300">
      {/* Header Bar */}
      <header className="flex items-center justify-between mb-4 bg-white p-4 border border-slate-200 rounded-xl shadow-sm">
        <div className="flex items-center gap-5">
          <Link to="/drivers" className="p-2.5 bg-slate-50 text-slate-500 hover:text-slate-600 rounded-lg transition-all">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="w-14 h-14 bg-indigo-600 text-white flex items-center justify-center font-black text-2xl rounded-xl shadow-lg shadow-indigo-100">
            {driver.name?.charAt(0) || 'D'}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">{driver.name}</h1>
              <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest border rounded-full ${driver.status?.toLowerCase() === 'active'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm'
                  : 'bg-amber-50 text-amber-700 border-amber-100 shadow-sm'
                }`}>
                {driver.status}
              </span>
            </div>
            <div className="flex items-center gap-6 text-[11px] font-black text-slate-500 mt-1.5 uppercase tracking-tight">
              <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-indigo-500" /> {driver.mobile}</span>
              <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-indigo-500" /> {driver.email}</span>
              <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-indigo-500" /> {driver.address}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to={`/drivers/edit/${driver.id}`}
            className="px-8 py-3 bg-slate-900 text-white font-black text-[11px] uppercase tracking-widest flex items-center gap-2 rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
          >
            <Edit className="w-4 h-4" /> Update Dossier
          </Link>
        </div>
      </header>

      <main className="bg-white border border-slate-200 rounded-2xl shadow-sm divide-y divide-slate-100 overflow-hidden">
        <div className="p-8 space-y-12">
          {sections.map((section, sIdx) => (
            <section key={sIdx}>
              <div className="flex items-center gap-2 mb-6 border-b border-slate-50 pb-3">
                <section.icon className="w-4 h-4 text-indigo-600" />
                <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{section.title}</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-10 gap-y-8">
                {section.fields.map((field, fIdx) => (
                  <div key={fIdx} className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      {field.label}
                    </span>
                    <div className="flex items-center gap-2">
                      {field.isBadge ? (
                        <span className={`text-[12px] font-black uppercase tracking-widest ${field.value?.toLowerCase() === 'yes' || field.value?.toLowerCase() === 'active' || field.value?.toLowerCase() === 'inducted'
                            ? 'text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded'
                            : 'text-rose-600 bg-rose-50 px-2 py-0.5 rounded'
                          }`}>
                          {field.value || 'N/A'}
                        </span>
                      ) : (
                        <span className={`text-[14px] font-bold text-slate-700 leading-tight ${field.isDate ? 'font-black text-slate-500' : ''}`}>
                          {field.value || '---'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}

          {/* Notes Section */}
          <section className="pt-2">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-50 pb-3">
              <Activity className="w-4 h-4 text-indigo-600" />
              <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Confidential Records</h3>
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
              <p className="text-[13px] font-medium text-slate-500 leading-relaxed italic">
                {driver.confidentialNotes || "Secure digital record initialized. No additional operational annotations recorded for this deployment cycle."}
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}



