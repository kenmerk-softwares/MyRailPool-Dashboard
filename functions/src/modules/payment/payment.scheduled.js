const { onSchedule } = require("firebase-functions/v2/scheduler");
const { db } = require("../../shared/config/firebase");
const { FieldValue } = require("firebase-admin/firestore");

const cleanupExpiredBookings = onSchedule("every 5 minutes", async (event) => {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    const pendingBookingsSnapshot = await db.collection("finance")
        .where("status", "==", "Pending")
        .get();
    if (pendingBookingsSnapshot.empty) {
        return null;
    }

    const expiredDocs = pendingBookingsSnapshot.docs.filter(doc => {
        const data = doc.data();
        if (data.paymentType !== "online") return false;
        const createdAt = data.createdAt && typeof data.createdAt.toDate === "function"
            ? data.createdAt.toDate()
            : new Date(data.createdAt);

        return createdAt <= tenMinutesAgo;
    });

    if (expiredDocs.length === 0) {
        return null;
    }

    console.log(`Found ${expiredDocs.length} expired booking(s). Cleaning up...`);

    const batch = db.batch();

    for (const doc of expiredDocs) {
        const financeData = doc.data();
        const { bookingId, userId, tripId } = financeData;
        let { bookingCount } = financeData;

        batch.delete(doc.ref);

        const bookingIdsList = Array.isArray(bookingId) ? bookingId : [bookingId];
        let stripeSessionExpired = false;

        const bookingNosList = financeData.bookingNos || [];
        let passengersToRemove = [];
        if (bookingNosList.length > 0) {
            for (const bNo of bookingNosList) {
                const bookingNoSafe = bNo.replace(/\//g, "-");
                const userBookingRef = db.collection("users").doc(userId).collection("bookings").doc(bookingNoSafe);
                const userBookingDoc = await userBookingRef.get();
                if (userBookingDoc.exists) {
                    const passengers = userBookingDoc.data().passengers || [];
                    passengersToRemove.push(...passengers);
                }
                batch.delete(userBookingRef);
            }
        } else {
            const userBookingRef = db.collection("users").doc(userId).collection("bookings").doc(doc.id);
            const userBookingDoc = await userBookingRef.get();
            if (userBookingDoc.exists) {
                passengersToRemove = userBookingDoc.data().passengers || [];
            }
            batch.delete(userBookingRef);
        }

        for (const bid of bookingIdsList) {
            const bookingRef = db.collection("bookings").doc(bid);
            const bookingDoc = await bookingRef.get();

            if (bookingDoc.exists) {
                const bookingData = bookingDoc.data();
                const { selectedDate } = bookingData;

                const userObj = bookingData.users?.find(u => u.userId === userId);
                const actualBookingCount = bookingCount !== undefined ? bookingCount : (userObj ? userObj.bookingCount : 0);

                if (userObj && userObj.stripeSessionId && !stripeSessionExpired) {
                    try {
                        const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
                        await stripe.checkout.sessions.expire(userObj.stripeSessionId);
                        console.log(`Expired Stripe session ${userObj.stripeSessionId} for booking ${bid}`);
                        stripeSessionExpired = true;
                    } catch (stripeErr) {
                        console.error(`Error expiring Stripe session ${userObj.stripeSessionId}:`, stripeErr);
                    }
                }

                console.log(`Restoring ${actualBookingCount} seats for trip ${tripId} on ${selectedDate}`);

                const tripRef = db.collection("trips").doc(tripId);
                const tripDoc = await tripRef.get();

                if (tripDoc.exists) {
                    const tripData = tripDoc.data();
                    const availableSeatsMap = tripData.available_seats || {};
                    const currentAvailableSeats = availableSeatsMap[selectedDate] ?? tripData.total_seats;

                    const newAvailableSeats = currentAvailableSeats + actualBookingCount;
                    const updatedAvailableSeatsMap = {
                        ...availableSeatsMap,
                        [selectedDate]: newAvailableSeats,
                    };

                    batch.update(tripRef, {
                        available_seats: updatedAvailableSeatsMap,
                    });
                }
                const usersArray = bookingData.users || [];
                const updatedUsersArray = usersArray.filter(user => user.userId !== userId);

                const bookingUpdate = {
                    users: updatedUsersArray,
                    bookedCount: FieldValue.increment(-actualBookingCount),
                    userIds: FieldValue.arrayRemove(userId)
                };

                if (passengersToRemove.length > 0) {
                    bookingUpdate.passengers = FieldValue.arrayRemove(...passengersToRemove);
                }

                batch.update(bookingRef, bookingUpdate);
            }
        }
    }

    try {
        await batch.commit();
        console.log("Successfully cleaned up expired bookings.");
    } catch (error) {
        console.error("Error committing batch for expired bookings:", error);
    }

    return null;
});

module.exports = {
    cleanupExpiredBookings
};
