import React from 'react';

/**
 * A premium, full-screen loading component for high-fidelity user feedback.
 * Features a sleek backdrop blur, a pulsing logo container, and a custom
 * spinner with glassmorphism aesthetics.
 */
export default function Loading({ message = "Initializing System..." }) {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-50/80 backdrop-blur-md">
      {/* Animated Spinner Container */}
      <div className="relative flex items-center justify-center">
        {/* Outer Pulsing Glow */}
        <div className="absolute w-24 h-24 bg-primary-500/20 rounded-full animate-ping"></div>
        
        {/* Main Spinner Ring */}
        <div className="w-16 h-16 border-4 border-slate-100 border-t-primary-600 rounded-full animate-spin shadow-lg"></div>
        
        {/* Center Accent */}
        <div className="absolute w-2 h-2 bg-primary-600 rounded-full"></div>
      </div>

      {/* Loading Text & Progress */}
      <div className="mt-8 flex flex-col items-center gap-3">
        <h3 className="text-lg font-bold text-slate-800 tracking-tight animate-pulse text-center px-4">
          {message}
        </h3>
        
        {/* Progress Bar Track */}
        <div className="w-48 h-1 bg-slate-200 rounded-full overflow-hidden">
          {/* Indeterminate Progress Animation (Uses global .animate-premium-loading from index.css) */}
          <div className="w-full h-full bg-primary-600 rounded-full animate-premium-loading origin-left"></div>
        </div>
      </div>
    </div>
  );
}
