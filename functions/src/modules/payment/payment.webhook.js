const { onRequest } = require("firebase-functions/v2/https");
const { db } = require("../../shared/config/firebase");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

const stripeWebhook = onRequest(async (req, res) => {
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
        const { bookingId } = session.metadata;

        if (bookingId) {
            try {
                const bookingRef = db.collection("bookings").doc(bookingId);
                const bookingDoc = await bookingRef.get();

                if (bookingDoc.exists) {
                    const bookingData = bookingDoc.data();
                    const userId = bookingData.userId;
                    
                    const batch = db.batch();
                    batch.update(bookingRef, { status: "Confirmed" });
                    const financeSnapshot = await db.collection("finance").where("bookingId", "==", bookingId).limit(1).get();
                    if (!financeSnapshot.empty) {
                        batch.update(financeSnapshot.docs[0].ref, { status: "Confirmed" });
                    }
                    if (userId) {
                        const userBookingRef = db.collection("users").doc(userId).collection("bookings").doc(bookingId);
                        batch.update(userBookingRef, { status: "Confirmed" });
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
    }
    res.json({received: true});
});

module.exports = {
    stripeWebhook
};
