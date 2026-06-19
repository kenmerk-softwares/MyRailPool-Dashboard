import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { collection, getDocs, doc, deleteDoc, updateDoc, addDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../shared/services/firebase';
import { SectionHeader, StatusBadge } from '../../components/Shared';
import { Table } from '../../shared/Table/Table';
import { useToast } from '../../shared/hooks/ToastContext';
import { exportToExcel } from '../../shared/utils/export';

const NOTIFICATION_TYPES = [
  {
    category: "Booking & Trips",
    items: [
      { id: "BOOKING_CONFIRMATION", label: "Booking Confirmation", variables: ["{{user_name}}", "{{booking_id}}", "{{pickup}}", "{{drop}}", "{{date}}", "{{amount}}"] },
      { id: "DRIVER_ASSIGNED", label: "Driver Assigned", variables: ["{{user_name}}", "{{booking_id}}", "{{driver_name}}", "{{vehicle_number}}"] },
      { id: "UPON_DOOR_STEP", label: "Upon Door Step", variables: ["{{user_name}}", "{{booking_id}}", "{{driver_name}}", "{{eta}}"] },
      { id: "TRIP_STARTED", label: "Trip Started", variables: ["{{booking_id}}", "{{driver_name}}"] },
      { id: "TRIP_COMPLETED", label: "Trip Completed", variables: ["{{user_name}}", "{{booking_id}}", "{{amount}}"] },
      { id: "RIDE_CANCELLED", label: "Ride Cancelled", variables: ["{{user_name}}", "{{booking_id}}", "{{cancellation_reason}}", "{{refund_amount}}"] },
      { id: "SYSTEM_RIDE_CANCELLATION", label: "System Ride Cancellation", variables: ["{{driver_name}}", "{{booking_id}}", "{{cancellation_reason}}"] }
    ]
  },
  {
    category: "Payments & Reminders",
    items: [
      { id: "PAYMENT_RECEIVED", label: "Payment Received", variables: ["{{user_name}}", "{{booking_id}}", "{{amount}}", "{{transaction_id}}"] },
      { id: "PAYMENT_REMINDER", label: "Payment Reminder", variables: ["{{user_name}}", "{{booking_id}}", "{{amount}}", "{{due_date}}"] }
    ]
  },
  {
    category: "System",
    items: [
      { id: "WELCOME_MESSAGE", label: "Welcome Message", variables: ["{{user_name}}"] }
    ]
  }
];

export const NotificationModalList = () => {
  const [modals, setModals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentModal, setCurrentModal] = useState(null);

  const [formData, setFormData] = useState({
    type: 'BOOKING_CONFIRMATION',
    title: '',
    message: '',
    status: 'Active',
    targetAudience: 'All Users'
  });
  const [uploading, setUploading] = useState(false);

  const fetchModals = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'notification_modals'));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setModals(data);
    } catch (error) {
      showToast('Error fetching modals', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModals();
  }, []);

  const handleClear = () => {
    setActiveFilter('');
    setSearchQuery('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      const payload = {
        ...formData,
        updatedAt: serverTimestamp()
      };

      if (currentModal) {
        await updateDoc(doc(db, 'notification_modals', currentModal.id), payload);
        showToast('Model updated successfully', 'success');
      } else {
        payload.createdAt = serverTimestamp();
        await setDoc(doc(db, 'notification_modals', formData.type), payload);
        showToast('Model created successfully', 'success');
      }

      setIsModalOpen(false);
      fetchModals();
    } catch (error) {
      showToast('Error saving model', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this model?')) {
      try {
        await deleteDoc(doc(db, 'notification_modals', id));
        showToast('Model deleted successfully', 'success');
        fetchModals();
      } catch (error) {
        showToast('Error deleting model', 'error');
      }
    }
  };

  const openAddModal = () => {
    setCurrentModal(null);
    setFormData({ type: 'BOOKING_CONFIRMATION', title: '', message: '', status: 'Active', targetAudience: 'All Users' });
    setIsModalOpen(true);
  };

  const openEditModal = (modal) => {
    setCurrentModal(modal);
    setFormData({
      type: modal.id || 'BOOKING_CONFIRMATION',
      title: modal.title || '',
      message: modal.message || '',
      status: modal.status || 'Active',
      targetAudience: modal.targetAudience || 'All Users'
    });
    setIsModalOpen(true);
  };

  const filteredModals = modals.filter(m => {
    const matchesSearch = (m.title?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter ? m.status === activeFilter : true;
    return matchesSearch && matchesFilter;
  });

  const handleExport = () => {
    exportToExcel(filteredModals, {
      id: 'Type ID',
      title: 'Title',
      message: 'Message Content',
      targetAudience: 'Target Audience',
      status: 'Status'
    }, 'NotificationModals');
  };

  return (
    <div className="animate-in fade-in duration-700">
      <SectionHeader
        title="Notification Models"
        subtitle="Manage Notification templates."
        actionLabel="Add Model"
        actionIcon={Plus}
        onActionClick={openAddModal}
        onExportClick={handleExport}
      />

      <div className="pb-10">
        <Table
          headers={['Details', 'Target Audience', 'Status']}
          data={filteredModals}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          onClear={handleClear}
          searchPlaceholder="Search models by title..."
          filterOptions={[
            { label: 'Active', value: 'Active' },
            { label: 'Inactive', value: 'Inactive' },
          ]}
          renderRow={(modal, idx) => (
            <>
              <td className="px-8 py-4">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md uppercase tracking-wider">{modal.id}</span>
                  </div>
                  <span className="text-[14px] font-black text-slate-800 tracking-tight">{modal.title}</span>
                  <span className="text-[12px] text-slate-500 mt-1 line-clamp-1 max-w-xs">{modal.message}</span>
                </div>
              </td>
              <td className="px-8 py-4">
                <span className="text-[12px] font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-wider">
                  {modal.targetAudience}
                </span>
              </td>
              <td className="px-8 py-4">
                <StatusBadge
                  status={modal.status}
                  statusColor={modal.status === 'Active' ? 'success' : 'danger'}
                />
              </td>
            </>
          )}
          actions={(modal) => (
            <div className="flex items-center gap-2">
              <button
                onClick={() => openEditModal(modal)}
                className="p-2.5 bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-100 rounded-xl transition-all hover:shadow-lg active:scale-95"
                title="Edit Model"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(modal.id)}
                className="p-2.5 bg-white border border-slate-200 text-slate-500 hover:text-red-500 hover:border-red-100 rounded-xl transition-all hover:shadow-lg active:scale-95"
                title="Delete Model"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        />
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-800">{currentModal ? 'Edit Model' : 'Create Model'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-slate-600">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Notification Type</label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  disabled={!!currentModal}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {NOTIFICATION_TYPES.map(category => (
                    <optgroup key={category.category} label={category.category}>
                      {category.items.map(item => (
                        <option key={item.id} value={item.id}>{item.label}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                {currentModal && <p className="text-[10px] text-slate-500 mt-1">Notification type cannot be changed after creation.</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                  placeholder="Model Title"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Message / Content</label>
                <textarea
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all h-24 resize-none"
                  placeholder="Model main message..."
                />
                {(() => {
                  const selectedItem = NOTIFICATION_TYPES.flatMap(c => c.items).find(i => i.id === formData.type);
                  if (selectedItem && selectedItem.variables.length > 0) {
                    return (
                      <div className="mt-3 p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                        <p className="text-[11px] font-bold text-indigo-800 uppercase tracking-wider mb-2">Available Variables (Click to copy)</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedItem.variables.map(v => (
                            <button
                              key={v}
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(v);
                                showToast(`Copied ${v} to clipboard`, 'success');
                              }}
                              className="text-xs font-mono bg-white px-2.5 py-1.5 rounded-lg border border-indigo-200 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-colors cursor-pointer shadow-sm"
                            >
                              {v}
                            </button>
                          ))}
                        </div>
                        <p className="text-[10px] text-indigo-400 mt-2">These variables will be replaced with actual user data when sent.</p>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Target Audience</label>
                  <select
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                  >
                    <option value="All Users">All Users</option>
                    <option value="Customers">Customers Only</option>
                    <option value="Drivers">Drivers Only</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-6 py-2.5 text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-all shadow-lg shadow-primary-600/20 disabled:opacity-70 flex items-center gap-2"
                >
                  {uploading ? 'Saving...' : 'Save Model'}
                  {!uploading && <CheckCircle className="w-4 h-4" />}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
