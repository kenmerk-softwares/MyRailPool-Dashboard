import React, { useState, useEffect } from 'react';
import { FaBuilding, FaUserTie, FaTimes, FaTrash } from 'react-icons/fa';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app, db } from '../../Config/Config';
import { useToast } from '../../Toast/ToastContext';


export default function EmployeeSettings() {
  const [showDeptPopup, setShowDeptPopup] = useState(false);
  const [showDesigPopup, setShowDesigPopup] = useState(false);

  return (
    <div className="p-6 md:p-8">
       <div className="mb-8">
        <div className="header-title">
          <h1 className="text-2xl font-bold text-slate-800">Employee Settings</h1>
          <p className="text-slate-500">Manage access control, departments and designations.</p>
        </div>
      </div>

      <div className="employee-settings-container">
        <div className="flex gap-4 mb-8 flex-wrap">
          <button 
            className="bg-white border border-slate-200 px-6 py-4 rounded-xl cursor-pointer flex items-center gap-3 font-semibold text-slate-600 transition-all shadow-sm hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300 hover:text-slate-800" 
            onClick={() => setShowDeptPopup(true)}
          >
            <FaBuilding className="text-emerald-800 text-lg" />
            Manage Departments
          </button>
          <button 
            className="bg-white border border-slate-200 px-6 py-4 rounded-xl cursor-pointer flex items-center gap-3 font-semibold text-slate-600 transition-all shadow-sm hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300 hover:text-slate-800" 
            onClick={() => setShowDesigPopup(true)}
          >
            <FaUserTie className="text-emerald-800 text-lg" />
            Manage Designations
          </button>
        </div>

        {/* <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', color: '#a0aec0', textAlign: 'center' }}>
          <h3>Employee List Module</h3>
          <p>Coming Soon...</p>
        </div> */}
      </div>

      {/* Popups */}
      <DepartmentPopup 
        isOpen={showDeptPopup} 
        onClose={() => setShowDeptPopup(false)} 
      />
      <Designation 
        isOpen={showDesigPopup} 
        onClose={() => setShowDesigPopup(false)} 
      />
    </div>
  );
}

function Designation({ isOpen, onClose }) {
	const { showToast } = useToast();
	const [designations, setDesignations] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [formData, setFormData] = useState({
	  uid: '',
	  designationName: ""
	});
  
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [designationToDelete, setDesignationToDelete] = useState(null);
  
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
  
	const handleAdd = async (e) => {
	  e.preventDefault();
	  setError("");
	  setLoading(true);
  
	  try {
		const functions = getFunctions(app, "asia-south1");
		const isUpdating = Boolean(formData.uid);
  
		const designationFunction = httpsCallable(
		  functions,
		  "manageDesignation"
		);
  
		const payload = isUpdating
		  ? { action: "update", id: formData.uid, designationName: formData.designationName }
		  : { action: "add", designationName: formData.designationName };
  
		const result = await designationFunction(payload);
		const data = result.data || {};
  
		if (data.success) {
		  showToast(
			isUpdating ? "Designation updated successfully!" : "Designation created successfully!",
			"success"
		  );
  
		  setFormData({
			uid: '',
			designationName: ""
		  });
		} else if (data.error) {
		  setError(data.error);
		} else {
		  setError("Failed to save designation.");
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
		const functions = getFunctions(app, "asia-south1");
		const deleteFunction = httpsCallable(functions, "manageDesignation");
		const result = await deleteFunction({ action: "delete", id: designationToDelete.id });
		if (result.data.success) {
		  showToast("Designation deleted successfully", "success");
		} else {
		  showToast("Failed to delete designation", "error");
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
					{loading ? "Saving..." : "Add"}
				  </button>
				</div>
				{error && <p className="text-red-500 text-sm mt-2">{error}</p>}
			  </form>
			</div>
  
			<div className="max-h-[300px] overflow-y-auto pr-1">
			  {designations.length > 0 ? (
				designations.map(desig => (
				  <div key={desig.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl mb-2 hover:bg-slate-100 transition-colors group">
					<span className="font-medium text-slate-700">{desig.designationName}</span>
					<button
					  className="text-red-400 hover:bg-red-50 hover:text-red-600 p-2 rounded-lg transition-all"
					  onClick={() => handleDelete(desig)}
					>
					  <FaTrash className="w-4 h-4" />
					</button>
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
  
		{isDeleteModalOpen && (
		  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
			<div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 transform transition-all scale-100 text-center">
			  <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
				<FaTrash className="text-xl" />
			  </div>
			  <h3 className="text-lg font-bold text-gray-900">Delete Designation?</h3>
			  <p className="text-gray-500 text-sm mt-2 mb-6">
				Are you sure you want to delete <br />
				<span className="font-semibold text-gray-900">{designationToDelete?.designationName}</span>?<br />
				This action cannot be undone.
			  </p>
			  <div className="flex gap-3">
				<button
				  onClick={() => setIsDeleteModalOpen(false)}
				  disabled={loading}
				  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
				>
				  Cancel
				</button>
				<button
				  onClick={confirmDelete}
				  disabled={loading}
				  className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white font-semibold text-sm hover:bg-red-600 shadow-lg shadow-red-200 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
				>
				  {loading ? 'Deleting...' : 'Delete'}
				</button>
			  </div>
			</div>
		  </div>
		)}
	  </>
	);
  }

function DepartmentPopup({ isOpen, onClose }) {
	const { showToast } = useToast();
	const [departments, setDepartments] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [formData, setFormData] = useState({
	  uid: '',
	  departmentName: ""
	});
  
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
  
	const handleAdd = async (e) => {
	  e.preventDefault();
	  setError("");
	  setLoading(true);
  
	  try {
		const functions = getFunctions(app, "asia-south1");
		const isUpdating = Boolean(formData.uid);
  
		const departmentFunction = httpsCallable(
		  functions,
		  "manageDepartment"
		);
  
		const payload = isUpdating
		  ? { action: "update", id: formData.uid, departmentName: formData.departmentName }
		  : { action: "add", departmentName: formData.departmentName };
  
		const result = await departmentFunction(payload);
		const data = result.data || {};
  
		if (data.success) {
		  showToast(
			"Department created successfully!",
			"success"
		  );
  
		  setFormData({
			uid: '',
			departmentName: ""
		  });
		} else if (data.error) {
		  setError(data.error);
		} else {
		  setError("Failed to save department.");
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
		const functions = getFunctions(app, "asia-south1");
		const deleteFunction = httpsCallable(functions, "manageDepartment");
		const result = await deleteFunction({ action: "delete", id: departmentToDelete.id });
		if (result.data.success) {
		  showToast("Department deleted successfully", "success");
		} else {
		  showToast("Failed to delete department", "error");
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
					{loading ? "Saving..." : "Add"}
				  </button>
				</div>
				{error && <p className="text-red-500 text-sm mt-2">{error}</p>}
			  </form>
			</div>
  
			<div className="max-h-[300px] overflow-y-auto pr-1">
			  {departments.length > 0 ? (
				departments.map(dept => (
				  <div key={dept.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl mb-2 hover:bg-slate-100 transition-colors group">
					<span className="font-medium text-slate-700">{dept.departmentName}</span>
					<button
					  className="text-red-400 hover:bg-red-50 hover:text-red-600 p-2 rounded-lg transition-all"
					  onClick={() => handleDelete(dept)}
					>
					  <FaTrash className="w-4 h-4" />
					</button>
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
  
		{isDeleteModalOpen && (
		  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
			<div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 transform transition-all scale-100 text-center">
			  <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
				<FaTrash className="text-xl" />
			  </div>
			  <h3 className="text-lg font-bold text-gray-900">Delete Department?</h3>
			  <p className="text-gray-500 text-sm mt-2 mb-6">
				Are you sure you want to delete <br />
				<span className="font-semibold text-gray-900">{departmentToDelete?.departmentName}</span>?<br />
				This action cannot be undone.
			  </p>
			  <div className="flex gap-3">
				<button
				  onClick={() => setIsDeleteModalOpen(false)}
				  disabled={loading}
				  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
				>
				  Cancel
				</button>
				<button
				  onClick={confirmDelete}
				  disabled={loading}
				  className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white font-semibold text-sm hover:bg-red-600 shadow-lg shadow-red-200 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
				>
				  {loading ? 'Deleting...' : 'Delete'}
				</button>
			  </div>
			</div>
		  </div>
		)}
	  </>
	);
  }
