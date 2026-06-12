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
			const termsRef = doc(db, 'termsandcondition', 'data');
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

			const termsRef = doc(db, 'termsandcondition', 'data');
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
		<div className="w-full min-h-screen bg-slate-50 p-6 md:p-10">
			<div className="max-w-4xl mx-auto">
				<h1 className="text-3xl font-extrabold text-slate-800 mb-8">Terms & Conditions Settings</h1>

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
						<div className="flex justify-between items-center mb-3">
							<h2 className="text-lg font-bold text-slate-700 flex items-center gap-2">
								<List className="w-5 h-5 text-emerald-500" /> Conditions
							</h2>
							<button type="button" onClick={addCondition} className="text-sm text-emerald-600 font-medium flex items-center gap-1 hover:text-emerald-700">
								<Plus className="w-4 h-4" /> Add Condition
							</button>
						</div>
						<div className="space-y-2">
							{formData.conditions.map((condition, index) => (
								<div key={index} className="flex gap-2">
									<input
										type="text"
										value={condition}
										onChange={(e) => updateCondition(index, e.target.value)}
										className="flex-1 border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
										placeholder={`Condition ${index + 1}`}
									/>
									{formData.conditions.length > 1 && (
										<button type="button" onClick={() => removeCondition(index)} className="text-red-500 p-3 hover:bg-red-50 rounded-lg">
											<Trash2 className="w-4 h-4" />
										</button>
									)}
								</div>
							))}
						</div>
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
									<Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
									<input
										type="email"
										value={formData.email}
										onChange={(e) => setFormData({ ...formData, email: e.target.value })}
										className="w-full pl-9 pr-3 py-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
										placeholder="contact@company.com"
									/>
								</div>
								<div className="relative">
									<Globe className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
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
							<p className="text-center text-xs text-slate-500 mt-3">
								Last updated: {new Date(existingData.updatedAt.toDate?.() || existingData.updatedAt).toLocaleDateString()}
							</p>
						)}
					</div>
				</form>
			</div>
		</div>
	);
};

export default TermsCondition;