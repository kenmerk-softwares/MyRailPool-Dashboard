/* eslint-disable max-len */
const {db, auth} = require("../../shared/config/firebase");
const { FieldValue } = require("firebase-admin/firestore");
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
    batch.update(tripRef, {
        status: "Cancelled",
        updatedAt: new Date()
    });
    const bookingsSnapshot = await db.collection("bookings")
        .where("tripId", "==", tripId)
        .get();

    for (const bookingDoc of bookingsSnapshot.docs) {
        const bookingData = bookingDoc.data();
        const bookingId = bookingDoc.id;
        const usersArray = bookingData.users || [];
        let updatedUsers = [...usersArray];

        let financeSnapshot = await db.collection("finance")
            .where("bookingId", "array-contains", bookingId)
            .get();

        if (financeSnapshot.empty) {
            financeSnapshot = await db.collection("finance")
                .where("bookingId", "==", bookingId)
                .get();
        }

        for (const financeDoc of financeSnapshot.docs) {
            const financeData = financeDoc.data();
            if (financeData.status === "Cancelled") {
                continue;
            }

            const userId = financeData.userId;
            let stripeSessionId = null;
            let stripeRefundId = null;
            
            const bookingNosList = financeData.bookingNos || [];
            const userBookingRefs = [];

            if (userId) {
                if (bookingNosList.length > 0) {
                    for (const bNo of bookingNosList) {
                        const bookingNoSafe = bNo.replace(/\//g, "-");
                        const uRef = db.collection("users").doc(userId).collection("bookings").doc(bookingNoSafe);
                        userBookingRefs.push(uRef);
                        if (!stripeSessionId) {
                            const userBookingDoc = await uRef.get();
                            if (userBookingDoc.exists) {
                                stripeSessionId = userBookingDoc.data().stripeSessionId;
                            }
                        }
                    }
                } else {
                    const uRef = db.collection("users").doc(userId).collection("bookings").doc(financeDoc.id);
                    userBookingRefs.push(uRef);
                    const userBookingDoc = await uRef.get();
                    if (userBookingDoc.exists) {
                        stripeSessionId = userBookingDoc.data().stripeSessionId;
                    }
                }
            }

            let paymentStatus = null;
            if (stripeSessionId && financeData.paymentStatus !== "refunded" && financeData.paymentStatus !== "initiated") {
                try {
                    const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
                    const session = await stripe.checkout.sessions.retrieve(stripeSessionId);
                    if (session && session.payment_intent) {
                        const refund = await stripe.refunds.create({
                            payment_intent: session.payment_intent,
                            metadata: {
                                financeId: financeDoc.id,
                                userId,
                                bookingId
                            }
                        });
                        stripeRefundId = refund.id;
                        paymentStatus = "initiated";
                        console.log(`Successfully refunded Stripe payment intent ${session.payment_intent} for trip cancellation`);
                    } else {
                        paymentStatus = "refund failed";
                    }
                } catch (stripeErr) {
                    paymentStatus = "refund failed";
                    console.error(`Stripe refund failed for session ${stripeSessionId}:`, stripeErr.message);
                }
            }

            updatedUsers = updatedUsers.map(user => {
                if (user.userId === userId && (user.status === "Confirmed" || user.status === "Pending")) {
                    const updatedUser = { ...user, status: "Cancelled", updatedAt: new Date() };
                    if (paymentStatus) {
                        updatedUser.paymentStatus = paymentStatus;
                    }
                    return updatedUser;
                }
                return user;
            });

            if (financeData.status !== "Cancelled") {
                const financeUpdate = { status: "Cancelled", updatedAt: new Date() };
                if (stripeRefundId) {
                    financeUpdate.stripeRefundId = stripeRefundId;
                }
                if (paymentStatus) {
                    financeUpdate.paymentStatus = paymentStatus;
                }
                batch.update(financeDoc.ref, financeUpdate);
            }

            for (const uRef of userBookingRefs) {
                const userBookingUpdate = { status: "Cancelled", updatedAt: new Date() };
                if (stripeRefundId) {
                    userBookingUpdate.stripeRefundId = stripeRefundId;
                }
                if (paymentStatus) {
                    userBookingUpdate.paymentStatus = paymentStatus;
                }
                batch.update(uRef, userBookingUpdate);
            }
        }

        batch.update(bookingDoc.ref, {
            users: updatedUsers,
            status: "Cancelled",
            updatedAt: new Date()
        });
    }

    await batch.commit();
    await adminLogs(req.auth.uid, req.auth.token.email, "Cancel Trip", `Cancelled trip ID: ${tripId} (${tripData.tripId || ""})`);
    logInfo(`Trip ${tripId} cancelled successfully by admin`);
    return { status: 200, success: true, message: "Trip cancelled successfully" };
};

// ==================== CANCEL BOOKING SERVICE ==================== //
const cancelBookingService = async (req) => {
    const { bookingId, userId, refund } = req.data;
    const bookingRef = db.collection("bookings").doc(bookingId);
    const bookingDoc = await bookingRef.get();
    if (!bookingDoc.exists) {
        return { success: false, error: "Booking not found" };
    }
    const bookingData = bookingDoc.data();
    const usersArray = bookingData.users || [];
    const userObj = usersArray.find(u => u.userId === userId && u.status !== "Cancelled");
    if (!userObj || !userObj.financeId) {
        return { success: false, error: "Active user booking not found" };
    }
    const financeId = userObj.financeId;
    const financeRef = db.collection("finance").doc(financeId);
    const financeDoc = await financeRef.get();

    if (!financeDoc.exists) {
        return { success: false, error: "Booking transaction not found" };
    }

    const financeData = financeDoc.data();
    if (financeData.status === "Cancelled") {
        return { success: false, error: "Booking is already cancelled" };
    }

    const bookingCount = financeData.bookingCount;

    const bookingNo = bookingData.bookingNo;
    const bookingNoSafe = bookingNo ? bookingNo.replace(/\//g, "-") : null;
    const userBookingRefId = bookingNoSafe || financeId;

    const userBookingRef = db.collection("users").doc(userId).collection("bookings").doc(userBookingRefId);
    const userBookingDoc = await userBookingRef.get();
    let passengersToRemove = [];
    let selectedDate = null;
    let stripeSessionId = null;
    
    if (userBookingDoc.exists) {
        const userBookingData = userBookingDoc.data();
        passengersToRemove = userBookingData.passengers || [];
        selectedDate = userBookingData.selectedDate;
        stripeSessionId = userBookingData.stripeSessionId;
    }

    let activeBookingIds = [];
    if (financeData.bookingId) {
        if (Array.isArray(financeData.bookingId)) {
            activeBookingIds = [...financeData.bookingId];
        } else if (typeof financeData.bookingId === "string") {
            activeBookingIds = financeData.bookingId.split(",").filter(id => id.trim() !== "");
        }
    }
    
    let activeBookingNos = [];
    if (financeData.bookingNos) {
        if (Array.isArray(financeData.bookingNos)) {
            activeBookingNos = [...financeData.bookingNos];
        } else if (typeof financeData.bookingNos === "string") {
            activeBookingNos = financeData.bookingNos.split(",").filter(no => no.trim() !== "");
        }
    }

    const isFullCancel = activeBookingIds.length <= 1;

    let stripeRefundId = null;
    let paymentStatus = null;
    if (refund === true && stripeSessionId && financeData.paymentStatus !== "refunded" && financeData.paymentStatus !== "initiated") {
        try {
            const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
            const session = await stripe.checkout.sessions.retrieve(stripeSessionId);
            if (session && session.payment_intent) {
                const refundParams = {
                    payment_intent: session.payment_intent,
                    metadata: {
                        financeId,
                        userId,
                        bookingId
                    }
                };
                if (!isFullCancel && userBookingDoc.exists && userBookingDoc.data().totalFare) {
                    refundParams.amount = Math.round(userBookingDoc.data().totalFare * 100);
                }
                const refund = await stripe.refunds.create(refundParams);
                stripeRefundId = refund.id;
                paymentStatus = "initiated";
                console.log(`Successfully refunded Stripe payment intent ${session.payment_intent} for booking ${bookingId}`);
            } else {
                paymentStatus = "refund failed";
            }
        } catch (stripeErr) {
            paymentStatus = "refund failed";
            console.error(`Stripe refund failed for session ${stripeSessionId}:`, stripeErr.message);
        }
    }

    const batch = db.batch();
    
    const financeUpdate = {
        updatedAt: new Date()
    };
    
    if (isFullCancel) {
        financeUpdate.status = "Cancelled";
    } else {
        const updatedBookingIds = activeBookingIds.filter(id => id !== bookingId && id !== bookingDoc.id);
        financeUpdate.bookingId = updatedBookingIds;
        if (bookingNo) {
            const updatedBookingNos = activeBookingNos.filter(no => no !== bookingNo);
            financeUpdate.bookingNos = updatedBookingNos;
        }
        if (userBookingDoc.exists && userBookingDoc.data().totalFare) {
            financeUpdate.amount = FieldValue.increment(-userBookingDoc.data().totalFare);
        }
    }

    if (stripeRefundId) {
        financeUpdate.stripeRefundId = stripeRefundId;
    }
    if (paymentStatus) {
        financeUpdate.paymentStatus = paymentStatus;
    }
    batch.update(financeRef, financeUpdate);

    const userBookingUpdate = {
        status: "Cancelled",
        updatedAt: new Date()
    };
    if (stripeRefundId) {
        userBookingUpdate.stripeRefundId = stripeRefundId;
    }
    if (paymentStatus) {
        userBookingUpdate.paymentStatus = paymentStatus;
    }
    batch.update(userBookingRef, userBookingUpdate);

    if (!selectedDate) {
        selectedDate = bookingData.selectedDate;
    }

    const updatedUsers = usersArray.map(user => {
        if (user.userId === userId && user.financeId === financeId) {
            const updatedUser = { ...user, status: "Cancelled", updatedAt: new Date() };
            if (paymentStatus) {
                updatedUser.paymentStatus = paymentStatus;
            }
            return updatedUser;
        }
        return user;
    });

    const activeUsersCount = updatedUsers.filter(u => u.status !== "Cancelled" && u.status !== "Expired").length;
    const newStatus = activeUsersCount === 0 ? "Cancelled" : (bookingData.status || "Confirmed");

    const bookingUpdate = {
        users: updatedUsers,
        bookedCount: FieldValue.increment(-bookingCount),
        userIds: FieldValue.arrayRemove(userId),
        status: newStatus,
        updatedAt: new Date()
    };

    if (passengersToRemove.length > 0) {
        bookingUpdate.passengers = FieldValue.arrayRemove(...passengersToRemove);
    }

    batch.update(bookingRef, bookingUpdate);
    if (selectedDate) {
        const tripRef = db.collection("trips").doc(financeData.tripId);
        const tripDoc = await tripRef.get();

        if (tripDoc.exists) {
            const tripData = tripDoc.data();
            const availableSeatsMap = tripData.available_seats || {};
            const updatedAvailableSeatsMap = { ...availableSeatsMap };

            const dates = Array.isArray(selectedDate) ? selectedDate : [selectedDate];
            for (const date of dates) {
                const currentAvailableSeats = updatedAvailableSeatsMap[date] ?? tripData.total_seats;
                updatedAvailableSeatsMap[date] = currentAvailableSeats + bookingCount;
            }

            batch.update(tripRef, {
                available_seats: updatedAvailableSeatsMap,
                updatedAt: new Date()
            });
        }
    }
    await batch.commit();
    try {
        const { sendBookingCancelled } = require("../whatsapp/whatsapp.service");
        await sendBookingCancelled(bookingId, userId);
    } catch (whatsappErr) {
        logError(`Error sending WhatsApp cancel notification for booking ${bookingId}: ${whatsappErr.message}`);
    }
    await adminLogs(req.auth.uid, req.auth.token.email, "Cancel Booking", `Cancelled booking ID: ${bookingId} (financeId: ${financeId}) for user ${userId}`);
    logInfo(`Booking ${bookingId} for user ${userId} cancelled successfully by admin`);
    return { status: 200, success: true, message: "Booking cancelled successfully" };
};

module.exports = {addAdminUserService, changePasswordService, editPermissionsService, updateEmployeeSettingsService, cancelTripService, cancelBookingService};
