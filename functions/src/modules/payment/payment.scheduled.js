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

        const bookingRef = db.collection("bookings").doc(bookingId);
        const bookingDoc = await bookingRef.get();

        if (bookingDoc.exists) {
            const bookingData = bookingDoc.data();
            const { selectedDate } = bookingData;
            
            const userObj = bookingData.users?.find(u => u.userId === userId);
            if (bookingCount === undefined) {
                bookingCount = userObj ? userObj.bookingCount : 0;
            }

            if (userObj && userObj.stripeSessionId) {
                try {
                    const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
                    await stripe.checkout.sessions.expire(userObj.stripeSessionId);
                    console.log(`Expired Stripe session ${userObj.stripeSessionId} for booking ${bookingId}`);
                } catch (stripeErr) {
                    console.error(`Error expiring Stripe session ${userObj.stripeSessionId}:`, stripeErr);
                }
            }

            console.log(`Restoring ${bookingCount} seats for trip ${tripId} on ${selectedDate}`);
            const userBookingRef = db.collection("users").doc(userId).collection("bookings").doc(bookingId);
            batch.update(userBookingRef, { status: "Expired" });

            const tripRef = db.collection("trips").doc(tripId);
            const tripDoc = await tripRef.get();

            if (tripDoc.exists) {
                const tripData = tripDoc.data();
                const availableSeatsMap = tripData.available_seats || {};
                const currentAvailableSeats = availableSeatsMap[selectedDate] ?? tripData.total_seats;

                const newAvailableSeats = currentAvailableSeats + bookingCount;
                const updatedAvailableSeatsMap = {
                    ...availableSeatsMap,
                    [selectedDate]: newAvailableSeats,
                };

                batch.update(tripRef, {
                    available_seats: updatedAvailableSeatsMap,
                });
            }
            const usersArray = bookingData.users || [];

            const updatedUsersArray = usersArray.map(user => {
                if (user.userId === userId && user.status === "Pending") {
                    return { ...user, status: "Expired" };
                }
                return user;
            });

            batch.update(bookingRef, {
                users: updatedUsersArray,
                bookedCount: FieldValue.increment(-bookingCount)
            });
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
