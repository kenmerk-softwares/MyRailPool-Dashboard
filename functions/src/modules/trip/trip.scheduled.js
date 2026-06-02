/* eslint-disable max-len */
const {onSchedule} = require("firebase-functions/v2/scheduler");
const {db} = require("../../shared/config/firebase");

// Runs daily at midnight to mark expired trips as "Completed" and expired routes as "Inactive"

const autoCompleteExpiredTrips = onSchedule("every day 00:00", async () => {
  const now = new Date();
  // Strip time part so we only compare dates
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  console.log(`[AutoComplete] Running expired trip/route check at ${now.toISOString()}`);

  let tripsUpdated = 0;
  let routesUpdated = 0;

  // 1. Find active trips where all travel dates have passed
  try {
    const activeTripsSnapshot = await db.collection("trips")
        .where("status", "==", "Active")
        .get();

    if (!activeTripsSnapshot.empty) {
      const batch = db.batch();
      let batchCount = 0;

      for (const tripDoc of activeTripsSnapshot.docs) {
        const tripData = tripDoc.data();
        const selectedDates = tripData.selectedDates || [];

        if (selectedDates.length === 0) continue;

        // If every date on this trip is in the past, it's done
        const allDatesExpired = selectedDates.every((dateStr) => {
          const tripDate = new Date(dateStr);
          return tripDate < today;
        });

        if (allDatesExpired) {
          batch.update(tripDoc.ref, {
            status: "Completed",
            updatedAt: new Date(),
            autoCompletedAt: new Date(),
          });
          batchCount++;
          tripsUpdated++;
          console.log(`Trip "${tripData.route_name || tripDoc.id}" auto-completed — all ${selectedDates.length} dates expired`);

          // Commit early if we're near Firestore's 500-op batch limit
          if (batchCount >= 450) {
            await batch.commit();
            batchCount = 0;
          }
        }
      }

      if (batchCount > 0) {
        await batch.commit();
      }
    }
  } catch (error) {
    console.error("Error processing trips:", error);
  }

  // 2. Find active routes whose deactivation date or all selected dates have passed
  try {
    const activeRoutesSnapshot = await db.collection("routes")
        .where("status", "==", "Active")
        .get();

    if (!activeRoutesSnapshot.empty) {
      const batch = db.batch();
      let batchCount = 0;

      for (const routeDoc of activeRoutesSnapshot.docs) {
        const routeData = routeDoc.data();

        // Handle both Firestore Timestamps and plain JS Dates
        let deactivationDate = routeData.deactivationDate;
        if (deactivationDate && typeof deactivationDate.toDate === "function") {
          deactivationDate = deactivationDate.toDate();
        } else if (deactivationDate) {
          deactivationDate = new Date(deactivationDate);
        }

        // Route is past its end-of-life date
        const isDeactivationPassed = deactivationDate && deactivationDate < today;

        // Every scheduled date on the route is in the past
        const selectedDates = routeData.selectedDates || [];
        const allDatesExpired = selectedDates.length > 0 && selectedDates.every((dateStr) => {
          const routeDate = new Date(dateStr);
          return routeDate < today;
        });

        // Either condition means the route is done
        if (isDeactivationPassed || allDatesExpired) {
          batch.update(routeDoc.ref, {
            status: "Inactive",
            updatedAt: new Date(),
            autoDeactivatedAt: new Date(),
          });
          batchCount++;
          routesUpdated++;
          console.log(`Route "${routeData.name || routeDoc.id}" auto-deactivated (deactivation passed: ${isDeactivationPassed}, all dates expired: ${allDatesExpired})`);

          // If the route is dead, complete any trips still running on it
          const routeTripsSnapshot = await db.collection("trips")
              .where("route_id", "==", routeDoc.id)
              .where("status", "==", "Active")
              .get();

          for (const tripDoc of routeTripsSnapshot.docs) {
            batch.update(tripDoc.ref, {
              status: "Completed",
              updatedAt: new Date(),
              autoCompletedAt: new Date(),
            });
            batchCount++;
            tripsUpdated++;
            console.log(`Trip "${tripDoc.data().route_name || tripDoc.id}" also completed (route deactivated)`);
          }

          if (batchCount >= 450) {
            await batch.commit();
            batchCount = 0;
          }
        }
      }

      if (batchCount > 0) {
        await batch.commit();
      }
    }
  } catch (error) {
    console.error("Error processing routes:", error);
  }

  console.log(`Done — ${tripsUpdated} trip(s) completed, ${routesUpdated} route(s) deactivated`);
  return null;
});

module.exports = {
  autoCompleteExpiredTrips,
};
