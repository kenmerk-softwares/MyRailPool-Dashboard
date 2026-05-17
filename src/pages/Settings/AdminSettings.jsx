import React, { useState, useEffect } from 'react';
import { PermissionPopup } from './PermissionPopup';
import { FaUserShield, FaBuilding, FaUserTie, FaTimes, FaTrash, FaEdit, FaUserSlash } from 'react-icons/fa';
import { collection, onSnapshot, query, orderBy, addDoc} from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { db, app } from '../../shared/services/firebase';
import { useToast } from '../../shared/hooks/ToastContext';
import DeleteModal from '../../shared/DeleteModal/DeleteModal';

export const AdminSettings = () => {
	const { showToast } = useToast();
	const [permissionPopup, setPermissionPopup] = React.useState(false);
	const [showDeptPopup, setShowDeptPopup] = useState(false);
	const [showDesigPopup, setShowDesigPopup] = useState(false);
	const [permissionsList, setPermissionsList] = useState([]);
	const [editPermissionData, setEditPermissionData] = useState(null);
	const [deletePermissionId, setDeletePermissionId] = useState(null);
	const [revokePermissionId, setRevokePermissionId] = useState(null);
	const [loading, setLoading] = useState(false);

	const handleEditPermission = (perm) => {
		setEditPermissionData(perm);
		setPermissionPopup(true);
	};

	const handleDeletePermission = (permId) => {
		setDeletePermissionId(permId);
	};

	const handleRevokePermission = (permId) => {
		setRevokePermissionId(permId);
	};

	const confirmDeletePermission = async () => {
		if (!deletePermissionId) return;
		setLoading(true);
		try {
			const functions = getFunctions(app, "asia-south1");
			const editPermissionsFn = httpsCallable(functions, 'editPermissions');
			
			const result = await editPermissionsFn({ 
				id: deletePermissionId, 
				operation: "delete" 
			});

			if (result.data.success) {
				showToast('Permission deleted successfully', 'success');
			} else {
				showToast(result.data.error || 'Error deleting permission', 'error');
			}
		} catch (error) {
			console.error("Error deleting permission:", error);
			showToast('Error deleting permission', 'error');
		} finally {
			setLoading(false);
			setDeletePermissionId(null);
		}
	};

	const confirmRevokePermission = async () => {
		if (!revokePermissionId) return;
		setLoading(true);
		try {
			const functions = getFunctions(app);
			const editPermissionsFn = httpsCallable(functions, 'editPermissions');
			
			const result = await editPermissionsFn({ 
				id: revokePermissionId, 
				operation: "revoke" 
			});

			if (result.data.success) {
				showToast('Permission revoked from all users successfully', 'success');
			} else {
				showToast(result.data.error || 'Error revoking permission', 'error');
			}
		} catch (error) {
			console.error("Error revoking permission:", error);
			showToast('Error revoking permission', 'error');
		} finally {
			setLoading(false);
			setRevokePermissionId(null);
		}
	};

	useEffect(() => {
		const unsubscribe = onSnapshot(collection(db, 'permissions'), (snapshot) => {
			const items = snapshot.docs.map(doc => ({
				id: doc.id,
				...doc.data()
			}));
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
					<button 
						className="w-full sm:w-auto justify-center sm:justify-start bg-white border border-slate-200 px-4 md:px-6 py-3 md:py-4 rounded-xl cursor-pointer flex items-center gap-3 font-semibold text-slate-600 transition-all duration-200 shadow-sm hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300 hover:text-slate-800" 
						onClick={() => setShowDeptPopup(true)}
					>
						<FaBuilding className="text-emerald-800 text-lg" />
						Manage Departments
					</button>
					<button 
						className="w-full sm:w-auto justify-center sm:justify-start bg-white border border-slate-200 px-4 md:px-6 py-3 md:py-4 rounded-xl cursor-pointer flex items-center gap-3 font-semibold text-slate-600 transition-all duration-200 shadow-sm hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300 hover:text-slate-800" 
						onClick={() => setShowDesigPopup(true)}
					>
						<FaUserTie className="text-emerald-800 text-lg" />
						Manage Designations
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
									<th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-[10px] sm:text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
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
												<td className="px-3 sm:px-6 py-3 sm:py-4 text-center whitespace-nowrap text-xs sm:text-sm font-medium">
													<div className="flex justify-center items-center gap-3">
														<button
															onClick={() => handleEditPermission(perm)}
															className="text-blue-500 hover:text-blue-700 transition-colors"
															title="Edit Permission"
														>
															<FaEdit className="w-4 h-4" />
														</button>
														<button
															onClick={() => handleRevokePermission(perm.id)}
															className="text-amber-500 hover:text-amber-700 transition-colors"
															title="Revoke from all users"
														>
															<FaUserSlash className="w-4 h-4" />
														</button>
														<button
															onClick={() => handleDeletePermission(perm.id)}
															className="text-red-500 hover:text-red-700 transition-colors"
															title="Delete Permission"
														>
															<FaTrash className="w-4 h-4" />
														</button>
													</div>
												</td>
											</tr>
										);
									})
								) : (
									<tr>
										<td colSpan="6" className="px-6 py-8 text-center text-sm text-gray-400">
											No permissions configured. Click "Permission Model" to add one.
										</td>
									</tr>
								)}
				</tbody>
						</table>
					</div>
				</div>
			</div>

			<PermissionPopup
				isOpen={permissionPopup}
				onClose={() => {
					setPermissionPopup(false);
					setEditPermissionData(null);
				}}
				editData={editPermissionData}
			/>
			<DepartmentPopup 
				isOpen={showDeptPopup} 
				onClose={() => setShowDeptPopup(false)} 
			/>
			<Designation 
				isOpen={showDesigPopup} 
				onClose={() => setShowDesigPopup(false)} 
			/>

			<DeleteModal 
				isOpen={!!deletePermissionId}
				onClose={() => setDeletePermissionId(null)}
				onConfirm={confirmDeletePermission}
				title="Delete Permission Model?"
				message="Are you sure you want to delete this permission model?"
				loading={loading}
			/>

			<DeleteModal 
				isOpen={!!revokePermissionId}
				onClose={() => setRevokePermissionId(null)}
				onConfirm={confirmRevokePermission}
				title="Revoke Permissions?"
				message="Are you sure you want to revoke this permission model from all assigned admin users?"
				loading={loading}
				confirmText="Revoke"
			/>
		</div>
	);
};

function Designation({ isOpen, onClose }) {
	const { showToast } = useToast();
	const [designations, setDesignations] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [formData, setFormData] = useState({
	  id: '',
	  designationName: ""
	});
	const [editData, setEditData] = useState(null);
  
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [designationToDelete, setDesignationToDelete] = useState(null);
				const functions = getFunctions(app, "asia-south1");

	useEffect(() => {
	  if (!isOpen) return;
  
	  const q = query(collection(db, "designations"), orderBy("designationName"));
	  const unsubscribe = onSnapshot(q, (snapshot) => {
		const types = snapshot.docs.map(doc => ({
		  id: doc.id,
		  ...doc.data()
		}));
		setDesignations(types);
	  }, (err) => {
		console.error("Error fetching designations:", err);
	  });
  
	  return () => unsubscribe();
	}, [isOpen]);
  
	if (!isOpen) return null;
  
	const handleInputChange = (e) => {
	  setFormData({ ...formData, designationName: e.target.value });
	};

	const handleEdit = (desig) => {
		setEditData(desig);
		setFormData({ id: desig.id, designationName: desig.designationName });
	};

	const resetForm = () => {
		setEditData(null);
		setFormData({ id: '', designationName: "" });
	};

	const handleAdd = async (e) => {
	  e.preventDefault();
	  setError("");
	  setLoading(true);
  
	  try {
		if (editData) {
			const editSettingsFn = httpsCallable(functions, 'editSettings');
			
			const result = await editSettingsFn({
				id: editData.id,
				type: "designation",
				operation: "edit",
				formData: { name: formData.designationName }
			});

			if (result.data.success) {
				showToast("Designation updated successfully!", "success");
				resetForm();
			} else {
				setError(result.data.error || "Error updating designation");
			}
		} else {
			const payload = {
				designationName: formData.designationName,
				searchKey: formData.designationName.toLowerCase(),
				createdAt: new Date(),
			};
	
			await addDoc(collection(db, "designations"), payload);
			showToast("Designation created successfully!", "success");
			resetForm();
		}
	  } catch (err) {
		console.error("Designation submit error:", err);
		setError(err.message || "Unexpected error occurred.");
	  } finally {
		setLoading(false);
	  }
	};
  
	const handleDelete = (desig) => {
	  setDesignationToDelete(desig);
	  setIsDeleteModalOpen(true);
	};
  
	const confirmDelete = async () => {
	  if (!designationToDelete) return;
	  setLoading(true);
	  try {
		const editSettingsFn = httpsCallable(functions, 'editSettings');
		
		const result = await editSettingsFn({
			id: designationToDelete.id,
			type: "designation",
			operation: "delete"
		});

		if (result.data.success) {
			showToast("Designation deleted successfully", "success");
		} else {
			showToast(result.data.error || "Error deleting designation", "error");
		}
	  } catch (error) {
		console.error("Error deleting designation:", error);
		showToast("Error deleting designation", "error");
	  } finally {
		setLoading(false);
		setIsDeleteModalOpen(false);
		setDesignationToDelete(null);
	  }
	};
  
	return (
	  <>
		<div className="fixed inset-0 z-[1000] flex justify-center items-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 p-4">
		  <div className="bg-white p-8 rounded-[24px] w-full max-w-[500px] shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
			<div className="flex justify-between items-center mb-6">
			  <h2 className="text-xl font-bold text-emerald-900">Manage Designations</h2>
			  <button 
                className="text-[#a0aec0] hover:bg-slate-50 hover:text-slate-800 p-2 rounded-lg transition-all flex items-center justify-center" 
                onClick={onClose}
              >
				<FaTimes className="text-lg" />
			  </button>
			</div>
  
			<div className="mb-8 pb-8 border-b border-slate-100">
			  <form onSubmit={handleAdd}>
				<div className="flex gap-3">
				  <input
					type="text"
					placeholder="Enter Designation Title"
					className="flex-1 p-3 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
					value={formData.designationName}
					onChange={handleInputChange}
					autoFocus
					disabled={loading}
				  />
				  <button 
                    type="submit" 
                    className="bg-emerald-700 text-white px-6 rounded-xl font-semibold cursor-pointer hover:bg-emerald-800 transition-colors disabled:opacity-50" 
                    disabled={loading}
                  >
					{loading ? "Saving..." : editData ? "Update" : "Add"}
				  </button>
				  {editData && (
					<button 
						type="button" 
						onClick={resetForm}
						className="bg-slate-100 text-slate-600 px-4 rounded-xl font-semibold cursor-pointer hover:bg-slate-200 transition-colors"
					>
						Cancel
					</button>
				  )}
				</div>
				{error && <p className="text-red-500 text-sm mt-2">{error}</p>}
			  </form>
			</div>
  
			<div className="max-h-[300px] overflow-y-auto pr-1">
			  {designations.length > 0 ? (
				designations.map(desig => (
				  <div key={desig.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl mb-2 hover:bg-slate-100 transition-colors group">
					<span className="font-medium text-slate-700">{desig.designationName}</span>
					<div className="flex items-center gap-1">
						<button
							className="text-blue-400 hover:bg-blue-50 hover:text-blue-600 p-2 rounded-lg transition-all"
							onClick={() => handleEdit(desig)}
						>
							<FaEdit className="w-4 h-4" />
						</button>
						<button
							className="text-red-400 hover:bg-red-50 hover:text-red-600 p-2 rounded-lg transition-all"
							onClick={() => handleDelete(desig)}
						>
							<FaTrash className="w-4 h-4" />
						</button>
					</div>
				  </div>
				))
			  ) : (
				<p className="text-center text-slate-400 py-4">No designations added yet.</p>
			  )}
			</div>
  
			<div className="mt-8 flex justify-end border-t border-slate-100 pt-6">
			  <button 
                className="bg-white border border-slate-200 text-slate-600 px-6 py-3 rounded-xl font-semibold cursor-pointer transition-all hover:bg-slate-50 hover:text-slate-800" 
                onClick={onClose}
              >
				Close
			  </button>
			</div>
		  </div>
		</div>
  
		<DeleteModal 
			isOpen={isDeleteModalOpen}
			onClose={() => setIsDeleteModalOpen(false)}
			onConfirm={confirmDelete}
			title="Delete Designation?"
			itemName={designationToDelete?.designationName}
			loading={loading}
		/>
	  </>
	);
  }

function DepartmentPopup({ isOpen, onClose }) {
	const { showToast } = useToast();
	const [departments, setDepartments] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [formData, setFormData] = useState({
	  id: '',
	  departmentName: ""
	});
	const [editData, setEditData] = useState(null);
  
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [departmentToDelete, setDepartmentToDelete] = useState(null);
  
	useEffect(() => {
	  if (!isOpen) return;
  
	  const q = query(collection(db, "departments"), orderBy("departmentName"));
	  const unsubscribe = onSnapshot(q, (snapshot) => {
		const types = snapshot.docs.map(doc => ({
		  id: doc.id,
		  ...doc.data()
		}));
		setDepartments(types);
	  }, (err) => {
		console.error("Error fetching departments:", err);
	  });
  
	  return () => unsubscribe();
	}, [isOpen]);
	if (!isOpen) return null;
  
	const handleInputChange = (e) => {
	  setFormData({ ...formData, departmentName: e.target.value });
	};

	const handleEdit = (dept) => {
		setEditData(dept);
		setFormData({ id: dept.id, departmentName: dept.departmentName });
	};

	const resetForm = () => {
		setEditData(null);
		setFormData({ id: '', departmentName: "" });
	};

	const handleAdd = async (e) => {
	  e.preventDefault();
	  setError("");
	  setLoading(true);
  
	  try {
		if (editData) {
			const functions = getFunctions(app);
			const editSettingsFn = httpsCallable(functions, 'editSettings');
			
			const result = await editSettingsFn({
				id: editData.id,
				type: "department",
				operation: "edit",
				formData: { name: formData.departmentName }
			});

			if (result.data.success) {
				showToast("Department updated successfully!", "success");
				resetForm();
			} else {
				setError(result.data.error || "Error updating department");
			}
		} else {
			const payload = { departmentName: formData.departmentName };
			await addDoc(collection(db, "departments"), payload);
			showToast("Department created successfully!", "success");
			resetForm();
		}
	  } catch (err) {
		console.error("Department submit error:", err);
		setError(err.message || "Unexpected error occurred.");
	  } finally {
		setLoading(false);
	  }
	};
  
	const handleDelete = (dept) => {
	  setDepartmentToDelete(dept);
	  setIsDeleteModalOpen(true);
	};
  
	const confirmDelete = async () => {
	  if (!departmentToDelete) return;
	  setLoading(true);
	  try {
		const functions = getFunctions(app);
		const editSettingsFn = httpsCallable(functions, 'editSettings');
		
		const result = await editSettingsFn({
			id: departmentToDelete.id,
			type: "department",
			operation: "delete"
		});

		if (result.data.success) {
			showToast("Department deleted successfully", "success");
		} else {
			showToast(result.data.error || "Error deleting department", "error");
		}
	  } catch (error) {
		console.error("Error deleting department:", error);
		showToast("Error deleting department", "error");
	  } finally {
		setLoading(false);
		setIsDeleteModalOpen(false);
		setDepartmentToDelete(null);
	  }
	};
  
	return (
	  <>
		<div className="fixed inset-0 z-[1000] flex justify-center items-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 p-4">
		  <div className="bg-white p-8 rounded-[24px] w-full max-w-[500px] shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
			<div className="flex justify-between items-center mb-6">
			  <h2 className="text-xl font-bold text-emerald-900">Manage Departments</h2>
			  <button 
                className="text-[#a0aec0] hover:bg-slate-50 hover:text-slate-800 p-2 rounded-lg transition-all flex items-center justify-center" 
                onClick={onClose}
              >
				<FaTimes className="text-lg" />
			  </button>
			</div>
  
			<div className="mb-8 pb-8 border-b border-slate-100">
			  <form onSubmit={handleAdd}>
				<div className="flex gap-3">
				  <input
					type="text"
					placeholder="Enter Department Name"
					className="flex-1 p-3 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
					value={formData.departmentName}
					onChange={handleInputChange}
					autoFocus
					disabled={loading}
				  />
				  <button 
                    type="submit" 
                    className="bg-emerald-700 text-white px-6 rounded-xl font-semibold cursor-pointer hover:bg-emerald-800 transition-colors disabled:opacity-50" 
                    disabled={loading}
                  >
					{loading ? "Saving..." : editData ? "Update" : "Add"}
				  </button>
				  {editData && (
					<button 
						type="button" 
						onClick={resetForm}
						className="bg-slate-100 text-slate-600 px-4 rounded-xl font-semibold cursor-pointer hover:bg-slate-200 transition-colors"
					>
						Cancel
					</button>
				  )}
				</div>
				{error && <p className="text-red-500 text-sm mt-2">{error}</p>}
			  </form>
			</div>
  
			<div className="max-h-[300px] overflow-y-auto pr-1">
			  {departments.length > 0 ? (
				departments.map(dept => (
				  <div key={dept.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl mb-2 hover:bg-slate-100 transition-colors group">
					<span className="font-medium text-slate-700">{dept.departmentName}</span>
					<div className="flex items-center gap-1">
						<button
							className="text-blue-400 hover:bg-blue-50 hover:text-blue-600 p-2 rounded-lg transition-all"
							onClick={() => handleEdit(dept)}
						>
							<FaEdit className="w-4 h-4" />
						</button>
						<button
							className="text-red-400 hover:bg-red-50 hover:text-red-600 p-2 rounded-lg transition-all"
							onClick={() => handleDelete(dept)}
						>
							<FaTrash className="w-4 h-4" />
						</button>
					</div>
				  </div>
				))
			  ) : (
				<p className="text-center text-slate-400 py-4">No departments added yet.</p>
			  )}
			</div>
  
			<div className="mt-8 flex justify-end border-t border-slate-100 pt-6">
			  <button 
                className="bg-white border border-slate-200 text-slate-600 px-6 py-3 rounded-xl font-semibold cursor-pointer transition-all hover:bg-slate-50 hover:text-slate-800" 
                onClick={onClose}
              >
				Close
			  </button>
			</div>
		  </div>
		</div>
  
		<DeleteModal 
			isOpen={isDeleteModalOpen}
			onClose={() => setIsDeleteModalOpen(false)}
			onConfirm={confirmDelete}
			title="Delete Department?"
			itemName={departmentToDelete?.departmentName}
			loading={loading}
		/>
	  </>
	);
  }
