/* eslint-disable max-len */
const {onCall} = require("firebase-functions/v2/https");
const {db, auth} = require("../config/config");
const {adminLogs} = require("../logs/admin-logs");

const addUser = onCall(async (req) => {
  try {
    if (!req.auth) {
      return {success: false, error: "Unauthorized"};
    }
    const data = req.data || {};
    const {
      action = "add",
      id,
      name,
      email,
      password,
      mobile,
      permissionId,
      designation,
      department,
    } = data;

    if (action === "add") {
      if (!name || !email || !password || !mobile) {
        return {success: false, error: "Missing required fields"};
      }

      const mobileQuerySnapshot = await db.collection("admin-users")
          .where("mobile", "==", mobile)
          .get();

      if (!mobileQuerySnapshot.empty) {
        return {success: false, error: "Mobile number already exists"};
      }

      const userRecord = await auth.createUser({
        email,
        password,
        displayName: name,
      });

      const uid = userRecord.uid;

      const payload = {
        uid,
        name,
        email,
        mobile,
        permissionId: permissionId || "",
        designation: designation || "",
        department: department || "",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await db.collection("admin-users").doc(uid).set(payload);

      await adminLogs(req.auth.uid, req.auth.token.email, "User Created", `Created admin user: ${name} (${email})`);
      return {status: 200, success: true, uid, email};
    } else if (action === "edit") {
      if (!id) return {success: false, error: "Missing user ID"};
      const currentData = await db.collection("admin-users").doc(id).get();
      if (!currentData.exists) {
        return {success: false, error: "User not found"};
      }
      const updateData = {
        displayName: name,
        email: email,
      };
      if (password && password.trim() !== "") {
        updateData.password = password;
      }
      await auth.updateUser(id, updateData);
      const payload = {
        name: name || currentData.data().name,
        email: email || currentData.data().email,
        mobile: mobile || currentData.data().mobile,
        permissionId: permissionId || currentData.data().permissionId,
        designation: designation || currentData.data().designation,
        department: department || currentData.data().department,
        updatedAt: new Date(),
      };
      await db.collection("admin-users").doc(id).update(payload);
      await adminLogs(req.auth.uid, req.auth.token.email, "User Updated", `Updated admin user: ${name} (${email})`);
      return {
        status: 200,
        success: true,
        message: "User updated successfully",
      };
    } else if (action === "delete") {
      if (!id) return {success: false, error: "Missing user ID"};
      await auth.deleteUser(id);
      await db.collection("admin-users").doc(id).update({
        status: "removed",
        updatedAt: new Date(),
        deletedAt: new Date(),
        deletedBy: req.auth.uid,
      });
      await adminLogs(req.auth.uid, req.auth.token.email, "User Deleted", `Deleted admin user ID: ${id}`);
      return {
        status: 200,
        success: true,
        message: "User deleted successfully",
      };
    } else {
      return {success: false, error: "Invalid action"};
    }
  } catch (error) {
    console.error("Admin Action Error:", error);
    return {
      success: false,
      error: error.message || "Internal server error",
    };
  }
});
const changePassword = onCall({
  cors: true,
  region: "asia-south1",
}, async (req) => {
  try {
    if (!req.auth) {
      return {success: false, error: "Unauthorized"};
    }
    const data = req.data || {};
    const {id, password} = data;
    if (!id || !password) {
      return {success: false, error: "Missing required fields"};
    }
    await auth.updateUser(id, {password});
    await adminLogs(req.auth.uid, req.auth.token.email, "Password Changed", `Changed password for user ID: ${id}`);
    return {status: 200, success: true, message: "Password changed successfully"};
  } catch (error) {
    console.error("Change Password Error:", error);
    return {
      success: false,
      error: error.message || "Internal server error",
    };
  }
});
module.exports = {addUser, changePassword};
