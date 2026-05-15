const {FieldValue} = require("firebase-admin/firestore");
const {db} = require("../../shared/config/firebase");
const {adminLogs} = require("../../logs/logs.service");

const addTripService = async (data, req) => {
  const {fields, type, id} = data;
  const batch = db.batch();

  if (type === "add") {
    const counterDoc = db.collection("configurations").doc("trip-settings");
    const counterSnap = await counterDoc.get();
    let tripNo = 1;

    if (counterSnap.exists && counterSnap.data().counter) {
      tripNo = counterSnap.data().counter + 1;
    }

    const payload = {
      ...fields,
      tripId: tripNo,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      total_bookings: 0,
      createdBy: req.auth.uid,
    };

    const tripRef = db.collection("trips").doc();
    batch.set(tripRef, payload);
    batch.set(counterDoc, {counter: tripNo}, {merge: true});

    await batch.commit();
    await adminLogs(req.auth.uid, req.auth.token.email, "Trip Scheduled", `Scheduled new trip: ${fields.route_name} for ${fields.selectedDates.length} dates`);
    return {success: true, message: "Trip scheduled successfully"};
  } else if (type === "edit") {
    if (!id) return {success: false, error: "Missing trip ID"};

    const tripRef = db.collection("trips").doc(id);
    const updatePayload = {
      ...fields,
      updatedAt: FieldValue.serverTimestamp(),
    };

    batch.update(tripRef, updatePayload);
    await batch.commit();
    await adminLogs(req.auth.uid, req.auth.token.email, "Trip Updated", `Updated trip configuration: ${fields.route_name}`);
    return {success: true, message: "Trip updated successfully"};
  }

  return {success: false, error: "Invalid action type"};
};

module.exports = {
  addTripService,
};
