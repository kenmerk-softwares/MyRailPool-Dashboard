const { onDocumentWritten } = require("firebase-functions/v2/firestore");
const { db } = require("../../shared/config/firebase");
const { getMessaging } = require("firebase-admin/messaging");

const sendPushNotification = async (userId, title, body, dataPayload = {}) => {
    try {
        const userDoc = await db.collection("users").doc(userId).get();
        if (!userDoc.exists) {
            console.log(`User ${userId} not found for notification.`);
            return false;
        }

        const userData = userDoc.data();
        const fcmToken = userData.fcmToken;

        if (!fcmToken) {
            console.log(`User ${userId} does not have an FCM token.`);
            return false;
        }

        const message = {
            token: fcmToken,
            notification: {
                title,
                body,
            },
            data: dataPayload,
        };

        const response = await getMessaging().send(message);
        console.log(`Successfully sent notification to user ${userId}:`, response);
        return true;
    } catch (error) {
        console.error("Error sending push notification:", error);
        return false;
    }
};

const sendBookingConfirmationNotification = async (userId, bookingId, date, source, destination) => {
    const title = "Booking Confirmed! 🎉";
    const body = `Your trip from ${source || "your starting point"} to ${destination || "your destination"} on ${date} has been confirmed successfully.`;
    const dataPayload = {
        type: "BOOKING_CONFIRMATION",
        bookingId: bookingId,
    };
    
    return await sendPushNotification(userId, title, body, dataPayload);
};

const onBookingConfirmed = onDocumentWritten("bookings/{bookingId}", async (event) => {
    const change = event.data;
    if (!change || !change.after.exists) return null;

    const beforeData = change.before.exists ? change.before.data() : null;
    const afterData = change.after.data();

    const beforeUsers = beforeData ? (beforeData.users || []) : [];
    const afterUsers = afterData.users || [];

    for (const afterUser of afterUsers) {
        if (afterUser.status === "Confirmed") {
            const wasConfirmedBefore = beforeUsers.some(u => u.userId === afterUser.userId && u.status === "Confirmed");
            if (!wasConfirmedBefore) {
                const startingPoint = afterUser.startingPoint || afterData.route_start;
                const dropPoint = afterUser.dropPoint || afterData.route_end;
                const selectedDate = afterData.selectedDate;

                await sendBookingConfirmationNotification(afterUser.userId, event.params.bookingId, selectedDate, startingPoint, dropPoint);
            }
        }
    }
    
    return null;
});

module.exports = {
    sendPushNotification,
    sendBookingConfirmationNotification,
    onBookingConfirmed
};
