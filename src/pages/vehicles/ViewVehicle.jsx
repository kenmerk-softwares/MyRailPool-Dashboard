import React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
	Car,
	Shield,
	Calendar,
	User,
	Info,
	FileText,
	CheckCircle2,
	AlertCircle,
	ArrowLeft,
	Edit,
	CreditCard,
	Wind,
	ShieldCheck,
	Briefcase,
	Key,
	Hash
} from 'lucide-react';
import { SectionHeader, StatusBadge } from '../../components/Shared';
import { vehiclesData } from '../../data/mockData';

export const ViewVehicle = () => {
	const { id } = useParams();
	const vehicle = vehiclesData.find(v => v.id.replace('#', '') === id);

	if (!vehicle) {
		return (
			<div className="p-8 text-center bg-white rounded-2xl border border-slate-100 shadow-sm animate-in fade-in duration-500">
				<h3 className="text-xl font-bold text-slate-800 text-center animate-in">Vehicle not found</h3>
				<Link
					to="/vehicles"
					className="mt-4 inline-block px-6 py-2 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
				>
					Back to Vehicles
				</Link>
			</div>
		);
	}

	const specs = [
		{ label: 'Make', value: vehicle.make, icon: Car, color: 'text-blue-600', bg: 'bg-blue-50' },
		{ label: 'Model', value: vehicle.model, icon: Key, color: 'text-indigo-600', bg: 'bg-indigo-50' },
		{ label: 'Capacity', value: vehicle.capacity, icon: Wind, color: 'text-emerald-600', bg: 'bg-emerald-50' },
		{ label: 'Color', value: vehicle.colour, icon: Info, color: 'text-amber-600', bg: 'bg-amber-50' },
	];

	return (
		<div className="animate-in fade-in duration-500 pb-12">


			<SectionHeader
				title={`${vehicle.make} ${vehicle.model}`}
				subtitle={`Fleet details and insurance records for asset ${vehicle.id}`}
				actionLabel="Edit Vehicle"
				actionIcon={Edit}
				actionTo={`/vehicles/edit/${id}`}
			/>

			{/* Quick Specs */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
				{specs.map((spec, i) => (
					<div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
						<div className={`p-3 rounded-xl ${spec.bg} ${spec.color}`}>
							<spec.icon className="w-6 h-6" />
						</div>
						<div>
							<p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">{spec.label}</p>
							<p className="text-xl font-bold text-slate-800 capitalize">{spec.value}</p>
						</div>
					</div>
				))}
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Core Asset Information */}
				<div className="lg:col-span-2 space-y-6">
					<div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
						<div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
							<Hash className="w-5 h-5 text-primary-600" />
							<h3 className="font-bold text-slate-800 tracking-tight">Registration & Licensing</h3>
						</div>
						<div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 relative group">
								<p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 leading-none text-center">Registration No</p>
								<h4 className="text-2xl font-black text-slate-800 text-center tracking-wider font-mono">{vehicle.registration_no}</h4>
								<div className="absolute top-2 right-2 p-1.5 bg-white rounded-lg shadow-sm">
									<Car className="w-4 h-4 text-emerald-500" />
								</div>
							</div>

							<div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 relative group">
								<p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 leading-none text-center">Vehicle Licence</p>
								<h4 className="text-base font-bold text-slate-800 text-center tracking-tight">{vehicle.ph_vehicle_licence_no}</h4>
								<div className="absolute top-2 right-2 p-1.5 bg-white rounded-lg shadow-sm">
									<ShieldCheck className="w-4 h-4 text-emerald-500" />
								</div>
								<div className="mt-3 flex items-center justify-center gap-2 text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
									<Calendar className="w-3 h-3" />
									Exp: {vehicle.licence_expiry}
								</div>
							</div>
						</div>
					</div>

					{/* Insurance Policy */}
					<div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
						<div className="px-6 py-4 border-b border-slate-100 bg-slate-50/30 flex items-center gap-3">
							<Shield className="w-5 h-5 text-indigo-600" />
							<h3 className="font-bold text-slate-800 tracking-tight">Insurance Coverage</h3>
						</div>
						<div className="ps-5">
							<div className="flex flex-col md:flex-row items-stretch md:items-center gap-1">
								<div className="flex-1 space-y-6">
									<div>
										<p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Provider</p>
										<div className="flex items-center gap-3">
											<div className="p-2 bg-indigo-50 rounded-xl">
												<Briefcase className="w-5 h-5 text-emerald-600" />
											</div>
											<span className="text-md font-semibold text-slate-700">{vehicle.insurence_provider}</span>
										</div>
									</div>
									<div>
										<p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Policy Number</p>
										<div className="flex items-center gap-3">
											<div className="p-2 bg-indigo-50 rounded-xl">
												<CreditCard className="w-5 h-5 text-emerald-600" />
											</div>
											<span className="text-md font-semibold text-slate-700 tracking-wider font-mono">{vehicle.policy_no}</span>
										</div>
									</div>
								</div>
								<div className="flex-1 bg-gradient-to-br from-slate-50 to-white p-8 rounded-3xl border border-slate-100 flex flex-col items-center justify-center text-center">
									<div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-4 border-4 border-white shadow-sm">
										<CheckCircle2 className="w-6 h-6 text-emerald-600" />
									</div>
									<p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Coverage Valid Until</p>
									<p className="text-xl font-black text-slate-800">{vehicle.insurence_expiry}</p>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Sidebar Details */}
				<div className="space-y-6">
					{/* Assignment Card */}
					<div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
						<div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
							<User className="w-5 h-5 text-blue-600" />
							<h3 className="font-bold text-slate-800 tracking-tight">Primary Assignment</h3>
						</div>
						<div className="p-8">
							<div className="flex items-center gap-5 p-4 hover:bg-slate-50 rounded-2xl transition-all cursor-pointer border border-transparent hover:border-slate-100 group">
								<div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center text-slate-900 font-bold text-2xl border border-slate-200 group-hover:shadow-md transition-shadow">
									{vehicle.driver.charAt(0)}
								</div>
								<div className="flex flex-col text-center">
									<p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 leading-none text-center">Designated Driver</p>
									<p className="text-lg font-bold text-slate-800 group-hover:text-primary-600 transition-colors">{vehicle.driver}</p>
									<div className="mt-1.5 flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
										<div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
										Active User
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Operational Notes */}
					<div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 flex flex-col gap-6 text-center">
						<div className="flex items-center gap-3 text-center justify-center">
							<div className="p-2 bg-amber-50 rounded-xl text-amber-600 shadow-sm">
								<FileText className="w-5 h-5" />
							</div>
							<h4 className="text-sm font-bold text-slate-900 tracking-tight text-center">Asset Remarks</h4>
						</div>
						<div className="p-6 bg-slate-50/80 rounded-3xl border border-slate-100 relative group min-h-[120px] text-center">
							<p className="text-sm text-slate-600 italic leading-relaxed text-center">
								{vehicle.notes || 'No maintenance logs or special remarks recorded for this vehicle asset.'}
							</p>
							<div className="absolute bottom-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
								<Car className="w-12 h-12" />
							</div>
						</div>
					</div>

					{/* Quick Profile Summary */}
					{/* <div className="bg-white rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl shadow-slate-200 text-center">
						<div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
							<Key className="w-24 h-24" />
						</div>
						<div className="relative z-10 text-center">
							<h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-8 text-center">Asset Profile</h4>
							<div className="space-y-6">
								<div className="flex justify-between items-center group cursor-default text-center">
									<span className="text-sm font-medium text-slate-400 group-hover:text-slate-200 transition-colors">Operational Status</span>
									<StatusBadge status={vehicle.status} statusColor={vehicle.status.toLowerCase() === 'active' ? 'success' : 'warning'} />
								</div>
								<div className="flex justify-between items-center group cursor-default text-center">
									<span className="text-sm font-medium text-slate-400 group-hover:text-slate-200 transition-colors">Vehicle Type</span>
									<span className="text-sm font-bold tracking-widest opacity-80">{vehicle.type}</span>
								</div>
								<div className="h-[1px] bg-white/10 w-full my-8"></div>
								<div className="pt-2 text-center">
									<div className="flex items-center gap-3 mb-4 text-center justify-center">
										<div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
											<AlertCircle className="w-4 h-4 text-primary-400" />
										</div>
										<span className="text-sm font-bold tracking-tight text-center">Compliance Alert</span>
									</div>
								</div>
							</div>
						</div>
					</div> */}
				</div>
			</div>
		</div>
	);
};