/* eslint-disable max-len */
const {onCall} = require("firebase-functions/v2/https");
const {db} = require("../config/config");
const {adminLogs} = require("../logs/admin-logs");

const editPermissions = onCall(async (request) => {
  try {
    if (!request.auth) {
      return {success: false, error: "Unauthorized"};
    }
    const {id, payload, operation} = request.data;
    if (!id || !operation) {
      return {success: false, error: "Missing required fields"};
    }

    const batch = db.batch();
    const permissionRef = db.collection("permissions").doc(id);

    if (operation === "delete" || operation === "revoke") {
      // ========================= DELETE PERMISSION MODEL OPERATION ========================= //
      const adminUsersSnap = await db.collection("admin-users").where("permissionId", "==", id).get();
      if (!adminUsersSnap.empty && operation !== "revoke") {
        return {success: false, error: "Permission is already assigned to an admin user and cannot be deleted."};
      }

      if (operation === "revoke") {
        // ========================= REVOKE PERMISSION MODEL FROM ADMIN USER ========================= //
        for (const userSnap of adminUsersSnap.docs) {
          batch.update(userSnap.ref, {permissionId: "", designationName: "", departmentName: "", revokedId: id, updatedAt: new Date()});
        }
      } else if (operation === "delete") {
        // ========================= DELETE PERMISSION MODEL ========================= //
        batch.delete(permissionRef);
      }
      await batch.commit();
      await adminLogs(request.auth.uid, request.auth.token.email, "Delete Permission", `Deleted permission model ID: ${id}`);
      return {success: true, message: "Permission deleted successfully"};
    } else if (operation === "restore") {
      // ========================= RESTORE PERMISSION MODEL OPERATION ========================= //
      const usersSnap = await db.collection("admin-users").where("revokedId", "==", id).get();
      for (const userSnap of usersSnap.docs) {
        const permissionData = await db.collection("permissions").doc(id).get();
        batch.update(userSnap.ref, {permissionId: id, designationName: permissionData.data().designationName, departmentName: permissionData.data().departmentName, revokedId: "", updatedAt: new Date()});
      }
      await batch.commit();
      await adminLogs(request.auth.uid, request.auth.token.email, "Restore Permission", `Restored permission model ID: ${id}`);
      return {success: true, message: "Permission restored successfully"};
    } else if (operation === "edit") {
      if (!payload) {
        return {success: false, error: "Missing payload for edit operation"};
      }

      const permissionDoc = await permissionRef.get();
      if (!permissionDoc.exists) {
        return {success: false, error: "Permission model not found"};
      }
      const oldData = permissionDoc.data();
      batch.update(permissionRef, {
        ...payload,
        updatedAt: new Date(),
      });

      const deptChanged = oldData.departmentId !== payload.departmentId;
      const desigChanged = oldData.designationId !== payload.designationId;

      if (deptChanged || desigChanged) {
        const adminUsersSnap = await db.collection("admin-users").where("permissionId", "==", id).get();
        adminUsersSnap.forEach((userSnap) => {
          const updateData = {updatedAt: new Date()};
          if (deptChanged) updateData.department = payload.departmentName;
          if (desigChanged) updateData.designation = payload.designationName;
          batch.update(userSnap.ref, updateData);
        });
      }
      await batch.commit();
      await adminLogs(request.auth.uid, request.auth.token.email, "Edit Permission", `Updated permission model: ${payload.permissionName || id}`);
      return {success: true, message: "Permissions updated successfully"};
    } else {
      return {success: false, error: "Invalid operation type"};
    }
  } catch (err) {
    console.error("Edit Permissions Error:", err);
    return {success: false, error: err.message || "Internal server error"};
  }
});

module.exports = {editPermissions};
