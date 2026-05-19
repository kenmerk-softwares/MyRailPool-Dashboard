const {db, auth} = require("../../shared/config/firebase");
const {FieldValue} = require("firebase-admin/firestore");

const addDriverService = async (data, req) => {
  const {fields} = data;
  const counterRef = db.collection("configurations").doc("driver-settings");
  const counterDoc = await counterRef.get();

  if (!counterDoc.exists) {
    return {success: false, error: "Driver settings not found"};
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
    batch.update(counterRef, {counter: newCounterId});
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
  return {success: true, message: `Driver ${data.type === "add" ? "added" : "updated"} successfully`};
};

module.exports = {addDriverService};
