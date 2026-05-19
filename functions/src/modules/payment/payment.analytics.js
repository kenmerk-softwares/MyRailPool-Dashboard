const { db } = require("../../shared/config/firebase");
const { FieldValue } = require("firebase-admin/firestore");

const updateAnalyticsData = async (amount, bookingCount, date = new Date(), isConfirmed = true) => {
    const parsedAmount = Number(amount) || 0;
    const parsedBookingCount = Number(bookingCount) || 0;

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
    const passengerChange = parsedBookingCount * multiplier;
    const tripChange = 1 * multiplier;

    const updateData = {
        amount: FieldValue.increment(amountChange),
        passengerCount: FieldValue.increment(passengerChange),
        noOfTrips: FieldValue.increment(tripChange)
    };

    const yearlyRef = db.collection("yearly_analytics").doc(year);
    const weeklyDocId = `${year}_W${week.padStart(2, "0")}`;
    const weeklyRef = db.collection("weekly_analytics").doc(weeklyDocId);
    
    const totalRef = db.collection("analytics").doc("total");

    try {
        const batch = db.batch();
        batch.set(yearlyRef, updateData, { merge: true });
        
        batch.set(weeklyRef, {
            ...updateData,
            year: year,
            week: week
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

    if (!wasConfirmed && isConfirmed) {
        // Payment is now confirmed. Increment analytics.
        const date = afterData.createdAt && typeof afterData.createdAt.toDate === "function" 
            ? afterData.createdAt.toDate() 
            : new Date();
        
        await updateAnalyticsData(afterData.amount, afterData.bookingCount, date, true);
    } else if (wasConfirmed && !isConfirmed) {
        // Payment was confirmed, but is now cancelled/deleted. Decrement analytics.
        const date = beforeData.createdAt && typeof beforeData.createdAt.toDate === "function" 
            ? beforeData.createdAt.toDate() 
            : new Date();
            
        await updateAnalyticsData(beforeData.amount, beforeData.bookingCount, date, false);
    }
    
    return null;
});

module.exports = {
    updateAnalyticsData,
    onFinanceUpdated
};
