const { onRequest } = require("firebase-functions/v2/https");
const { db } = require("../../shared/config/firebase");
const stripeWebhook = onRequest(async (req, res) => {
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
        const { bookingId, userId, financeId, bookingNos } = session.metadata;
        let bookingIds = [];
        if (bookingId) {
            bookingIds = bookingId.split(",");
        }
        let finalBookingNos = bookingNos ? bookingNos.split(",") : [];

        if (financeId || bookingIds.length > 0) {
            try {
                let finalBookingIds = [...bookingIds];

                if (financeId) {
                    const financeDoc = await db.collection("finance").doc(financeId).get();
                    if (financeDoc.exists) {
                        const bookingIdVal = financeDoc.data().bookingId;
                        if (bookingIdVal) {
                            finalBookingIds = Array.isArray(bookingIdVal) ? bookingIdVal : [bookingIdVal];
                        }
                        const bookingNosVal = financeDoc.data().bookingNos;
                        if (bookingNosVal) {
                            finalBookingNos = Array.isArray(bookingNosVal) ? bookingNosVal : [bookingNosVal];
                        }
                    }
                }

                const batch = db.batch();
                const paymentIntentId = session.payment_intent;

                for (const bid of finalBookingIds) {
                    const bookingRef = db.collection("bookings").doc(bid);
                    const bookingDoc = await bookingRef.get();

                    if (bookingDoc.exists) {
                        const bookingData = bookingDoc.data();
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
                    }
                }

                if (financeId) {
                    const financeRef = db.collection("finance").doc(financeId);
                    const financeUpdate = { status: "Confirmed", paymentStatus: "complete" };
                    if (paymentIntentId) {
                        financeUpdate.paymentIntentId = paymentIntentId;
                    }
                    batch.update(financeRef, financeUpdate);

                    if (userId) {
                        for (const bNo of finalBookingNos) {
                            const bookingNoSafe = bNo.replace(/\//g, "-");
                            const userBookingRef = db.collection("users").doc(userId).collection("bookings").doc(bookingNoSafe);
                            const userBookingUpdate = { status: "Confirmed", paymentStatus: "complete" };
                            if (paymentIntentId) {
                                userBookingUpdate.paymentIntentId = paymentIntentId;
                            }
                            batch.update(userBookingRef, userBookingUpdate);
                        }
                    }
                }

                await batch.commit();
                console.log(`Successfully confirmed bookings: ${finalBookingIds.join(", ")}`);
            } catch (error) {
                console.error(`Error updating bookings:`, error);
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
                    batch.update(financeDoc.ref, { paymentStatus: "refunded", stripeRefundId: stripeRefundId, refundDate: new Date() });
                    
                    const financeData = financeDoc.data();
                    const bookingNosVal = financeData.bookingNos;
                    const bookingNosList = Array.isArray(bookingNosVal) ? bookingNosVal : (typeof bookingNosVal === "string" ? bookingNosVal.split(",") : []);

                    if (userId) {
                        for (const bNo of bookingNosList) {
                            const bookingNoSafe = bNo.replace(/\//g, "-");
                            const userBookingRef = db.collection("users").doc(userId).collection("bookings").doc(bookingNoSafe);
                            const userBookingUpdate = { paymentStatus: "refunded", stripeRefundId: stripeRefundId };
                            if (paymentIntentId) {
                                userBookingUpdate.paymentIntentId = paymentIntentId;
                            }
                            batch.update(userBookingRef, userBookingUpdate);
                        }
                    }
                    const bookingIdVal = financeData.bookingId || bookingId;
                    const bookingIdsList = Array.isArray(bookingIdVal) ? bookingIdVal : (typeof bookingIdVal === "string" ? bookingIdVal.split(",") : [bookingIdVal]);

                    for (const bid of bookingIdsList) {
                        const bookingRef = db.collection("bookings").doc(bid);
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
    res.json({ received: true });
});

module.exports = {
    stripeWebhook
};
