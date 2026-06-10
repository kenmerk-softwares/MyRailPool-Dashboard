const { FieldValue } = require("firebase-admin/firestore");
const { db } = require("../../shared/config/firebase");

const getFareFromMatrix = (fareMatrix, from, to) => {
    if (!fareMatrix || !from || !to) return null;
    const cleanFrom = from.trim().toLowerCase();
    const cleanTo = to.trim().toLowerCase();

    // First pass: Exact match (case-insensitive)
    for (const [key, value] of Object.entries(fareMatrix)) {
        const parts = key.split("-");
        if (parts.length === 2) {
            const p1 = parts[0].trim().toLowerCase();
            const p2 = parts[1].trim().toLowerCase();
            if ((p1 === cleanFrom && p2 === cleanTo) || (p1 === cleanTo && p2 === cleanFrom)) {
                return Number(value);
            }
        }
    }

    // Second pass: Partial match (includes)
    for (const [key, value] of Object.entries(fareMatrix)) {
        const parts = key.split("-");
        if (parts.length === 2) {
            const p1 = parts[0].trim().toLowerCase();
            const p2 = parts[1].trim().toLowerCase();
            if (
                (p1.includes(cleanFrom) && p2.includes(cleanTo)) ||
                (p1.includes(cleanTo) && p2.includes(cleanFrom))
            ) {
                return Number(value);
            }
        }
    }
    return null;
};

const bookTripService = async (data) => {
    const { tripId, bookingCount, userId, paymentType, startingPoint, dropPoint, selectedDate, boardingPoint, dropOffPoint, returnTripId, returnSelectedDate, returnMultiBookings, returnBoardingPoint, returnDropOffPoint } = data;

    let tripDoc = await db.collection("trips").doc(tripId).get();
    if (!tripDoc.exists) {
        return { success: false, message: "Trip not found" };
    }

    const tripData = tripDoc.data();

    // ==================== PRE-BOOKING VALIDATIONS ==================== //

    // 1. Check trip status
    if (tripData.status !== "Active") {
        return { success: false, message: `Booking not allowed — trip is ${tripData.status || "unavailable"}` };
    }

    // 2. Check route status
    if (tripData.route_id) {
        const routeDoc = await db.collection("routes").doc(tripData.route_id).get();
        if (!routeDoc.exists) {
            return { success: false, message: "Booking not allowed — associated route not found" };
        }
        const routeData = routeDoc.data();
        if (routeData.status !== "Active") {
            return { success: false, message: `Booking not allowed — route is ${routeData.status || "unavailable"}` };
        }
    }

    // 3. Check if selected date & departure time have passed
    const currentTime = new Date();
    const departureDates = Array.isArray(selectedDate) ? selectedDate : [selectedDate];
    for (const date of departureDates) {
        // Build a full Date from the selected date + departure time at the boarding point
        const departureTime = tripData.routeTiming ? (tripData.routeTiming[startingPoint] || tripData.routeTiming[boardingPoint]) : null;
        let departureDateTime;
        if (departureTime) {
            // departureTime is expected as "HH:mm" (e.g. "08:30")
            departureDateTime = new Date(`${date}T${departureTime}:00`);
        } else {
            // No specific time — treat the entire date as the cutoff (end of day)
            departureDateTime = new Date(`${date}T23:59:59`);
        }

        if (departureDateTime < currentTime) {
            return {
                success: false,
                message: `Booking not allowed — departure on ${date}${departureTime ? ` at ${departureTime}` : ""} has already passed`,
            };
        }
    }

    // ==================== RETURN PRE-BOOKING VALIDATIONS ==================== //
    let returnTripDoc;
    let returnTripData;
    const returnDates = returnTripId ? [...new Set(Array.isArray(returnSelectedDate) ? returnSelectedDate : [returnSelectedDate])] : [];
    if (returnTripId) {
        returnTripDoc = await db.collection("trips").doc(returnTripId).get();
        if (!returnTripDoc.exists) {
            return { success: false, message: "Return trip not found" };
        }
        returnTripData = returnTripDoc.data();

        if (returnTripData.status !== "Active") {
            return { success: false, message: `Booking not allowed — return trip is ${returnTripData.status || "unavailable"}` };
        }

        if (returnTripData.route_id) {
            const returnRouteDoc = await db.collection("routes").doc(returnTripData.route_id).get();
            if (!returnRouteDoc.exists) {
                return { success: false, message: "Booking not allowed — return route not found" };
            }
            const returnRouteData = returnRouteDoc.data();
            if (returnRouteData.status !== "Active") {
                return { success: false, message: `Booking not allowed — return route is ${returnRouteData.status || "unavailable"}` };
            }
        }

        for (const date of returnDates) {
            // Boarding point is dropPoint on the return trip
            const departureTime = returnTripData.routeTiming ? (returnTripData.routeTiming[dropPoint] || returnTripData.routeTiming[startingPoint]) : null;
            let departureDateTime;
            if (departureTime) {
                departureDateTime = new Date(`${date}T${departureTime}:00`);
            } else {
                departureDateTime = new Date(`${date}T23:59:59`);
            }

            if (departureDateTime < currentTime) {
                return {
                    success: false,
                    message: `Booking not allowed — return departure on ${date}${departureTime ? ` at ${departureTime}` : ""} has already passed`,
                };
            }
        }
    }

    // ================================================================= //

    const counterRef = db.collection("configurations").doc("booking-settings");
    const counterDoc = await counterRef.get();
    const baseCounter = (counterDoc.exists && counterDoc.data().counter) ? counterDoc.data().counter : 0;
    let counterId = baseCounter + 1;

    // Check seats for outbound
    const availableSeatsMap = tripData.available_seats || {};
    const dates = [...new Set(Array.isArray(selectedDate) ? selectedDate : [selectedDate])];
    for (const date of dates) {
        const currentAvailableSeats = availableSeatsMap[date] ?? tripData.total_seats;
        if (currentAvailableSeats < bookingCount) {
            return { success: false, message: `Not enough seats available for the date ${date}` };
        }
    }

    // Check seats for return
    if (returnTripId) {
        const returnAvailableSeatsMap = returnTripData.available_seats || {};
        for (const date of returnDates) {
            const currentAvailableSeats = returnAvailableSeatsMap[date] ?? returnTripData.total_seats;
            if (currentAvailableSeats < bookingCount) {
                return { success: false, message: `Not enough seats available for return trip on date ${date}` };
            }
        }
    }

    // Outbound fare
    const fare = getFareFromMatrix(tripData.fareMatrix, startingPoint, dropPoint);
    if (fare === null) {
        return { success: false, message: "Fare not configured for the selected route" };
    }
    const outboundFareTotal = Number(fare) * bookingCount * dates.length;

    // Return fare
    let returnFareTotal = 0;
    let returnFare = null;
    if (returnTripId) {
        returnFare = getFareFromMatrix(returnTripData.fareMatrix, dropPoint, startingPoint);
        if (returnFare === null) {
            returnFare = fare; // Fallback to outbound fare
        }
        returnFareTotal = Number(returnFare) * bookingCount * returnDates.length;
    }

    const totalFare = outboundFareTotal + returnFareTotal;

    const batch = db.batch();
    const financeRef = db.collection("finance").doc();

    // Update outbound seats
    const updatedAvailableSeatsMap = { ...availableSeatsMap };
    for (const date of dates) {
        const currentAvailableSeats = updatedAvailableSeatsMap[date] ?? tripData.total_seats;
        updatedAvailableSeatsMap[date] = currentAvailableSeats - bookingCount;
    }
    batch.update(tripDoc.ref, {
        available_seats: updatedAvailableSeatsMap,
        total_bookings: FieldValue.increment(bookingCount * dates.length),
    });

    // Update return seats
    if (returnTripId) {
        const updatedReturnAvailableSeatsMap = { ...(returnTripData.available_seats || {}) };
        for (const date of returnDates) {
            const currentAvailableSeats = updatedReturnAvailableSeatsMap[date] ?? returnTripData.total_seats;
            updatedReturnAvailableSeatsMap[date] = currentAvailableSeats - bookingCount;
        }
        batch.update(returnTripDoc.ref, {
            available_seats: updatedReturnAvailableSeatsMap,
            total_bookings: FieldValue.increment(bookingCount * returnDates.length),
        });
    }

    const bookingIds = [];
    const bookingNos = [];
    const now = new Date();
    const pad = (num) => String(num).padStart(2, "0");
    const bookingTime = `${pad(now.getHours())}${pad(now.getMinutes())}`;

    // Outbound booking doc IDs and numbers
    for (let i = 0; i < dates.length; i++) {
        const date = dates[i];
        const bookingDocId = `${tripId}_${date}`;
        bookingIds.push(bookingDocId);
        bookingNos.push(`MRP/TB/${date}/${bookingTime}/${counterId + i}`);
    }

    // Return booking doc IDs and numbers
    const returnBookingIds = [];
    const returnBookingNos = [];
    if (returnTripId) {
        for (let i = 0; i < returnDates.length; i++) {
            const date = returnDates[i];
            const bookingDocId = `${returnTripId}_${date}`;
            returnBookingIds.push(bookingDocId);
            returnBookingNos.push(`MRP/TB/${date}/${bookingTime}/${counterId + dates.length + i}`);
        }
    }

    let sessionId = null;
    let paymentUrl = null;
    const bookingStatus = (paymentType === "cash" || paymentType === "offline") ? "Confirmed" : "Pending";
    const paymentStatus = "pending";

    const successUrl = data?.platform === "web" ? `https://myrailpool-4150a.web.app/payment/success?session_id={CHECKOUT_SESSION_ID}` : "myrailpool://payment-success";
    const cancelUrl = data?.platform === "web" ? "https://myrailpool-4150a.web.app/payment/cancel" : "myrailpool://payment-cancel";

    if (paymentType === "online") {
        if (!process.env.STRIPE_SECRET_KEY) {
            return { success: false, message: "Stripe is not configured. Online payments are currently unavailable." };
        }
        const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

        const lineItems = [
            {
                price_data: {
                    currency: "gbp",
                    product_data: {
                        name: `Trip Booking: ${startingPoint} to ${dropPoint}`,
                        description: `Booking for ${bookingCount} passenger(s) on ${dates.join(", ")}`,
                    },
                    unit_amount: Math.round(Number(fare) * bookingCount * dates.length * 100),
                },
                quantity: 1,
            }
        ];

        if (returnTripId) {
            lineItems.push({
                price_data: {
                    currency: "gbp",
                    product_data: {
                        name: `Return Trip Booking: ${dropPoint} to ${startingPoint}`,
                        description: `Booking for ${bookingCount} passenger(s) on ${returnDates.join(", ")}`,
                    },
                    unit_amount: Math.round(Number(returnFare) * bookingCount * returnDates.length * 100),
                },
                quantity: 1,
            });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            success_url: successUrl,
            cancel_url: cancelUrl,
            metadata: {
                bookingId: [...bookingIds, ...returnBookingIds].slice(0, 5).join(","),
                bookingNos: [...bookingNos, ...returnBookingNos].join(","),
                userId: userId,
                tripId: tripDoc.id,
                ...(returnTripId && { returnTripId: returnTripDoc.id }),
                financeId: financeRef.id,
                selectedDate: [...dates, ...returnDates].slice(0, 5).join(",")
            }
        });
        sessionId = session.id;
        paymentUrl = session.url;
    }

    const userDoc = await db.collection("users").doc(userId).get();
    const userData = userDoc.exists ? userDoc.data() : {};

    // Save outbound bookings
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

    // Save return bookings
    if (returnTripId) {
        const singleReturnBookingFare = Number(returnFare) * bookingCount;
        for (let i = 0; i < returnDates.length; i++) {
            const date = returnDates[i];
            const bookingDocId = returnBookingIds[i];
            const bookingRef = db.collection("bookings").doc(bookingDocId);
            const bookingNo = returnBookingNos[i];

            const userDetailsMap = {
                userId,
                financeId: financeRef.id,
                bookingNo,
                name: userData.name || userData.displayName || "Unknown",
                phone: userData.phone || userData.phoneNumber || "",
                bookingCount,
                paymentType,
                startingPoint: dropPoint,
                dropPoint: startingPoint,
                totalFare: singleReturnBookingFare,
                status: bookingStatus,
                boardingPoint: returnBoardingPoint || null,
                dropOffPoint: returnDropOffPoint || null,
                paymentStatus,
                createdAt: new Date(),
                ...(sessionId && { stripeSessionId: sessionId })
            };

            const bookingData = {
                bookingId: bookingRef.id,
                bookingNo: bookingNo,
                tripId: returnTripDoc.id,
                tripNo: returnTripData.tripId,
                driver_id: returnTripData.driver_id || "",
                driver_name: returnTripData.driver_name || "",
                vehicle_id: returnTripData.vehicle_id || "",
                route_id: returnTripData.route_id || "",
                route_name: returnTripData.route_name || "",
                route_start: returnTripData.routes && returnTripData.routes.length > 0 ? returnTripData.routes[0] : "",
                route_end: returnTripData.routes && returnTripData.routes.length > 0 ? returnTripData.routes[returnTripData.routes.length - 1] : "",
                route_type: returnTripData.route_type || "",
                selectedDate: date,
                updatedAt: new Date(),
                totalSeats: returnTripData.total_seats,
                bookedCount: FieldValue.increment(bookingCount),
                users: FieldValue.arrayUnion(userDetailsMap),
                passengers: FieldValue.arrayUnion(...data.passengers),
                userIds: FieldValue.arrayUnion(userId),
            };
            batch.set(bookingRef, bookingData, { merge: true });
        }
    }

    // Create finance record
    const financeData = {
        financeId: financeRef.id,
        bookingId: [...bookingIds, ...returnBookingIds],
        bookingNos: [...bookingNos, ...returnBookingNos],
        amount: totalFare,
        userId,
        bookingCount,
        paymentType,
        tripId: tripDoc.id,
        driverId: tripData.driver_id || "",
        createdAt: new Date(),
        type: "Credit",
        description: returnTripId ? `Booking for trip ${tripData.tripId || tripDoc.id} and return trip ${returnTripData.tripId || returnTripDoc.id}` : `Booking for trip ${tripData.tripId || tripDoc.id}`,
        status: bookingStatus,
        paymentStatus,
        tripStatus: "Not Started",
        multiBookings: data.multiBookings || false,
    };
    batch.set(financeRef, financeData);

    // Save outbound user bookings
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

    // Save return user bookings
    if (returnTripId) {
        const singleReturnBookingFare = Number(returnFare) * bookingCount;
        for (let i = 0; i < returnDates.length; i++) {
            const date = returnDates[i];
            const bookingDocId = returnBookingIds[i];
            const bookingNo = returnBookingNos[i];
            const bookingNoSafe = bookingNo.replace(/\//g, "-");
            const userBookingRef = db.collection("users").doc(userId).collection("bookings").doc(bookingNoSafe);

            const userBookingData = {
                bookingId: bookingNoSafe,
                bookingsDocId: [bookingDocId],
                bookingNo: bookingNo,
                tripId: returnTripDoc.id,
                tripNo: returnTripData.tripId,
                driver_id: returnTripData.driver_id || "",
                driver_name: returnTripData.driver_name || "",
                vehicle_id: returnTripData.vehicle_id || "",
                route_id: returnTripData.route_id || "",
                route_name: returnTripData.route_name || "",
                route_start: returnTripData.routes && returnTripData.routes.length > 0 ? returnTripData.routes[0] : "",
                route_end: returnTripData.routes && returnTripData.routes.length > 0 ? returnTripData.routes[returnTripData.routes.length - 1] : "",
                route_type: returnTripData.route_type || "",
                selectedDate: date,
                updatedAt: new Date(),
                passengers: data.passengers,
                bookingCount,
                paymentType,
                startingPoint: dropPoint,
                dropPoint: startingPoint,
                totalFare: singleReturnBookingFare,
                status: bookingStatus,
                boardingPoint: returnBoardingPoint || null,
                dropOffPoint: returnDropOffPoint || null,
                paymentStatus,
                createdAt: new Date(),
                tripStatus: "Not Started",
                multiBookings: returnMultiBookings || false,
                financeId: financeRef.id,
                ...(sessionId && { stripeSessionId: sessionId })
            };

            batch.set(userBookingRef, userBookingData);
        }
    }

    batch.set(counterRef, { counter: baseCounter + dates.length + returnDates.length }, { merge: true });

    await batch.commit();

    return {
        success: true,
        data: {
            id: [...bookingIds, ...returnBookingIds],
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
