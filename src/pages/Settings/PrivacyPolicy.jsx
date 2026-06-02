import React, { useState, useEffect } from 'react';
import { db } from '../../shared/services/firebase';
import { setDoc, doc, getDoc } from 'firebase/firestore';
import { useToast } from '../../shared/hooks/ToastContext';
import { Shield, Plus, Trash2, Save, Mail, Globe, AlignLeft, List, Layers, Sparkles } from 'lucide-react';

const PrivacyPolicy = () => {
	const { showToast } = useToast();
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [existingData, setExistingData] = useState(null);

	const [formData, setFormData] = useState({
		introduction: '',
		dataPoints: [''],
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

	const fetchPolicy = async () => {
		try {
			setLoading(true);
			const policyRef = doc(db, 'pages', 'settings', 'privacypolicy', 'data');
			const policySnap = await getDoc(policyRef);

			if (policySnap.exists()) {
				const data = policySnap.data();
				setExistingData(data);
				setFormData({
					introduction: data.introduction || '',
					dataPoints: Array.isArray(data.dataPoints) && data.dataPoints.length > 0 ? data.dataPoints : [''],
					sections: Array.isArray(data.sections) && data.sections.length > 0
						? data.sections
						: [{ title: '', description: '' }],
					footerDescription: data.footerDescription || '',
					email: data.email || '',
					website: data.website || '',
				});
			}
		} catch (error) {
			console.error('Error fetching privacy policy:', error);
			showToast('Error fetching privacy policy', 'error');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchPolicy();
	}, []);

	// --- Data Point helpers ---
	const addDataPoint = () => {
		setFormData({ ...formData, dataPoints: [...formData.dataPoints, ''] });
	};

	const updateDataPoint = (index, value) => {
		const updated = [...formData.dataPoints];
		updated[index] = value;
		setFormData({ ...formData, dataPoints: updated });
	};

	const removeDataPoint = (index) => {
		setFormData({
			...formData,
			dataPoints: formData.dataPoints.filter((_, i) => i !== index),
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
			const filteredDataPoints = formData.dataPoints.filter((d) => d.trim() !== '');
			const filteredSections = formData.sections.filter(
				(s) => s.title.trim() !== '' || s.description.trim() !== ''
			);

			const policyRef = doc(db, 'pages', 'settings', 'privacypolicy', 'data');
			await setDoc(
				policyRef,
				{
					introduction: formData.introduction,
					dataPoints: filteredDataPoints,
					sections: filteredSections,
					footerDescription: formData.footerDescription,
					email: formData.email,
					website: formData.website,
					updatedAt: new Date(),
				},
				{ merge: true }
			);

			showToast('Privacy Policy saved successfully', 'success');
			fetchPolicy();
		} catch (error) {
			console.error('Error saving privacy policy:', error);
			showToast('Error saving privacy policy', 'error');
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
						<Shield className="w-6 h-6 text-indigo-600" />
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
					Privacy <span className="text-emerald-900">Policy</span>
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
						onChange={(e) => setFormData({ ...formData, introduction: e.target.value })}
						className="w-full bg-white border border-slate-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none transition"
						placeholder="Enter the introduction paragraph for your privacy policy..."
					/>
				</div>

				{/* Data Points Collected */}
				<div className="bg-white/80 backdrop-blur-xl border border-slate-200 shadow-[0_15px_40px_rgba(0,0,0,0.05)] rounded-3xl p-8">
					<div className="flex justify-between items-center mb-5">
						<div className="flex items-center gap-2">
							<List className="w-5 h-5 text-emerald-600" />
							<h2 className="text-xl font-bold text-slate-800">Data We Collect</h2>
						</div>
						<button
							type="button"
							onClick={addDataPoint}
							className="flex items-center gap-1 px-4 py-2 text-sm font-medium bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-700 hover:text-white transition"
						>
							<Plus className="w-4 h-4" />
							Add Data Point
						</button>
					</div>

					<div className="space-y-3">
						{formData.dataPoints.map((point, index) => (
							<div key={index} className="flex gap-2 items-center">
								<span className="text-xs font-bold text-slate-400 w-6 text-center shrink-0">
									{index + 1}.
								</span>
								<input
									type="text"
									value={point}
									onChange={(e) => updateDataPoint(index, e.target.value)}
									placeholder={`Data point ${index + 1} (e.g. "Name and email address")`}
									className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
								/>
								{formData.dataPoints.length > 1 && (
									<button
										type="button"
										onClick={() => removeDataPoint(index)}
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
							<h2 className="text-xl font-bold text-slate-800">Policy Sections</h2>
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
									placeholder="Section Heading (e.g. How We Use Your Data)"
									onChange={(e) => updateSection(index, 'title', e.target.value)}
									className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 mb-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
								/>
								<textarea
									rows="4"
									value={section.description}
									placeholder="Section description..."
									onChange={(e) => updateSection(index, 'description', e.target.value)}
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
								onChange={(e) => setFormData({ ...formData, footerDescription: e.target.value })}
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
									onChange={(e) => setFormData({ ...formData, email: e.target.value })}
									placeholder="privacy@company.com"
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
									onChange={(e) => setFormData({ ...formData, website: e.target.value })}
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
							Save Privacy Policy
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

export default PrivacyPolicy;