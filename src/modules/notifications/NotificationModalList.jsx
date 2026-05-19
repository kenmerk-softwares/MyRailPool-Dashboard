import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Image as ImageIcon, CheckCircle, XCircle } from 'lucide-react';
import { collection, getDocs, doc, deleteDoc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../shared/services/firebase';
import { SectionHeader, StatusBadge } from '../../components/Shared';
import { Table } from '../../shared/Table/Table';
import { useToast } from '../../shared/hooks/ToastContext';

export const NotificationModalList = () => {
  const [modals, setModals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentModal, setCurrentModal] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    status: 'Active',
    targetAudience: 'All Users',
    imageUrl: ''
  });
  const [imageFile, setImageFile] = useState(null);
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

  const handleImageUpload = async (file) => {
    if (!file) return null;
    const storageRef = ref(storage, `modals/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      let finalImageUrl = formData.imageUrl;
      if (imageFile) {
        finalImageUrl = await handleImageUpload(imageFile);
      }

      const payload = {
        ...formData,
        imageUrl: finalImageUrl,
        updatedAt: serverTimestamp()
      };

      if (currentModal) {
        await updateDoc(doc(db, 'notification_modals', currentModal.id), payload);
        showToast('Modal updated successfully', 'success');
      } else {
        payload.createdAt = serverTimestamp();
        await addDoc(collection(db, 'notification_modals'), payload);
        showToast('Modal created successfully', 'success');
      }

      setIsModalOpen(false);
      fetchModals();
    } catch (error) {
      showToast('Error saving modal', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this modal?')) {
      try {
        await deleteDoc(doc(db, 'notification_modals', id));
        showToast('Modal deleted successfully', 'success');
        fetchModals();
      } catch (error) {
        showToast('Error deleting modal', 'error');
      }
    }
  };

  const openAddModal = () => {
    setCurrentModal(null);
    setFormData({ title: '', message: '', status: 'Active', targetAudience: 'All Users', imageUrl: '' });
    setImageFile(null);
    setIsModalOpen(true);
  };

  const openEditModal = (modal) => {
    setCurrentModal(modal);
    setFormData({
      title: modal.title || '',
      message: modal.message || '',
      status: modal.status || 'Active',
      targetAudience: modal.targetAudience || 'All Users',
      imageUrl: modal.imageUrl || ''
    });
    setImageFile(null);
    setIsModalOpen(true);
  };

  const filteredModals = modals.filter(m => {
    const matchesSearch = (m.title?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter ? m.status === activeFilter : true;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="animate-in fade-in duration-700">
      <SectionHeader
        title="Notification Modals"
        subtitle="Manage popup modals and promotional banners shown to users."
        actionLabel="Add Modal"
        actionIcon={Plus}
        onActionClick={openAddModal}
      />

      <div className="pb-10">
        <Table
          headers={['Modal Image', 'Details', 'Target Audience', 'Status']}
          data={filteredModals}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          onClear={handleClear}
          searchPlaceholder="Search modals by title..."
          filterOptions={[
            { label: 'Active', value: 'Active' },
            { label: 'Inactive', value: 'Inactive' },
          ]}
          renderRow={(modal, idx) => (
            <>
              <td className="px-8 py-4">
                <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden">
                  {modal.imageUrl ? (
                    <img src={modal.imageUrl} alt={modal.title} className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-slate-300" />
                  )}
                </div>
              </td>
              <td className="px-8 py-4">
                <div className="flex flex-col">
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
                className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 rounded-xl transition-all hover:shadow-lg active:scale-95"
                title="Edit Modal"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(modal.id)}
                className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-100 rounded-xl transition-all hover:shadow-lg active:scale-95"
                title="Delete Modal"
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
              <h3 className="text-xl font-bold text-slate-800">{currentModal ? 'Edit Modal' : 'Create Modal'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                  placeholder="Modal Title"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Message / Content</label>
                <textarea
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all h-24 resize-none"
                  placeholder="Modal main message..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Target Audience</label>
                  <select
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({...formData, targetAudience: e.target.value})}
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
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Banner Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                />
                {formData.imageUrl && !imageFile && (
                  <div className="mt-3">
                    <img src={formData.imageUrl} alt="Preview" className="h-20 rounded-lg object-cover" />
                  </div>
                )}
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
                  {uploading ? 'Saving...' : 'Save Modal'}
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
