const twilio = require("twilio");
const { db } = require("../../shared/config/firebase");

let client;
const getTwilioClient = () => {
  if (!client) {
    client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  }
  return client;
};

const TEMPLATE_SIDS = {
  booking_confirmation: process.env.TWILIO_BOOKING_TEMPLATE_SID || "HX5303221ad90993004443880a7f640f35",
  trip_reminder: process.env.TWILIO_REMINDER_TEMPLATE_SID || "HX6c22bf0dc3c52b6e44c5815f56a16e2c",
  booking_cancelled: process.env.TWILIO_CANCELLED_TEMPLATE_SID || "HX9587f49a0d8a044e308774ccc200bfb8",
};

const formatWhatsAppNumber = (mobile) => {
  if (!mobile) return "";
  // Remove spaces, dashes, parentheses and keeping numbers and '+'
  let clean = mobile.replace(/[^\d+]/g, "");

  if (clean.startsWith("+")) {
    return clean;
  }

  if (clean.startsWith("00")) {
    return "+" + clean.slice(2);
  }

  // UK defaults: if starts with 0 (e.g. 07911122233), replace with +44
  if (clean.startsWith("0")) {
    return "+44" + clean.slice(1);
  }

  // If starts with 44 but not +, prepend +
  if (clean.startsWith("44") && clean.length >= 11) {
    return "+" + clean;
  }

  return "+44" + clean;
};

const sendBookingConfirmation = async (bookingDocId, targetUserId = null, targetFinanceId = null) => {
  const bookingDoc = await db.collection("bookings").doc(bookingDocId).get();

  if (!bookingDoc.exists) {
    console.error("Booking not found:", bookingDocId);
    return;
  }

  const booking = bookingDoc.data();
  console.log("Booking Data:", booking);

  const sentMobiles = new Set();

  for (const passenger of booking.users || []) {
    if (targetUserId && passenger.userId !== targetUserId) continue;
    if (targetFinanceId && passenger.financeId !== targetFinanceId) continue;

    const userDoc = await db.collection("users")
      .doc(passenger.userId)
      .get();

    if (!userDoc.exists) {
      console.error("User not found:", passenger.userId);
      continue;
    }

    const user = userDoc.data();
    console.log("User Mobile:", user.mobile);
    if (!user.mobile) {
      console.error("User mobile not found:", passenger.userId);
      continue;
    }

    const formattedMobile = formatWhatsAppNumber(user.mobile);
    if (!formattedMobile) {
      console.error("Formatted mobile not found:", user.mobile);
      continue;
    }

    if (sentMobiles.has(formattedMobile)) {
      console.log("Message already sent to this number in this run:", formattedMobile);
      continue;
    }
    sentMobiles.add(formattedMobile);

    try {
      const result = await getTwilioClient().messages.create({
        from: process.env.TWILIO_WHATSAPP_NUMBER,
        to: `whatsapp:${formattedMobile}`,
        contentSid: TEMPLATE_SIDS.booking_confirmation,
        contentVariables: JSON.stringify({
          1: String(passenger.name || user.name || ""),
          2: String(passenger.bookingNo || booking.bookingNo || ""),
          3: String(booking.route_name || ""),
          4: String(booking.selectedDate || ""),
          5: String(passenger.boardingPoint?.name || passenger.startingPoint || ""),
          6: String(passenger.dropOffPoint?.name || passenger.dropPoint || ""),
          7: String(passenger.bookingCount || 0),
          8: String(passenger.paymentType || ""),
          9: String(passenger.totalFare || 0),
        }),
      });
      console.log("WhatsApp SID:", result.sid);
    }
    catch (err) {
      console.error("WhatsApp Error:", err);
    }
  }
};

const sendBookingCancelled = async (bookingDocId, targetUserId = null) => {
  const bookingDoc = await db.collection("bookings").doc(bookingDocId).get();

  if (!bookingDoc.exists) {
    return;
  }
  const booking = bookingDoc.data();

  for (const passenger of booking.users || []) {
    if (passenger.status !== "Cancelled") continue;
    if (targetUserId && passenger.userId !== targetUserId) continue;

    const userDoc = await db.collection("users")
      .doc(passenger.userId)
      .get();

    if (!userDoc.exists) continue;

    const user = userDoc.data();
    console.log("User Mobile:", user.mobile);
    if (!user.mobile) continue;

    const formattedMobile = formatWhatsAppNumber(user.mobile);
    if (!formattedMobile) continue;

    try {
      const result = await getTwilioClient().messages.create({
        from: process.env.TWILIO_WHATSAPP_NUMBER,
        to: `whatsapp:${formattedMobile}`,
        contentSid: TEMPLATE_SIDS.booking_cancelled,
        contentVariables: JSON.stringify({
          1: String(passenger.name || user.name || ""),
          2: String(passenger.bookingNo || booking.bookingNo || ""),
          3: String(booking.route_name || ""),
          4: String(booking.selectedDate || ""),
          5: String(passenger.boardingPoint?.name || passenger.startingPoint || ""),
          6: String(passenger.dropOffPoint?.name || passenger.dropPoint || ""),
          7: String(passenger.bookingCount || 0),
          8: String(passenger.paymentType || ""),
          9: String(passenger.totalFare || 0),
        }),
      });
      console.log("WhatsApp SID (Cancelled):", result.sid);
    }
    catch (err) {
      console.error("WhatsApp Error (Cancelled):", err);
    }
  }
};

module.exports = {
  sendBookingConfirmation,
  sendBookingCancelled,
  formatWhatsAppNumber,
};

