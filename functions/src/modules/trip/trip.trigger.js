const { onDocumentWritten } = require("firebase-functions/v2/firestore");
const { db } = require("../../shared/config/firebase");

const onTripWritten = onDocumentWritten("trips/{tripId}", async (event) => {
    const change = event.data;
    if (!change) return null;

    const beforeData = change.before.exists ? change.before.data() : null;
    const afterData = change.after.exists ? change.after.data() : null;

    const routeIds = new Set();
    if (beforeData && beforeData.route_id) {
        routeIds.add(beforeData.route_id);
    }
    if (afterData && afterData.route_id) {
        routeIds.add(afterData.route_id);
    }

    if (routeIds.size === 0) return null;

    for (const routeId of routeIds) {
        try {
            const tripsQuery = await db.collection("trips")
                .where("route_id", "==", routeId)
                .where("status", "not-in", ["Completed", "Cancelled"])
                .limit(1)
                .get();

            const routeRef = db.collection("routes").doc(routeId);
            const routeDoc = await routeRef.get();

            if (routeDoc.exists) {
                const newStatus = !tripsQuery.empty ? "Active" : "Inactive";
                if (routeDoc.data().status !== newStatus) {
                    await routeRef.update({
                        status: newStatus,
                        updatedAt: new Date()
                    });
                    console.log(`Route "${routeId}" status updated to "${newStatus}" because trips exist: ${!tripsQuery.empty}`);
                }
            }
        } catch (error) {
            console.error(`Error updating route status for route_id ${routeId}:`, error);
        }
    }

    return null;
});

module.exports = {
    onTripWritten
};
