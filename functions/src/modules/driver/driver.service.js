const { db, auth } = require("../../shared/config/firebase");
const { FieldValue } = require("firebase-admin/firestore");

const addDriverService = async (data, req) => {
  const { fields } = data;
  const counterRef = db.collection("configurations").doc("driver-settings");
  const counterDoc = await counterRef.get();

  if (!counterDoc.exists) {
    return { success: false, error: "Driver settings not found" };
  }
  const batch = db.batch();
  if (data.type === "add") {
    const counterData = counterDoc.data();
    const counterId = counterData.counter || 0;
    const newCounterId = counterId + 1;
    const driverId = "MRP/DVR/" + String(newCounterId).padStart(4, "0");
    const userRecord = await auth.createUser({
      email: fields.email,
      password: "password123",
      displayName: fields.name,
    });
    batch.update(counterRef, { counter: newCounterId });
    const driverRef = db.collection("drivers").doc(userRecord.uid);
    const driverData = {
      ...fields,
      id: driverId,
      uid: userRecord.uid,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };
    batch.set(driverRef, driverData);
  } else if (data.type === "update") {
    // Update Firebase Authentication first
    await auth.updateUser(fields.id, {
      email: fields.email,
      displayName: fields.name,
    });

    const driverRef = db.collection("drivers").doc(fields.id);
    const driverData = {
      ...fields,
      updatedAt: FieldValue.serverTimestamp(),
    };
    batch.update(driverRef, driverData);
  }
  await batch.commit();
  return { success: true, message: `Driver ${data.type === "add" ? "added" : "updated"} successfully` };
};

const updatePaymentDriverService = async (data, req) => {
  const { uid, financeId, bookingId, paymentStatus } = data;

  const bookingRef = db.collection("bookings").doc(bookingId);
  const bookingDoc = await bookingRef.get();
  if (!bookingDoc.exists) {
    return { success: false, error: "Booking not found" };
  }

  const financeRef = db.collection("finance").doc(financeId);
  const financeDoc = await financeRef.get();
  if (!financeDoc.exists) {
    return { success: false, error: "Finance record not found" };
  }

  const batch = db.batch();

  // 1. Update paymentStatus in bookings document's users array
  const bookingData = bookingDoc.data();
  const usersArray = bookingData.users || [];
  const updatedUsersArray = usersArray.map(user => {
    if (user.userId === uid) {
      return { ...user, paymentStatus };
    }
    return user;
  });
  batch.update(bookingRef, { users: updatedUsersArray });

  // 2. Update paymentStatus, offlinePaymentTime, and updatedAt in finance document
  const financeUpdate = {
    paymentStatus,
    offlinePaymentTime: new Date(),
    updatedAt: FieldValue.serverTimestamp(),
  };
  batch.update(financeRef, financeUpdate);

  // 3. Update paymentStatus in users subcollection bookings
  const financeData = financeDoc.data();
  const bookingNosList = Array.isArray(financeData.bookingNos) ?
    financeData.bookingNos :
    (typeof financeData.bookingNos === "string" ? financeData.bookingNos.split(",") : []);

  if (bookingNosList.length > 0) {
    for (const bNo of bookingNosList) {
      const bookingNoSafe = bNo.replace(/\//g, "-");
      const userBookingRef = db.collection("users").doc(uid).collection("bookings").doc(bookingNoSafe);
      batch.update(userBookingRef, { paymentStatus });
    }
  } else {
    // Fallback: look at bookingDoc.users array for the bookingNo
    const userObj = usersArray.find(user => user.userId === uid);
    if (userObj && userObj.bookingNo) {
      const bookingNoSafe = userObj.bookingNo.replace(/\//g, "-");
      const userBookingRef = db.collection("users").doc(uid).collection("bookings").doc(bookingNoSafe);
      batch.update(userBookingRef, { paymentStatus });
    }
  }

  await batch.commit();
  return { success: true, message: "Payment status updated successfully" };
};

// ==================== UPDATE TRIP FROM DRIVER APP ===================== //
const updateTripDriverAppService = async (data, req) => {
  const { bookingId, tripId, tripStatus } = data;

  const bookingRef = db.collection("bookings").doc(bookingId);
  const bookingDoc = await bookingRef.get();
  if (!bookingDoc.exists) {
    return { success: false, error: "Booking not found" };
  }

  const batch = db.batch();

  // 1. Update tripStatus in bookings document
  const bookingData = bookingDoc.data();
  const usersArray = bookingData.users || [];
  const updatedUsersArray = usersArray.map(user => {
    return { ...user, tripStatus, updatedAt: new Date() };
  });
  batch.update(bookingRef, {
    tripStatus,
    users: updatedUsersArray,
    updatedAt: new Date()
  });

  // 2. Get unique userIds from users array filtered by active status
  const activeStatuses = ["Confirmed", "Pending"];
  const userIds = [...new Set(
    usersArray
      .filter(user => activeStatuses.includes(user.status))
      .map(user => user.userId)
      .filter(Boolean)
  )];

  // 3. Query each user's bookings subcollection by tripId and update tripStatus
  for (const userId of userIds) {
    const userBookingsQuery = await db.collection("users").doc(userId).collection("bookings")
      .where("tripId", "==", tripId)
      .get();

    for (const doc of userBookingsQuery.docs) {
      batch.update(doc.ref, {
        tripStatus,
        updatedAt: new Date()
      });
    }
  }

  await batch.commit();
  return { success: true, message: "Trip status updated successfully" };
};

module.exports = { addDriverService, updatePaymentDriverService, updateTripDriverAppService };
