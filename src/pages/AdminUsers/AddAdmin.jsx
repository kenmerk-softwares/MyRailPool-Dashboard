import React, { useState, useEffect } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions'
import { app, db } from '../../Config/Config'
import { useToast } from '../../Toast/ToastContext';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { X } from 'lucide-react';

export default function AddAdmin({ isOpen, onClose, editData = null, onRefresh }) {
	const { showToast } = useToast();

	const [formData, setFormData] = useState({
		id: '',
		name: '',
		email: '',
		mobile: '',
		designationId: '',
		department: '',
		password: '',
		confirmPassword: ''
	})

	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')
	const [designations, setDesignations] = useState([])
	const [departments, setDepartments] = useState([])

	const fetchDepartments = async () => {
		const q = query(collection(db, "departments"));
		const unsubscribe = onSnapshot(q, (snapshot) => {
			const items = snapshot.docs.map(doc => ({
				id: doc.id,
				...doc.data()
			}));
			setDepartments(items);
		}, (err) => {
			console.error("Error fetching departments:", err);
		});
		return () => unsubscribe();
	}

	const fetchDesignations = async () => {
		const q = query(collection(db, "designations"), orderBy("designationName"));
		const unsubscribe = onSnapshot(q, (snapshot) => {
			const items = snapshot.docs.map(doc => ({
				id: doc.id,
				...doc.data()
			}));
			setDesignations(items);
		}, (err) => {
			console.error("Error fetching designations:", err);
		});
		return () => unsubscribe();
	}

	useEffect(() => {
		if (isOpen) {
			fetchDepartments();
			fetchDesignations();

			if (editData) {
				setFormData({
					id: editData.id || '',
					name: editData.name || '',
					email: editData.email || '',
					mobile: editData.mobile || '',
					designationId: editData.designationId || '',
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
					designationId: '',
					department: '',
					password: '',
					confirmPassword: '',
				});
			}
		}
	}, [isOpen, editData]);

	const handleChange = (e) => {
		const { name, value } = e.target
		setFormData(prev => ({
			...prev,
			[name]: value
		}))
	}

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");

		if (formData.password || formData.confirmPassword) {
			if (formData.password !== formData.confirmPassword) {
				setError("Passwords do not match");
				setLoading(false);
				return;
			}
		}

		if (!editData && (!formData.password || !formData.email || !formData.name)) {
			setError("Please fill all required fields");
			setLoading(false);
			return;
		}

		setLoading(true);

		try {
			const functions = getFunctions(app, "asia-south1");
			const manageAdmin = httpsCallable(functions, "addUser");
			const selectedDesig = designations.find((d) => d.id === formData.designationId);

			const payload = {
				action: editData ? "edit" : "add",
				id: formData.id,
				name: formData.name,
				email: formData.email,
				mobile: formData.mobile,
				designation: selectedDesig?.designationName || "",
				designationId: formData.designationId,
				department: formData.department,
			};

			if (formData.password) {
				payload.password = formData.password;
			}

			const result = await manageAdmin(payload);
			const data = result.data || {};

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
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
				onClick={onClose}
			/>

			{/* Modal Content */}
			<div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
				{/* Header */}
				<div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
					<div>
						<h2 className="text-xl font-bold text-slate-800">{editData ? "Edit Admin User" : "Create New Admin"}</h2>
						<p className="text-sm text-slate-500 mt-0.5">
							{editData ? "Update the details of the existing administrator." : "Fill in the details to add a new administrator."}
						</p>
					</div>
					<button
						onClick={onClose}
						className="p-2 rounded-xl hover:bg-slate-200/50 text-slate-400 hover:text-slate-600 transition-colors"
					>
						<X className="w-5 h-5" />
					</button>
				</div>

				{/* Body */}
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
								className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all placeholder:text-slate-400 text-sm"
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
								className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all placeholder:text-slate-400 text-sm"
								value={formData.email}
								onChange={handleChange}
								placeholder="Email Address"
								required
							/>
						</div>

						<div className="flex flex-col items-start w-full">
							<label htmlFor="mobile" className="mb-2 text-sm font-semibold text-slate-700">
								Mobile Number
							</label>
							<input
								type="tel"
								id="mobile"
								name="mobile"
								className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all placeholder:text-slate-400 text-sm"
								value={formData.mobile}
								onChange={handleChange}
								placeholder="Mobile Number"
								pattern="[0-9]{10}"
							/>
						</div>

						<div className="flex flex-col items-start w-full">
							<label htmlFor="designationId" className="mb-2 text-sm font-semibold text-slate-700">
								Designation
							</label>
							<select
								id="designationId"
								name="designationId"
								className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all bg-white text-sm"
								value={formData.designationId}
								onChange={handleChange}
							>
								<option value="">Select Designation</option>
								{designations.map((desig) => (
									<option key={desig.id} value={desig.id}>
										{desig.designationName}
									</option>
								))}
							</select>
						</div>

						<div className="flex flex-col items-start w-full">
							<label htmlFor="department" className="mb-2 text-sm font-semibold text-slate-700">
								Department
							</label>
							<select
								id="department"
								name="department"
								className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all bg-white text-sm"
								value={formData.department}
								onChange={handleChange}
							>
								<option value="">Select Department</option>
								{departments.map((dept) => (
									<option key={dept.id} value={dept.departmentName}>
										{dept.departmentName}
									</option>
								))}
							</select>
						</div>

						<div className="flex flex-col items-start w-full">
							<label htmlFor="password" className="mb-2 text-sm font-semibold text-slate-700">
								Password {editData ? "(Leave blank to keep current)" : <span className="text-red-500">*</span>}
							</label>
							<input
								type="password"
								id="password"
								name="password"
								className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all placeholder:text-slate-400 text-sm"
								value={formData.password}
								onChange={handleChange}
								placeholder="••••••••"
								required={!editData}
							/>
						</div>

						<div className="flex flex-col items-start w-full">
							<label htmlFor="confirmPassword" className="mb-2 text-sm font-semibold text-slate-700">
								Confirm Password {editData ? "(Leave blank to keep current)" : <span className="text-red-500">*</span>}
							</label>
							<input
								type="password"
								id="confirmPassword"
								name="confirmPassword"
								className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all placeholder:text-slate-400 text-sm"
								value={formData.confirmPassword}
								onChange={handleChange}
								placeholder="••••••••"
								required={!editData}
							/>
						</div>

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
