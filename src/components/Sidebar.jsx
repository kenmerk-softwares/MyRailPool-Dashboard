import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarCheck,
  Map as MapIcon,
  Users,
  Car,
  Settings,
  X,
  Bell
} from 'lucide-react';

const SidebarItem = ({ icon: Icon, label, path, onClick, isMobile }) => {
  const location = useLocation();
  const active = location.pathname === path;

  return (
    <Link
      to={path}
      onClick={isMobile ? onClick : undefined}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${active
          ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md shadow-primary-500/20'
          : 'text-primary-100/70 hover:bg-primary-800 hover:text-white'
        }`}
    >
      <Icon className={`w-5 h-5 shrink-0 ${active ? 'text-white' : 'text-primary-200/50 group-hover:text-white transition-colors'}`} />
      <span className="font-medium truncate">{label}</span>
    </Link>
  );
};

export const Sidebar = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/bookings', label: 'Bookings', icon: CalendarCheck },
    { path: '/trips', label: 'Trips', icon: MapIcon },
    { path: '/routes', label: 'Routes', icon: MapIcon },
    { path: '/drivers', label: 'Drivers', icon: Users },
    { path: '/vehicles', label: 'Vehicles', icon: Car },
    { path: '/notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside className={`fixed lg:static inset-y-0 left-0 w-72 bg-primary-900 flex flex-col shadow-2xl lg:shadow-xl z-40 transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="h-20 flex items-center justify-between px-8 border-b border-primary-800/50 shrink-0">
          <Link to="/" className="flex items-center gap-3" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="bg-white/10 backdrop-blur-sm text-white p-2 rounded-xl flex items-center justify-center border border-white/10 shadow-lg">
              <Car className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <h1 className="text-white font-bold text-lg md:text-xl tracking-wide uppercase">MyRail<span className="text-primary-400">Pool</span></h1>
          </Link>
          <button
            className="lg:hidden text-primary-200 hover:text-white p-2 -mr-2"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-8 px-4 space-y-2 custom-scrollbar">
          <div className="text-xs font-semibold text-primary-300/50 uppercase tracking-wider mb-4 px-4">Navigation</div>
          {navItems.map((item) => (
            <SidebarItem
              key={item.path}
              icon={item.icon}
              label={item.label}
              path={item.path}
              isMobile={true}
              onClick={() => setIsMobileMenuOpen(false)}
            />
          ))}
        </div>

        <div className="p-4 border-t border-primary-800 shrink-0">
          <button className="flex items-center gap-3 px-4 py-3 w-full text-primary-100/70 hover:text-white hover:bg-primary-800 rounded-xl transition-colors">
            <Settings className="w-5 h-5" />
            <span className="font-medium truncate">System Settings</span>
          </button>
        </div>
      </aside>
    </>
  );
};
