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
    const body = `Your trip from ${source} to ${destination} on ${date} has been confirmed successfully.`;
    const dataPayload = {
        type: "BOOKING_CONFIRMATION",
        bookingId: bookingId,
    };
    
    return await sendPushNotification(userId, title, body, dataPayload);
};

module.exports = {
    sendPushNotification,
    sendBookingConfirmationNotification
};
