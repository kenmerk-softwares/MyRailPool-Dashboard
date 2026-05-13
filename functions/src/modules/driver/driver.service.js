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
    const userRecord = await auth.createUser({
      email: fields.email,
      password: "password123",
      displayName: fields.name,
    });
    batch.update(counterRef, {counter: newCounterId});
    const driverRef = db.collection("drivers").doc(userRecord.uid);
    const driverData = {
      ...fields,
      id: newCounterId,
      uid: userRecord.uid,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };
    batch.set(driverRef, driverData);
  } else if (data.type === "update") {
    const driverRef = db.collection("drivers").doc(fields.id);
    const driverData = {
      ...fields,
      updatedAt: FieldValue.serverTimestamp(),
    };
    batch.update(driverRef, driverData);
  }
  await batch.commit();
  return {success: true, message: "Driver added successfully"};
};

module.exports = {addDriverService};
