const { onRequest } = require("firebase-functions/v2/https");
const { db } = require("../../shared/config/firebase");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY || "sk_test_YOUR_STRIPE_SECRET_KEY");
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || "whsec_YOUR_WEBHOOK_SECRET";

const stripeWebhook = onRequest(async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
        // Stripe requires the raw body to construct the event
        event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
    } catch (err) {
        console.error("Webhook Error:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the checkout.session.completed event
    if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        
        // Fulfill the purchase...
        const { bookingId, userId } = session.metadata;

        if (bookingId && userId) {
            try {
                const batch = db.batch();
                
                // 1. Update Booking status
                const bookingRef = db.collection("bookings").doc(bookingId);
                batch.update(bookingRef, { status: "Confirmed" });

                // 2. Update Finance status
                const financeSnapshot = await db.collection("finance").where("bookingId", "==", bookingId).limit(1).get();
                if (!financeSnapshot.empty) {
                    batch.update(financeSnapshot.docs[0].ref, { status: "Confirmed" });
                }

                // 3. Update User's sub-collection booking
                const userBookingRef = db.collection("users").doc(userId).collection("bookings").doc(bookingId);
                batch.update(userBookingRef, { status: "Confirmed" });

                await batch.commit();
                console.log(`Successfully confirmed booking ${bookingId}`);
            } catch (error) {
                console.error(`Error updating booking ${bookingId}:`, error);
                return res.status(500).send("Internal Server Error updating database");
            }
        }
    }

    // Return a 200 response to acknowledge receipt of the event
    res.json({received: true});
});

module.exports = {
    stripeWebhook
};
