const admin = require("firebase-admin");

if (admin.apps.length === 0) {
  admin.initializeApp({
    projectId: "myrailpool-4150a"
  });
}

const db = admin.firestore();

async function run() {
  console.log("Fetching route_request docs...");
  const snapshot = await db.collection("route_request").limit(5).get();
  if (snapshot.empty) {
    console.log("No route requests found");
    return;
  }
  snapshot.forEach(doc => {
    console.log("---------------------------------------");
    console.log("Doc ID:", doc.id);
    console.log("Data:", JSON.stringify(doc.data(), null, 2));
  });
}

run().catch(console.error);
