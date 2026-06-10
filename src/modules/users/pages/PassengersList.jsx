import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Phone, ArrowLeft, User } from 'lucide-react';
import { SectionHeader } from '../../../components/Shared';
import { Table } from '../../../shared/Table/Table';
import { usePassengers } from '../hooks/usePassengers';

export default function PassengersList() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { passengers, loading, fetchPassengers } = usePassengers(userId);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Table component expects these props even if not used actively
  const [activeFilter, setActiveFilter] = useState('');
  const handleClear = () => {
    setSearchQuery('');
    setActiveFilter('');
  };

  useEffect(() => {
    fetchPassengers();
  }, [fetchPassengers]);

  // Client-side search for passengers
  const filteredPassengers = passengers.filter(p => {
    if (!searchQuery) return true;
    const s = searchQuery.toLowerCase();
    return (
      (p.name && p.name.toLowerCase().includes(s)) ||
      (p.mobile && String(p.mobile).toLowerCase().includes(s))
    );
  });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-4">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Users
        </button>
      </div>
      
      <SectionHeader
        title="Passengers List"
        subtitle="View passengers associated with the selected user."
      />

      <div className="pb-10">
        <Table
          headers={['Sl No', 'Passenger Profile', 'Contact Details']}
          data={filteredPassengers}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          onClear={handleClear}
          searchPlaceholder="Search passengers..."
          renderRow={(passenger, idx) => (
            <>
              <td className="px-6 py-5 text-[13px] font-black text-slate-400/80">{(idx + 1).toString().padStart(2, '0')}</td>
              <td className="px-6 py-5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 font-bold border border-indigo-100">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[14px] font-black text-slate-800 leading-tight">{passenger.name || 'Unknown'}</span>
                  </div>
                </div>
              </td>
              <td className="px-6 py-5">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span className="text-[13px] font-bold text-slate-600">{passenger.mobile || 'N/A'}</span>
                </div>
              </td>
            </>
          )}
        />

        {passengers.length === 0 && !loading && (
          <div className="text-center py-10 text-slate-500 font-medium mt-4 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
            No passengers found for this user.
          </div>
        )}
      </div>
    </div>
  );
}
