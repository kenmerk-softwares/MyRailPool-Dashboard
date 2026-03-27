import React from 'react';
import { PermissionPopup } from './PermissionPopup';
import { designations } from '../../data/mockData';
import { FaUserShield } from 'react-icons/fa';

export const AdminSettings = () => {
	const [permissionPopup, setPermissionPopup] = React.useState(false);

	return (
		<div className="page-container">
			<div className="page-header-section">
				<div className="header-title">
					<h1 className='text-2xl font-bold text-slate-800'>Admin Settings</h1>
					<p className='text-sm text-slate-600'>System configuration and admin controls.</p>
				</div>
			</div>

			<div className="p-6">
				<div className="flex gap-4 mb-8 flex-wrap">
					<button
						className="bg-white border border-slate-200 px-6 py-4 rounded-xl cursor-pointer flex items-center gap-3 font-semibold text-slate-600 transition-all duration-200 shadow-sm hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300 hover:text-slate-800"
						onClick={() => setPermissionPopup(true)}
					>
						<FaUserShield className="text-[1.2rem] text-green-800" />
						Permission Model
					</button>
				</div>

				<div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
					<div className="mb-4">
						<h3 className="text-lg font-bold text-gray-800">Designation & Permissions</h3>
						<p className="text-sm text-gray-500">Overview of system roles and their access levels.</p>
					</div>

					<div className="overflow-hidden rounded-xl border border-gray-200">
						<table className="min-w-full divide-y divide-gray-200">
							<thead className="bg-gradient-to-r from-gray-50 to-gray-100">
								<tr>
									<th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider text-center">Designation</th>
									<th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider text-center">Permissions</th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-200">
								{designations.length > 0 ? (
									designations.map(desig => {
										//   const routes = getPermissionRoutes(desig.id);
										return (
											<tr key={desig.id} className="hover:bg-gray-50 transition-colors">
												<td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 text-center">
													{desig.designationName}
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-center">
													{/* {routes ? ( */}
													<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
														{/* {routes.length} page{routes.length !== 1 ? 's' : ''} allowed */}
													</span>
													{/* ) : ( */}
													<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
														No permissions set
													</span>
													{/* )} */}
												</td>
											</tr>
										);
									})
								) : (
									<tr>
										<td colSpan="2" className="px-6 py-8 text-center text-sm text-gray-400">
											No designations found. Add designations from Employee Settings.
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
