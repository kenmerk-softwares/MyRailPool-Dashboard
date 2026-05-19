/* eslint-disable max-len */
const {db, auth} = require("../../shared/config/firebase");
const {adminLogs} = require("../../logs/logs.service");
const {logInfo, logError} = require("../../shared/utils/logger");
const addAdminUserService = async (payLoad, req) => {
  const {action, id, name, email, password, mobile, permissionId, designation, department} = payLoad;
  try {
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
      logInfo(`User ${id} created successfully`);
      return {status: 200, success: true, message: "User added successfully"};
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
      logInfo(`User ${id} updated successfully`);
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
      logInfo(`User ${id} deleted successfully`);
      return {
        status: 200,
        success: true,
        message: "User deleted successfully",
      };
    } else {
      return {success: false, error: "Invalid action"};
    }
  } catch (error) {
    return {error: error.message, success: false};
  }
};

// ==================== CHANGE PASSWORD ==================== //
const changePasswordService = async (req) => {
  const {id, password} = req.data;
  await auth.updateUser(id, {password});
  await adminLogs(req.auth.uid, req.auth.token.email, "Password Changed", `Changed password for user ID: ${id}`);
  return {status: 200, success: true, message: "Password changed successfully"};
};
// ====================== EDIT PERMISSIONS SERVICE ==================== //
const editPermissionsService = async (req) => {
  const {id, payload, operation} = req.data;
  const batch = db.batch();
  const permissionRef = db.collection("permissions").doc(id);

  if (operation === "delete" || operation === "revoke") {
    // ========================= DELETE PERMISSION MODEL OPERATION ========================= //
    const adminUsersSnap = await db.collection("admin-users").where("permissionId", "==", id).get();
    if (!adminUsersSnap.empty && operation !== "revoke") {
      logError(req.auth.uid, req.auth.token.email, "Error editing permissions", `Permission is already assigned to an admin user and cannot be deleted.`);
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
    await adminLogs(req.auth.uid, req.auth.token.email, "Delete Permission", `Deleted permission model ID: ${id}`);
    logInfo(`Permission ${id} deleted successfully`);
    return {success: true, message: "Permission deleted successfully"};
  } else if (operation === "restore") {
    // ========================= RESTORE PERMISSION MODEL OPERATION ========================= //
    const usersSnap = await db.collection("admin-users").where("revokedId", "==", id).get();
    for (const userSnap of usersSnap.docs) {
      const permissionData = await db.collection("permissions").doc(id).get();
      batch.update(userSnap.ref, {permissionId: id, designationName: permissionData.data().designationName, departmentName: permissionData.data().departmentName, revokedId: "", updatedAt: new Date()});
    }
    await batch.commit();
    await adminLogs(req.auth.uid, req.auth.token.email, "Restore Permission", `Restored permission model ID: ${id}`);
    logInfo(`Permission ${id} restored successfully`);
    return {success: true, message: "Permission restored successfully"};
  } else if (operation === "edit") {
    if (!payload) {
      logError(req.auth.uid, req.auth.token.email, "Error editing permissions", "Missing payload for edit operation");
      return {success: false, error: "Missing payload for edit operation"};
    }

    const permissionDoc = await permissionRef.get();
    if (!permissionDoc.exists) {
      logError(req.auth.uid, req.auth.token.email, "Error editing permissions", "Permission model not found");
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
    await adminLogs(req.auth.uid, req.auth.token.email, "Edit Permission", `Updated permission model: ${payload.permissionName || id}`);
    logInfo(`Permission ${id} updated successfully`);
    return {success: true, message: "Permissions updated successfully"};
  } else {
    logError(req.auth.uid, req.auth.token.email, "Error editing permissions", "Invalid operation type");
    return {success: false, error: "Invalid operation type"};
  }
};

// ====================== UPDATE EMPLOYEE SETTINGS SERVICE ==================== //
const updateEmployeeSettingsService = async (req) => {
  const {type, id, operation, formData} = req.data;
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
            [type]: formData.name || userSnap.data()[type],
            updatedAt: new Date(),
          });
        });
        const permissionRef = db.collection("permissions").doc(permId);
        batch.update(permissionRef, {
          [nameField]: formData.name,
          updatedAt: new Date(),
        });
      }
    }
  } else if (operation === "delete") {
    if (permissionIds.length > 0) {
      return {success: false, error: "This item is used in permission models and cannot be deleted."};
    }
    // ======================== UPDATE MAIN COLLECTION ======================== //
    const mainRef = db.collection(mainCol).doc(id);
    batch.delete(mainRef);
  }

  // ======================== COMMIT BATCH ======================== //
  await batch.commit();

  await adminLogs(req.auth.uid, req.auth.token.email, `Edit ${type}`, `Updated ${type} ${id}`);
  logInfo(`Updated ${type} successfully`);
  return {success: true, message: `Updated ${type} successfully`};
};
// ==================== CANCEL TRIP SERVICE ==================== //
const cancelTripService = async (req) => {
    const { tripId } = req.data;

    // 1. Fetch the trip
    const tripRef = db.collection("trips").doc(tripId);
    const tripDoc = await tripRef.get();

    if (!tripDoc.exists) {
        return { success: false, error: "Trip not found" };
    }

    const tripData = tripDoc.data();
    if (tripData.status === "Cancelled") {
        return { success: false, error: "Trip is already cancelled" };
    }

    const batch = db.batch();

    // 2. Mark the trip as Cancelled
    batch.update(tripRef, {
        status: "Cancelled",
        updatedAt: new Date()
    });

    // 3. Fetch all bookings related to this trip
    const bookingsSnapshot = await db.collection("bookings")
        .where("tripId", "==", tripId)
        .get();

    for (const bookingDoc of bookingsSnapshot.docs) {
        const bookingData = bookingDoc.data();
        const usersArray = bookingData.users || [];
        const bookingId = bookingDoc.id;

        // 4. Cancel all active users in each booking
        const updatedUsers = usersArray.map(user => {
            if (user.status === "Confirmed" || user.status === "Pending") {
                return { ...user, status: "Cancelled", updatedAt: new Date() };
            }
            return user;
        });

        batch.update(bookingDoc.ref, {
            users: updatedUsers,
            status: "Cancelled",
            updatedAt: new Date()
        });

        // 5. Cancel all finance records for this booking and their corresponding user bookings
        const financeSnapshot = await db.collection("finance")
            .where("bookingId", "==", bookingId)
            .get();

        for (const financeDoc of financeSnapshot.docs) {
            const financeData = financeDoc.data();
            if (financeData.status !== "Cancelled") {
                batch.update(financeDoc.ref, { status: "Cancelled", updatedAt: new Date() });
            }

            const userId = financeData.userId;
            if (userId) {
                const userBookingRef = db.collection("users").doc(userId).collection("bookings").doc(financeDoc.id);
                batch.update(userBookingRef, {
                    status: "Cancelled",
                    updatedAt: new Date()
                });
            }
        }
    }

    await batch.commit();

    await adminLogs(req.auth.uid, req.auth.token.email, "Cancel Trip", `Cancelled trip ID: ${tripId} (${tripData.tripId || ""})`);
    logInfo(`Trip ${tripId} cancelled successfully by admin`);

    return { status: 200, success: true, message: "Trip cancelled successfully" };
};

module.exports = {addAdminUserService, changePasswordService, editPermissionsService, updateEmployeeSettingsService, cancelTripService};
