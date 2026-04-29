import React from 'react';
import { Menu, Bell, UserCircle, ChevronDown, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { signOut } from 'firebase/auth';
import { auth } from '../Config/Config';
import { useToast } from '../Toast/ToastContext';

export const Header = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const handleBack = () => {
    navigate(-1);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      showToast('Logged out successfully', 'success');
      navigate('/login');
    } catch (error) {
      console.error(error);
      showToast('Logout failed. Try again.', 'error');
    }
  };

  return (
    <header className="h-16 md:h-20 bg-white border-b border-slate-200/60 shadow-sm flex items-center justify-between px-4 md:px-8 z-10 shrink-0 sticky top-0 w-full">
      {/* Mobile Hamburger & Logo text */}
      <div className="flex items-center gap-2 md:gap-3 lg:hidden">
        <button
          className="text-slate-500 hover:text-slate-700 p-1 -ml-1 rounded-md active:bg-slate-100 transition-colors"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu className="w-5 h-5 md:w-6 md:h-6" />
        </button>
        <span className="font-bold text-base md:text-lg tracking-wide uppercase text-slate-800">MyRail<span className="text-primary-600">Pool</span></span>
      </div>

      <div className="flex items-center gap-3">
        <button className="appbar-back-btn flex items-center gap-1.5 md:gap-2 text-slate-500" onClick={handleBack} title="Go Back">
          <FaArrowLeft className="w-3.5 h-3.5 md:w-4 md:h-4" />
          <span className="text-xs md:text-sm font-bold text-slate-500">Back</span>
        </button>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 md:gap-6 ml-auto">

        <div className="relative">
          <Link to="/notifications" className="text-slate-400 hover:text-slate-600 p-1 md:p-2 rounded-full hover:bg-slate-50 transition-colors block relative focus:outline-none">
            <Bell className="w-4 h-4 md:w-6 md:h-6" />
            <span className="absolute top-1 right-1 md:top-1.5 md:right-2 block h-1.5 w-1.5 md:h-2.5 md:w-2.5 rounded-full bg-red-500 ring-2 ring-white shadow-sm"></span>
          </Link>
        </div>

        <div className="w-px h-5 md:h-8 bg-slate-200 hidden xs:block"></div>

        <button className="flex items-center gap-1.5 md:gap-3 hover:bg-slate-50 p-1 md:p-1.5 rounded-full md:pr-4 transition-colors border border-transparent hover:border-slate-200 focus:outline-none">
          <div className="h-6 w-6 md:h-9 md:w-9 rounded-full bg-gradient-to-tr from-primary-500 to-primary-600 flex items-center justify-center text-white shadow-sm shrink-0">
            <UserCircle className="w-4 h-4 md:w-6 md:h-6" />
          </div>
          <div className="flex-col items-start leading-tight hidden md:flex">
            <span className="text-sm font-semibold text-slate-700">Admin User</span>
            <span className="text-xs text-slate-500">Superadmin</span>
          </div>
          <ChevronDown className="w-3 h-3 md:w-4 md:h-4 text-slate-400 hidden md:block" />
        </button>
        <button
          onClick={handleLogout}
          className="text-slate-400 hover:text-red-500 p-1 md:p-2 rounded-full hover:bg-red-50 transition-colors focus:outline-none"
          title="Logout"
        >
          <LogOut className="w-4 h-4 md:w-6 md:h-6" />
        </button>
      </div>
    </header>
  )
};
