const {FieldValue} = require("firebase-admin/firestore");
const {db} = require("../../shared/config/firebase");

const addTripService = async (data, req) => {
  const fields = req.data.fields;
  const counterDoc = db.collection("counters").doc("trip");
  const counterSnap = await counterDoc.get();
  const batch = db.batch();
  let tripNo = 0;

  if (counterSnap.exists && counterSnap.data().counter) {
    tripNo = counterSnap.data().counter + 1;
  }

  const payload = {
    ...fields,
    tripNo,
    status: "Active",
    updatedAt: new Date(),
    total_bookings: 0,
  };

  const tripsCollection = db.collection("trips");
  batch.set(tripsCollection.doc(), payload);
  batch.update(counterDoc, {counter: FieldValue.increment(1)});
  await batch.commit();
  return {status: 200, success: true, message: "Trip added successfully"};
};

module.exports = {
  addTripService,
};
