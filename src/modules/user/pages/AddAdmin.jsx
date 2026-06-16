import React, { useState, useEffect } from 'react';
import { db } from '../../../shared/services/firebase'
import { useToast } from '../../../shared/hooks/ToastContext';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { X } from 'lucide-react';
import { FunctionsAPI } from '../../../shared/services/functions.api';

export default function AddAdmin({ isOpen, onClose, editData = null, onRefresh }) {
	const { showToast } = useToast();

	const [formData, setFormData] = useState({
		id: '',
		name: '',
		email: '',
		mobile: '',
		permissionId: '',
		department: '',
		password: '',
		confirmPassword: ''
	})

	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')
	const [permissions, setPermissions] = useState([])

	const fetchPermissions = async () => {
		const q = query(collection(db, "permissions"));
		const unsubscribe = onSnapshot(q, (snapshot) => {
			const items = snapshot.docs.map(doc => ({
				id: doc.id,
				...doc.data()
			}));
			setPermissions(items);
		}, (err) => {
			console.error("Error fetching permissions:", err);
		});
		return () => unsubscribe();
	}

	useEffect(() => {
		if (isOpen) {
			fetchPermissions();

			if (editData) {
				setFormData({
					id: editData.id || '',
					name: editData.name || '',
					email: editData.email || '',
					mobile: editData.mobile || '',
					permissionId: editData.permissionId || '',
					department: editData.department || '',
					password: '',
					confirmPassword: '',
				});
			} else {
				setFormData({
					id: '',
					name: '',
					email: '',
					mobile: '',
					permissionId: '',
					department: '',
					password: '',
					confirmPassword: '',
				});
			}
		}
	}, [isOpen, editData]);

	const handleChange = (e) => {
		const { name, value } = e.target
		if (name === 'permissionId') {
			const selectedPerm = permissions.find(p => p.id === value);
			setFormData(prev => ({
				...prev,
				permissionId: value,
				department: selectedPerm?.departmentName || '',
			}))
		} else {
			setFormData(prev => ({
				...prev,
				[name]: value
			}))
		}
	}

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");

		if (!editData) {
			if (formData.password !== formData.confirmPassword) {
				setError("Passwords do not match");
				setLoading(false);
				return;
			}
			if (!formData.password || !formData.email || !formData.name || !formData.mobile) {
				setError("Please fill all required fields");
				setLoading(false);
				return;
			}
		}

		setLoading(true);

		try {
			const selectedPerm = permissions.find((d) => d.id === formData.permissionId);
			const payload = {
				action: editData ? "edit" : "add",
				id: formData.id,
				name: formData.name,
				email: formData.email,
				mobile: formData.mobile,
				permissionId: formData.permissionId,
				designation: selectedPerm?.designationName || editData?.designation || "",
				department: formData.department,
			};

			if (!editData && formData.password) {
				payload.password = formData.password;
			}

			const data = await FunctionsAPI.addAdminUser(payload);

			if (data.success === true) {
				showToast(editData ? "Admin updated successfully!" : "Admin created successfully!", "success");
				if (onRefresh) onRefresh();
				onClose();
				return;
			}

			if (data.error) {
				setError(data.error);
				return;
			}

			setError(`Failed to ${editData ? "update" : "create"} admin. Please try again.`);
		} catch (err) {
			console.error(`${editData ? "Edit" : "Create"} admin error:`, err);
			setError(err.message || "Unexpected error occurred.");
		} finally {
			setLoading(false);
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
			<div
				className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
				onClick={onClose}
			/>

			<div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
				<div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
					<div>
						<h2 className="text-xl font-bold text-slate-800">{editData ? "Edit Admin User" : "Create New Admin"}</h2>
						<p className="text-sm text-slate-500 mt-0.5">
							{editData ? "Update the details of the existing administrator." : "Fill in the details to add a new administrator."}
						</p>
					</div>
					<button
						onClick={onClose}
						className="p-2 rounded-xl hover:bg-slate-200/50 text-slate-500 hover:text-slate-600 transition-colors"
					>
						<X className="w-5 h-5" />
					</button>
				</div>

				<div className="p-6 overflow-y-auto max-h-[calc(100vh-200px)]">
					<form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
						<div className="flex flex-col items-start w-full">
							<label htmlFor="name" className="mb-2 text-sm font-semibold text-slate-700">
								Full Name <span className="text-red-500">*</span>
							</label>
							<input
								type="text"
								id="name"
								name="name"
								className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all placeholder:text-slate-500 text-sm"
								value={formData.name}
								onChange={handleChange}
								placeholder="Full Name"
								required
							/>
						</div>

						<div className="flex flex-col items-start w-full">
							<label htmlFor="email" className="mb-2 text-sm font-semibold text-slate-700">
								Email Address <span className="text-red-500">*</span>
							</label>
							<input
								type="email"
								id="email"
								name="email"
								className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all placeholder:text-slate-500 text-sm"
								value={formData.email}
								onChange={handleChange}
								placeholder="Email Address"
								required
							/>
						</div>

						<div className="flex flex-col items-start w-full">
							<label htmlFor="mobile" className="mb-2 text-sm font-semibold text-slate-700">
								Mobile Number <span className="text-red-500">*</span>
							</label>
							<input
								type="tel"
								id="mobile"
								name="mobile"
								className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all placeholder:text-slate-500 text-sm"
								value={formData.mobile}
								onChange={handleChange}
								placeholder="Mobile Number"
								pattern="[0-9]{10}"
								required
							/>
						</div>

						<div className="flex flex-col items-start w-full">
							<label htmlFor="permissionId" className="mb-2 text-sm font-semibold text-slate-700">
								Permission Model
							</label>
							<select
								id="permissionId"
								name="permissionId"
								className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all bg-white text-sm"
								value={formData.permissionId}
								onChange={handleChange}
							>
								<option value="">Select Permission Model</option>
								{permissions.map((perm) => (
									<option key={perm.id} value={perm.id}>
										{perm.permissionName}
									</option>
								))}
							</select>
						</div>

						<div className="flex flex-col items-start w-full">
							<label htmlFor="department" className="mb-2 text-sm font-semibold text-slate-700">
								Department
							</label>
							<input
								type="text"
								id="department"
								name="department"
								className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 outline-none transition-all text-sm cursor-not-allowed"
								value={formData.department}
								readOnly
								placeholder="Auto-filled from Permission Model"
							/>
						</div>

						<div className="flex flex-col items-start w-full">
							<label htmlFor="designationId" className="mb-2 text-sm font-semibold text-slate-700">
								Designation
							</label>
							<input
								type="text"
								id="designationId"
								name="designation"
								className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 outline-none transition-all text-sm cursor-not-allowed"
								value={permissions.find(p => p.id === formData.permissionId)?.designationName || (editData ? editData.designation : '') || ''}
								readOnly
								placeholder="Auto-filled from Permission Model"
							/>
						</div>

						{!editData && (
							<>
								<div className="flex flex-col items-start w-full">
									<label htmlFor="password" className="mb-2 text-sm font-semibold text-slate-700">
										Password <span className="text-red-500">*</span>
									</label>
									<input
										type="password"
										id="password"
										name="password"
										className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all placeholder:text-slate-500 text-sm"
										value={formData.password}
										onChange={handleChange}
										placeholder="••••••••"
										required
									/>
								</div>

								<div className="flex flex-col items-start w-full">
									<label htmlFor="confirmPassword" className="mb-2 text-sm font-semibold text-slate-700">
										Confirm Password <span className="text-red-500">*</span>
									</label>
									<input
										type="password"
										id="confirmPassword"
										name="confirmPassword"
										className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all placeholder:text-slate-500 text-sm"
										value={formData.confirmPassword}
										onChange={handleChange}
										placeholder="••••••••"
										required
									/>
								</div>
							</>
						)}

						{error && <div className="text-red-500 text-xs font-medium col-span-full bg-red-50 p-3 rounded-lg border border-red-100">{error}</div>}

						<div className="flex items-center gap-5 mt-4 col-span-full">
							<button
								type="button"
								className="flex-1 px-6 py-4 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50 active:scale-[0.98] transition-all text-sm"
								onClick={onClose}
							>
								Cancel
							</button>
							<button
								type="submit"
								disabled={loading}
								className="flex-[2] px-1 py-4 rounded-xl bg-emerald-700 hover:bg-emerald-900 text-white font-semibold shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
							>
								{loading ? "Processing..." : editData ? "Update Admin Account" : "Create Admin Account"}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	)
}
