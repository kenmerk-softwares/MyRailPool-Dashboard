import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Search, AlertTriangle, X } from 'lucide-react';
import { SectionHeader } from '../../components/Shared';
import AddAdmin from './AddAdmin';
import { collection, getDocs } from 'firebase/firestore';
import { app, db } from '../../Config/Config';
import { getFunctions, httpsCallable } from 'firebase/functions';

export const AdminUserList = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState();
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const querySnapshot = await getDocs(collection(db, 'admin-users'));
      const userList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(userList);
    } catch (err) {
      setError('Failed to fetch admin users');
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
          <div className="flex items-center justify-between m-4">
            {/* Search Bar */}
            <div className="hidden sm:flex flex-1 max-w-xl ml-4 lg:ml-0">
              <div className="relative group w-full">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-500 transition-colors">
                  <Search className="h-4 w-4 md:h-5 md:w-5" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 md:pl-11 pr-4 py-2 md:py-2.5 bg-slate-50 border border-transparent rounded-xl text-xs md:text-sm placeholder-slate-400 focus:border-primary-500 focus:bg-white focus:ring focus:ring-primary-500/20 transition-all duration-200"
                  placeholder="Search admin users"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <select name="" id="" className="border border-slate-200 rounded-xl px-4 py-2 text-xs md:text-sm">
                <option value="">All</option>
                <option value="">Active</option>
                <option value="">Inactive</option>
              </select>
              <button className="bg-red-500 text-white px-4 py-2 rounded-xl text-xs md:text-sm">Clear</button>
            </div>

          </div>
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100 text-center">Name</th>
                <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100 text-center">Email</th>
                <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100 hidden sm:table-cell text-center">Role</th>
                <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100 text-center">Status</th>
                <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
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
                  <td className="px-4 md:px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => {
                          setSelectedUser(user);
                          setIsAddModalOpen(true);
                        }}
                        className="text-primary-600 hover:text-primary-800 p-1.5 rounded-lg hover:bg-primary-50 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => {
                          setUserToDelete(user);
                          setIsDeleteModalOpen(true);
                        }}
                        className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
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

      {/* Delete Confirmation Modal */}
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
    </>
  );
};
