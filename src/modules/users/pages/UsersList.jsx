import React, { useEffect, useState } from 'react';
import { Users, Phone, Mail, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SectionHeader, StatusBadge } from '../../../components/Shared';
import { Table } from '../../../shared/Table/Table';
import { useUsers } from '../hooks/user.userList';

export default function UsersList() {
  const navigate = useNavigate();
  const { users, loading, hasMore, fetchUsers } = useUsers();
  const [activeFilter, setActiveFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleClear = () => {
    setActiveFilter('');
    setSearchQuery('');
  };

  useEffect(() => {
    fetchUsers({ searchQuery, activeFilter });
  }, [searchQuery, activeFilter, fetchUsers]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <SectionHeader
        title="Users Management"
        subtitle="Manage your platform users and their passengers."
      />

      <div className="pb-10">
        <Table
          headers={['Sl No', 'User Profile', 'Contact', 'Status', 'Joined Date']}
          data={users}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          onClear={handleClear}
          searchPlaceholder="Search by name, email, or mobile..."
          filterOptions={[
            { label: 'Active', value: 'Active' },
            { label: 'Inactive', value: 'Inactive' },
          ]}
          renderRow={(user, idx) => {
            let joinDate = "N/A";
            if (user.createdAt) {
              joinDate = new Date(user.createdAt).toLocaleDateString();
            }

            return (
              <>
                <td className="px-6 py-5 text-[13px] font-black text-slate-500/80">{(idx + 1).toString().padStart(2, '0')}</td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold border border-slate-200">
                      {user.name?.charAt(0) || 'U'}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[14px] font-black text-slate-800 leading-tight">{user.name || 'Unknown'}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-indigo-500" />
                      <span className="text-[12px] font-bold text-slate-600">{user.mobile || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-[12px] font-bold text-slate-600">{user.email || 'N/A'}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <StatusBadge
                    status={user?.status || 'Active'}
                    statusColor={
                      user?.status?.toLowerCase() === 'active' ? 'success' : 'warning'
                    }
                  />
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-300" />
                    <span className="text-[13px] font-black text-slate-500">{new Date(user.createdAt.seconds * 1000).toLocaleDateString()}</span>
                  </div>
                </td>
              </>
            )
          }}
          actions={(user) => (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => navigate(`/passenger-list/${user.id}`)}
                className="p-2.5 bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-100 hover:bg-indigo-50/30 rounded-xl transition-all duration-300 hover:shadow-md active:scale-95 group flex items-center gap-2"
                title="View Passengers"
              >
                <Users className="w-4 h-4 transition-transform group-hover:scale-110" />
                <span className="text-xs font-bold">Passengers</span>
              </button>
            </div>
          )}
        />

        {hasMore && (
          <div className="mt-10 flex justify-center">
            <button
              onClick={() => fetchUsers({ searchQuery, activeFilter, isLoadMore: true })}
              disabled={loading}
              className="group relative px-10 py-3.5 bg-white border border-slate-200 text-slate-500 font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl hover:border-indigo-300 hover:text-indigo-600 transition-all duration-300 shadow-sm active:scale-95 disabled:opacity-50 overflow-hidden"
            >
              <span className="relative z-10">{loading ? 'Synchronizing Data...' : 'Load More Records'}</span>
              <div className="absolute inset-0 bg-indigo-50 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
