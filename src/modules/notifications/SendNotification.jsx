import React, { useState } from 'react';
import { Send, Bell, User, MessageSquare, AlertCircle, CheckCircle2 } from 'lucide-react';
import { SectionHeader } from '../../components/Shared';
import { useNavigate } from 'react-router-dom';

export const SendNotification = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    role: 'user',
    recipientGroups: 'all',
    title: '',
    message: '',
    type: 'info'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      navigate('/notifications');
    }, 1500);
  };

  return (
    <div className="max-w-3xl mx-auto pb-12 animate-in fade-in duration-500 px-4 md:px-0">
      <SectionHeader 
        title="Send Notification" 
      />

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mt-6">
        <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/30 flex items-center gap-3">
          <div className="p-2 bg-primary-50 rounded-lg">
            <Bell className="w-4 h-4 text-primary-600" />
          </div>
          <h3 className="font-bold text-slate-800">Notification Composer</h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6 md:space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-tight block">Target Role</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <select 
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all appearance-none cursor-pointer"
                >
                  <option value="user">User</option>
                  <option value="driver">Driver</option>
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-tight block">Recipient Group</label>
              <div className="relative">
                <Bell className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <select 
                  name="recipientGroups"
                  value={formData.recipientGroups}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all appearance-none cursor-pointer"
                >
                  <option value="all">All Users</option>
                  <option value="drivers">Drivers</option>
                  <option value="operators">Staff</option>
                  <option value="customers">Customers</option>
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                </div>
              </div>
            </div>

            
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-normal block">Notification Title</label>
            <div className="relative">
              <MessageSquare className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., System Maintenance Update"
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-normal block">Message Content</label>
            <textarea 
              name="message"
              required
              value={formData.message}
              onChange={handleChange}
              rows="5"
              placeholder="Detailed notification message goes here..."
              className="w-full px-4 py-4 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all resize-none"
            ></textarea>
          </div>

          <div className="pt-4 flex flex-col-reverse md:flex-row items-center justify-end gap-3 md:gap-4">
            <button
              type="button"
              onClick={() => navigate('/notifications')}
              className="w-full md:w-auto px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`w-full md:w-auto px-8 py-3 bg-primary-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary-600/20 transition-all hover:bg-primary-800 active:scale-95 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Broadcast Notification
                </>
              )}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};
