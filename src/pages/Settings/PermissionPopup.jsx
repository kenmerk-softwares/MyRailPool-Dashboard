import React, { useEffect } from 'react';
import { FaTimes, FaTrash, FaUserSlash } from 'react-icons/fa';
import { addDoc, collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { db, app } from '../../Config/Config';
import { useToast } from '../../hooks/ToastContext';

import { systemRoutes } from '../../App';

export const PermissionPopup = ({ isOpen, onClose, editData }) => {
	const { showToast } = useToast();
	const [permissionName, setPermissionName] = React.useState('');
	const [selectedDepartment, setSelectedDepartment] = React.useState('');
	const [selectedDesignation, setSelectedDesignation] = React.useState('');
	const [currentDesignationRoutes, setCurrentDesignationRoutes] = React.useState([]);
	const [saving, setSaving] = React.useState(false);
	const [departments, setDepartments] = React.useState([]);
	const [designations, setDesignations] = React.useState([]);
	const functions = getFunctions(app, "asia-south1");

	useEffect(() => {
		if (isOpen) {
			if (editData) {
				setPermissionName(editData.permissionName || '');
				setSelectedDepartment(editData.departmentId || '');
				setSelectedDesignation(editData.designationId || '');
				setCurrentDesignationRoutes(editData.permissions || []);
			} else {
				setPermissionName('');
				setSelectedDepartment('');
				setSelectedDesignation('');
				setCurrentDesignationRoutes([]);
			}
		}
	}, [isOpen, editData]);

	useEffect(() => {
		if (!isOpen) return;

		const qDept = query(collection(db, "departments"), orderBy("departmentName"));
		const unsubscribeDept = onSnapshot(qDept, (snapshot) => {
			const items = snapshot.docs.map(doc => ({
				id: doc.id,
				...doc.data()
			}));
			setDepartments(items);
		}, (err) => {
			console.error("Error fetching departments:", err);
		});

		const qDesig = query(collection(db, "designations"), orderBy("designationName"));
		const unsubscribeDesig = onSnapshot(qDesig, (snapshot) => {
			const items = snapshot.docs.map(doc => ({
				id: doc.id,
				...doc.data()
			}));
			setDesignations(items);
		}, (err) => {
			console.error("Error fetching designations:", err);
		});

		return () => {
			unsubscribeDept();
			unsubscribeDesig();
		};
	}, [isOpen]);
	const handleSelectAll = () => {
		const allPaths = systemRoutes.map(r => r.path);
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
		
		const payload = {
			permissionName: permissionName,
			departmentId: selectedDepartment,
			departmentName: departments.find(d => d.id === selectedDepartment)?.departmentName || '',
			designationId: selectedDesignation,
			designationName: designations.find(d => d.id === selectedDesignation)?.designationName || '',
			permissions: currentDesignationRoutes,
		};

		if (editData) {
			const editPermissionsFn = httpsCallable(functions, 'editPermissions');
			
			editPermissionsFn({ id: editData.id, payload: payload, operation: "edit" })
				.then((result) => {
					setSaving(false);
					if (result.data.success) {
						showToast("Permissions updated successfully!", "success");
						onClose();
					} else {
						showToast(result.data.error || "Error updating permissions", "error");
					}
				})
				.catch((err) => {
					setSaving(false);
					showToast("Error updating permissions", "error");
					console.error(err);
				});
		} else {
			const ref = collection(db, "permissions");
			addDoc(ref, {...payload, createdAt: new Date()}).then(() => {
				setSaving(false);
				showToast("Permissions saved successfully!", "success");
				onClose();
			}).catch((err) => {
				setSaving(false);
				showToast("Error saving permissions", "error");
				console.error(err);
			});
		}
	};

	const handleDelete = () => {
		if (!editData?.id) return;
		if (!window.confirm("Are you sure you want to delete this permission model?")) return;
		
		setSaving(true);
		const editPermissionsFn = httpsCallable(functions, 'editPermissions');
		
		editPermissionsFn({ id: editData.id, operation: "delete" })
			.then((result) => {
				setSaving(false);
				if (result.data.success) {
					showToast("Permission model deleted successfully", "success");
					onClose();
				} else {
					showToast(result.data.error || "Error deleting permission", "error");
				}
			})
			.catch((err) => {
				setSaving(false);
				showToast("Error deleting permission", "error");
				console.error(err);
			});
	};

	const handleRevoke = () => {
		if (!editData?.id) return;
		if (!window.confirm("Are you sure you want to revoke this permission from all assigned users?")) return;
		
		setSaving(true);
		const editPermissionsFn = httpsCallable(functions, 'editPermissions');
		
		editPermissionsFn({ id: editData.id, operation: "revoke" })
			.then((result) => {
				setSaving(false);
				if (result.data.success) {
					showToast("Permission revoked from all users successfully", "success");
					onClose();
				} else {
					showToast(result.data.error || "Error revoking permission", "error");
				}
			})
			.catch((err) => {
				setSaving(false);
				showToast("Error revoking permission", "error");
				console.error(err);
			});
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

					<div className="mb-4">
						<label className="block mb-2 text-slate-600 font-medium">Permission Name</label>
						<input
							type="text"
							className="w-full p-3 border border-slate-200 rounded-lg bg-white text-base text-slate-800 outline-none focus:border-indigo-500 placeholder:text-slate-400"
							placeholder="e.g. Manager Access, Viewer Access"
							value={permissionName}
							onChange={(e) => setPermissionName(e.target.value)}
						/>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
						<div>
							<label className="block mb-2 text-slate-600 font-medium">Select Department</label>
							<select
								className="w-full p-3 border border-slate-200 rounded-lg bg-white text-base text-slate-800 outline-none focus:border-indigo-500"
								value={selectedDepartment}
								onChange={(e) => setSelectedDepartment(e.target.value)}
							>
								<option value="">-- Choose Department --</option>
								{departments.map(dept => (
									<option key={dept.id} value={dept.id}>{dept.departmentName}</option>
								))}
							</select>
						</div>

						<div>
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
					</div>

					{selectedDepartment && selectedDesignation && (
						<div className="space-y-4">
							<div className="flex justify-between items-center mb-4">
								<label className="m-0 text-slate-600 font-medium">
									Allowed Pages
								</label>
								<button
									type="button"
									onClick={handleSelectAll}
									className="bg-transparent border-none text-emerald-500 cursor-pointer font-semibold text-sm hover:text-indigo-700 transition-colors"
								>
									{systemRoutes.every(r => currentDesignationRoutes.includes(r.path)) ? 'Deselect All' : 'Select All'}
								</button>
							</div>
							<div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4 overflow-y-auto pr-2 max-h-[400px]">
								{systemRoutes.map((route, index) => (
									<label key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg cursor-pointer transition-colors duration-200 hover:bg-slate-100">
										<input
											type="checkbox"
											className="w-[18px] h-[18px] accent-emerald-600 cursor-pointer"
											checked={currentDesignationRoutes.includes(route.path)}
											onChange={() => handleCheckboxChange(route.path)}
										/>
										<span className="text-slate-700">{route.name}</span>
									</label>
								))}
							</div>
						</div>
					)}

					{(!selectedDepartment || !selectedDesignation) && (
						<div className="text-center text-slate-400 py-8">
							Please select a department and designation to configure permissions.
						</div>
					)}

				</div>

				<div className="mt-6 flex justify-end border-t border-slate-200 pt-4 gap-3">
					<button className="bg-white border border-slate-200 text-slate-500 px-6 py-3 rounded-lg font-semibold cursor-pointer transition-all duration-200 hover:bg-slate-50 hover:text-slate-800 hover:border-slate-300" onClick={onClose}>
						Close
					</button>
					{editData && (
						<>
							<button
								className="bg-amber-500 text-white px-4 py-3 rounded-lg font-semibold cursor-pointer transition-all duration-200 hover:bg-amber-600 disabled:opacity-50 flex items-center gap-2"
								onClick={handleRevoke}
								disabled={saving}
								title="Revoke from all users"
							>
								<FaUserSlash className="w-4 h-4" /> Revoke
							</button>
							<button
								className="bg-red-500 text-white px-4 py-3 rounded-lg font-semibold cursor-pointer transition-all duration-200 hover:bg-red-600 disabled:opacity-50 flex items-center gap-2"
								onClick={handleDelete}
								disabled={saving}
							>
								<FaTrash className="w-4 h-4" /> Delete
							</button>
						</>
					)}
					{selectedDepartment && selectedDesignation && permissionName && (
						<button
							className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold cursor-pointer transition-all duration-200 hover:bg-emerald-700 disabled:bg-emerald-300"
							onClick={handleSave}
							disabled={saving}
						>
							{saving ? 'Saving...' : editData ? 'Update Permissions' : 'Save Permissions'}
						</button>
					)}
				</div>
			</div>
		</div>
	);
};