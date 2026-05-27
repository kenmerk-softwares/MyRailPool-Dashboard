const { FieldValue } = require("firebase-admin/firestore");
const { db } = require("../../shared/config/firebase");
const bookTripService = async (data) => {
    const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
    const { tripId, bookingCount, userId, paymentType, startingPoint, dropPoint, selectedDate, boardingPoint, dropOffPoint } = data;

    let tripDoc = await db.collection("trips").doc(tripId).get();
    if (!tripDoc.exists) {
        return { success: false, message: "Trip not found" };
    }

    const tripData = tripDoc.data();

    const counterRef = db.collection("configurations").doc("booking-settings");
    const counterDoc = await counterRef.get();
    const baseCounter = (counterDoc.exists && counterDoc.data().counter) ? counterDoc.data().counter : 0;
    let counterId = baseCounter + 1;

    const availableSeatsMap = tripData.available_seats || {};
    const dates = Array.isArray(selectedDate) ? selectedDate : [selectedDate];
    for (const date of dates) {
        const currentAvailableSeats = availableSeatsMap[date] ?? tripData.total_seats;
        if (currentAvailableSeats < bookingCount) {
            return { success: false, message: `Not enough seats available for the date ${date}` };
        }
    }

    const routeKey = `${startingPoint}-${dropPoint}`;
    const fare = tripData.fareMatrix ? tripData.fareMatrix[routeKey] : null;
    if (!fare) {
        return { success: false, message: "Fare not configured for the selected route" };
    }
    const totalFare = Number(fare) * bookingCount * dates.length;

    const batch = db.batch();
    const financeRef = db.collection("finance").doc();

    const updatedAvailableSeatsMap = { ...availableSeatsMap };
    for (const date of dates) {
        const currentAvailableSeats = updatedAvailableSeatsMap[date] ?? tripData.total_seats;
        updatedAvailableSeatsMap[date] = currentAvailableSeats - bookingCount;
    }
    batch.update(tripDoc.ref, {
        available_seats: updatedAvailableSeatsMap,
        total_bookings: FieldValue.increment(bookingCount * dates.length),
    });

    const bookingIds = [];
    const bookingNos = [];
    const now = new Date();
    const pad = (num) => String(num).padStart(2, "0");
    const bookingTime = `${pad(now.getHours())}${pad(now.getMinutes())}`;

    for (let i = 0; i < dates.length; i++) {
        const date = dates[i];
        const bookingDocId = `${tripId}_${date}`;
        bookingIds.push(bookingDocId);
        bookingNos.push(`MRP/TB/${date}/${bookingTime}/${counterId + i}`);
    }

    let sessionId = null;
    let paymentUrl = null;
    const bookingStatus = paymentType === "online" ? "Pending" : "Confirmed";
    const paymentStatus = bookingStatus === "Pending" ? "pending" : "complete";

    if (paymentType === "online") {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "gbp",
                        product_data: {
                            name: `Trip Booking: ${startingPoint} to ${dropPoint}`,
                            description: `Booking for ${bookingCount} passenger(s) on ${dates.join(", ")}`,
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
                bookingId: bookingIds.slice(0, 5).join(","),
                bookingNos: bookingNos.join(","),
                userId: userId,
                tripId: tripDoc.id,
                financeId: financeRef.id,
                selectedDate: dates.slice(0, 5).join(",")
            }
        });
        sessionId = session.id;
        paymentUrl = session.url;
    }

    const userDoc = await db.collection("users").doc(userId).get();
    const userData = userDoc.exists ? userDoc.data() : {};

    const singleBookingFare = Number(fare) * bookingCount;

    for (let i = 0; i < dates.length; i++) {
        const date = dates[i];
        const bookingDocId = bookingIds[i];
        const bookingRef = db.collection("bookings").doc(bookingDocId);
        const bookingNo = bookingNos[i];

        const userDetailsMap = {
            userId,
            financeId: financeRef.id,
            bookingNo,
            name: userData.name || userData.displayName || "Unknown",
            phone: userData.phone || userData.phoneNumber || "",
            bookingCount,
            paymentType,
            startingPoint,
            dropPoint,
            totalFare: singleBookingFare,
            status: bookingStatus,
            boardingPoint,
            dropOffPoint,
            paymentStatus,
            createdAt: new Date(),
            ...(sessionId && { stripeSessionId: sessionId })
        };

        const bookingData = {
            bookingId: bookingRef.id,
            bookingNo: bookingNo,
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
            selectedDate: date,
            updatedAt: new Date(),
            totalSeats: tripData.total_seats,
            bookedCount: FieldValue.increment(bookingCount),
            users: FieldValue.arrayUnion(userDetailsMap),
            passengers: FieldValue.arrayUnion(...data.passengers),
            userIds: FieldValue.arrayUnion(userId),
        };
        batch.set(bookingRef, bookingData, { merge: true });
    }

    const financeData = {
        financeId: financeRef.id,
        bookingId: bookingIds,
        bookingNos: bookingNos,
        amount: totalFare,
        userId,
        bookingCount,
        paymentType,
        tripId: tripDoc.id,
        driverId: tripData.driver_id || "",
        createdAt: new Date(),
        type: "Credit",
        description: `Booking for trip ${tripData.tripId || tripDoc.id}`,
        status: bookingStatus,
        paymentStatus,
        tripStatus: "Not Started",
        multiBookings: data.multiBookings || false,
    };
    batch.set(financeRef, financeData);

    for (let i = 0; i < dates.length; i++) {
        const date = dates[i];
        const bookingDocId = bookingIds[i];
        const bookingNo = bookingNos[i];
        const bookingNoSafe = bookingNo.replace(/\//g, "-");
        const userBookingRef = db.collection("users").doc(userId).collection("bookings").doc(bookingNoSafe);

        const userBookingData = {
            bookingId: bookingNoSafe,
            bookingsDocId: [bookingDocId],
            bookingNo: bookingNo,
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
            selectedDate: date,
            updatedAt: new Date(),
            passengers: data.passengers,
            bookingCount,
            paymentType,
            startingPoint,
            dropPoint,
            totalFare: singleBookingFare,
            status: bookingStatus,
            boardingPoint,
            dropOffPoint,
            paymentStatus,
            createdAt: new Date(),
            tripStatus: "Not Started",
            multiBookings: data.multiBookings || false,
            financeId: financeRef.id,
            ...(sessionId && { stripeSessionId: sessionId })
        };

        batch.set(userBookingRef, userBookingData);
    }

    batch.set(counterRef, { counter: baseCounter + dates.length }, { merge: true });

    await batch.commit();

    return {
        success: true,
        data: {
            id: bookingIds,
            totalFare,
            status: bookingStatus,
            ...(paymentUrl && { paymentUrl })
        },
    };
};

// ==================== CREATE USER SERVICE ==================== //
const createUserService = async (data) => {
    const { uid, name, email, mobile, fcmToken, address, profileImage, platform } = data;
    console.log(data);
    const userRef = db.collection("users").doc(uid);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
        const updateData = {};

        if (name !== undefined) {
            updateData.name = name;
            updateData.searchKey = name ? name.toLowerCase() : "";
        }
        if (email !== undefined) {
            updateData.email = email;
        }
        if (mobile !== undefined) {
            updateData.mobile = mobile;
        }
        if (address !== undefined) {
            updateData.address = address;
        }
        if (profileImage !== undefined) {
            updateData.profileImage = profileImage;
        }

        if (fcmToken !== undefined) {
            const existingFcmToken = userDoc.data().fcmToken || {};
            const fcmTokenMap = {
                web: existingFcmToken.web || "",
                android: existingFcmToken.android || "",
                ios: existingFcmToken.ios || ""
            };

            if (typeof fcmToken === "string") {
                if (platform) {
                    fcmTokenMap[platform] = fcmToken;
                }
            } else if (typeof fcmToken === "object" && fcmToken !== null) {
                Object.keys(fcmTokenMap).forEach(key => {
                    if (fcmToken[key] !== undefined) {
                        fcmTokenMap[key] = fcmToken[key];
                    }
                });
            }
            updateData.fcmToken = fcmTokenMap;
        }

        const existing = userDoc.data() || {};
        let hasChanges = false;

        for (const key of ["name", "searchKey", "email", "mobile", "address", "profileImage"]) {
            if (updateData[key] !== undefined && updateData[key] !== existing[key]) {
                hasChanges = true;
                break;
            }
        }

        if (!hasChanges && updateData.fcmToken !== undefined) {
            const existingFcmToken = existing.fcmToken || {};
            if (
                updateData.fcmToken.web !== (existingFcmToken.web || "") ||
                updateData.fcmToken.android !== (existingFcmToken.android || "") ||
                updateData.fcmToken.ios !== (existingFcmToken.ios || "")
            ) {
                hasChanges = true;
            }
        }

        if (!hasChanges) {
            return { success: true, message: "No changes detected, update skipped" };
        }

        updateData.updatedAt = new Date();
        await userRef.update(updateData);
        return { success: true, message: "User updated successfully" };
    }

    const userData = {
        mobile,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: "Active",
    };

    if (name) {
        userData.name = name;
        userData.searchKey = name.toLowerCase();
    }
    if (email) userData.email = email;
    if (address) userData.address = address;
    if (profileImage) userData.profileImage = profileImage;

    const fcmTokenMap = {
        web: "",
        android: "",
        ios: ""
    };
    if (fcmToken) {
        if (typeof fcmToken === "string") {
            if (platform) {
                fcmTokenMap[platform] = fcmToken;
            }
        } else if (typeof fcmToken === "object" && fcmToken !== null) {
            Object.keys(fcmTokenMap).forEach(key => {
                if (fcmToken[key] !== undefined) {
                    fcmTokenMap[key] = fcmToken[key];
                }
            });
        }
    }
    userData.fcmToken = fcmTokenMap;

    await userRef.set(userData);

    return { success: true, message: "User created successfully" };
};

module.exports = { bookTripService, createUserService };
