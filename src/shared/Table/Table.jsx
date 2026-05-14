import { Search } from 'lucide-react';
import { Filter } from '../../Filter/Filter';

export const Table = ({ 
  headers, 
  data, 
  renderRow, 
  actions,
  searchQuery, 
  setSearchQuery, 
  activeFilter, 
  setActiveFilter, 
  onClear,
  filterOptions,
  searchPlaceholder = "Search records...",
  fromDate,
  setFromDate,
  toDate,
  setToDate
}) => {
  return (
    <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
      <div className="border-b border-slate-50">
        <Filter 
          searchPlaceholder={searchPlaceholder}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          options={filterOptions}
          onClear={onClear}
          fromDate={fromDate}
          setFromDate={setFromDate}
          toDate={toDate}
          setToDate={setToDate}
        />
      </div>


      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/30">
              {headers.map((header, idx) => (
                <th key={idx} className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-slate-100">
                  {header}
                </th>
              ))}
              {actions && (
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-slate-100 text-center">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {data && data.length > 0 ? (
              data.map((item, index) => (
                <tr key={item.id || index} className="group hover:bg-slate-50/80 transition-all duration-300">
                  {renderRow(item, index)}
                  {actions && (

                    <td className="px-8 py-4 text-center">
                      <div className="flex items-center justify-center gap-2 transition-all duration-300 ">
                        {actions(item)}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={headers.length + (actions ? 1 : 0)} className="px-8 py-24 text-center">
                  <div className="flex flex-col items-center max-w-xs mx-auto">
                    <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner">
                      <Search className="w-10 h-10 text-slate-500" />
                    </div>
                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-2">No Records Found</h4>
                    <p className="text-xs text-slate-500 font-bold leading-relaxed">
                      We couldn't find any results matching your current filters or search query.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};