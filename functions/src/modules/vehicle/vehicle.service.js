/* eslint-disable max-len */
const {db} = require("../../shared/config/firebase");
const {FieldValue} = require("firebase-admin/firestore");
const {adminLogs} = require("../../logs/logs.service");

const addVehicleService = async (data, req) => {
  const {fields, type, id} = data;
  const counterRef = db.collection("configurations").doc("vehicle-settings");
  const counterDoc = await counterRef.get();

  const batch = db.batch();

  if (type === "add") {
    let counterId = 1;
    if (counterDoc.exists) {
      counterId = (counterDoc.data().counter || 0) + 1;
    }

    batch.set(counterRef, {counter: counterId}, {merge: true});

    const vehicleRef = db.collection("vehicles").doc();
    const vehicleData = {
      ...fields,
      id: `VH-${String(counterId).padStart(3, "0")}`,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      createdBy: req.auth.uid,
    };
    batch.set(vehicleRef, vehicleData);

    await batch.commit();
    await adminLogs(req.auth.uid, req.auth.token.email, "Vehicle Added", `Added new vehicle: ${fields.make} ${fields.model} (${fields.registrationNo})`);
    return {success: true, message: "Vehicle added successfully"};
  } else if (type === "edit") {
    if (!id) return {success: false, error: "Missing vehicle ID"};

    const vehicleRef = db.collection("vehicles").doc(id);
    const vehicleData = {
      ...fields,
      updatedAt: FieldValue.serverTimestamp(),
    };
    batch.update(vehicleRef, vehicleData);

    await batch.commit();
    await adminLogs(req.auth.uid, req.auth.token.email, "Vehicle Updated", `Updated vehicle profile: ${fields.make} ${fields.model} (${fields.registrationNo})`);
    return {success: true, message: "Vehicle updated successfully"};
  }

  return {success: false, error: "Invalid action type"};
};

module.exports = {addVehicleService};
