import React from 'react';
import { Plus, Edit, Trash2, Car, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SectionHeader } from '../../components/Shared';
import { adminUsersData } from '../../data/mockData';

export const AdminUserList = () => (
	<>
		<SectionHeader
			title="Admin User List"
			subtitle="Manage your admin users, roles, and permissions."
			actionLabel="Add Admin User"
			actionIcon={Plus}
			actionTo="/admin-users/add"
		/>

		<div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
			<div className="p-4 md:p-6 border-b border-slate-100">
				<h3 className="text-base md:text-lg font-bold text-slate-800">Admin User List</h3>
			</div>
			<div className="overflow-x-auto w-full">
				<div className="flex items-center justify-between m-4">
					{/* Search Bar */}
					<div className="hidden sm:flex flex-1 max-w-xl ml-4 lg:ml-0">
						<div className="relative group w-full">
							<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-500 transition-colors">
								<Search className="h-4 w-4 md:h-5 md:w-5" />
							</div>
							<input
								type="text"
								className="block w-full pl-10 md:pl-11 pr-4 py-2 md:py-2.5 bg-slate-50 border border-transparent rounded-xl text-xs md:text-sm placeholder-slate-400 focus:border-primary-500 focus:bg-white focus:ring focus:ring-primary-500/20 transition-all duration-200"
								placeholder="Search admin users"
							/>
						</div>
					</div>
					<div className="flex items-center gap-3">
						<select name="" id="" className="border border-slate-200 rounded-xl px-4 py-2 text-xs md:text-sm">
							<option value="">All</option>
							<option value="">Active</option>
							<option value="">Inactive</option>
						</select>
						<button className="bg-red-500 text-white px-4 py-2 rounded-xl text-xs md:text-sm">Clear</button>
					</div>

				</div>
				<table className="w-full text-left border-collapse min-w-[700px]">
					<thead>
						<tr className="bg-slate-50/50">
							<th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100 text-center">Name</th>
							<th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100 text-center">Email</th>
							<th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100 hidden sm:table-cell text-center">Role</th>
							<th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100 text-center">Status</th>
							<th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100 text-center">Action</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-slate-100">
						{adminUsersData.map((user, idx) => (
							<tr key={idx} className="hover:bg-slate-50/50 transition-colors">
								<td className="px-4 md:px-6 py-4 text-center">
									<div className="text-xs md:text-sm font-medium text-slate-900">{user.name}</div>
								</td>
								<td className="px-4 md:px-6 py-4 text-center">
									<div className="text-[10px] md:text-sm text-slate-600 mt-0.5">{user.email}</div>
								</td>
								<td className="px-4 md:px-6 py-4 text-xs md:text-sm text-slate-600 text-center">{user.role}</td>
								<td className="px-4 md:px-6 py-4 text-xs md:text-sm text-center">
									<span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${user.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
										{user.status}
									</span>
								</td>
								<td className="px-4 md:px-6 py-4 text-center">
									<div className="flex items-center justify-center gap-2">
										<Link to={`/admin-users/edit/${user.id.replace('#', '')}`} className="text-primary-600 hover:text-primary-800 p-1.5 rounded-lg hover:bg-primary-50 transition-colors">
											<Edit className="w-4 h-4" />
										</Link>
										<button className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition-colors">
											<Trash2 className="w-4 h-4" />
										</button>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	</>
);
