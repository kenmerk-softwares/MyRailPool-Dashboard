import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, X, KeyRound } from 'lucide-react';
import DeleteModal from '../../../shared/DeleteModal/DeleteModal';
import { SectionHeader } from '../../../components/Shared';
import AddAdmin from './AddAdmin';
import { useToast } from '../../../shared/hooks/ToastContext';
import { useUsers } from '../hooks/user.useUsers';
import { FunctionsAPI } from '../../../shared/services/functions.api';
import { Table } from '../../../shared/Table/Table';
import { StatusBadge } from '../../../components/Shared';

export const AdminUserList = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { users, loading, hasMore, fetchUsers, setLoading } = useUsers();
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordUser, setPasswordUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const { showToast } = useToast();
  const [activeFilter, setActiveFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleClear = () => {
    setActiveFilter('');
    setSearchQuery('');
  };

  const filteredData = users; 

  useEffect(() => {
    fetchUsers({ searchQuery, activeFilter });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, activeFilter]);

  const handleDelete = async () => {
    if (!userToDelete) return;

    setLoading(true);
    try {
      const res = await FunctionsAPI.addAdminUser({ action: "delete", id: userToDelete.id });
      if (res?.success) {
        fetchUsers({ searchQuery, activeFilter });
        alert("User deleted successfully");
        setIsDeleteModalOpen(false);
        setUserToDelete(null);
      } else {
        alert("Error deleting user: " + res.data?.error);
      }
    } catch (error) {
      console.error("Delete Error:", error);
      alert("Error deleting user");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError('');

    if (!newPassword || !confirmNewPassword) {
      setPasswordError('Please fill in both password fields.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await FunctionsAPI.changePassword({ id: passwordUser.id, password: newPassword });
      if (res?.success) {
        showToast("Password changed successfully!", "success");
        setIsPasswordModalOpen(false);
        setPasswordUser(null);
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        setPasswordError(res.data?.error || "Failed to change password.");
      }
    } catch (error) {
      console.error("Change Password Error:", error);
      setPasswordError(error.message || "An unexpected error occurred.");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <>
      <SectionHeader
        title="Admin User List"
        subtitle="Manage your admin users, roles, and permissions."
        actionLabel="Add Admin User"
        actionIcon={Plus}
        onActionClick={() => {
          setSelectedUser(null);
          setIsAddModalOpen(true);
        }}
      />

      <div className="pb-10">
        <Table
          headers={['Sl No', 'User Info', 'Role & Access', 'Status', 'Last Activity']}
          data={filteredData}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          onClear={handleClear}
          searchPlaceholder="Search admin users by name, email, role..."
          filterOptions={[
            { label: 'Active', value: 'Active' },
            { label: 'Inactive', value: 'Inactive' },
          ]}
          renderRow={(user, idx) => (
            <>
              <td className="px-8 py-4 text-[13px] font-black text-slate-800">{idx + 1}</td>
              <td className="px-8 py-4">
                <div className="flex flex-col">
                  <span className="text-[13px] font-black text-slate-800">{user.name}</span>
                  <span className="text-[10px] font-bold text-slate-400">{user.email}</span>
                </div>
              </td>
              <td className="px-8 py-4">
                <span className="text-[13px] font-black text-slate-600 uppercase tracking-tighter">
                  {user.designation || 'N/A'}
                </span>
              </td>
              <td className="px-8 py-4">
                <StatusBadge 
                  status="Active" 
                  statusColor="success" 
                />
              </td>
              <td className="px-8 py-4 text-[13px] font-black text-slate-600 whitespace-nowrap">
                {user.lastActive
                  ? new Date(user.lastActive.seconds ? user.lastActive.seconds * 1000 : user.lastActive).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
                  : 'N/A'}
              </td>
            </>
          )}
          actions={(user) => (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                  setSelectedUser(user);
                  setIsAddModalOpen(true);
                }}
                className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-primary-600 hover:border-primary-100 rounded-xl transition-all hover:shadow-lg active:scale-95"
                title="Edit User"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button 
                onClick={() => {
                  setPasswordUser(user);
                  setPasswordError('');
                  setNewPassword('');
                  setConfirmNewPassword('');
                  setIsPasswordModalOpen(true);
                }}
                className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-amber-600 hover:border-amber-100 rounded-xl transition-all hover:shadow-lg active:scale-95"
                title="Change Password"
              >
                <KeyRound className="w-4 h-4" />
              </button>
              <button 
                onClick={() => {
                  setUserToDelete(user);
                  setIsDeleteModalOpen(true);
                }}
                className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-100 rounded-xl transition-all hover:shadow-lg active:scale-95"
                title="Delete User"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        />

        {hasMore && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => fetchUsers({ searchQuery, activeFilter, isLoadMore: true })}
              disabled={loading}
              className="px-8 py-3 bg-white border border-slate-200 text-slate-500 font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Synchronizing...' : 'Load More Admin Data'}
            </button>
          </div>
        )}
      </div>

      <AddAdmin 
        isOpen={isAddModalOpen} 
        onClose={() => {
          setIsAddModalOpen(false);
          setSelectedUser(null);
        }} 
        editData={selectedUser}
        onRefresh={() => fetchUsers({ searchQuery, activeFilter })}
      />

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Admin User?"
        message="Are you sure you want to delete this admin user?"
        itemName={userToDelete?.name}
        loading={loading}
      />

      {/* Change Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => {
              if (!passwordLoading) {
                setIsPasswordModalOpen(false);
                setPasswordUser(null);
              }
            }}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="bg-amber-50 p-2.5 rounded-xl">
                  <KeyRound className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Change Password</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    For <span className="font-semibold text-slate-700">{passwordUser?.name}</span>
                  </p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setIsPasswordModalOpen(false);
                  setPasswordUser(null);
                }}
                className="p-2 hover:bg-slate-200/50 rounded-xl transition-colors text-slate-400 hover:text-slate-600"
                disabled={passwordLoading}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col items-start w-full">
                  <label htmlFor="newPassword" className="mb-2 text-sm font-semibold text-slate-700">
                    New Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all placeholder:text-slate-400 text-sm"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    disabled={passwordLoading}
                  />
                </div>

                <div className="flex flex-col items-start w-full">
                  <label htmlFor="confirmNewPassword" className="mb-2 text-sm font-semibold text-slate-700">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    id="confirmNewPassword"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all placeholder:text-slate-400 text-sm"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Confirm new password"
                    disabled={passwordLoading}
                  />
                </div>

                {passwordError && (
                  <div className="text-red-500 text-xs font-medium bg-red-50 p-3 rounded-lg border border-red-100">
                    {passwordError}
                  </div>
                )}

                <div className="flex gap-3 mt-2">
                  <button
                    onClick={() => {
                      setIsPasswordModalOpen(false);
                      setPasswordUser(null);
                    }}
                    disabled={passwordLoading}
                    className="flex-1 px-4 py-3 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50 transition-all text-sm disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleChangePassword}
                    disabled={passwordLoading}
                    className="flex-[2] px-4 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold transition-all text-sm shadow-lg shadow-amber-600/20 disabled:opacity-50"
                  >
                    {passwordLoading ? "Changing..." : "Change Password"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
