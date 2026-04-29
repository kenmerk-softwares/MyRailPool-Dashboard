import React, { useState, useEffect } from 'react';
import { db } from '../../Config/Config';
import { setDoc, doc, getDoc } from 'firebase/firestore';
import { useToast } from '../../Toast/ToastContext';
import { Building2, MapPin, Phone, Tag, Save, Plus, Trash2, Sparkles } from 'lucide-react';

const Company = () => {
	const { showToast } = useToast();
	const [companyData, setCompanyData] = useState(null);
	const [loading, setLoading] = useState(false);
	const [showAddForm, setShowAddForm] = useState(false);

	const [formData, setFormData] = useState({
		companyName: '',
		address: '',
		contact: [],
		tag: ''
	});

	const fetchCompanyDetails = async () => {
		try {
			setLoading(true);
			const companyRef = doc(db, 'company', 'settings');
			const companySnap = await getDoc(companyRef);

			if (companySnap.exists()) {
				const company = companySnap.data();
				setCompanyData({
					id: 'settings',
					...company
				});
				setFormData({
					companyName: company.companyName || '',
					address: company.address || '',
					contact: Array.isArray(company.contact) ? company.contact : (company.contact ? [company.contact] : []),
					tag: company.tag || ''
				});
				setShowAddForm(false);
			} else {
				setCompanyData(null);
				setShowAddForm(true);
			}
		} catch (error) {
			console.error('Error fetching company details:', error);
			showToast('Error fetching company details', 'error');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchCompanyDetails();
	}, []);

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData({
			...formData,
			[name]: value
		});
	};

	const handleAddPhoneNumber = () => {
		setFormData({
			...formData,
			contact: [...formData.contact, '']
		});
	};

	const handlePhoneChange = (index, value) => {
		const updatedContact = [...formData.contact];
		updatedContact[index] = value;
		setFormData({
			...formData,
			contact: updatedContact
		});
	};

	const handleRemovePhone = (index) => {
		setFormData({
			...formData,
			contact: formData.contact.filter((_, i) => i !== index)
		});
	};

	const handleSaveCompany = async (e) => {
		e.preventDefault();
		setLoading(true);

		try {
			if (!formData.companyName || !formData.address || !formData.tag) {
				showToast('Please fill in all required fields', 'error');
				setLoading(false);
				return;
			}

			const filteredContact = formData.contact.filter(phone => phone.trim() !== '');
			if (filteredContact.length === 0) {
				showToast('Please add at least one contact number', 'error');
				setLoading(false);
				return;
			}

			const companyRef = doc(db, 'company', 'settings');
			const payload = {
				companyName: formData.companyName,
				address: formData.address,
				contact: filteredContact,
				tag: formData.tag,
				updatedAt: new Date(),
			};

			if (!companyData) {
				payload.createdAt = new Date();
			}

			await setDoc(companyRef, payload, { merge: true });

			showToast(companyData ? 'Company updated successfully' : 'Company added successfully', 'success');
			fetchCompanyDetails();
		} catch (error) {
			console.error('Error saving company:', error);
			showToast('Error saving company details', 'error');
		} finally {
			setLoading(false);
		}
	};

	if (loading && !companyData && !showAddForm) {
		return (
			<div className="flex items-center justify-center h-screen bg-slate-50">
				<div className="relative">
					<div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
					<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
						<Building2 className="w-6 h-6 text-indigo-600" />
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="w-full min-h-screen bg-slate-50 relative overflow-hidden py-10 px-4 md:px-10">

			{/* Background ambient lights */}
			<div className="absolute -top-40 -left-40 w-[420px] h-[420px] bg-indigo-200 opacity-30 blur-[120px] rounded-full"></div>
			<div className="absolute -bottom-40 -right-40 w-[420px] h-[420px] bg-violet-200 opacity-30 blur-[120px] rounded-full"></div>

			{/* HEADER */}
			<div className="max-w-6xl mx-auto mb-12 relative z-10">

				<p className="text-sm font-semibold text-emerald-700 uppercase tracking-wider">
					Company Management
				</p>

				<h1 className="text-3xl md:text-4xl font-extrabold text-emerald-900 mt-1">
					Manage <span className="text-emerald-900">Company Details</span>
				</h1>

			</div>

			{/* MAIN GRID */}
			<div className="max-w-6xl mx-auto grid grid-cols-1 xl:grid-cols-2 gap-8 relative z-10">

				{/* FORM SECTION */}
				{(companyData || showAddForm) && (

					<form
						onSubmit={handleSaveCompany}
						className="bg-white/80 backdrop-blur-xl border border-slate-200 shadow-[0_15px_40px_rgba(0,0,0,0.05)] rounded-3xl p-8 flex flex-col justify-between"
					>

						{/* FORM HEADER */}
						<div>

							<h2 className="text-xl font-bold text-slate-800 mb-6">
								{companyData ? "Update Company Profile" : "Register Company"}
							</h2>

							<div className="space-y-5">

								{/* COMPANY NAME */}
								<div>
									<label className="block text-xs font-semibold uppercase text-slate-500 mb-2 text-start">
										Company Name
									</label>

									<div className="relative">
										<Building2 className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />

										<input
											type="text"
											name="companyName"
											value={formData.companyName}
											onChange={handleInputChange}
											placeholder="Global Logistics Inc."
											className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
											required
										/>
									</div>
								</div>

								{/* ADDRESS */}
								<div>

									<label className="block text-xs font-semibold uppercase text-slate-500 mb-2 text-start">
										Address
									</label>

									<div className="relative">
										<MapPin className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />

										<textarea
											name="address"
											value={formData.address}
											onChange={handleInputChange}
											rows="1"
											placeholder="Full business address..."
											className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none transition"
											required
										/>
									</div>
								</div>

								{/* TAG */}
								<div>

									<label className="block text-xs font-semibold uppercase text-slate-500 mb-2 text-start">
										Tag
									</label>

									<div className="relative">
										<Tag className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />

										<input
											type="text"
											name="tag"
											value={formData.tag}
											onChange={handleInputChange}
											placeholder="Trading, Manufacturing..."
											className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
											required
										/>
									</div>
								</div>

								{/* CONTACT NUMBERS */}
								<div>

									<div className="flex justify-between items-center mb-3">

										<label className="text-xs font-semibold uppercase text-slate-500 text-start">
											Contact Numbers
										</label>

										<button
											type="button"
											onClick={handleAddPhoneNumber}
											className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-700 hover:text-white transition"
										>
											<Plus className="w-3 h-3" />
											Add
										</button>

									</div>

									<div className="space-y-2 max-h-40 overflow-y-auto">

										{formData.contact.map((phone, idx) => (

											<div key={idx} className="flex gap-2 items-center">

												<div className="relative flex-1">

													<Phone className="absolute left-3 top-2.5 w-3 h-3 text-slate-400" />

													<input
														type="tel"
														value={phone}
														onChange={(e) =>
															handlePhoneChange(idx, e.target.value)
														}
														placeholder={`Contact ${idx + 1}`}
														className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
													/>

												</div>

												{formData.contact.length > 1 && (

													<button
														type="button"
														onClick={() => handleRemovePhone(idx)}
														className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
													>
														<Trash2 className="w-4 h-4" />
													</button>

												)}

											</div>

										))}

									</div>

								</div>

							</div>
						</div>

						{/* SUBMIT BUTTON */}

						<button
							type="submit"
							disabled={loading}
							className="mt-8 w-full py-3 rounded-xl bg-emerald-600 text-white font-semibold shadow-md hover:bg-emerald-700 transition flex items-center justify-center gap-2"
						>

							{loading ? (
								<div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
							) : companyData ? (
								<>
									<Save className="w-4 h-4" />
									Update Company
								</>
							) : (
								<>
									<Sparkles className="w-4 h-4" />
									Create Company
								</>
							)}

						</button>

					</form>

				)}

				{/* COMPANY DETAILS */}

				{companyData && (

					<div className="bg-white/80 backdrop-blur-xl border border-slate-200 shadow-[0_15px_40px_rgba(0,0,0,0.05)] rounded-3xl p-8 flex flex-col justify-between">

						<div className="space-y-6">
							<h2 className="text-xl font-bold text-slate-800 mb-6">
								Current Company Profile
							</h2>
							{/* NAME */}
							<div>

								<p className="text-xs uppercase font-semibold text-slate-700 mb-2 text-start">
									Company Name
								</p>

								<h2 className="text-xl font-bold text-slate-900 text-start">
									{companyData.companyName}
								</h2>

							</div>

							{/* ADDRESS */}

							<div>

								<p className="text-xs uppercase font-semibold text-slate-700 mb-2 flex gap-1 text-start items-start">
									<MapPin className="w-3 h-3" />
									Location
								</p>

								<div className="text-left p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700">
									{companyData.address}
								</div>

							</div>

							{/* TAG */}

							<div>

								<p className="text-xs uppercase font-semibold text-slate-700 mb-2 flex text-start gap-1">
									<Tag className="w-3 h-3" />
									Tag
								</p>

								<div className="text-left p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700">
									{companyData.tag}
								</div>

							</div>

							{/* CONTACT */}

							<div>

								<p className="text-xs uppercase font-semibold text-slate-700 mb-3 flex text-start gap-1">
									<Phone className="w-3 h-3" />
									Contact Numbers
								</p>

								<div className="flex flex-wrap gap-2">

									{Array.isArray(companyData.contact) ? (
										companyData.contact.map((phone, idx) => (

											<div
												key={idx}
												className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
											>
												<Phone className="w-3 h-3 text-indigo-600" />
												{phone}
											</div>

										))
									) : (

										<div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm">
											{companyData.contact}
										</div>

									)}

								</div>

							</div>

						</div>

						{/* FOOTER */}

						<div className="mt-8 pt-6 border-t border-slate-200 flex justify-between items-center text-xs text-slate-400">

							<div className="flex items-center gap-1 text-gray-700">
								<Sparkles className="w-3 h-3 text-amber-700" />
								Last updated:
								{companyData.updatedAt
									? new Date(
										companyData.updatedAt.toDate?.() ||
										companyData.updatedAt
									).toLocaleDateString()
									: "N/A"}
							</div>



						</div>

					</div>

				)}

			</div>

		</div>
	);
};

export default Company;

