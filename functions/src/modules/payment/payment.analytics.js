const { db } = require("../../shared/config/firebase");
const { FieldValue } = require("firebase-admin/firestore");

const updateAnalyticsData = async (amount, bookingCount, tripsCount, date = new Date(), isConfirmed = true) => {
    const parsedAmount = Number(amount) || 0;
    const parsedBookingCount = Number(bookingCount) || 0;
    const parsedTripsCount = Number(tripsCount) || 1;

    const year = date.getFullYear().toString();
    const getWeekNumber = (d) => {
        d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
        return weekNo.toString();
    };
    const week = getWeekNumber(date);
    const multiplier = isConfirmed ? 1 : -1;
    const amountChange = parsedAmount * multiplier;
    // Total passenger seats booked = passenger count per trip * number of trips
    const passengerChange = (parsedBookingCount * parsedTripsCount) * multiplier;
    const tripChange = parsedTripsCount * multiplier;

    const updateData = {
        amount: FieldValue.increment(amountChange),
        passengerCount: FieldValue.increment(passengerChange),
        noOfTrips: FieldValue.increment(tripChange),
        bookingCount: FieldValue.increment(parsedBookingCount * multiplier),
        updatedAt: new Date()
    };

    const yearlyRef = db.collection("yearly_analytics").doc(year);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const monthlyDocID = `${year}-${month}`;
    const weekOfMonth = Math.ceil(date.getDate() / 7);
    const weeklyDocId = `${year}-${month}-${weekOfMonth}`;
    const dailyDocId = `${year}-${month}-${day}`;
    const monthlyRef = db.collection("monthly_analytics").doc(monthlyDocID);
    const weeklyRef = db.collection("weekly_analytics").doc(weeklyDocId);
    const totalRef = db.collection("analytics").doc("total");
    const dailyRef = db.collection("daily_analytics").doc(dailyDocId);

    try {
        const batch = db.batch();
        batch.set(yearlyRef, updateData, { merge: true });
        batch.set(monthlyRef, {
            ...updateData,
            year: year,
            month: month
        }, { merge: true });
        batch.set(weeklyRef, {
            ...updateData,
            year: year,
            month: month,
            week: week
        }, { merge: true });
        batch.set(dailyRef, {
            ...updateData,
            year: year,
            month: month,
            week: week,
            day: date.getDate()
        }, { merge: true });

        batch.set(totalRef, updateData, { merge: true });

        await batch.commit();
        console.log(`Updated separate analytics for year ${year}, week ${week} (diff: trips=${tripChange}, pax=${passengerChange}, amt=${amountChange})`);
    } catch (error) {
        console.error("Error updating analytics:", error);
    }
};

const { onDocumentWritten } = require("firebase-functions/v2/firestore");

const onFinanceUpdated = onDocumentWritten("finance/{financeId}", async (event) => {
    const change = event.data;
    if (!change) return null;

    const beforeData = change.before.exists ? change.before.data() : null;
    const afterData = change.after.exists ? change.after.data() : null;

    const wasConfirmed = beforeData && beforeData.status === "Confirmed";
    const isConfirmed = afterData && afterData.status === "Confirmed";

    if (wasConfirmed === isConfirmed) {
        return null;
    }

    const eventId = event.id;
    const eventRef = db.collection("analytics_events").doc(eventId);

    try {
        await db.runTransaction(async (t) => {
            const doc = await t.get(eventRef);
            if (doc.exists) {
                console.log(`Event ${eventId} already processed. Skipping.`);
                return;
            }
            t.set(eventRef, { processedAt: new Date() });
        });
    } catch (e) {
        console.error("Transaction failed or event already processed:", e);
        return null;
    }

    const getTripsCount = (data) => {
        if (!data || !data.bookingId) return 1;
        if (Array.isArray(data.bookingId)) return data.bookingId.length;
        if (typeof data.bookingId === "string" && data.bookingId.includes(",")) return data.bookingId.split(",").length;
        return 1;
    };

    const extractDate = (createdAt) => {
        if (!createdAt) return new Date();
        if (typeof createdAt.toDate === "function") return createdAt.toDate();
        if (createdAt instanceof Date) return createdAt;
        if (typeof createdAt === "string" || typeof createdAt === "number") return new Date(createdAt);
        return new Date();
    };

    if (!wasConfirmed && isConfirmed) {
        const date = extractDate(afterData.createdAt);

        const tripsCount = getTripsCount(afterData);
        await updateAnalyticsData(afterData.amount, afterData.bookingCount, tripsCount, date, true);
    } else if (wasConfirmed && !isConfirmed) {
        const date = extractDate(beforeData.createdAt);

        const tripsCount = getTripsCount(beforeData);
        await updateAnalyticsData(beforeData.amount, beforeData.bookingCount, tripsCount, date, false);
    }
    return null;
});

module.exports = {
    updateAnalyticsData,
    onFinanceUpdated
};
