/* eslint-disable max-len */
const {onCall} = require("firebase-functions/v2/https");
const {db} = require("../config/config");
const {adminLogs} = require("../logs/admin-logs");

const editSettings = onCall(async (request) => {
  try {
    if (!request.auth) {
      return {success: false, error: "Unauthorized"};
    }
    const payload = request.data;
    const {id, type, formData, operation} = payload;

    if (!id || !type) {
      return {success: false, error: "ID or Type is required"};
    }

    const batch = db.batch();
    const mainCol = type === "department" ? "departments" : "designations";
    const nameField = type === "department" ? "departmentName" : "designationName";


    // ======================== UPDATE PERMISSION COLLECTION ======================== //
    const permissionData = await db.collection("permissions").where(type + "Id", "==", id).get();
    const permissionIds = [];
    permissionData.forEach((docSnap) => {
      permissionIds.push(docSnap.id);
      batch.update(docSnap.ref, {
        [nameField]: formData.name,
      });
    });
    if (operation === "edit") {
    // ======================== UPDATE MAIN COLLECTION ======================== //
      const mainRef = db.collection(mainCol).doc(id);
      batch.update(mainRef, {
        [nameField]: formData.name,
        name: formData.name,
        searchKey: formData.name.toLowerCase(),
        updatedAt: new Date(),
      });
      if (permissionIds.length > 0) {
      // ======================== UPDATE ADMIN-USERS COLLECTION ======================== //
        for (const permId of permissionIds) {
          const adminUsersData = await db.collection("admin-users").where("permissionId", "==", permId).get();
          adminUsersData.forEach((userSnap) => {
            batch.update(userSnap.ref, {
              [type]: formData.name,
              updatedAt: new Date(),
            });
          });
        }
      } else if (operation === "delete") {
        if (permissionIds.length > 0) {
          return {success: false, error: "Permission is already assigned to an admin user"};
        }
        // ======================== UPDATE MAIN COLLECTION ======================== //
        const mainRef = db.collection(mainCol).doc(id);
        batch.delete(mainRef);
      }
    }

    // ======================== COMMIT BATCH ======================== //
    await batch.commit();

    await adminLogs(request.auth.uid, request.auth.token.email, `Edit ${type}`, `Updated ${type} ${id}`);
    return {success: true, message: `Updated ${type} successfully`};
  } catch (err) {
    console.error("Edit Settings Error:", err);
    return {
      success: false,
      error: err.message || "Internal server error",
    };
  }
});
module.exports = {editSettings};
