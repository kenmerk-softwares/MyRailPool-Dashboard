import { Award, Briefcase, Edit, Phone, Activity, MapPin, Calendar, Car, ShieldCheck, Plus, Search } from 'lucide-react';
import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { SectionHeader, StatusBadge } from '../../components/Shared';
import { driversData, tripsData } from '../../data/mockData';

export default function ViewDriver() {
	const { id } = useParams();
	const navigate = useNavigate();

	const selectedDriver = driversData.find(d => d.id.replace('#', '') === id);
	const driverTrips = selectedDriver ? tripsData.filter(t => t.driver === selectedDriver.name) : [];

	if (!selectedDriver) {
		return (
			<div className="p-8 text-center bg-white rounded-2xl border border-slate-100 shadow-sm animate-in fade-in duration-500">
				<h3 className="text-xl font-bold text-slate-800">Driver not found</h3>
				<Link
					to="/drivers"
					className="mt-4 inline-block px-6 py-2 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
				>
					Back to List
				</Link>
			</div>
		);
	}

	return (
		<div className="animate-in fade-in duration-500 pb-12">
			<SectionHeader
				title="Driver Portfolio"
				subtitle={`Detailed profile and assignment log for ${selectedDriver.name}`}
				actionLabel="Edit Profile"
				actionIcon={Edit}
				actionTo={`/drivers/edit/${selectedDriver.id.replace('#', '')}`}
			/>

			<div className="space-y-6 md:space-y-8">
				{/* Top Profile Card */}
				<div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-center gap-6 md:gap-10 relative overflow-hidden">
					<div className="relative shrink-0">
						<div className="w-20 h-20 md:w-28 md:h-28 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-900 font-bold text-3xl md:text-4xl border border-slate-100 uppercase shadow-sm">
							{selectedDriver.name.charAt(0)}
						</div>
						<div className="absolute -bottom-1 -right-1 w-8 h-8 md:w-10 md:h-10 bg-emerald-500 rounded-xl border-4 border-white flex items-center justify-center shadow-md">
							<ShieldCheck className="w-5 h-5 text-white" />
						</div>
					</div>

					<div className="flex-1 text-center md:text-left">
						<div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-3 md:mb-4 justify-center md:justify-start">
							<h3 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">{selectedDriver.name}</h3>
							<StatusBadge status={selectedDriver.status} statusColor={selectedDriver.status === 'Active' ? 'success' : 'warning'} />
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 text-slate-500 font-medium text-sm md:text-base">
							<div className="flex items-center gap-2 justify-center md:justify-start text-slate-600">
								<Phone className="w-4 h-4 text-primary-500" />
								{selectedDriver.phone}
							</div>
							<div className="flex items-center gap-2 justify-center md:justify-start text-slate-600 text-xs md:text-sm uppercase font-bold tracking-wider">
								<Award className="w-4 h-4 text-primary-500" />
								License: {selectedDriver.license}
							</div>
							<div className="flex items-center gap-2 justify-center md:justify-start">
								<MapPin className="w-4 h-4 text-primary-500" />
								<span className="text-slate-600">Main Transit Hub</span>
							</div>
							<div className="flex items-center gap-2 justify-center md:justify-start">
								<Briefcase className="w-4 h-4 text-primary-500" />
								<span className="text-slate-600">Exp: {selectedDriver.experience}</span>
							</div>
						</div>
					</div>

					<div className="w-full md:w-auto mt-4 md:mt-0 flex flex-row md:flex-col gap-3 justify-center">
						<div className="bg-slate-50 px-5 py-4 rounded-xl border border-slate-100 text-center min-w-[120px]">
							<p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Total Trips</p>
							<p className="text-xl md:text-2xl font-bold text-slate-800">{driverTrips.length}</p>
						</div>
					</div>
				</div>

				{/* Table*/}
				<div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
					<div className="p-4 md:p-6 border-b border-slate-100 bg-white flex justify-between items-center">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600">
								<Car className="w-5 h-5" />
							</div>
							<h3 className="text-base md:text-lg font-bold text-slate-800 tracking-tight">Recent Trip Assignments</h3>
						</div>

						<div className="flex items-center justify-between m-4">
							{/* Search Bar */}
							<div className="hidden sm:flex flex-1 max-w-xl ml-4 lg:ml-0">
								<div className="relative group w-full">
									<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-500 transition-colors">
										<Search className="h-4 w-4 md:h-5 md:w-5" />
									</div>
									<input
										type="text"
										className="block w-full pl-10 md:pl-11 pr-4 py-2 md:py-2.5 bg-slate-50 border border-transparent rounded-xl text-xs md:text-sm placeholder-slate-400 focus:border-primary-500 focus:bg-white focus:ring focus:ring-primary-500/20 transition-all duration-200"
										placeholder="Search drivers"
									/>
								</div>
							</div>
							<div className="flex items-center gap-3">
								<select name="" id="" className="border border-slate-200 rounded-xl px-4 py-2 text-xs md:text-sm">
									<option value="">All</option>
									<option value="">In Transit</option>
									<option value="">Assigned</option>
									<option value="">Pending</option>
									<option value="">Cancelled</option>
								</select>
								<button className="bg-red-500 text-white px-4 py-2 rounded-xl text-xs md:text-sm">Clear</button>
							</div>

						</div>
					</div>

					{driverTrips.length > 0 ? (
						<div className="overflow-x-auto">
							<table className="w-full text-left border-collapse min-w-[600px]">
								<thead>
									<tr className="bg-slate-50/50">
										<th className="px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100 text-center">Trip ID</th>
										<th className="px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100 text-center">Route</th>
										<th className="px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100 text-center">Schedule</th>
										<th className="px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100 text-center">Status</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-slate-100">
									{driverTrips.map((trip, idx) => (
										<tr key={idx} className="group hover:bg-slate-50/30 transition-colors">
											<td className="px-6 py-5 text-center">
												<span className="text-sm font-bold text-slate-800 truncate block max-w-[120px] text-center">{trip.id}</span>
											</td>
											<td className="px-6 py-5 text-center">
												<div className="flex items-center gap-3">
													<MapPin className="w-4 h-4 text-slate-300" />
													<span className="text-sm font-medium text-slate-700 text-center">{trip.route}</span>
												</div>
											</td>
											<td className="px-6 py-5 text-center">
												<span className="text-sm font-medium text-slate-600 text-center">{trip.date}</span>
											</td>
											<td className="px-6 py-5 text-center">
												<StatusBadge status={trip.status} statusColor={trip.status === 'In Transit' ? 'primary' : 'success'} />
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					) : (
						<div className="flex flex-col items-center justify-center py-20 bg-slate-50/10">
							<div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-300 mb-4">
								<Car className="w-8 h-8" />
							</div>
							<p className="text-slate-400 font-medium">No trip records found for this driver.</p>
						</div>
					)}
				</div>


			</div>
		</div>
	);
}
