const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkAnalytics() {
  const doc = await db.collection("analytics").doc("total").get();
  console.log("total analytics:", doc.data());
}

checkAnalytics();
