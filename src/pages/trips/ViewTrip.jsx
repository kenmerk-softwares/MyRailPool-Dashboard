import React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
	Clock,
	MapPin,
	Users,
	Car,
	DollarSign,
	Navigation,
	Leaf,
	FileText,
	Calendar,
	Edit,
	ArrowLeft,
	TrendingUp,
	CreditCard,
	Briefcase
} from 'lucide-react';
import { SectionHeader, StatusBadge } from '../../components/Shared';
import { tripsData } from '../../data/mockData';

export const ViewTrip = () => {
	const { id } = useParams();
	const trip = tripsData.find(t => t.id.replace('#', '') === id);

	if (!trip) {
		return (
			<div className="p-8 text-center bg-white rounded-2xl border border-slate-100 shadow-sm animate-in fade-in duration-500">
				<h3 className="text-xl font-bold text-slate-800 text-center justify-center">Trip not found</h3>
				<Link
					to="/trips"
					className="mt-4 inline-block px-6 py-2 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
				>
					Back to Trips
				</Link>
			</div>
		);
	}

	const stats = [
		{ label: 'Total Bookings', value: trip.total_bookings, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
		{ label: 'Passengers', value: trip.passenger_count, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
		{ label: 'Total Price', value: trip.price, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
		{ label: 'Net Profit', value: `₹${trip.profit}`, icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
	];

	return (
		<div className="animate-in fade-in duration-500 pb-12">
			<SectionHeader
				title={`Trip ${trip.id}`}
				subtitle={`Overview of route ${trip.route} on ${trip.date}`}
				actionLabel="Edit Trip"
				actionIcon={Edit}
				actionTo={`/trips/edit/${id}`}
			/>

			{/* Quick Stats */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
				{stats.map((stat, i) => (
					<div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
						<div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
							<stat.icon className="w-6 h-6" />
						</div>
						<div>
							<p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">{stat.label}</p>
							<p className="text-xl font-bold text-slate-800">{stat.value}</p>
						</div>
					</div>
				))}
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Journey Details */}
				<div className="lg:col-span-2 space-y-6">
					<div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
						<div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
							<Navigation className="w-5 h-5 text-primary-600" />
							<h3 className="font-bold text-slate-800">Journey Information</h3>
						</div>
						<div className="p-6 md:p-8">
							<div className="flex flex-col md:flex-row items-stretch gap-8">
								{/* Route flow visual */}
								<div className="flex-1 space-y-8">
									<div className="flex items-start gap-4">
										<div className="flex flex-col items-center">
											<div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center shrink-0 border-2 border-white shadow-sm">
												<MapPin className="w-5 h-5 text-primary-600" />
											</div>
											<div className="w-0.5 h-12 bg-slate-100 my-1"></div>
											<div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 border-2 border-white shadow-sm">
												<MapPin className="w-5 h-5 text-emerald-600" />
											</div>
										</div>
										<div className="flex-1 space-y-12 py-1">
											<div>
												<p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pickup Point</p>
												<p className="text-lg font-bold text-slate-800">{trip.start_location}</p>
												<p className="text-sm font-medium text-slate-500">{trip.start_time}</p>
											</div>
											<div>
												<p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Dropoff Point</p>
												<p className="text-lg font-bold text-slate-800">{trip.end_location}</p>
												<p className="text-sm font-medium text-slate-500">{trip.end_time}</p>
											</div>
										</div>
									</div>
								</div>

								<div className="hidden md:block w-[1px] bg-slate-100"></div>

								<div className="flex-1 flex flex-col justify-center gap-4">
									<div className="flex justify-between items-center p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50">
										<div className="flex items-center gap-3">
											<div className="p-2 bg-white rounded-lg shadow-sm">
												<Calendar className="w-4 h-4 text-slate-400" />
											</div>
											<span className="text-sm font-medium text-slate-600">Travel Date</span>
										</div>
										<span className="text-sm font-bold text-slate-800">{trip.date}</span>
									</div>
									<div className="flex justify-between items-center p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50">
										<div className="flex items-center gap-3">
											<div className="p-2 bg-white rounded-lg shadow-sm">
												<Clock className="w-4 h-4 text-slate-400" />
											</div>
											<span className="text-sm font-medium text-slate-600">Trip Status</span>
										</div>
										<StatusBadge status={trip.status} statusColor={trip.status === 'In Transit' ? 'primary' : trip.status === 'Pending' ? 'warning' : 'success'} />
									</div>
									<div className="flex justify-between items-center p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50">
										<div className="flex items-center gap-3">
											<div className="p-2 bg-white rounded-lg shadow-sm">
												<FileText className="w-4 h-4 text-slate-400" />
											</div>
											<span className="text-sm font-medium text-slate-600">Booking ID</span>
										</div>
										<span className="text-sm font-bold text-slate-800">{trip.booking_id}</span>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Impact Grid */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between">
							<div className="flex items-center justify-between mb-2">
								<h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
									<Leaf className="w-4 h-4 text-emerald-500" />
									Eco Impact
								</h4>
								{/* <div className="px-2 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-md uppercase">Green Trip</div> */}
							</div>
							<div className="space-y-4">
								<div className="flex justify-between items-end">
									<span className="text-xs font-medium text-slate-500">Journey Distance</span>
									<span className="text-lg font-bold text-slate-800">{trip.journey_miles} <span className="text-xs font-medium text-slate-400">km</span></span>
								</div>
								<div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
									<div className="bg-emerald-500 h-full w-3/4 rounded-full"></div>
								</div>
								<div className="flex justify-between items-center pt-2">
									<div className="flex flex-col">
										<span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">CO2 Saved</span>
										<span className="text-base font-bold text-emerald-600">{trip.co2_saved} kg</span>
									</div>
									<div className="flex flex-col text-right">
										<span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Fuel Saved</span>
										<span className="text-base font-bold text-slate-800">{trip.saved_money} L</span>
									</div>
								</div>
							</div>
						</div>
						<div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
							<h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
								<CreditCard className="w-4 h-4 text-primary-500" />
								Financial Breakdown
							</h4>
							<div className="space-y-4">
								<div className="flex justify-between items-center group">
									<span className="text-sm text-slate-500 group-hover:text-slate-700 transition-colors">Gross Fare</span>
									<span className="text-sm font-bold text-slate-800">{trip.price}</span>
								</div>
								<div className="flex justify-between items-center group">
									<span className="text-sm text-slate-500 group-hover:text-slate-700 transition-colors">Driver Payout</span>
									<span className="text-sm font-bold text-red-500">- ₹{trip.driver_salary}</span>
								</div>
								<div className="flex justify-between items-center group">
									<span className="text-sm text-slate-500 group-hover:text-slate-700 transition-colors">Taxes & Fees</span>
									<span className="text-sm font-bold text-slate-400">₹0.00</span>
								</div>
								<div className="pt-4 border-t border-slate-50 flex justify-between items-center">
									<span className="text-sm font-bold text-slate-900">Profit</span>
									<div className="flex items-center gap-2">
										<TrendingUp className="w-4 h-4 text-emerald-500" />
										<span className="text-lg font-bold text-emerald-600">₹{trip.profit}</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Sidebar Details */}
				<div className="space-y-6">
					{/* Assignment Card */}
					<div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
						<div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
							<Briefcase className="w-5 h-5 text-indigo-600" />
							<h3 className="font-bold text-slate-800">Resources</h3>
						</div>
						<div className="p-6 flex flex-col gap-6">
							{/* Driver Info */}
							<div className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-2xl transition-colors cursor-pointer border border-transparent hover:border-slate-100">
								<div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center text-slate-800 font-bold text-xl border border-slate-200 shadow-sm">
									{trip.driver.charAt(0)}
								</div>
								<div>
									<p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Assigned Driver</p>
									<p className="text-base font-bold text-slate-800 group-hover:text-primary-600 transition-colors flex items-center gap-1">
										{trip.driver}
										<ArrowLeft className="w-3 h-3 rotate-180 text-slate-300" />
									</p>
									<p className="text-[10px] font-medium text-slate-500">ID: {trip.driver_license.slice(-4)}</p>
								</div>
							</div>

							{/* Vehicle Info */}
							<div className="space-y-4 pt-2">
								<div className="flex items-start gap-4">
									<div className="p-2 bg-slate-100/50 rounded-xl text-slate-500">
										<Car className="w-5 h-5" />
									</div>
									<div>
										<p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Vehicle Asset</p>
										<p className="text-sm font-bold text-slate-800 leading-tight">{trip.vehicle}</p>
										<span className="inline-block mt-1.5 px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded uppercase tracking-wide">Premium Sedan</span>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Operational Notes */}
					<div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
						<div className="flex items-center gap-3 mb-4">
							<div className="p-2 bg-amber-50 rounded-xl text-amber-600">
								<FileText className="w-4 h-4" />
							</div>
							<h4 className="text-sm font-bold text-slate-900">Trip Remarks</h4>
						</div>
						<div className="p-4 bg-amber-50/30 rounded-2xl border border-amber-100/50">
							<p className="text-sm text-amber-900/70 font-medium leading-relaxed">
								{trip.notes || 'No operational notes recorded for this trip. The mission is progressing as scheduled.'}
							</p>
						</div>
					</div>

					{/* Execution Timeline (If exists) */}
					{(trip.actual_destination || trip.actual_dropoff_time) && (
						<div className="bg-white rounded-3xl p-6 text-gray-500 shadow-lg shadow-emerald-100">
							<div className="flex items-center gap-3 mb-6">
								<div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
									<Clock className="w-4 h-4 text-white" />
								</div>
								<h4 className="text-sm font-bold uppercase tracking-wider">Completion Data</h4>
							</div>
							<div className="space-y-5">
								<div>
									<p className="text-[10px] font-bold text-emerald-900 uppercase tracking-widest mb-1.5 opacity-80">Actual Destination</p>
									<p className="text-sm font-bold flex items-center gap-2">
										<MapPin className="w-3 h-3 text-emerald-900" />
										{trip.actual_destination}
									</p>
								</div>
								<div className="h-[1px] bg-white/10 w-full"></div>
								<div>
									<p className="text-[10px] font-bold text-emerald-900 uppercase tracking-widest mb-1.5 opacity-80">Execution Time</p>
									<p className="text-sm font-bold flex items-center gap-2">
										<Clock className="w-3 h-3 text-emerald-900" />
										{trip.actual_dropoff_time}
									</p>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};