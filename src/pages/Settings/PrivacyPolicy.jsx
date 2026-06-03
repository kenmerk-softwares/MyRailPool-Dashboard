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
		dataPointsHeading: '',
		dataPoints: [{ title: '', descriptions: [''] }],
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
			const policyRef = doc(db, 'privacypolicy', 'data');
			const policySnap = await getDoc(policyRef);

			if (policySnap.exists()) {
				const data = policySnap.data();
				setExistingData(data);
				setFormData({
					introduction: data.introduction || '',
					dataPointsHeading: data.dataPointsHeading || '',
					dataPoints: Array.isArray(data.dataPoints) && data.dataPoints.length > 0
						? data.dataPoints.map(d => {
							if (typeof d === 'string') return { title: '', descriptions: [d] };
							if (d.description !== undefined && !d.descriptions) return { title: d.title || '', descriptions: [d.description] };
							return { title: d.title || '', descriptions: Array.isArray(d.descriptions) ? d.descriptions : [''] };
						})
						: [{ title: '', descriptions: [''] }],
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
		setFormData({ ...formData, dataPoints: [...formData.dataPoints, { title: '', descriptions: [''] }] });
	};

	const updateDataPoint = (index, field, value) => {
		const updated = [...formData.dataPoints];
		updated[index] = { ...updated[index], [field]: value };
		setFormData({ ...formData, dataPoints: updated });
	};

	const addDescription = (dpIndex) => {
		const updated = [...formData.dataPoints];
		updated[dpIndex] = { ...updated[dpIndex], descriptions: [...(updated[dpIndex].descriptions || ['']), ''] };
		setFormData({ ...formData, dataPoints: updated });
	};

	const updateDescription = (dpIndex, descIndex, value) => {
		const updated = [...formData.dataPoints];
		const descs = [...(updated[dpIndex].descriptions || [''])];
		descs[descIndex] = value;
		updated[dpIndex] = { ...updated[dpIndex], descriptions: descs };
		setFormData({ ...formData, dataPoints: updated });
	};

	const removeDescription = (dpIndex, descIndex) => {
		const updated = [...formData.dataPoints];
		const descs = (updated[dpIndex].descriptions || ['']).filter((_, i) => i !== descIndex);
		updated[dpIndex] = { ...updated[dpIndex], descriptions: descs.length > 0 ? descs : [''] };
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
			const filteredDataPoints = formData.dataPoints.filter(
				(d) => d.title.trim() !== '' || (d.descriptions || []).some(desc => desc.trim() !== '')
			);
			const filteredSections = formData.sections.filter(
				(s) => s.title.trim() !== '' || s.description.trim() !== ''
			);

			const policyRef = doc(db, 'privacypolicy', 'data');
			await setDoc(
				policyRef,
				{
					introduction: formData.introduction,
					dataPointsHeading: formData.dataPointsHeading,
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
		<div className="w-full min-h-screen bg-slate-50 p-6 md:p-10">
			<div className="max-w-4xl mx-auto">
				<h1 className="text-3xl font-extrabold text-slate-800 mb-8">Privacy Policy Settings</h1>

				<form onSubmit={handleSave} className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 md:p-8 space-y-8">
					<section>
						<h2 className="text-lg font-bold text-slate-700 mb-3 flex items-center gap-2">
							<AlignLeft className="w-5 h-5 text-indigo-500" /> Introduction
						</h2>
						<textarea
							rows="4"
							value={formData.introduction}
							onChange={(e) => setFormData({ ...formData, introduction: e.target.value })}
							className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
							placeholder="Introduction paragraph..."
						/>
					</section>

					<section>
						{/* <div className="flex justify-between items-center mb-3">
							<div className="flex items-center gap-2 flex-1 mr-4">
								<List className="w-5 h-5 text-emerald-500 shrink-0" />
								<input
									type="text"
									value={formData.dataPointsHeading}
									onChange={(e) => setFormData({ ...formData, dataPointsHeading: e.target.value })}
									className="flex-1 border border-slate-300 rounded-lg px-3 py-1.5 text-base font-bold text-slate-700 focus:ring-2 focus:ring-emerald-400 outline-none"
									placeholder="Section heading (e.g. Data We Collect)"
								/>
							</div>
							<button type="button" onClick={addDataPoint} className="text-sm text-emerald-600 font-medium flex items-center gap-1 hover:text-emerald-700 shrink-0">
								<Plus className="w-4 h-4" /> Add Card
							</button>
						</div> */}
						{/* <div className="space-y-4">
							{formData.dataPoints.map((point, index) => (
								<div key={index} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
									<div className="flex justify-between mb-2">
										<span className="text-sm font-bold text-slate-600">Card {index + 1}</span>
										{formData.dataPoints.length > 1 && (
											<button type="button" onClick={() => removeDataPoint(index)} className="text-red-500 text-sm flex items-center gap-1">
												<Trash2 className="w-3 h-3" /> Remove Card
											</button>
										)}
									</div>
									<input
										type="text"
										value={point.title || ''}
										onChange={(e) => updateDataPoint(index, 'title', e.target.value)}
										className="w-full border border-slate-300 rounded-lg p-3 text-sm mb-3 focus:ring-2 focus:ring-indigo-500 outline-none"
										placeholder="Card title (e.g. REGISTRATION FORMS)"
									/>
									<div className="space-y-2">
										{(point.descriptions || ['']).map((desc, dIdx) => (
											<div key={dIdx} className="flex gap-2 items-start">
												<textarea
													rows="2"
													value={desc}
													onChange={(e) => updateDescription(index, dIdx, e.target.value)}
													className="flex-1 border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
													placeholder="Description line..."
												/>
												{(point.descriptions || ['']).length > 1 && (
													<button type="button" onClick={() => removeDescription(index, dIdx)} className="text-red-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 mt-1">
														<Trash2 className="w-3 h-3" />
													</button>
												)}
											</div>
										))}
										<button type="button" onClick={() => addDescription(index)} className="text-xs text-indigo-500 font-medium flex items-center gap-1 hover:text-indigo-700 mt-1">
											<Plus className="w-3 h-3" /> Add Description Line
										</button>
									</div>
								</div>
							))}
						</div> */}
					</section>

					<section>
						<div className="flex justify-between items-center mb-3">
							<h2 className="text-lg font-bold text-slate-700 flex items-center gap-2">
								<Layers className="w-5 h-5 text-violet-500" /> Policy Sections
							</h2>
							<button type="button" onClick={addSection} className="text-sm text-indigo-600 font-medium flex items-center gap-1 hover:text-indigo-700">
								<Plus className="w-4 h-4" /> Add Section
							</button>
						</div>
						<div className="space-y-4">
							{formData.sections.map((section, index) => (
								<div key={index} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
									<div className="flex justify-between mb-2">
										<span className="text-sm font-bold text-slate-600">Section {index + 1}</span>
										{formData.sections.length > 1 && (
											<button type="button" onClick={() => removeSection(index)} className="text-red-500 text-sm flex items-center gap-1">
												<Trash2 className="w-3 h-3" /> Remove
											</button>
										)}
									</div>
									<input
										type="text"
										value={section.title}
										onChange={(e) => updateSection(index, 'title', e.target.value)}
										className="w-full border border-slate-300 rounded-lg p-3 text-sm mb-3 focus:ring-2 focus:ring-indigo-500 outline-none"
										placeholder="Section Heading"
									/>
									<textarea
										rows="3"
										value={section.description}
										onChange={(e) => updateSection(index, 'description', e.target.value)}
										className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
										placeholder="Section description..."
									/>
								</div>
							))}
						</div>
					</section>

					<section>
						<h2 className="text-lg font-bold text-slate-700 mb-3 flex items-center gap-2">
							<Sparkles className="w-5 h-5 text-amber-500" /> Company Info
						</h2>
						<div className="space-y-4">
							<textarea
								rows="2"
								value={formData.footerDescription}
								onChange={(e) => setFormData({ ...formData, footerDescription: e.target.value })}
								className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
								placeholder="Footer Description"
							/>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="relative">
									<Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
									<input
										type="email"
										value={formData.email}
										onChange={(e) => setFormData({ ...formData, email: e.target.value })}
										className="w-full pl-9 pr-3 py-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
										placeholder="privacy@company.com"
									/>
								</div>
								<div className="relative">
									<Globe className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
									<input
										type="text"
										value={formData.website}
										onChange={(e) => setFormData({ ...formData, website: e.target.value })}
										className="w-full pl-9 pr-3 py-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
										placeholder="www.company.com"
									/>
								</div>
							</div>
						</div>
					</section>

					<div>
						<button type="submit" disabled={saving} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 flex justify-center items-center gap-2">
							{saving ? <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" /> : <><Save className="w-5 h-5" /> Save Changes</>}
						</button>
						{existingData?.updatedAt && (
							<p className="text-center text-xs text-slate-400 mt-3">
								Last updated: {new Date(existingData.updatedAt.toDate?.() || existingData.updatedAt).toLocaleDateString()}
							</p>
						)}
					</div>
				</form>
			</div>
		</div>
	);
};

export default PrivacyPolicy;