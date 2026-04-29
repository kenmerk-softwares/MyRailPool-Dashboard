import React, { useState, useEffect } from 'react';
import {
  DollarSign, CheckCircle, Clock, XCircle, RefreshCcw,
  Download, Calendar as CalendarIcon
} from 'lucide-react';
import StatCard from './StatCard';
import Filters from './Filters';
import PaymentTable from './PaymentTable';
import PaymentCharts from './PaymentCharts';
import PaymentDetailsModal from './PaymentDetailsModal';
import RefundModal from './RefundModal';
import { mockPayments, revenueChartData, methodDistributionData } from '../../data/mockData';

const Payment = () => {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [methodFilter, setMethodFilter] = useState('All Methods');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isRefundOpen, setIsRefundOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const filteredPayments = mockPayments.filter(payment => {
    const matchesSearch =
      payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All Status' || payment.status === statusFilter;
    const matchesMethod = methodFilter === 'All Methods' || payment.method === methodFilter;

    return matchesSearch && matchesStatus && matchesMethod;
  });

  const handleViewDetails = (payment) => {
    setSelectedPayment(payment);
    setIsDetailsOpen(true);
  };

  const handleInitiateRefund = (payment) => {
    setSelectedPayment(payment);
    setIsRefundOpen(true);
  };

  if (loading) {
    return (
      <div className="p-8 space-y-8 animate-pulse">
        <div className="h-8 w-64 bg-slate-200 rounded-xl mb-10" />
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-32 bg-slate-100 rounded-2xl" />)}
        </div>
        <div className="h-16 bg-slate-100 rounded-2xl" />
        <div className="h-96 bg-slate-100 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 text-slate-800 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Payment Dashboard</h2>
          <p className="text-slate-500 font-medium mt-1">Monitor transactions, manage refunds, and track revenue.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
            <CalendarIcon className="w-4 h-4" />
            Apr 2024
          </button>
          <button className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      <div className="space-y-10">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          <StatCard
            title="Total Revenue"
            value="₹45,280"
            icon={DollarSign}
            trend="up"
            trendValue="12.5%"
            color="indigo"
          />
          <StatCard
            title="Successful"
            value="128"
            icon={CheckCircle}
            trend="up"
            trendValue="8.2%"
            color="emerald"
          />
          <StatCard
            title="Pending"
            value="14"
            icon={Clock}
            trend="down"
            trendValue="3.1%"
            color="amber"
          />
          <StatCard
            title="Failed"
            value="06"
            icon={XCircle}
            trend="up"
            trendValue="0.5%"
            color="rose"
          />
          <StatCard
            title="Refunds"
            value="₹2,400"
            icon={RefreshCcw}
            trend="down"
            trendValue="1.2%"
            color="blue"
          />
        </div>

        {/* Charts Row */}
        <PaymentCharts
          revenueData={revenueChartData}
          methodData={methodDistributionData}
        />

        {/* List  */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Recent Transactions</h3>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-lg text-[10px] font-black text-indigo-600 uppercase tracking-widest">
              Live Feed
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse ml-1" />
            </div>
          </div>

          <Filters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            methodFilter={methodFilter}
            setMethodFilter={setMethodFilter}
          />

          <PaymentTable
            payments={filteredPayments}
            onView={handleViewDetails}
            onRefund={handleInitiateRefund}
          />
        </div>
      </div>

      <PaymentDetailsModal
        payment={selectedPayment}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />

      <RefundModal
        payment={selectedPayment}
        isOpen={isRefundOpen}
        onClose={() => setIsRefundOpen(false)}
      />
    </div>
  );
};

export default Payment;
