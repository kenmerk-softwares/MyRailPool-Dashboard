import React, { useState, useEffect } from 'react';
import { db } from '../../shared/services/firebase';
import { setDoc, doc, getDoc } from 'firebase/firestore';
import { useToast } from '../../shared/hooks/ToastContext';
import { FileText, Plus, Trash2, Save, Mail, Globe, AlignLeft, List, Layers, Sparkles } from 'lucide-react';

const TermsCondition = () => {
	const { showToast } = useToast();
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [existingData, setExistingData] = useState(null);

	const [formData, setFormData] = useState({
		introduction: '',
		conditions: [''],
		sections: [
			{
				title: '',
				description: '',
			},
		],
		footerDescription: '',
		email: '',
		website: '',
	});

	const fetchTerms = async () => {
		try {
			setLoading(true);
			const termsRef = doc(db, 'pages', 'settings', 'termscondition', 'data');
			const termsSnap = await getDoc(termsRef);

			if (termsSnap.exists()) {
				const data = termsSnap.data();
				setExistingData(data);
				setFormData({
					introduction: data.introduction || '',
					conditions: Array.isArray(data.conditions) && data.conditions.length > 0 ? data.conditions : [''],
					sections: Array.isArray(data.sections) && data.sections.length > 0
						? data.sections
						: [{ title: '', description: '' }],
					footerDescription: data.footerDescription || '',
					email: data.email || '',
					website: data.website || '',
				});
			}
		} catch (error) {
			console.error('Error fetching terms:', error);
			showToast('Error fetching terms & conditions', 'error');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchTerms();
	}, []);

	// --- Condition helpers ---
	const addCondition = () => {
		setFormData({
			...formData,
			conditions: [...formData.conditions, ''],
		});
	};

	const updateCondition = (index, value) => {
		const updated = [...formData.conditions];
		updated[index] = value;
		setFormData({ ...formData, conditions: updated });
	};

	const removeCondition = (index) => {
		setFormData({
			...formData,
			conditions: formData.conditions.filter((_, i) => i !== index),
		});
	};

	// --- Section helpers ---
	const addSection = () => {
		setFormData({
			...formData,
			sections: [...formData.sections, { title: '', description: '' }],
		});
	};

	const updateSection = (index, field, value) => {
		const updated = [...formData.sections];
		updated[index][field] = value;
		setFormData({ ...formData, sections: updated });
	};

	const removeSection = (index) => {
		setFormData({
			...formData,
			sections: formData.sections.filter((_, i) => i !== index),
		});
	};

	// --- Save ---
	const handleSave = async (e) => {
		e.preventDefault();
		setSaving(true);

		try {
			const filteredConditions = formData.conditions.filter((c) => c.trim() !== '');
			const filteredSections = formData.sections.filter(
				(s) => s.title.trim() !== '' || s.description.trim() !== ''
			);

			const termsRef = doc(db, 'pages', 'settings', 'termscondition', 'data');
			await setDoc(
				termsRef,
				{
					introduction: formData.introduction,
					conditions: filteredConditions,
					sections: filteredSections,
					footerDescription: formData.footerDescription,
					email: formData.email,
					website: formData.website,
					updatedAt: new Date(),
				},
				{ merge: true }
			);

			showToast('Terms & Conditions saved successfully', 'success');
			fetchTerms();
		} catch (error) {
			console.error('Error saving terms:', error);
			showToast('Error saving terms & conditions', 'error');
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center h-screen bg-slate-50">
				<div className="relative">
					<div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
					<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
						<FileText className="w-6 h-6 text-indigo-600" />
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="w-full min-h-screen bg-slate-50 relative overflow-hidden py-10 px-4 md:px-10">
			{/* Background blobs */}
			<div className="absolute -top-40 -left-40 w-[420px] h-[420px] bg-indigo-200 opacity-30 blur-[120px] rounded-full"></div>
			<div className="absolute -bottom-40 -right-40 w-[420px] h-[420px] bg-violet-200 opacity-30 blur-[120px] rounded-full"></div>

			{/* Header */}
			<div className="max-w-5xl mx-auto mb-12 relative z-10">
				<p className="text-sm font-semibold text-emerald-700 uppercase tracking-wider">
					Legal Documents
				</p>
				<h1 className="text-3xl md:text-4xl font-extrabold text-emerald-900 mt-1">
					Terms & <span className="text-emerald-900">Conditions</span>
				</h1>
			</div>

			{/* Form */}
			<form
				onSubmit={handleSave}
				className="max-w-5xl mx-auto relative z-10 space-y-8"
			>
				{/* Introduction */}
				<div className="bg-white/80 backdrop-blur-xl border border-slate-200 shadow-[0_15px_40px_rgba(0,0,0,0.05)] rounded-3xl p-8">
					<div className="flex items-center gap-2 mb-5">
						<AlignLeft className="w-5 h-5 text-indigo-600" />
						<h2 className="text-xl font-bold text-slate-800">Introduction</h2>
					</div>
					<textarea
						rows="5"
						value={formData.introduction}
						onChange={(e) =>
							setFormData({ ...formData, introduction: e.target.value })
						}
						className="w-full bg-white border border-slate-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none transition"
						placeholder="Enter the introduction paragraph for your terms & conditions..."
					/>
				</div>

				{/* Conditions */}
				<div className="bg-white/80 backdrop-blur-xl border border-slate-200 shadow-[0_15px_40px_rgba(0,0,0,0.05)] rounded-3xl p-8">
					<div className="flex justify-between items-center mb-5">
						<div className="flex items-center gap-2">
							<List className="w-5 h-5 text-emerald-600" />
							<h2 className="text-xl font-bold text-slate-800">Conditions</h2>
						</div>
						<button
							type="button"
							onClick={addCondition}
							className="flex items-center gap-1 px-4 py-2 text-sm font-medium bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-700 hover:text-white transition"
						>
							<Plus className="w-4 h-4" />
							Add Condition
						</button>
					</div>

					<div className="space-y-3">
						{formData.conditions.map((condition, index) => (
							<div key={index} className="flex gap-2 items-center">
								<span className="text-xs font-bold text-slate-400 w-6 text-center shrink-0">
									{index + 1}.
								</span>
								<input
									type="text"
									value={condition}
									onChange={(e) => updateCondition(index, e.target.value)}
									placeholder={`Condition ${index + 1}`}
									className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
								/>
								{formData.conditions.length > 1 && (
									<button
										type="button"
										onClick={() => removeCondition(index)}
										className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
									>
										<Trash2 className="w-4 h-4" />
									</button>
								)}
							</div>
						))}
					</div>
				</div>

				{/* Sections */}
				<div className="bg-white/80 backdrop-blur-xl border border-slate-200 shadow-[0_15px_40px_rgba(0,0,0,0.05)] rounded-3xl p-8">
					<div className="flex justify-between items-center mb-5">
						<div className="flex items-center gap-2">
							<Layers className="w-5 h-5 text-violet-600" />
							<h2 className="text-xl font-bold text-slate-800">Main Sections</h2>
						</div>
						<button
							type="button"
							onClick={addSection}
							className="flex items-center gap-1 px-4 py-2 text-sm font-medium bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-700 hover:text-white transition"
						>
							<Plus className="w-4 h-4" />
							Add Section
						</button>
					</div>

					<div className="space-y-5">
						{formData.sections.map((section, index) => (
							<div
								key={index}
								className="bg-slate-50 border border-slate-200 rounded-2xl p-5"
							>
								<div className="flex justify-between items-center mb-3">
									<span className="text-xs font-bold uppercase text-slate-500">
										Section {index + 1}
									</span>
									{formData.sections.length > 1 && (
										<button
											type="button"
											onClick={() => removeSection(index)}
											className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 rounded-lg transition"
										>
											<Trash2 className="w-3 h-3" />
											Remove
										</button>
									)}
								</div>
								<input
									type="text"
									value={section.title}
									placeholder="Section Heading"
									onChange={(e) =>
										updateSection(index, 'title', e.target.value)
									}
									className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 mb-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
								/>
								<textarea
									rows="4"
									value={section.description}
									placeholder="Section description..."
									onChange={(e) =>
										updateSection(index, 'description', e.target.value)
									}
									className="w-full bg-white border border-slate-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none transition"
								/>
							</div>
						))}
					</div>
				</div>

				{/* Footer / Company Info */}
				<div className="bg-white/80 backdrop-blur-xl border border-slate-200 shadow-[0_15px_40px_rgba(0,0,0,0.05)] rounded-3xl p-8">
					<div className="flex items-center gap-2 mb-5">
						<Sparkles className="w-5 h-5 text-amber-600" />
						<h2 className="text-xl font-bold text-slate-800">Company Information</h2>
					</div>

					<div className="space-y-4">
						<div>
							<label className="block text-xs font-semibold uppercase text-slate-500 mb-2 text-start">
								Footer Description
							</label>
							<textarea
								rows="4"
								value={formData.footerDescription}
								onChange={(e) =>
									setFormData({ ...formData, footerDescription: e.target.value })
								}
								placeholder="Company description for the footer..."
								className="w-full bg-white border border-slate-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none transition"
							/>
						</div>

						<div>
							<label className="block text-xs font-semibold uppercase text-slate-500 mb-2 text-start">
								Email Address
							</label>
							<div className="relative">
								<Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
								<input
									type="email"
									value={formData.email}
									onChange={(e) =>
										setFormData({ ...formData, email: e.target.value })
									}
									placeholder="contact@company.com"
									className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
								/>
							</div>
						</div>

						<div>
							<label className="block text-xs font-semibold uppercase text-slate-500 mb-2 text-start">
								Website URL
							</label>
							<div className="relative">
								<Globe className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
								<input
									type="text"
									value={formData.website}
									onChange={(e) =>
										setFormData({ ...formData, website: e.target.value })
									}
									placeholder="https://www.company.com"
									className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
								/>
							</div>
						</div>
					</div>
				</div>

				{/* Save Button */}
				<button
					type="submit"
					disabled={saving}
					className="w-full py-4 rounded-xl bg-emerald-600 text-white font-semibold shadow-md hover:bg-emerald-700 transition flex items-center justify-center gap-2"
				>
					{saving ? (
						<div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
					) : (
						<>
							<Save className="w-5 h-5" />
							Save Terms & Conditions
						</>
					)}
				</button>

				{/* Last updated info */}
				{existingData?.updatedAt && (
					<div className="flex justify-center items-center gap-1 text-xs text-slate-400 pb-4">
						<Sparkles className="w-3 h-3 text-amber-500" />
						<span>
							Last updated:{' '}
							{new Date(
								existingData.updatedAt.toDate?.() || existingData.updatedAt
							).toLocaleDateString()}
						</span>
					</div>
				)}
			</form>
		</div>
	);
};

export default TermsCondition;
