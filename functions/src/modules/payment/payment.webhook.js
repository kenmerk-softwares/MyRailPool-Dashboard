const { onRequest } = require("firebase-functions/v2/https");
const { db } = require("../../shared/config/firebase");
const stripeWebhook = onRequest(async (req, res) => {
    // Initialize inside the function to ensure env vars are populated
    const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    const sig = req.headers["stripe-signature"];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
    } catch (err) {
        console.error("Webhook Error:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const { bookingId, userId, financeId } = session.metadata;

        if (bookingId) {
            try {
                const bookingRef = db.collection("bookings").doc(bookingId);
                const bookingDoc = await bookingRef.get();

                if (bookingDoc.exists) {
                    const bookingData = bookingDoc.data();
                    const batch = db.batch();
                    const paymentIntentId = session.payment_intent;

                    const usersArray = bookingData.users || [];
                    const updatedUsersArray = usersArray.map(user => {
                        if (user.userId === userId && user.status === "Pending") {
                            const updatedUser = { ...user, status: "Confirmed", paymentStatus: "complete" };
                            if (paymentIntentId) {
                                updatedUser.paymentIntentId = paymentIntentId;
                            }
                            return updatedUser;
                        }
                        return user;
                    });
                    batch.update(bookingRef, { users: updatedUsersArray });

                    const financeRef = db.collection("finance").doc(financeId);
                    const financeDoc = await financeRef.get();
                    if (financeDoc.exists) {
                        const financeUpdate = { status: "Confirmed", paymentStatus: "complete" };
                        if (paymentIntentId) {
                            financeUpdate.paymentIntentId = paymentIntentId;
                        }
                        batch.update(financeRef, financeUpdate);
                        
                        if (userId) {
                            const userBookingRef = db.collection("users").doc(userId).collection("bookings").doc(financeDoc.id);
                            const userBookingUpdate = { status: "Confirmed", paymentStatus: "complete" };
                            if (paymentIntentId) {
                                userBookingUpdate.paymentIntentId = paymentIntentId;
                            }
                            batch.update(userBookingRef, userBookingUpdate);
                        }
                    }

                    await batch.commit();
                    console.log(`Successfully confirmed booking ${bookingId}`);

                } else {
                    console.error(`Booking document not found for ID: ${bookingId}`);
                }
            } catch (error) {
                console.error(`Error updating booking ${bookingId}:`, error);
                return res.status(500).send("Internal Server Error updating database");
            }
        }
    } else if (event.type === "charge.refunded") {
        const charge = event.data.object;
        const paymentIntentId = charge.payment_intent;
        const stripeRefundId = charge.id;
        const { financeId, userId, bookingId } = charge.metadata;

        if (paymentIntentId) {
            try {
                const financeDoc = await db.collection("finance").doc(financeId).get();

                if (financeDoc.exists) {
                    const batch = db.batch();
                    batch.update(financeDoc.ref, { paymentStatus: "refunded", stripeRefundId: stripeRefundId });
                    if (userId) {
                        const userBookingRef = db.collection("users").doc(userId).collection("bookings").doc(financeId);
                        const userBookingUpdate = { paymentStatus: "refunded", stripeRefundId: stripeRefundId };
                        if (paymentIntentId) {
                            userBookingUpdate.paymentIntentId = paymentIntentId;
                        }
                        batch.update(userBookingRef, userBookingUpdate);
                    }
                    if (bookingId) {
                        const bookingRef = db.collection("bookings").doc(bookingId);
                        const bookingDoc = await bookingRef.get();
                        if (bookingDoc.exists) {
                            const bookingData = bookingDoc.data();
                            const usersArray = bookingData.users || [];
                            const updatedUsersArray = usersArray.map(user => {
                                if (user.userId === userId) {
                                    return { ...user, paymentStatus: "refunded" };
                                }
                                return user;
                            });
                            batch.update(bookingRef, { users: updatedUsersArray });
                        }
                    }
                    await batch.commit();
                    console.log(`Successfully processed refund event for payment intent ${paymentIntentId}`);
                }
            } catch (error) {
                console.error(`Error processing refund event for payment intent ${paymentIntentId}:`, error);
                return res.status(500).send("Internal Server Error processing refund");
            }
        }
    }
    res.json({received: true});
});

module.exports = {
    stripeWebhook
};
