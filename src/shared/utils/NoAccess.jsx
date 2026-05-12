import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLock, FaHome } from 'react-icons/fa';

export default function NoAccess() {
    const navigate = useNavigate();

    return (
        <div className="flex items-center justify-center min-h-[70vh] p-8">
            <div className="text-center bg-white rounded-[1.25rem] py-12 px-10 shadow-[0_4px_24px_rgba(0,0,0,0.07)] border border-[#e5e7eb] max-w-[420px] w-full">
                <div className="text-[3.5rem] text-[#ef4444] mb-4 inline-flex items-center justify-center bg-[#fef2f2] rounded-full w-20 h-20">
                    <FaLock />
                </div>
                <h2 className="text-2xl font-bold text-[#1f2937] mb-2">Access Denied</h2>
                <p className="text-[0.95rem] text-[#6b7280] mb-6 leading-relaxed">
                    You don't have permission to view this page. Please contact your
                    administrator if you believe this is an error.
                </p>
                <button
                    className="inline-flex items-center gap-2 px-6 py-[0.65rem] bg-green-900 text-white border-none rounded-[0.625rem] text-[0.9rem] font-semibold cursor-pointer transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_4px_12px_rgba(99,102,241,0.35)]"
                    onClick={() => navigate('/')}
                >
                    <FaHome /> Go Home
                </button>
            </div>
        </div>
    );
}