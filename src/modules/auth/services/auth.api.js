import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../../shared/services/firebase";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";

import { serialize } from "../../../shared/utils/serialize";

// ==================== USER PROFILE FETCH ==================== //

/**
 * @param {string} uid - The Firebase Auth UID.
 * @returns {Promise<Object>} The user profile data.
 */
export const getUserProfile = async (uid) => {
  if (!uid) {
    throw new Error("UID is required");
  }

  const docRef = doc(db, "admin-users", uid);
  const snap = await getDoc(docRef);

  if (!snap.exists()) {
    throw new Error("User profile not found in admin-users");
  }

  return serialize({
    id: snap.id,
    ...snap.data(),
  });
};

// ==================== PERMISSION FETCH ==================== //

/**
 * @param {string} permissionId - The ID of the permission document.
 * @returns {Promise<Object>} The permission data.
 */
export const getPermissions = async (permissionId) => {
  if (!permissionId) {
    throw new Error("Permission ID is required");
  }

  const docRef = doc(db, "permissions", permissionId);
  const snap = await getDoc(docRef);

  if (!snap.exists()) {
    throw new Error("Permission model not found");
  }

  return serialize({
    id: snap.id,
    ...snap.data(),
  });
};

// ==================== AUTHENTICATION FUNCTIONS ==================== //

export const adminLogin = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const adminRef = doc(db, 'admin-users', user.uid);
        const adminSnap = await getDoc(adminRef);

        if (!adminSnap.exists()) {
            await signOut(auth);
            return {
                success: false,
                error: 'Access denied. Admin only.',
            };
        }
        
        const adminData = adminSnap.data();
        if (adminData.uid !== user.uid) {
            await signOut(auth);
            return {
                success: false,
                error: 'Account disabled. Contact admin.',
            };
        }
        
        return {
            success: true,
            user: userCredential.user,
        };
    } catch (error) {
        console.error("Login Error:", error);
        let errorMessage = "An error occurred during login. Please try again.";

        if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
            errorMessage = 'User not found or invalid credentials.';
        } else if (error.code === 'auth/wrong-password') {
            errorMessage = 'Incorrect password.';
        } else if (error.code === 'auth/too-many-requests') {
            errorMessage = 'Too many failed login attempts. Please try again later.';
        } else if (error.code === 'auth/network-request-failed') {
            errorMessage = 'Network error. Please check your connection.';
        }

        return {
            success: false,
            error: errorMessage,
        };
    }
}

export const adminLogout = async () => {
    await signOut(auth);
    return {
        success: true,
    };
}

