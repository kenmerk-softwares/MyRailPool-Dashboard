/* eslint-disable max-len */
const {onCall} = require("firebase-functions/v2/https");
const {db} = require("../config");
const {FieldValue} = require("firebase-admin/firestore");

const manageDepartment = onCall(async (req) => {
  try {
    if (!req.auth) {
      return {success: false, error: "Unauthorized"};
    }
    const data = req.data || {};
    const {action, id, departmentName} = data;

    if (action === "add") {
      if (!departmentName) {
        return {success: false, error: "Missing required fields"};
      }
      let uid = null;
      // =============== TRANSACTION START ================= //
      await db.runTransaction(async (transaction) => {
        const counterRef = db.collection("counters").doc("departmentCounter");
        transaction.set(counterRef, {
          department_no: FieldValue.increment(1),
        }, {merge: true});

        transaction.set(counterRef, {merge: true});
        const payload = {
          departmentName,
          createdAt: new Date(), updatedAt: new Date(),
        };
        const departmentRef = db.collection("departments").doc();
        transaction.set(departmentRef, {...payload});
        uid = departmentRef.id;
      });
      return {success: true, uid};
    } else if (action === "delete") {
      if (!id) {
        return {success: false, error: "Missing department ID"};
      }

      const departmentRef = db.collection("departments").doc(id);
      const departmentDoc = await departmentRef.get();

      if (!departmentDoc.exists) {
        return {success: false, error: "Department not found"};
      }

      const batch = db.batch();
      batch.delete(departmentRef);
      await batch.commit();

      return {success: true, message: "Department deleted successfully"};
    }

    return {success: false, error: "Invalid action specified"};
  } catch (error) {
    console.error("🔥 Manage Department Error:", error);
    return {success: false, error: error.message || String(error)};
  }
});

module.exports = {manageDepartment};
