const {onCall} = require("firebase-functions/v2/https");
const {db, auth} = require("../config");

const addUser = onCall({
  cors: true,
  region: "asia-south1",
}, async (req) => {
  try {
    if (!req.auth) {
      return {success: false, error: "Unauthorized"};
    }
    const data = req.data || {};
    const {
      action = "add",
      id,
      name,
      email,
      password,
      mobile,
      designation,
      designationId,
      department,
    } = data;

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
        designation: designation || "",
        designationId: designationId || "",
        department: department || "",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await db.collection("admin-users").doc(uid).set(payload);

      return {status: 200, success: true, uid, email};
    } else if (action === "edit") {
      if (!id) return {success: false, error: "Missing user ID"};

      // Update Auth
      const updateData = {
        displayName: name,
        email: email,
      };
      if (password && password.trim() !== "") {
        updateData.password = password;
      }
      await auth.updateUser(id, updateData);

      // Update Firestore
      const payload = {
        name,
        email,
        mobile,
        designation: designation || "",
        designationId: designationId || "",
        department: department || "",
        updatedAt: new Date(),
      };
      await db.collection("admin-users").doc(id).update(payload);

      return {
        status: 200,
        success: true,
        message: "User updated successfully",
      };
    } else if (action === "delete") {
      if (!id) return {success: false, error: "Missing user ID"};

      // Delete from Auth
      await auth.deleteUser(id);

      // Delete from Firestore
      await db.collection("admin-users").doc(id).delete();

      return {
        status: 200,
        success: true,
        message: "User deleted successfully",
      };
    } else {
      return {success: false, error: "Invalid action"};
    }
  } catch (error) {
    console.error("🔥 Admin Action Error:", error);
    return {
      success: false,
      error: error.message || "Internal server error",
    };
  }
});
module.exports = {addUser};
