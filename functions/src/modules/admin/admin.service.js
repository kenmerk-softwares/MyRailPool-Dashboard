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
    const { FieldValue } = require("firebase-admin/firestore");
    const { bookingId, userId } = req.data;

    const bookingRef = db.collection("bookings").doc(bookingId);
    const bookingDoc = await bookingRef.get();

    if (!bookingDoc.exists) {
        return { success: false, error: "Booking not found" };
    }

    const bookingData = bookingDoc.data();
    const usersArray = bookingData.users || [];
    
    const userBookingIndex = usersArray.findIndex(u => u.userId === userId && (u.status === "Confirmed" || u.status === "Pending"));
    if (userBookingIndex === -1) {
        return { success: false, error: "Active user booking not found" };
    }
    
    const userBookingDetails = usersArray[userBookingIndex];
    const { bookingCount } = userBookingDetails;
    const { tripId, selectedDate } = bookingData;

    const tripRef = db.collection("trips").doc(tripId);
    const tripDoc = await tripRef.get();
    
    if (!tripDoc.exists) {
        return { success: false, error: "Trip not found" };
    }
    
    const tripData = tripDoc.data();
    const batch = db.batch();

    // 1. Restore the seats in trips
    const availableSeatsMap = tripData.available_seats || {};
    const currentAvailableSeats = availableSeatsMap[selectedDate] ?? tripData.total_seats;
    const updatedAvailableSeatsMap = {
        ...availableSeatsMap,
        [selectedDate]: currentAvailableSeats + bookingCount,
    };
    
    batch.update(tripRef, {
        available_seats: updatedAvailableSeatsMap,
        total_bookings: FieldValue.increment(-bookingCount)
    });

    // 2. Update status in aggregate bookings doc
    usersArray[userBookingIndex] = { ...userBookingDetails, status: "Cancelled", updatedAt: new Date() };
    batch.update(bookingRef, {
        users: usersArray,
        bookedCount: FieldValue.increment(-bookingCount)
    });

    // 3. Update status in finance doc
    const financeSnapshot = await db.collection("finance")
        .where("bookingId", "==", bookingId)
        .where("userId", "==", userId)
        .limit(1)
        .get();
        
    if (!financeSnapshot.empty) {
        batch.update(financeSnapshot.docs[0].ref, { status: "Cancelled", updatedAt: new Date() });
    }

    // 4. Update specific user booking doc
    const userBookingRef = db.collection("users").doc(userId).collection("bookings").doc(bookingId);
    const userBookingDoc = await userBookingRef.get();
    if (userBookingDoc.exists) {
        batch.update(userBookingRef, { 
            users: usersArray,
            status: "Cancelled",
            updatedAt: new Date()
        });
    }

    await batch.commit();

    await adminLogs(req.auth.uid, req.auth.token.email, "Cancel Trip", `Cancelled booking ID: ${bookingId} for user ID: ${userId}`);
    logInfo(`Booking ${bookingId} cancelled successfully by admin`);

    return { status: 200, success: true, message: "Booking cancelled successfully" };
};

module.exports = {addAdminUserService, changePasswordService, editPermissionsService, updateEmployeeSettingsService, cancelTripService};
