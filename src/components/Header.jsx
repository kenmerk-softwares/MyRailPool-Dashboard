import React from 'react';
import { Menu, Search, Bell, UserCircle, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Header = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => (
  <header className="h-16 md:h-20 bg-white border-b border-slate-200/60 shadow-sm flex items-center justify-between px-4 md:px-8 z-10 shrink-0 sticky top-0 w-full">
    {/* Mobile Hamburger & Logo text */}
    <div className="flex items-center gap-3 lg:hidden">
      <button
        className="text-slate-500 hover:text-slate-700 p-1 -ml-1 rounded-md active:bg-slate-100 transition-colors"
        onClick={() => setIsMobileMenuOpen(true)}
      >
        <Menu className="w-6 h-6" />
      </button>
      <span className="font-bold text-lg tracking-wide uppercase text-slate-800">MyRail<span className="text-primary-600">Pool</span></span>
    </div>

    {/* Search Bar
    <div className="hidden sm:flex flex-1 max-w-xl ml-4 lg:ml-0">
      <div className="relative group w-full">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-500 transition-colors">
          <Search className="h-4 w-4 md:h-5 md:w-5" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 md:pl-11 pr-4 py-2 md:py-2.5 bg-slate-50 border border-transparent rounded-xl text-xs md:text-sm placeholder-slate-400 focus:border-primary-500 focus:bg-white focus:ring focus:ring-primary-500/20 transition-all duration-200"
          placeholder="Search bookings, trips, drivers..."
        />
      </div>
    </div> */}

    {/* Right Actions */}
    <div className="flex items-center gap-3 md:gap-6 ml-auto">
      {/* <button className="sm:hidden text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-50">
        <Search className="w-5 h-5" />
      </button> */}

      <div className="relative">
        <Link to="/notifications" className="text-slate-400 hover:text-slate-600 p-1.5 md:p-2 rounded-full hover:bg-slate-50 transition-colors block relative focus:outline-none">
          <Bell className="w-5 h-5 md:w-6 md:h-6" />
          <span className="absolute top-1 right-1.5 md:top-1.5 md:right-2 block h-2 w-2 md:h-2.5 md:w-2.5 rounded-full bg-red-500 ring-2 ring-white shadow-sm"></span>
        </Link>
      </div>

      <div className="w-px h-6 md:h-8 bg-slate-200 hidden xs:block"></div>

      <button className="flex items-center gap-2 md:gap-3 hover:bg-slate-50 p-1 md:p-1.5 rounded-full md:pr-4 transition-colors border border-transparent hover:border-slate-200 focus:outline-none">
        <div className="h-8 w-8 md:h-9 md:w-9 rounded-full bg-gradient-to-tr from-primary-500 to-primary-600 flex items-center justify-center text-white shadow-sm shrink-0">
          <UserCircle className="w-5 h-5 md:w-6 md:h-6" />
        </div>
        <div className="flex-col items-start leading-tight hidden md:flex">
          <span className="text-sm font-semibold text-slate-700">Admin User</span>
          <span className="text-xs text-slate-500">Superadmin</span>
        </div>
        <ChevronDown className="w-3 h-3 md:w-4 md:h-4 text-slate-400 hidden md:block" />
      </button>
    </div>
  </header>
);
