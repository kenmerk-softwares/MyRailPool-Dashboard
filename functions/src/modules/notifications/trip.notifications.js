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
                    .replace(/{{booking_id}}/g, user.bookingNo || "")
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

const sendRouteRequestAcceptedNotification = async (userId, routeRequest, bookingNo, bookingId = null) => {
    try {
        if (!userId) {
            console.error("No userId provided for route request accepted notification.");
            return false;
        }
        const templateDoc = await db.collection("notification_modals").doc("ROUTE_REQUEST_ACCEPTED").get();
        const fromVal = typeof routeRequest.from === "object" ? (routeRequest.from.name || "") : (routeRequest.from || "");
        const toVal = typeof routeRequest.to === "object" ? (routeRequest.to.name || "") : (routeRequest.to || "");
        const nameVal = routeRequest.name || "Customer";

        let title = "Route Request Accepted! 🎉";
        let body = `Hi ${nameVal}, your route request from ${fromVal} to ${toVal} has been accepted and your slot is booked! Booking Reference: ${bookingNo}`;
        let type = "ROUTE_REQUEST_ACCEPTED";

        if (templateDoc.exists) {
            const templateData = templateDoc.data();
            if (templateData.title) title = templateData.title;
            if (templateData.type) type = templateData.type;
            if (templateData.message) {
                body = templateData.message
                    .replace(/{{user_name}}/g, nameVal)
                    .replace(/{{booking_id}}/g, bookingNo || "")
                    .replace(/{{pickup}}/g, fromVal)
                    .replace(/{{drop}}/g, toVal);
            }
        }

        const dataPayload = {
            type: type,
            bookingNo: bookingNo || "",
        };
        if (bookingId) {
            dataPayload.bookingId = bookingId;
        }

        return await sendPushNotification(userId, title, body, dataPayload);
    } catch (error) {
        console.error("Error sending route request accepted notification:", error);
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

    // Deduplicate by (userId + financeId) to avoid sending multiple notifications
    // when a multi-date booking creates separate booking docs with the same financeId.
    const notifiedConfirmationKeys = new Set();
    const notifiedCancellationKeys = new Set();

    for (const afterUser of afterUsers) {
        const wasConfirmedBefore = beforeUsers.some(u => u.userId === afterUser.userId && u.status === "Confirmed");
        const wasPendingBefore = beforeUsers.some(u => u.userId === afterUser.userId && u.status === "Pending");
        const isConfirmedNow = afterUser.status === "Confirmed";
        const isCancelledNow = afterUser.status === "Cancelled";

        const financeId = afterUser.financeId || null;
        // Dedup key: prefer financeId (groups all dates of a multi-booking), fall back to userId alone.
        const dedupKey = financeId ? `${afterUser.userId}:${financeId}` : afterUser.userId;

        const enrichedUser = {
            ...afterUser,
            startingPoint: afterUser.startingPoint || afterData.route_start,
            dropPoint: afterUser.dropPoint || afterData.route_end,
            bookingNo: afterData.bookingNo || ""
        };
        const selectedDate = afterData.selectedDate;

        if (!wasConfirmedBefore && isConfirmedNow) {
            if (!notifiedConfirmationKeys.has(dedupKey)) {
                notifiedConfirmationKeys.add(dedupKey);
                await sendBookingConfirmationNotification(enrichedUser, event.params.bookingId, selectedDate);
            }
        }
        if ((wasConfirmedBefore || wasPendingBefore) && isCancelledNow) {
            if (!notifiedCancellationKeys.has(dedupKey)) {
                notifiedCancellationKeys.add(dedupKey);
                await sendTripCancellationNotification(enrichedUser, event.params.bookingId, selectedDate);
                try {
                    const { sendBookingCancelled } = require("../whatsapp/whatsapp.service");
                    await sendBookingCancelled(event.params.bookingId, afterUser.userId);
                } catch (whatsappErr) {
                    console.error("Error sending WhatsApp cancel notification:", whatsappErr);
                }
            }
        }
    }

    return null;
});

module.exports = {
    sendPushNotification,
    sendBookingConfirmationNotification,
    sendTripCancellationNotification,
    sendRouteRequestAcceptedNotification,
    onBookingUpdated
};
