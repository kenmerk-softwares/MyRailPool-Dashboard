import React, { useState, useEffect } from 'react';
import { PermissionPopup } from './PermissionPopup';
import { FaUserShield } from 'react-icons/fa';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../Config/Config';

export const AdminSettings = () => {
	const [permissionPopup, setPermissionPopup] = React.useState(false);
	const [permissionsList, setPermissionsList] = useState([]);

	useEffect(() => {
		const unsubscribe = onSnapshot(collection(db, 'permissions'), (snapshot) => {
			const items = snapshot.docs.map(doc => ({
				id: doc.id,
				...doc.data()
			}));
			// Optional: sort by createdAt or permissionName here if needed
			setPermissionsList(items);
		}, (err) => {
			console.error("Error fetching permissions:", err);
		});

		return () => unsubscribe();
	}, []);

	return (
		<div className="page-container">
			<div className="page-header-section">
				<div className="header-title">
					<h1 className='text-2xl font-bold text-slate-800'>Admin Settings</h1>
					<p className='text-sm text-slate-600'>System configuration and admin controls.</p>
				</div>
			</div>

			<div className="p-4 md:p-6">
				<div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-8 flex-wrap">
					<button
						className="w-full sm:w-auto justify-center sm:justify-start bg-white border border-slate-200 px-4 md:px-6 py-3 md:py-4 rounded-xl cursor-pointer flex items-center gap-3 font-semibold text-slate-600 transition-all duration-200 shadow-sm hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300 hover:text-slate-800"
						onClick={() => setPermissionPopup(true)}
					>
						<FaUserShield className="text-[1.2rem] text-green-800" />
						Permission Model
					</button>
				</div>

				<div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
					<div className="mb-4">
						<h3 className="text-lg font-bold text-gray-800">Permission Models</h3>
						<p className="text-sm text-gray-500">Overview of configured permissions and their access levels.</p>
					</div>

					<div className="overflow-x-auto rounded-xl border border-gray-200">
						<table className="min-w-full divide-y divide-gray-200">
							<thead className="bg-gradient-to-r from-gray-50 to-gray-100">
								<tr>
									<th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-[10px] sm:text-xs font-bold text-gray-600 uppercase tracking-wider">Sl No</th>
									<th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-[10px] sm:text-xs font-bold text-gray-600 uppercase tracking-wider">Name</th>
									<th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-[10px] sm:text-xs font-bold text-gray-600 uppercase tracking-wider">Department</th>
									<th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-[10px] sm:text-xs font-bold text-gray-600 uppercase tracking-wider">Designation</th>
									<th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-[10px] sm:text-xs font-bold text-gray-600 uppercase tracking-wider">Permissions</th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-200">
								{permissionsList.length > 0 ? (
									permissionsList.map((perm, index) => {
										const routes = perm.permissions || [];
										return (
											<tr key={perm.id} className="hover:bg-gray-50 transition-colors">
												<td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-semibold text-gray-900 text-center">
													{index + 1}
												</td>
												<td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-semibold text-gray-900 text-center">
													{perm.permissionName || 'N/A'}
												</td>
												<td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-600 text-center">
													{perm.departmentName || 'N/A'}
												</td>
												<td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-600 text-center">
													{perm.designationName || 'N/A'}
												</td>
												<td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 text-center">
													{routes.length > 0 ? (
														<span className="inline-flex items-center px-2 py-0.5 sm:px-2.5 rounded-full text-[10px] sm:text-xs font-medium bg-green-100 text-green-800 text-center break-words whitespace-normal">
															{routes.length} page{routes.length !== 1 ? 's' : ''} allowed
														</span>
													) : (
														<span className="inline-flex items-center px-2 py-0.5 sm:px-2.5 rounded-full text-[10px] sm:text-xs font-medium bg-gray-100 text-gray-800 text-center break-words whitespace-normal">
															No permissions set
														</span>
													)}
												</td>
											</tr>
										);
									})
								) : (
									<tr>
										<td colSpan="5" className="px-6 py-8 text-center text-sm text-gray-400">
											No permissions configured. Click "Permission Model" to add one.
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</div>
			</div>

			{/* Permission Popup */}
			<PermissionPopup
				isOpen={permissionPopup}
				onClose={() => setPermissionPopup(false)}
			/>
		</div>
	);
};
