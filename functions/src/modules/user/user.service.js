const { FieldValue } = require("firebase-admin/firestore");
const { db } = require("../../shared/config/firebase");
const bookTripService = async (data) => {
    const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
    const { tripId, bookingCount, userId, paymentType, startingPoint, dropPoint, selectedDate } = data;

    let tripDoc = await db.collection("trips").doc(tripId).get();
    if (!tripDoc.exists) {
        return { success: false, message: "Trip not found" };
    }
    
    const tripData = tripDoc.data();

    const availableSeatsMap = tripData.available_seats || {};
    const currentAvailableSeats = availableSeatsMap[selectedDate] ?? tripData.total_seats;
    if (currentAvailableSeats < bookingCount) {
        return { success: false, message: "Not enough seats available for the selected date" };
    }

    const routeKey = `${startingPoint}-${dropPoint}`;
    const fare = tripData.fareMatrix ? tripData.fareMatrix[routeKey] : null;
    if (!fare) {
        return { success: false, message: "Fare not configured for the selected route" };
    }
    const totalFare = Number(fare) * bookingCount;

    const batch = db.batch();

    const newAvailableSeats = currentAvailableSeats - bookingCount;
    const updatedAvailableSeatsMap = {
        ...availableSeatsMap,
        [selectedDate]: newAvailableSeats,
    };
    batch.update(tripDoc.ref, {
        available_seats: updatedAvailableSeatsMap,
        total_bookings: FieldValue.increment(bookingCount),
    });

    const bookingDocId = `${tripId}_${selectedDate}`;
    const bookingRef = db.collection("bookings").doc(bookingDocId);
    
    let sessionId = null;
    let paymentUrl = null;
    const bookingStatus = paymentType === "online" ? "Pending" : "Confirmed";

    if (paymentType === "online") {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "eur", 
                        product_data: {
                            name: `Trip Booking: ${startingPoint} to ${dropPoint}`,
                            description: `Booking for ${bookingCount} passenger(s) on ${selectedDate}`,
                        },
                        unit_amount: Math.round(totalFare * 100),
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: `http://localhost:5173/payment/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `http://localhost:5173/payment/cancel`,
            metadata: {
                bookingId: bookingRef.id,
                userId: userId,
                tripId: tripDoc.id,
                selectedDate: selectedDate
            }
        });
        sessionId = session.id;
        paymentUrl = session.url;
    }

    const userDoc = await db.collection("users").doc(userId).get();
    const userData = userDoc.exists ? userDoc.data() : {};

    const userDetailsMap = {
        userId,
        name: userData.name || userData.displayName || "Unknown",
        phone: userData.phone || userData.phoneNumber || "",
        bookingCount,
        paymentType,
        startingPoint,
        dropPoint,
        totalFare,
        status: bookingStatus,
        createdAt: new Date(),
        ...(sessionId && { stripeSessionId: sessionId })
    };

    const bookingData = {
        bookingId: bookingRef.id,
        tripId: tripDoc.id,
        tripNo: tripData.tripId,
        driver_id: tripData.driver_id || "",
        driver_name: tripData.driver_name || "",
        vehicle_id: tripData.vehicle_id || "",
        route_id: tripData.route_id || "",
        route_name: tripData.route_name || "",
        route_start: tripData.routes && tripData.routes.length > 0 ? tripData.routes[0] : "",
        route_end: tripData.routes && tripData.routes.length > 0 ? tripData.routes[tripData.routes.length - 1] : "",
        route_type: tripData.route_type || "",
        selectedDate,
        updatedAt: new Date(),
        totalSeats: tripData.total_seats,
        bookedCount: FieldValue.increment(bookingCount),
        users: FieldValue.arrayUnion(userDetailsMap)
    };
    batch.set(bookingRef, bookingData, { merge: true });

    const financeRef = db.collection("finance").doc();
    const financeData = {
        financeId: financeRef.id,
        bookingId: bookingRef.id,
        amount: totalFare,
        userId,
        bookingCount,
        paymentType,
        tripId: tripDoc.id,
        driverId: tripData.driver_id || "",
        createdAt: new Date(),
        type: "Credit",
        description: `Booking for trip ${tripData.tripId || tripDoc.id}`,
        status: bookingStatus
    };
    batch.set(financeRef, financeData);

    const userBookingRef = db.collection("users").doc(userId).collection("bookings").doc(bookingRef.id);
    batch.set(userBookingRef, bookingData);

    await batch.commit();

    if (bookingStatus === "Confirmed") {
        const { updateAnalyticsData } = require("../payment/payment.analytics");
        await updateAnalyticsData(totalFare, bookingCount, new Date(), true);
        
        const { sendBookingConfirmationNotification } = require("../notifications/trip.notifications");
        await sendBookingConfirmationNotification(userId, bookingRef.id, selectedDate, startingPoint, dropPoint);
    }

    return {
        success: true,
        data: {
            id: bookingRef.id,
            totalFare,
            status: bookingStatus,
            ...(paymentUrl && { paymentUrl })
        },
    };
};

module.exports = {bookTripService};