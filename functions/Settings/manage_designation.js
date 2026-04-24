/* eslint-disable max-len */
const {onCall} = require("firebase-functions/v2/https");
const {db} = require("../config");
const {FieldValue} = require("firebase-admin/firestore");

const manageDesignation = onCall(async (req) => {
  try {
    if (!req.auth) {
      return {success: false, error: "Unauthorized"};
    }
    const data = req.data || {};
    const {action, id, designationName} = data;

    if (action === "add") {
      if (!designationName) {
        return {success: false, error: "Missing required fields"};
      }
      let uid = null;
      // =============== TRANSACTION START ================= //
      await db.runTransaction(async (transaction) => {
        const counterRef = db.collection("counters").doc("designationCounter");
        transaction.set(counterRef, {
          designation_no: FieldValue.increment(1),
        }, {merge: true});

        transaction.set(counterRef, {merge: true});
        const payload = {
          designationName,
          createdAt: new Date(), updatedAt: new Date(),
        };
        const designationRef = db.collection("designations").doc();
        transaction.set(designationRef, {...payload});
        uid = designationRef.id;
      });
      return {success: true, uid};
    } else if (action === "delete") {
      if (!id) {
        return {success: false, error: "Missing designation ID"};
      }

      const designationRef = db.collection("designations").doc(id);
      const designationDoc = await designationRef.get();

      if (!designationDoc.exists) {
        return {success: false, error: "Designation not found"};
      }

      const batch = db.batch();
      batch.delete(designationRef);
      await batch.commit();

      return {success: true, message: "Designation deleted successfully"};
    }

    return {success: false, error: "Invalid action specified"};
  } catch (error) {
    console.error("🔥 Manage Designation Error:", error);
    return {success: false, error: error.message || String(error)};
  }
});

module.exports = {manageDesignation};
