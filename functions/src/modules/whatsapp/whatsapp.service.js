const twilio = require("twilio");
const { db } = require("../../shared/config/firebase");

let client;
const getTwilioClient = () => {
  if (!client) {
    client = twilio(
      process.env.TEST_TWILIO_ACCOUNT_SID,
      process.env.TEST_TWILIO_AUTH_TOKEN
    );
  }
  return client;
};

const TEMPLATE_SIDS = {
  booking_confirmation: process.env.TEST_TWILIO_BOOKING_TEMPLATE_SID,
  trip_reminder: process.env.TEST_TWILIO_REMINDER_TEMPLATE_SID,
  booking_cancelled: process.env.TEST_TWILIO_CANCELLED_TEMPLATE_SID,
  admin_booking: process.env.TEST_TWILIO_ADMIN_BOOKING_TEMPLATE_SID,
  route_request_accepted: process.env.TEST_TWILIO_ROUTE_REQUEST_ACCEPTED_TEMPLATE_SID,
  user_route_request_accepted: process.env.TEST_TWILIO_USER_ROUTE_REQUEST_ACCEPTED_TEMPLATE_SID,
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
        from: process.env.TEST_TWILIO_WHATSAPP_NUMBER,
        to: `whatsapp:${formattedMobile}`,
        contentSid: TEMPLATE_SIDS.booking_confirmation,
        contentVariables: JSON.stringify({
          1: String(passenger.name || user.name || ""),
          2: String(passenger.bookingNo || booking.bookingNo || ""),
          3: String(booking.route_name || ""),
          4: String(booking.selectedDate || ""),
          5: String(passenger.boardingPoint?.placeName || passenger.startingPoint || ""),
          6: String(passenger.dropOffPoint?.placeName || passenger.dropPoint || ""),
          7: String(passenger.bookingCount || 0),
          8: String(passenger.paymentType || ""),
          9: String(passenger.totalFare || 0),
        }),
      });
      console.log("WhatsApp SID:", result.sid);

      await sendAdminBookingNotification(
        booking,
        passenger,
        user
      );
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
        from: process.env.TEST_TWILIO_WHATSAPP_NUMBER,
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

const sendAdminBookingNotification = async (
  booking,
  passenger,
  user
) => {
  const adminNumber = process.env.TEST_ADMIN_WHATSAPP_NUMBER;

  if (!adminNumber) {
    console.log("Admin WhatsApp number missing");
    return;
  }

  const formattedAdmin =
    adminNumber.startsWith("+")
      ? adminNumber
      : `+${adminNumber}`;

  const result = await getTwilioClient().messages.create({
    from: process.env.TEST_TWILIO_WHATSAPP_NUMBER,
    to: `whatsapp:${formattedAdmin}`,
    contentSid: TEMPLATE_SIDS.admin_booking,
    contentVariables: JSON.stringify({
      1: String(user.name || ""),
      2: String(user.mobile || ""),
      3: String(booking.bookingNo || ""),
      4: String(booking.route_name || ""),
      5: String(booking.selectedDate || ""),
      6: String(passenger.boardingPoint?.name || ""),
      7: String(passenger.dropOffPoint?.name || ""),
      8: String(passenger.bookingCount || 0),
      9: String(passenger.paymentType || ""),
      10: String(passenger.totalFare || 0),
      11: String(booking.driver_name || ""),
    }),
  });

  console.log("Admin WhatsApp sent:", result.sid);
};

const sendAdminRouteRequestNotification = async (routeRequest) => {
  const adminNumber = process.env.TEST_ADMIN_WHATSAPP_NUMBER;

  if (!adminNumber) {
    console.log("Admin WhatsApp number missing");
    return;
  }

  const formattedAdmin =
    adminNumber.startsWith("+")
      ? adminNumber
      : `+${adminNumber}`;

  const from = routeRequest.from || "";
  const to = routeRequest.to || "";
  const name = routeRequest.name || "Unknown";
  const phone = routeRequest.phone || "";
  const passengerCount = routeRequest.passenger_count || 1;
  const shareIntrest = routeRequest.share_intrest ? "Yes" : "No";

  let schedulesStr = "";
  if (routeRequest.schedules && routeRequest.schedules.length > 0) {
    schedulesStr = routeRequest.schedules
      .map((s) => `${s.date} ${s.time ? s.time.join(", ") : ""}`)
      .join("; ");
  } else if (routeRequest.routeDates && routeRequest.routeDates.length > 0) {
    schedulesStr = routeRequest.routeDates.join("; ");
  }

  const messageOptions = {
    from: process.env.TEST_TWILIO_WHATSAPP_NUMBER,
    to: `whatsapp:${formattedAdmin}`,
  };

  const templateSid = TEMPLATE_SIDS.route_request_accepted;
  if (templateSid) {
    messageOptions.contentSid = templateSid;
    messageOptions.contentVariables = JSON.stringify({
      1: String(name),
      2: String(phone),
      3: String(from),
      4: String(to),
      5: String(passengerCount),
      6: String(shareIntrest),
      7: String(schedulesStr),
    });
  } else {
    messageOptions.body = `New Route Request Received:\n\n` +
      `- User: ${name}\n` +
      `- Phone: ${phone}\n` +
      `- From: ${from}\n` +
      `- To: ${to}\n` +
      `- Passenger(s): ${passengerCount}\n` +
      `- Interested in sharing: ${shareIntrest}\n` +
      `- Schedules: ${schedulesStr || "N/A"}`;
  }

  try {
    const result = await getTwilioClient().messages.create(messageOptions);
    console.log("Admin Route Request WhatsApp sent:", result.sid);
  } catch (err) {
    console.error("WhatsApp Error (Admin Route Request):", err);
  }
};

const sendUserRouteRequestAcceptedNotification = async (routeRequest, bookingNo) => {
  const userMobile = routeRequest.phone;
  if (!userMobile) {
    console.log("User phone number missing in route request");
    return;
  }

  const formattedMobile = formatWhatsAppNumber(userMobile);
  if (!formattedMobile) {
    console.log("Could not format user phone number:", userMobile);
    return;
  }

  const fromVal = typeof routeRequest.from === "object" ? (routeRequest.from.name || "") : (routeRequest.from || "");
  const toVal = typeof routeRequest.to === "object" ? (routeRequest.to.name || "") : (routeRequest.to || "");
  const nameVal = routeRequest.name || "Customer";

  const messageOptions = {
    from: process.env.TEST_TWILIO_WHATSAPP_NUMBER,
    to: `whatsapp:${formattedMobile}`,
    body: `Hi ${nameVal},\n\nYour route request from ${fromVal} to ${toVal} has been accepted and your slot is booked!\n\nBooking Reference: ${bookingNo}`,
  };

  try {
    const result = await getTwilioClient().messages.create(messageOptions);
    console.log("User Route Request Accepted WhatsApp sent:", result.sid);
  } catch (err) {
    console.error("WhatsApp Error (User Route Request Accepted):", err);
  }
};

module.exports = {
  sendBookingConfirmation,
  sendBookingCancelled,
  formatWhatsAppNumber,
  sendAdminBookingNotification,
  sendAdminRouteRequestNotification,
  sendUserRouteRequestAcceptedNotification,
};



