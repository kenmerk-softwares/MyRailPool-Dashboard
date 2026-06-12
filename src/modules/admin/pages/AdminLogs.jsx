import React, { useEffect, useState, useCallback } from 'react';
import { ArrowRight } from 'lucide-react';
import { SectionHeader } from '../../../components/Shared';
import { adminDb } from '../../../shared/services/firebase';
import { where, orderBy } from 'firebase/firestore';
import { useCollection } from '../../../shared/hooks/useCollection';
import { Table } from '../../../shared/Table/Table';
import { exportToExcel } from '../../../shared/utils/export';

export default function AdminLogs() {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const { data: logs, loading, hasMore, fetchData } = useCollection('admin-logs', {
    pageSize: 20,
    dbInstance: adminDb
  });

  const getConstraints = useCallback(() => {
    const constraints = [];
    if (searchQuery) {
      // Search query (email) takes precedence in DB query to narrow down logs
      constraints.push(where('email', '==', searchQuery.trim()));
      // We do NOT add orderBy('createdAt') or date range constraints here
      // to avoid needing a composite index!
    } else {
      // Normal browse/date filter mode
      constraints.push(orderBy('createdAt', 'desc'));
      if (fromDate) {
        constraints.push(where('createdAt', '>=', new Date(fromDate + "T00:00:00")));
      }
      if (toDate) {
        constraints.push(where('createdAt', '<=', new Date(toDate + "T23:59:59")));
      }
    }
    return constraints;
  }, [fromDate, toDate, searchQuery]);

  useEffect(() => {
    fetchData({ constraints: getConstraints() });
  }, [fetchData, getConstraints]);

  // Filter and sort logs on the client side if searchQuery is active
  const processedLogs = React.useMemo(() => {
    let result = [...logs];
    if (searchQuery) {
      // Apply date filters client-side
      if (fromDate) {
        const start = new Date(fromDate + "T00:00:00").getTime();
        result = result.filter(log => {
          const time = log.createdAt?.seconds ? log.createdAt.seconds * 1000 : new Date(log.createdAt).getTime();
          return time >= start;
        });
      }
      if (toDate) {
        const end = new Date(toDate + "T23:59:59").getTime();
        result = result.filter(log => {
          const time = log.createdAt?.seconds ? log.createdAt.seconds * 1000 : new Date(log.createdAt).getTime();
          return time <= end;
        });
      }
      // Sort by createdAt descending client-side
      result.sort((a, b) => {
        const timeA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : new Date(a.createdAt).getTime();
        const timeB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : new Date(b.createdAt).getTime();
        return timeB - timeA;
      });
    }
    return result;
  }, [logs, searchQuery, fromDate, toDate]);

  const handleLoadMore = () => {
    fetchData({
      constraints: getConstraints(),
      isLoadMore: true
    });
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return { time: 'N/A', date: 'N/A' };
    const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    return {
      time: date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      date: date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }),
    };
  };

  const handleExport = () => {
    exportToExcel(processedLogs, {
      adminName: 'Administrator Name',
      email: 'Email Address',
      action: 'Action Type',
      details: 'Description',
      timestamp: 'Timestamp'
    }, 'AdminLogs');
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <SectionHeader
        title="Admin Logs"
        subtitle="Monitor system activities, configuration changes, and administrator actions."
        onExportClick={handleExport}
      />

      <div className="pb-10">
        <Table
          headers={['Sl No', 'Administrator', 'Email Address', 'Action Type', 'Description', 'Timestamp']}
          data={processedLogs}
          searchQuery={searchTerm}
          setSearchQuery={setSearchTerm}
          activeFilter={searchQuery} // We'll use searchQuery as a dummy to trigger the search button logic if needed, or just sync them
          setActiveFilter={setSearchQuery}
          onClear={() => {
            setSearchTerm('');
            setSearchQuery('');
            setFromDate('');
            setToDate('');
          }}
          fromDate={fromDate}
          setFromDate={setFromDate}
          toDate={toDate}
          setToDate={setToDate}
          searchPlaceholder="Search logs by email..."
          filterOptions={[]} // No status filter for logs yet, or we could add one if needed
          renderRow={(log, idx) => {
            const { time, date } = formatTimestamp(log.createdAt);
            return (
              <>
                <td className="px-8 py-4 text-[13px] font-black text-slate-800">{idx + 1}</td>
                <td className="px-8 py-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600 font-black text-[11px] border border-primary-100 mr-3">
                      {(log.email || '?').charAt(0).toUpperCase()}
                    </div>
                    <span className="text-[13px] font-black text-slate-800">{log.name || 'N/A'}</span>
                  </div>
                </td>
                <td className="px-8 py-4">
                  <span className="text-[13px] font-black text-slate-600">{log.email || 'N/A'}</span>
                </td>
                <td className="px-8 py-4">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-black uppercase tracking-tighter">
                    {log.action || 'N/A'}
                  </span>
                </td>
                <td className="px-8 py-4">
                  <p className="text-[13px] font-black text-slate-600 max-w-xs truncate">{log.description || 'N/A'}</p>
                </td>
                <td className="px-8 py-4 whitespace-nowrap">
                  <div className="text-[13px] font-black text-slate-900">{time}</div>
                  <div className="text-[10px] font-bold text-slate-500 mt-0.5 uppercase tracking-tighter">{date}</div>
                </td>
              </>
            );
          }}
        />

        {hasMore && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleLoadMore}
              disabled={loading}
              className="px-8 py-3 bg-white border border-slate-200 text-slate-500 font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-95 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? 'Synchronizing...' : 'Load More Activity Data'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}