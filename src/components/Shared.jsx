import React from 'react';
import { Clock, CheckCircle2, XCircle, Car, Users, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export const StatCard = ({ title, value, icon: Icon, trend, trendUp }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-2xl md:text-3xl font-bold text-slate-800">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl ${trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
        <Icon className="w-5 h-5 md:w-6 md:h-6" />
      </div>
    </div>
    <div className="mt-4 flex items-center text-sm">
      <span className={`font-medium ${trendUp ? 'text-emerald-600' : 'text-red-600'}`}>
        {trend}
      </span>
      <span className="text-slate-400 ml-2">vs last month</span>
    </div>
  </div>
);

export const SectionHeader = ({ title, subtitle, actionLabel, actionIcon: Icon, actionTo, onActionClick }) => (
  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-6 md:mb-8 gap-4 sm:gap-0">
    <div>
      <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">{title}</h2>
      <p className="text-sm md:text-base text-slate-500 mt-1">{subtitle}</p>
    </div>
    {actionLabel && (
      <div className="flex flex-wrap gap-2 md:gap-3">
        <button className="bg-white border text-slate-700 border-slate-200 px-3 md:px-4 py-2 rounded-xl text-xs md:text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm flex-1 sm:flex-none text-center justify-center">
          Export
        </button>
        {actionTo ? (
          <Link to={actionTo} className="bg-primary-600 text-white px-3 md:px-4 py-2 rounded-xl text-xs md:text-sm font-medium hover:bg-primary-700 active:bg-primary-800 transition-colors shadow-sm shadow-primary-600/20 flex items-center justify-center gap-2 flex-1 sm:flex-none">
            {Icon && <Icon className="w-4 h-4" />}
            {actionLabel}
          </Link>
        ) : (
          <button 
            onClick={onActionClick}
            className="bg-primary-600 text-white px-3 md:px-4 py-2 rounded-xl text-xs md:text-sm font-medium hover:bg-primary-700 active:bg-primary-800 transition-colors shadow-sm shadow-primary-600/20 flex items-center justify-center gap-2 flex-1 sm:flex-none"
          >
            {Icon && <Icon className="w-4 h-4" />}
            {actionLabel}
          </button>
        )}
      </div>
    )}
  </div>
);

export const StatusBadge = ({ status, statusColor }) => {
  const colors = {
    warning: 'bg-amber-100 text-amber-800',
    success: 'bg-emerald-100 text-emerald-800',
    danger: 'bg-red-100 text-red-800',
    primary: 'bg-primary-100 text-primary-800',
    slate: 'bg-slate-100 text-slate-800'
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize whitespace-nowrap ${colors[statusColor] || colors.slate}`}>
      {status === 'Pending' && <Clock className="w-3 h-3 mr-1" />}
      {(status === 'Approved' || status === 'Completed') && <CheckCircle2 className="w-3 h-3 mr-1" />}
      {status === 'Declined' && <XCircle className="w-3 h-3 mr-1" />}
      {status === 'In Transit' && <Car className="w-3 h-3 mr-1" />}
      {status === 'Assigned' && <Users className="w-3 h-3 mr-1" />}
      {status}
    </span>
  );
};

export const EmptyView = ({ title, subtitle, icon: Icon }) => (
  <div className="flex flex-col items-center justify-center h-[50vh] md:h-[60vh] text-center px-4">
    <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 md:mb-6">
      <Icon className="w-8 h-8 md:w-10 md:h-10 text-slate-400" />
    </div>
    <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-2">{title}</h3>
    <p className="text-sm md:text-base text-slate-500 max-w-md">{subtitle}</p>
    <button className="mt-6 md:mt-8 bg-primary-600 text-white px-5 md:px-6 py-2.5 md:py-3 rounded-xl text-sm font-medium hover:bg-primary-700 active:bg-primary-800 transition-colors shadow-sm shadow-primary-600/20 flex items-center gap-2">
      <Plus className="w-5 h-5" />
      Create New {title.split(' ')[0]}
    </button>
  </div>
);

// Fallback Activity icon
export const Activity = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
);
