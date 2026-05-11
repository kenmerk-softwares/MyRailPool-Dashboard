/* eslint-disable max-len */
const {initializeApp, cert, getApps} = require("firebase-admin/app");
const {getFirestore} = require("firebase-admin/firestore");
const {getServiceAccountFromEnv} = require("../shared/config/service-account-env");
const {db} = require("../shared/config/firebase");

let adminLogDb = null;

/**
 * Returns the Firestore instance for the admin log app, initializing lazily.
 * @return {FirebaseFirestore.Firestore} Firestore instance.
 */
function getAdminLogDb() {
  if (!adminLogDb) {
    const appName = "adminLogApp";
    const app = getApps().find((a) => a.name === appName) ||
      initializeApp({
        credential: cert(getServiceAccountFromEnv()),
      }, appName);
    adminLogDb = getFirestore(app);
  }
  return adminLogDb;
}

const adminLogs = (async (uid, email, action, description) => {
  try {
    if (!uid) {
      return {success: false, error: "Unauthorized"};
    }
    const adminData = await db.collection("admin-users").doc(uid).get();
    const {name, designation, department} = adminData.data();
    const payload = {
      uid,
      name,
      designation,
      department,
      email,
      action,
      description,
      createdAt: new Date(),
    };
    await getAdminLogDb().collection("admin-logs").add(payload);
    return {status: 200, success: true};
  } catch (error) {
    console.error("Admin Logs Error:", error);
    return {
      success: false,
      error: error.message || "Internal server error",
    };
  }
});

module.exports = {adminLogs};
