import React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
	User,
	Phone,
	Mail,
	MapPin,
	Calendar,
	CreditCard,
	Car,
	Clock,
	Navigation,
	DollarSign,
	Info,
	Accessibility,
	Edit,
	ArrowLeft,
	CheckCircle2,
	AlertCircle,
	Briefcase,
	Layers,
	ShieldCheck,
	TrendingUp,
	Globe
} from 'lucide-react';
import { SectionHeader, StatusBadge } from '../../components/Shared';
import { bookingsData } from '../../data/mockData';

export const ViewBooking = () => {
	const { id } = useParams();
	const booking = bookingsData.find(b => b.id.replace('#', '') === id);

	if (!booking) {
		return (
			<div className="p-8 text-center bg-white rounded-2xl border border-slate-100 shadow-sm animate-in fade-in duration-500">
				<h3 className="text-xl font-bold text-slate-800 tracking-tight">Booking not found</h3>
				<Link
					to="/bookings"
					className="mt-4 inline-block px-6 py-2 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
				>
					Back to Bookings
				</Link>
			</div>
		);
	}

	const metrics = [
		{ label: 'Passenger Count', value: `${booking.passenger_count} Persons`, icon: Layers, color: 'text-blue-600', bg: 'bg-blue-50' },
		{ label: 'Quoted Fare', value: booking.fare_quoted, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
		{ label: 'Amount Paid', value: booking.amount_paid, icon: CreditCard, color: 'text-indigo-600', bg: 'bg-indigo-50' },
		{ label: 'Channel', value: booking.booking_channel, icon: Globe, color: 'text-amber-600', bg: 'bg-amber-50' },
	];

	return (
		<div className="animate-in fade-in duration-500 pb-12">
			<SectionHeader
				title={`Booking ${booking.id}`}
				subtitle={`Overview of request ${booking.req_id} for ${booking.name}`}
				actionLabel="Edit Booking"
				actionIcon={Edit}
				actionTo={`/bookings/edit/${id}`}
			/>

			{/* Quick Metrics */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
				{metrics.map((m, i) => (
					<div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
						<div className={`p-3 rounded-xl ${m.bg} ${m.color}`}>
							<m.icon className="w-6 h-6" />
						</div>
						<div>
							<p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">{m.label}</p>
							<p className="text-xl font-bold text-slate-800">{m.value}</p>
						</div>
					</div>
				))}
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Main Information */}
				<div className="lg:col-span-2 space-y-6">
					{/* Journey Path */}
					<div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
						<div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
							<Navigation className="w-5 h-5 text-primary-600" />
							<h3 className="font-bold text-slate-800 tracking-tight">Journey Timeline</h3>
						</div>
						<div className="p-8 md:p-10 relative">
							{/* Visual flow line */}
							<div className="absolute left-[2.75rem] top-[6rem] bottom-[6rem] w-0.5 border-l-2 border-slate-100 border-dashed hidden md:block"></div>

							<div className="space-y-12">
								<div className="flex items-start gap-6 relative">
									<div className="w-12 h-12 rounded-2xl bg-primary-100 flex items-center justify-center shrink-0 shadow-sm z-10 border-4 border-white">
										<MapPin className="w-6 h-6 text-primary-600" />
									</div>
									<div className="flex-1 pt-1">
										<div className="flex justify-between items-start">
											<div>
												<p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1 leading-none font-mono">Pickup Zone</p>
												<h4 className="text-lg font-bold text-slate-800">{booking.pickup_location}</h4>
											</div>
											<div className="text-right">
												<p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1 leading-none font-mono">Scheduled</p>
												<p className="text-sm font-bold text-slate-600 px-3 py-1 bg-slate-50 rounded-lg border border-slate-100">{booking.pickup_date}</p>
											</div>
										</div>
									</div>
								</div>

								<div className="flex items-start gap-6 relative">
									<div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center shrink-0 shadow-sm z-10 border-4 border-white">
										<MapPin className="w-6 h-6 text-indigo-600" />
									</div>
									<div className="flex-1 pt-1">
										<p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1 leading-none font-mono">Booked Destination</p>
										<h4 className="text-lg font-bold text-slate-800">{booking.booked_destination}</h4>
										<p className="text-xs text-slate-500 mt-2 font-medium flex items-center gap-1.5 font-mono">
											<Layers className="w-3 h-3" />
											Route: {booking.route}
										</p>
									</div>
								</div>

								<div className="flex items-start gap-6 relative">
									<div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center shrink-0 shadow-sm z-10 border-4 border-white">
										<CheckCircle2 className="w-6 h-6 text-emerald-600" />
									</div>
									<div className="flex-1 pt-1">
										<div className="flex justify-between items-start">
											<div>
												<p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1 leading-none font-mono">Actual Dropoff</p>
												<h4 className="text-lg font-bold text-slate-800">{booking.actual_dropoff || 'Pending Arrival'}</h4>
											</div>
											{booking.dropoff_time && (
												<div className="text-right">
													<p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1 leading-none font-mono">Time Recorded</p>
													<p className="text-sm font-bold text-emerald-600 px-3 py-1 bg-emerald-50 rounded-lg border border-emerald-100">{booking.dropoff_time}</p>
												</div>
											)}
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Customer Information Card */}
					<div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
						<div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
							<User className="w-5 h-5 text-indigo-600" />
							<h3 className="font-bold text-slate-800 tracking-tight">Customer Profile</h3>
						</div>
						<div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
							<div className="flex flex-col items-center md:items-start text-center md:text-left space-y-4">
								<div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center text-indigo-600 font-bold text-4xl border border-indigo-100 shadow-inner">
									{booking.name.charAt(0)}
								</div>
								<div>
									<h4 className="text-xl font-bold text-slate-800 leading-tight">{booking.name}</h4>
									<p className="text-sm font-medium text-slate-400 mt-1">Client since March 2026</p>
								</div>
							</div>

							<div className="md:col-span-2 space-y-6 flex flex-col justify-center">
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
									<div className="space-y-1.5 p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-blue-200 transition-colors">
										<p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 leading-none">
											<Mail className="w-3 h-3" /> Email Address
										</p>
										<p className="text-sm font-bold text-slate-800 group-hover:text-primary-600 transition-colors">{booking.email}</p>
									</div>
									<div className="space-y-1.5 p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-emerald-200 transition-colors">
										<p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 leading-none">
											<Phone className="w-3 h-3" /> Mobile Number
										</p>
										<p className="text-sm font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">{booking.phone}</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Sidebar */}
				<div className="space-y-6">
					{/* Status Card */}
					<div className="bg-white rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl shadow-slate-200">
						<div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
							<ShieldCheck className="w-24 h-24" />
						</div>
						<div className="relative z-10">
							<h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-8">Mission Status</h4>
							<div className="space-y-6">
								<div className="flex justify-between items-center group cursor-default">
									<span className="text-sm font-medium text-slate-500 group-hover:text-slate-200 transition-colors">Current Phase</span>
									<StatusBadge status={booking.status} statusColor={booking.statusColor} />
								</div>
								<div className="flex justify-between items-center group cursor-default">
									<span className="text-sm font-medium text-slate-500 group-hover:text-slate-200 transition-colors">Req ID</span>
									<span className="text-sm font-bold tracking-widest opacity-80">{booking.req_id}</span>
								</div>
								<div className="h-[1px] bg-white/10 w-full my-8"></div>
								<div className="pt-2">
									<div className="flex items-center gap-3 mb-4">
										<div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
											<CreditCard className="w-4 h-4 text-primary-400" />
										</div>
										<span className="text-sm font-bold tracking-tight">Financial Balance</span>
									</div>
									<div className="flex justify-between items-end">
										<p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Value</p>
										<p className="text-2xl font-black text-white">{booking.price}</p>
									</div>
									<p className="text-xs text-slate-400 mt-2 font-medium">Payment via {booking.payment_method.toUpperCase()}</p>
								</div>
							</div>
						</div>
					</div>

					{/* Operational Assignment */}
					<div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
						<div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
							<Briefcase className="w-5 h-5 text-indigo-600" />
							<h3 className="font-bold text-slate-800 tracking-tight">Dispatch Team</h3>
						</div>
						<div className="p-8 space-y-6">
							{booking.driver ? (
								<>
									<div className="flex items-center gap-4">
										<div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xl border border-indigo-100 shadow-sm">
											{booking.driver.charAt(0)}
										</div>
										<div>
											<p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Primary Driver</p>
											<p className="text-lg font-bold text-slate-800">{booking.driver}</p>
											<p className="text-[10px] font-medium text-slate-500">{booking.driverContact}</p>
										</div>
									</div>
									<div className="pt-6 border-t border-slate-50">
										<div className="flex items-center gap-3">
											<div className="p-2 bg-slate-100/50 rounded-xl text-slate-400">
												<Car className="w-4 h-4" />
											</div>
											<div>
												<p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 leading-none">Vehicle ID</p>
												<p className="text-sm font-bold text-slate-800 tracking-widest">{booking.vehicleNo}</p>
											</div>
										</div>
									</div>
								</>
							) : (
								<div className="py-6 flex flex-col items-center text-center">
									<div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mb-3 border border-slate-100/50">
										<AlertCircle className="w-6 h-6" />
									</div>
									<p className="text-sm font-bold text-slate-900">Unassigned</p>
									<p className="text-[10px] text-slate-400 px-4 mt-1 leading-relaxed">No driver or vehicle has been dispatched for this mission yet.</p>
								</div>
							)}
						</div>
					</div>

					{/* Fare Confirmation */}
					<div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 flex flex-col gap-6">
						<div className="flex items-center gap-3">
							<div className="p-2 bg-emerald-50 rounded-xl text-emerald-600 shadow-sm border border-emerald-100">
								<TrendingUp className="w-5 h-5" />
							</div>
							<h4 className="text-sm font-bold text-slate-900 tracking-tight">Fare Validation</h4>
						</div>
						<div className="space-y-4">
							<div className="flex justify-between items-center group">
								<span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Confirmed Status</span>
								<span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-lg uppercase border border-emerald-100">
									{booking.fare_confirm_status}
								</span>
							</div>
							<div className="flex justify-between items-center group">
								<span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Channel</span>
								<span className="text-sm font-bold text-slate-700 capitalize">{booking.fare_confirm_channel}</span>
							</div>
							<div className="pt-2">
								<p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 leading-none">Conf. Recorded On</p>
								<div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center font-mono text-xs font-bold text-slate-600">
									{booking.fare_confirm_date}
								</div>
							</div>
						</div>
					</div>

					{/* Accessibility */}
					<div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 flex flex-col gap-6">
						<div className="flex items-center gap-3">
							<div className="p-2 bg-amber-50 rounded-xl text-amber-600 shadow-sm border border-amber-100">
								<Accessibility className="w-5 h-5" />
							</div>
							<h4 className="text-sm font-bold text-slate-900 tracking-tight">Support Requirements</h4>
						</div>
						<div className="p-6 bg-slate-50/50 rounded-[2rem] border border-slate-100 relative group">
							<div className="flex justify-between items-center mb-3">
								<p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Needs</p>
								<span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${booking.accessibility_needs === 'yes' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
									{booking.accessibility_needs === 'yes' ? 'Required' : 'None'}
								</span>
							</div>
							<p className="text-sm text-slate-600 italic leading-relaxed">
								{booking.accessibility_datails || 'No special accessibility arrangements requested for this mission.'}
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};