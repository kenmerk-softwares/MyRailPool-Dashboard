import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const Layout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#F1F9F3] font-sans antialiased text-slate-900 overflow-hidden">
      <Sidebar 
        isMobileMenuOpen={isMobileMenuOpen} 
        setIsMobileMenuOpen={setIsMobileMenuOpen} 
      />

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative w-full lg:w-auto">
        <Header 
          isMobileMenuOpen={isMobileMenuOpen} 
          setIsMobileMenuOpen={setIsMobileMenuOpen} 
        />

        {/* Dashboard Content area */}
        <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 relative w-full">
          <div className="absolute inset-0 bg-primary-50 -z-10"></div>
          
          <div className="max-w-7xl mx-auto pb-12 sm:pb-20">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};
