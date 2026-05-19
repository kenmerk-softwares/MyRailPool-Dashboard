const { onDocumentWritten } = require("firebase-functions/v2/firestore");
const { db } = require("../../shared/config/firebase");
const { getMessaging } = require("firebase-admin/messaging");

const sendPushNotification = async (userId, title, body, dataPayload = {}) => {
    try {
        await db.collection("users").doc(userId).collection("notifications").add({
            title,
            body,
            type: dataPayload.type || "GENERAL",
            bookingId: dataPayload.bookingId || null,
            createdAt: new Date(),
            status: "Unread"
        });

        const userDoc = await db.collection("users").doc(userId).get();
        if (!userDoc.exists) {
            console.log(`User ${userId} not found for push notification.`);
            return false;
        }

        const userData = userDoc.data();
        const fcmToken = userData.fcmToken;

        if (!fcmToken) {
            console.log(`User ${userId} does not have an FCM token.`);
            return false;
        }

        let tokens = [];
        if (typeof fcmToken === "string" && fcmToken.trim() !== "") {
            tokens.push(fcmToken);
        } else if (typeof fcmToken === "object" && fcmToken !== null) {
            tokens = Object.values(fcmToken).filter(t => typeof t === "string" && t.trim() !== "");
        }

        if (tokens.length === 0) {
            console.log(`User ${userId} does not have any valid FCM tokens.`);
            return false;
        }

        const cleanDataPayload = {};
        if (dataPayload && typeof dataPayload === "object") {
            for (const [key, value] of Object.entries(dataPayload)) {
                if (value !== null && value !== undefined) {
                    cleanDataPayload[key] = String(value);
                }
            }
        }

        const sendPromises = tokens.map(async (token) => {
            const message = {
                token: token,
                notification: {
                    title,
                    body,
                },
                data: cleanDataPayload,
            };
            return getMessaging().send(message);
        });

        const results = await Promise.allSettled(sendPromises);
        console.log(`Push notifications send results for user ${userId}:`, results);
        return true;
    } catch (error) {
        console.error("Error storing/sending notification:", error);
        return false;
    }
};

const sendBookingConfirmationNotification = async (user, bookingId, date) => {
    try {
        const templateDoc = await db.collection("notification_modals").doc("BOOKING_CONFIRMATION").get();
        let title = "Booking Confirmed! 🎉";
        let body = `Your trip from ${user.startingPoint || "your starting point"} to ${user.dropPoint || "your destination"} on ${date} has been confirmed successfully.`;
        let type = "BOOKING_CONFIRMATION";

        if (templateDoc.exists) {
            const templateData = templateDoc.data();
            if (templateData.title) title = templateData.title;
            if (templateData.type) type = templateData.type;
            if (templateData.message) {
                body = templateData.message
                    .replace(/{{user_name}}/g, user.name || "Customer")
                    .replace(/{{booking_id}}/g, bookingId || "")
                    .replace(/{{date}}/g, date || "")
                    .replace(/{{pickup}}/g, user.startingPoint || "")
                    .replace(/{{drop}}/g, user.dropPoint || "")
                    .replace(/{{amount}}/g, user.totalFare !== undefined ? String(user.totalFare) : "");
            }
        }

        const dataPayload = {
            type: type,
            bookingId: bookingId,
        };
        
        return await sendPushNotification(user.userId, title, body, dataPayload);
    } catch (error) {
        console.error("Error sending booking confirmation notification:", error);
        return false;
    }
};

const sendTripCancellationNotification = async (user, bookingId, date) => {
    try {
        const templateDoc = await db.collection("notification_modals").doc("TRIP_CANCELLATION").get();
        let title = "Booking Cancelled ❌";
        let body = `Your trip from ${user.startingPoint || "your starting point"} to ${user.dropPoint || "your destination"} on ${date} has been cancelled.`;
        let type = "TRIP_CANCELLATION";

        if (templateDoc.exists) {
            const templateData = templateDoc.data();
            if (templateData.title) title = templateData.title;
            if (templateData.type) type = templateData.type;
            if (templateData.message) {
                body = templateData.message
                    .replace(/{{user_name}}/g, user.name || "Customer")
                    .replace(/{{booking_id}}/g, bookingId || "")
                    .replace(/{{date}}/g, date || "")
                    .replace(/{{pickup}}/g, user.startingPoint || "")
                    .replace(/{{drop}}/g, user.dropPoint || "")
                    .replace(/{{amount}}/g, user.totalFare !== undefined ? String(user.totalFare) : "");
            }
        }

        const dataPayload = {
            type: type,
            bookingId: bookingId,
        };
        
        return await sendPushNotification(user.userId, title, body, dataPayload);
    } catch (error) {
        console.error("Error sending trip cancellation notification:", error);
        return false;
    }
};

const onBookingUpdated = onDocumentWritten("bookings/{bookingId}", async (event) => {
    const change = event.data;
    if (!change || !change.after.exists) return null;

    const beforeData = change.before.exists ? change.before.data() : null;
    const afterData = change.after.data();

    const beforeUsers = beforeData ? (beforeData.users || []) : [];
    const afterUsers = afterData.users || [];

    for (const afterUser of afterUsers) {
        const wasConfirmedBefore = beforeUsers.some(u => u.userId === afterUser.userId && u.status === "Confirmed");
        const wasPendingBefore = beforeUsers.some(u => u.userId === afterUser.userId && u.status === "Pending");
        const isConfirmedNow = afterUser.status === "Confirmed";
        const isCancelledNow = afterUser.status === "Cancelled";

        const enrichedUser = {
            ...afterUser,
            startingPoint: afterUser.startingPoint || afterData.route_start,
            dropPoint: afterUser.dropPoint || afterData.route_end
        };
        const selectedDate = afterData.selectedDate;

        // Confirmation Notification
        if (!wasConfirmedBefore && isConfirmedNow) {
            await sendBookingConfirmationNotification(enrichedUser, event.params.bookingId, selectedDate);
        }

        // Cancellation Notification
        if ((wasConfirmedBefore || wasPendingBefore) && isCancelledNow) {
            await sendTripCancellationNotification(enrichedUser, event.params.bookingId, selectedDate);
        }
    }
    
    return null;
});

module.exports = {
    sendPushNotification,
    sendBookingConfirmationNotification,
    sendTripCancellationNotification,
    onBookingUpdated
};
