// import React from "react";
// import { FaCalendarAlt } from "react-icons/fa";
// import { Search } from "lucide-react";

// const SearchFilter = ()=>{
// 	 return(
// 		<div className="hidden sm:flex flex-1 max-w-xl ml-4 lg:ml-0">
// 		<div className="relative group w-full">
// 		  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-500 transition-colors">
// 			<Search className="h-4 w-4 md:h-5 md:w-5" />
// 		  </div>
// 		  <input
// 			type="text"
// 			className="block w-full pl-10 md:pl-11 pr-4 py-2 md:py-2.5 bg-slate-50 border border-transparent rounded-xl text-xs md:text-sm placeholder-slate-400 focus:border-primary-500 focus:bg-white focus:ring focus:ring-primary-500/20 transition-all duration-200"
// 			placeholder="Search bookings, trips, drivers..."
// 		  />
// 		</div>
// 	  </div>

// 	 )
// }
// const DateFilter = ()=>{
// 	return(
// 		<div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
// 		<FaCalendarAlt className="text-gray-400 text-xs" />
// 		<input
// 		  type="date"
// 		  value={fromDate}
// 		  onChange={(e) => { setFromDate(e.target.value); setActiveFilter(null); }}
// 		  className="bg-transparent border-none outline-none text-sm text-gray-600 w-32"
// 		/>
// 		<span className="text-gray-300">|</span>
// 		<input
// 		  type="date"
// 		  value={toDate}
// 		  onChange={(e) => { setToDate(e.target.value); setActiveFilter(null); }}
// 		  className="bg-transparent border-none outline-none text-sm text-gray-600 w-32"
// 		/>
// 	  </div>
// 	 ) 
// }

// const SortFilter = ()=>{
// 	return(
// 		<div className="flex items-center gap-3">
// 		<select name="" id="" className="border border-slate-200 rounded-xl px-4 py-2 text-xs md:text-sm">
// 		  <option value="">All</option>
// 		  <option value="">Approved</option>
// 		  <option value="">Pending</option>
// 		  <option value="">Completed</option>
// 		  <option value="">Declined</option>
// 		</select>
// 		<button className="bg-red-500 text-white px-4 py-2 rounded-xl text-xs md:text-sm">Clear</button>
// 	  </div>	
// 	)
// }

// export { SearchFilter, DateFilter, SortFilter }