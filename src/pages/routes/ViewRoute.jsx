import React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
	MapPin,
	Clock,
	Navigation,
	TrendingUp,
	User,
	Car,
	Calendar,
	ArrowLeft,
	ArrowRightLeft,
	Edit,
	Info,
	Clock3,
	Map,
	Route as RouteIcon
} from 'lucide-react';
import { SectionHeader, StatusBadge } from '../../components/Shared';
import { routesData } from '../../data/mockData';

export default function ViewRoute() {
	const { id } = useParams();
	const route = routesData.find(r => r.id.replace('#', '') === id);

	if (!route) {
		return (
			<div className="p-8 text-center bg-white rounded-2xl border border-slate-100 shadow-sm animate-in fade-in duration-500">
				<h3 className="text-xl font-bold text-slate-800">Route not found</h3>
				<Link
					to="/routes"
					className="mt-4 inline-block px-6 py-2 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
				>
					Back to Routes
				</Link>
			</div>
		);
	}

	const metrics = [
		{ label: 'Total Distance', value: route.distance, icon: Map, color: 'text-blue-600', bg: 'bg-blue-50' },
		{ label: 'Estimated Price', value: route.estPrice, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
		{ label: 'Route Type', value: route.route_type.replace('_', ' '), icon: RouteIcon, color: 'text-indigo-600', bg: 'bg-indigo-50', isCaps: true },
		{ label: 'Active Status', value: route.status, icon: Info, color: 'text-amber-600', bg: 'bg-amber-50' },
	];

	return (
		<div className="animate-in fade-in duration-500 pb-12">

			<SectionHeader
				title={route.name}
				subtitle={`Configuration and scheduling for route ${route.id}`}
				actionLabel="Edit Route"
				actionIcon={Edit}
				actionTo={`/routes/edit/${id}`}
			/>

			{/* Metrics */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
				{metrics.map((m, i) => (
					<div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
						<div className={`p-3 rounded-xl ${m.bg} ${m.color}`}>
							<m.icon className="w-6 h-6" />
						</div>
						<div>
							<p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">{m.label}</p>
							<p className={`text-xl font-bold text-slate-800 ${m.isCaps ? 'capitalize' : ''}`}>{m.value}</p>
						</div>
					</div>
				))}
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Main Path Info */}
				<div className="lg:col-span-2 space-y-6">
					<div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
						<div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
							<Navigation className="w-5 h-5 text-primary-600" />
							<h3 className="font-bold text-slate-800 tracking-tight">Standard Travel Path</h3>
						</div>
						<div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-indigo-200 transition-colors">
								<div className="flex items-center gap-3 mb-3">
									<div className="p-2 bg-white rounded-lg shadow-sm text-indigo-500">
										<MapPin className="w-4 h-4" />
									</div>
									<span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Starting Point</span>
								</div>
								<h4 className="text-xl font-bold text-slate-800">{route.start}</h4>
								<div className="mt-2 flex items-center gap-2 text-sm text-slate-500 font-medium">
									<Clock className="w-4 h-4 text-emerald-600" />
									Active Pickup Zone
								</div>
							</div>

							<div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-emerald-200 transition-colors">
								<div className="flex items-center gap-3 mb-3">
									<div className="p-2 bg-white rounded-lg shadow-sm text-emerald-500">
										<MapPin className="w-4 h-4" />
									</div>
									<span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Primary Destination</span>
								</div>
								<p className="text-lg font-bold text-slate-800">{route.end || 'Not Applicable'}</p>
								<div className="mt-2 flex items-center gap-2 text-sm text-slate-500 font-medium">
									<Navigation className="w-4 h-4 text-emerald-600" />
									Standard Arrival Terminal
								</div>                          
							</div>
						</div>
					</div>

					{/* Operational Schedule */}
					<div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
						<div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
							<Clock3 className="w-5 h-5 text-indigo-600" />
							<h3 className="font-bold text-slate-800 tracking-tight">Active Schedule</h3>
						</div>
						<div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-indigo-200 transition-colors">
								<div className="flex items-center gap-3 mb-3">
									<div className="p-2 bg-white rounded-lg shadow-sm text-indigo-500">
										<Calendar className="w-4 h-4" />
									</div>
									<span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Outbound Timing</span>
								</div>
								<p className="text-lg font-bold text-slate-800">{route.timings}</p>
								{/* <p className="text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-widest leading-none">Monday - Sunday</p> */}
							</div>

							<div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-emerald-200 transition-colors">
								<div className="flex items-center gap-3 mb-3">
									<div className="p-2 bg-white rounded-lg shadow-sm text-emerald-500">
										<ArrowRightLeft className="w-4 h-4" />
									</div>
									<span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Return Timing</span>
								</div>
								<p className="text-lg font-bold text-slate-800">{route.return_timing || 'Not Applicable'}</p>
								{/* <p className="text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-widest leading-none">Monday - Sunday</p> */}
							</div>
						</div>
					</div>
				</div>

				{/* Sidebar Details */}
				<div className="space-y-6">
					{/* Assignment Card */}
					<div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
						<div className="px-6 py-4 border-b border-slate-100 bg-slate-50/30 flex items-center gap-3">
							<User className="w-5 h-5 text-blue-600" />
							<h3 className="font-bold text-slate-800">Primary Assignment</h3>
						</div>
						<div className="p-6 space-y-6">
							{/* Driver */}
							<div className="flex items-center gap-4">
								<div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-900 font-bold text-lg border border-slate-200 shadow-sm">
									{route.driver.charAt(0)}
								</div>
								<div>
									<p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Assigned Driver</p>
									<p className="text-base font-bold text-slate-800 group-hover:text-primary-600 transition-colors">{route.driver}</p>
								</div>
							</div>

							{/* Vehicle */}
							<div className="flex items-start gap-4 pt-4 border-t border-slate-50">
								<div className="p-2 bg-slate-100/50 rounded-xl text-slate-400">
									<Car className="w-5 h-5 text-emerald-600" />
								</div>
								<div className="flex-1">
									<p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Standard Vehicle</p>
									<p className="text-sm font-bold text-slate-800 leading-tight">{route.vehicle}</p>
									{route.vehicle !== 'Unassigned' && (
										<span className="inline-block mt-2 px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded uppercase tracking-wide">Primary Asset</span>
									)}
								</div>
							</div>
						</div>
					</div>

					{/* Quick Stats/Summary Card */}
					{/* <div className="bg-white rounded-3xl p-6 text-white shadow-xl shadow-slate-200">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Execution Summary</h4>
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-slate-400">Status</span>
                                <StatusBadge status={route.status} statusColor={route.status === 'Active' ? 'success' : 'slate'} />
                            </div>
                            <div className="flex justify-between items-center group">
                                <span className="text-sm font-medium text-slate-400 group-hover:text-slate-200 transition-colors">Daily Frequency</span>
                                <span className="text-sm font-bold">Planned</span>
                            </div>
                            <div className="h-[1px] bg-white/10 w-full"></div>
                            <div className="pt-2">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-white/10 rounded-xl">
                                        <Navigation className="w-4 h-4 text-primary-400" />
                                    </div>
                                    <span className="text-sm font-bold tracking-tight">Automated Dispatch</span>
                                </div>
                            </div>
                        </div>
                    </div> */}
				</div>
			</div>
		</div>
	);
}