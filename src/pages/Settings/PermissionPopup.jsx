import React from 'react';
import { FaTimes } from 'react-icons/fa';
import { designations } from '../../data/mockData';

const systemRoutes = [
	{ name: 'Dashboard', path: '/' },
	{ name: 'Bookings', path: '/bookings' },
	{ name: 'Trips', path: '/trips' },
	{ name: 'Routes', path: '/routes' },
	{ name: 'Drivers', path: '/drivers' },
	{ name: 'Vehicles', path: '/vehicles' },
	{ name: 'Notifications', path: '/notifications' },
	{ name: 'Admin Users', path: '/admin-users' },
	{ name: 'Admin Settings', path: '/admin-settings' },
];

export const PermissionPopup = ({ isOpen, onClose }) => {
	const [selectedDesignation, setSelectedDesignation] = React.useState('');
	const [allRoutes, setAllRoutes] = React.useState(systemRoutes);
	const [currentDesignationRoutes, setCurrentDesignationRoutes] = React.useState([]);
	const [saving, setSaving] = React.useState(false);

	const handleSelectAll = () => {
		const allPaths = allRoutes.map(r => r.path);
		if (currentDesignationRoutes.length === allPaths.length) {
			setCurrentDesignationRoutes([]);
		} else {
			setCurrentDesignationRoutes(allPaths);
		}
	};

	const handleCheckboxChange = (path) => {
		if (currentDesignationRoutes.includes(path)) {
			setCurrentDesignationRoutes(currentDesignationRoutes.filter(p => p !== path));
		} else {
			setCurrentDesignationRoutes([...currentDesignationRoutes, path]);
		}
	};

	const handleSave = () => {
		setSaving(true);
		// Here you would save the permissions to your backend
		console.log('Saving permissions for designation:', selectedDesignation);
		console.log('Permissions:', currentDesignationRoutes);
		setTimeout(() => {
			setSaving(false);
			onClose();
		}, 1000);
	};
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000] backdrop-blur-sm animate-in fade-in duration-200">
			<div className="bg-white p-8 rounded-[20px] w-[90%] max-w-[600px] shadow-2xl animate-in slide-in-from-bottom-5 duration-300 flex flex-col max-h-[85vh]">
				<div className="flex justify-between items-center mb-6">
					<h2 className="m-0 text-green-900 text-xl font-bold">Permission Model</h2>
					<button className="bg-transparent border-none text-[1.25rem] text-slate-400 cursor-pointer p-2 rounded-lg transition-all duration-200 flex items-center justify-center hover:bg-slate-50 hover:text-slate-800" onClick={onClose}>
						<FaTimes />
					</button>
				</div>

				<div className="flex-1 overflow-y-hidden">

					<div className="mb-6">
						<label className="block mb-2 text-slate-600 font-medium">Select Designation</label>
						<select
							className="w-full p-3 border border-slate-200 rounded-lg bg-white text-base text-slate-800 outline-none focus:border-indigo-500"
							value={selectedDesignation}
							onChange={(e) => setSelectedDesignation(e.target.value)}
						>
							<option value="">-- Choose Designation --</option>
							{designations.map(desig => (
								<option key={desig.id} value={desig.id}>{desig.designationName}</option>
							))}
						</select>
					</div>

					{selectedDesignation && (
						<div className="space-y-4">
							<div className="flex justify-between items-center mb-4">
								<label className="m-0 text-slate-600 font-medium">
									Allowed Pages
								</label>
								<button
									type="button"
									onClick={handleSelectAll}
									className="bg-transparent border-none text-indigo-500 cursor-pointer font-semibold text-sm hover:text-indigo-700 transition-colors"
								>
									{allRoutes.every(r => currentDesignationRoutes.includes(r.path)) ? 'Deselect All' : 'Select All'}
								</button>
							</div>
							<div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4 overflow-y-auto pr-2 max-h-[400px]">
								{allRoutes.map((route, index) => (
									<label key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg cursor-pointer transition-colors duration-200 hover:bg-slate-100">
										<input
											type="checkbox"
											className="w-[18px] h-[18px] accent-indigo-500 cursor-pointer"
											checked={currentDesignationRoutes.includes(route.path)}
											onChange={() => handleCheckboxChange(route.path)}
										/>
										<span className="text-slate-700">{route.name}</span>
									</label>
								))}
							</div>
						</div>
					)}

					{!selectedDesignation && (
						<div className="text-center text-slate-400 py-8">
							Please select a designation to configure permissions.
						</div>
					)}

				</div>

				<div className="mt-6 flex justify-end border-t border-slate-200 pt-4 gap-3">
					<button className="bg-white border border-slate-200 text-slate-500 px-6 py-3 rounded-lg font-semibold cursor-pointer transition-all duration-200 hover:bg-slate-50 hover:text-slate-800 hover:border-slate-300" onClick={onClose}>
						Close
					</button>
					{selectedDesignation && (
						<button
							className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold cursor-pointer transition-all duration-200 hover:bg-indigo-700 disabled:bg-indigo-300"
							onClick={handleSave}
							disabled={saving}
						>
							{saving ? 'Saving...' : 'Save Permissions'}
						</button>
					)}
				</div>
			</div>
		</div>
	);
};