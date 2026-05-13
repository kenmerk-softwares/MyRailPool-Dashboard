import React from "react";
import { FaCalendarAlt } from "react-icons/fa";
import { Search } from "lucide-react";

const SearchFilter = ({ placeholder, searchQuery, setSearchQuery }) => {
	return (
		<div className="hidden sm:flex flex-1 max-w-xl ml-4 lg:ml-0">
			<div className="relative group w-full">
				<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-500 transition-colors">
					<Search className="h-4 w-4 md:h-5 md:w-5" />
				</div>
				<input
					type="text"
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="block w-full pl-10 md:pl-11 pr-4 py-2 md:py-2.5 bg-slate-50 border border-transparent rounded-xl text-xs md:text-sm placeholder-slate-400 focus:border-primary-500 focus:bg-white focus:ring focus:ring-primary-500/20 transition-all duration-200"
					placeholder={placeholder || "Search..."}
				/>
			</div>
		</div>
	);
};

const DateFilter = ({ fromDate, setFromDate, toDate, setToDate, setActiveFilter }) => {
	return (
		<div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
			<FaCalendarAlt className="text-gray-400 text-xs" />
			<input
				type="date"
				value={fromDate}
				onChange={(e) => {
					setFromDate(e.target.value);
					if (setActiveFilter) setActiveFilter(null);
				}}
				className="bg-transparent border-none outline-none text-sm text-gray-600 w-32"
			/>
			<span className="text-gray-300">|</span>
			<input
				type="date"
				value={toDate}
				onChange={(e) => {
					setToDate(e.target.value);
					if (setActiveFilter) setActiveFilter(null);
				}}
				className="bg-transparent border-none outline-none text-sm text-gray-600 w-32"
			/>
		</div>
	);
};

const SortFilter = ({ activeFilter, setActiveFilter, options, onClear }) => {
	return (
		<div className="flex items-center gap-3">
			<select
				value={activeFilter || ""}
				onChange={(e) => setActiveFilter(e.target.value)}
				className="border border-slate-200 rounded-xl px-4 py-2 text-xs md:text-sm outline-none focus:border-primary-500 transition-all bg-white"
			>
				<option value="">All</option>
				{options?.map((opt) => (
					<option key={opt.value} value={opt.value}>
						{opt.label}
					</option>
				))}
			</select>
			<button
				onClick={onClear}
				className="bg-red-500 text-white px-4 py-2 rounded-xl text-xs md:text-sm hover:bg-red-600 transition-colors"
			>
				Clear
			</button>
		</div>
	);
};

export const Filter = ({
	searchPlaceholder,
	searchQuery,
	setSearchQuery,
	fromDate,
	setFromDate,
	toDate,
	setToDate,
	activeFilter,
	setActiveFilter,
	options,
	onClear,
}) => {
	return (
		<div className="flex flex-col md:flex-row items-center justify-between gap-4 px-6 py-4">

			<SearchFilter
				placeholder={searchPlaceholder}
				searchQuery={searchQuery}
				setSearchQuery={setSearchQuery}
			/>
			<div className="flex flex-wrap items-center gap-4">
				{setFromDate && setToDate && (
					<DateFilter
						fromDate={fromDate}
						setFromDate={setFromDate}
						toDate={toDate}
						setToDate={setToDate}
						setActiveFilter={setActiveFilter}
					/>
				)}
				<SortFilter
					activeFilter={activeFilter}
					setActiveFilter={setActiveFilter}
					options={options}
					onClear={onClear}
				/>
			</div>
		</div>
	);
};

export { SearchFilter, DateFilter, SortFilter };