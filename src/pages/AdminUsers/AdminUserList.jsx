import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, AlertTriangle, X, KeyRound } from 'lucide-react';
import { SectionHeader } from '../../components/Shared';
import AddAdmin from './AddAdmin';
import { collection, getDocs } from 'firebase/firestore';
import { app, db } from '../../Config/Config';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useToast } from '../../Toast/ToastContext';
import { Filter } from '../../Filter/Filter';

export const AdminUserList = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
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

  const filteredData = users.filter(item => {
    const matchesSearch = !searchQuery || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.designation?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = !activeFilter || activeFilter === 'Active'; // For now all are active

    return matchesSearch && matchesStatus;
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'admin-users'));
      const userList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(userList);
    } catch (err) {
      console.log("Error fetching admin users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async () => {
    if (!userToDelete) return;

    setLoading(true);
    try {
      const functions = getFunctions(app, "asia-south1");
      const manageAdmin = httpsCallable(functions, "addUser");

      const res = await manageAdmin({ action: "delete", id: userToDelete.id });
      if (res.data?.success) {
        setUsers(users.filter(u => u.id !== userToDelete.id));
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
      const functions = getFunctions(app, "asia-south1");
      const changePasswordFn = httpsCallable(functions, "changePassword");

      const res = await changePasswordFn({ id: passwordUser.id, password: newPassword });
      if (res.data?.success) {
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

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 md:p-6 border-b border-slate-100">
          <h3 className="text-base md:text-lg font-bold text-slate-800">Admin User List</h3>
        </div>
        <div className="overflow-x-auto w-full">
          <Filter 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            onClear={handleClear}
            searchPlaceholder="Search admin users by name, email, role..."
            options={[
              { label: 'Active', value: 'Active' },
              { label: 'Inactive', value: 'Inactive' },
            ]}
          />
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100 text-center">Sl No</th>
                <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100 text-center">Name</th>
                <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100 text-center">Email</th>
                <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100 hidden sm:table-cell text-center">Role</th>
                <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100 text-center">Status</th>
                <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100 text-center">Last Active</th>
                <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((user, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 md:px-6 py-4 text-center text-xs md:text-sm font-medium text-slate-500">{idx + 1}</td>
                  <td className="px-4 md:px-6 py-4 text-center">
                    <div className="text-xs md:text-sm font-medium text-slate-900">{user.name}</div>
                  </td>
                  <td className="px-4 md:px-6 py-4 text-center">
                    <div className="text-[10px] md:text-sm text-slate-600 mt-0.5">{user.email}</div>
                  </td>
                  <td className="px-4 md:px-6 py-4 text-xs md:text-sm text-slate-600 text-center">{user.designation || 'N/A'}</td>
                  <td className="px-4 md:px-6 py-4 text-xs md:text-sm text-center">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800`}>
                      Active
                    </span>
                  </td>
                  <td className="px-4 md:px-6 py-4 text-xs md:text-sm text-slate-600 text-center">
                    {user.lastActive
                      ? new Date(user.lastActive.seconds ? user.lastActive.seconds * 1000 : user.lastActive).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
                      : 'N/A'}
                  </td>
                  <td className="px-4 md:px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => {
                          setSelectedUser(user);
                          setIsAddModalOpen(true);
                        }}
                        className="text-primary-600 hover:text-primary-800 p-1.5 rounded-lg hover:bg-primary-50 transition-colors"
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
                        className="text-amber-600 hover:text-amber-800 p-1.5 rounded-lg hover:bg-amber-50 transition-colors"
                        title="Change Password"
                      >
                        <KeyRound className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => {
                          setUserToDelete(user);
                          setIsDeleteModalOpen(true);
                        }}
                        className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AddAdmin 
        isOpen={isAddModalOpen} 
        onClose={() => {
          setIsAddModalOpen(false);
          setSelectedUser(null);
        }} 
        editData={selectedUser}
        onRefresh={fetchUsers}
      />

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => {
              if (!loading) setIsDeleteModalOpen(false);
            }}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="bg-red-50 p-3 rounded-2xl">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <button 
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400"
                  disabled={loading}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Admin User?</h3>
              <p className="text-slate-500 mb-6">
                Are you sure you want to delete <span className="font-semibold text-slate-700">{userToDelete?.name}</span>? This action cannot be undone and will permanently remove their access.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  disabled={loading}
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50 transition-all text-sm disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="flex-1 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition-all text-sm shadow-lg shadow-red-600/20 disabled:opacity-50"
                >
                  {loading ? "Deleting..." : "Confirm Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
