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
  booking_confirmation: process.env.TWILIO_BOOKING_TEMPLATE_SID,
  trip_reminder: process.env.TWILIO_REMINDER_TEMPLATE_SID,
  booking_cancelled: process.env.TWILIO_CANCELLED_TEMPLATE_SID,
  admin_booking: process.env.TWILIO_ADMIN_BOOKING_TEMPLATE_SID,
  admin_route_req_noti: process.env.TWILIO_ADMIN_ROUTEREQ_TEMPLATE_SID,
  route_request_approved: process.env.TWILIO_ROUTEREQ_APPROVED
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

  const sentMobiles = new Set();

  for (const passenger of booking.users || []) {
    if (targetUserId && passenger.userId !== targetUserId) continue;
    if (targetFinanceId && passenger.financeId !== targetFinanceId) continue;

    const userDoc = await db.collection("users")
      .doc(passenger.userId)
      .get();

    if (!userDoc.exists) {
      console.error(`User not found in DB for passenger ID`);
      continue;
    }

    const user = userDoc.data();
    if (!user.mobile) {
      console.error(`User mobile is empty for`);
      continue;
    }

    const formattedMobile = formatWhatsAppNumber(user.mobile);
    if (!formattedMobile) {
      console.error(`Could not format mobile number`);
      continue;
    }

    if (sentMobiles.has(formattedMobile)) {
      console.log(`Message already sent to this number in this run`);
      continue;
    }
    sentMobiles.add(formattedMobile);

    try {
      const result = await getTwilioClient().messages.create({
        from: process.env.TWILIO_WHATSAPP_NUMBER,
        to: `whatsapp:${formattedMobile}`,
        contentSid: TEMPLATE_SIDS.booking_confirmation,
        contentVariables: JSON.stringify({
          1: String(passenger.name || user.name || "N/A"),
          2: String(passenger.bookingNo || booking.bookingNo || "N/A"),
          3: String(booking.route_name || "N/A"),
          4: String(booking.selectedDate || "N/A"),
          5: String(passenger.boardingPoint?.placeName || passenger.startingPoint || "N/A"),
          6: String(passenger.dropOffPoint?.placeName || passenger.dropPoint || "N/A"),
          7: String(passenger.bookingCount || "0"),
          8: String(passenger.paymentType || "N/A"),
          9: String(passenger.totalFare || "0"),
        }),
      });
      console.log("WhatsApp sendBookingConfirmation SID:", result.sid);

      await sendAdminBookingNotification(
        booking,
        passenger,
        user
      );
    }
    catch (err) {
      console.error("WhatsApp Error sendBookingConfirmation:", err);
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

    if (!userDoc.exists) {
      console.error(`User not found in DB for passenger ID`);
      continue;
    }

    const user = userDoc.data();
    console.log(`Fetched user`);
    if (!user.mobile) {
      console.error(`User mobile is empty`);
      continue;
    }

    const formattedMobile = formatWhatsAppNumber(user.mobile);
    if (!formattedMobile) {
      console.error(`Could not format mobile number`);
      continue;
    }

    console.log(`Preparing to send cancellation WhatsApp message `);

    try {
      const result = await getTwilioClient().messages.create({
        from: process.env.TWILIO_WHATSAPP_NUMBER,
        to: `whatsapp:${formattedMobile}`,
        contentSid: TEMPLATE_SIDS.booking_cancelled,
        contentVariables: JSON.stringify({
          1: String(passenger.name || user.name || "N/A"),
          2: String(passenger.bookingNo || booking.bookingNo || "N/A"),
          3: String(booking.route_name || "N/A"),
          4: String(booking.selectedDate || "N/A"),
          5: String(passenger.boardingPoint?.name || passenger.startingPoint || "N/A"),
          6: String(passenger.dropOffPoint?.name || passenger.dropPoint || "N/A"),
          7: String(passenger.bookingCount || "0"),
          8: String(passenger.paymentType || "N/A"),
          9: String(passenger.totalFare || "0"),
        }),
      });
      console.log("WhatsApp sendBookingCancelled", result.sid);
    }
    catch (err) {
      console.error("WhatsApp Error (bookCancelled):");
    }
  }
};

const sendAdminBookingNotification = async (
  booking,
  passenger,
  user
) => {
  const adminNumber = process.env.ADMIN_WHATSAPP_NUMBER;

  if (!adminNumber) {
    // console.log("Admin WhatsApp number missing");
    return;
  }

  const formattedAdmin =
    adminNumber.startsWith("+")
      ? adminNumber
      : `+${adminNumber}`;

  const toWhatsAppNumber = `whatsapp:${formattedAdmin}`;
  if (toWhatsAppNumber === process.env.TWILIO_WHATSAPP_NUMBER) {
    console.warn("Skipping Admin WhatsApp notification: ADMIN_WHATSAPP_NUMBER is the same as TWILIO_WHATSAPP_NUMBER.");
    return;
  }

  try {
    const result = await getTwilioClient().messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: toWhatsAppNumber,
      contentSid: TEMPLATE_SIDS.admin_booking,
      contentVariables: JSON.stringify({
        1: String(user.name || "N/A"),
        2: String(user.mobile || "N/A"),
        3: String(booking.bookingNo || "N/A"),
        4: String(booking.route_name || "N/A"),
        5: String(booking.selectedDate || "N/A"),
        6: String(passenger.boardingPoint?.name || "N/A"),
        7: String(passenger.dropOffPoint?.name || "N/A"),
        8: String(passenger.bookingCount || "0"),
        9: String(passenger.paymentType || "N/A"),
        10: String(passenger.totalFare || "0"),
        11: String(booking.driver_name || "N/A"),
      }),
    });

    console.log("Admin WhatsApp sent SID", result.sid);
  } catch (err) {
    console.error("Admin WhatsApp Error", err);
  }
};

const sendAdminRouteRequestNotification = async (routeRequest) => {
  const adminNumber = process.env.ADMIN_WHATSAPP_NUMBER;

  if (!adminNumber) {
    // console.log("Admin WhatsApp number missing");
    return;
  }

  const formattedAdmin =
    adminNumber.startsWith("+")
      ? adminNumber
      : `+${adminNumber}`;

  const from = typeof routeRequest.from === "object" ? (routeRequest.from.name || "") : (routeRequest.from || "");
  const to = typeof routeRequest.to === "object" ? (routeRequest.to.name || "") : (routeRequest.to || "");
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
    from: process.env.TWILIO_WHATSAPP_NUMBER,
    to: `whatsapp:${formattedAdmin}`,
  };

  const templateSid = TEMPLATE_SIDS.admin_route_req_noti;
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
    console.log("Admin Route Request WhatsApp sent", result.sid);
  } catch (err) {
    console.error("WhatsApp Error (Admin Route Request):", err);
  }
};

const sendUserRouteRequestAcceptedNotification = async (routeRequest, bookingNo) => {
  const userMobile = routeRequest.phone;
  if (!userMobile) {
    // console.log("User phone number missing in route request");
    return;
  }

  const formattedMobile = formatWhatsAppNumber(userMobile);
  if (!formattedMobile) {
    // console.log("Could not format user phone number:", userMobile);
    return;
  }

  const fromVal = typeof routeRequest.from === "object" ? (routeRequest.from.name || "") : (routeRequest.from || "");
  const toVal = typeof routeRequest.to === "object" ? (routeRequest.to.name || "") : (routeRequest.to || "");
  const nameVal = routeRequest.name || "Customer";

  const messageOptions = {
    from: process.env.TWILIO_WHATSAPP_NUMBER,
    to: `whatsapp:${formattedMobile}`,
  };

  const templateSid = TEMPLATE_SIDS.route_request_approved;
  if (templateSid) {
    messageOptions.contentSid = templateSid;
    messageOptions.contentVariables = JSON.stringify({
      1: String(nameVal),
      2: String(fromVal),
      3: String(toVal),
      4: String(bookingNo),
      5: String(routeRequest.passenger_count || 1),
      6: String(routeRequest.share_intrest ? "Yes" : "No"),
      7: String(
        routeRequest.schedules && routeRequest.schedules.length > 0
          ? routeRequest.schedules
            .map((s) => `${s.date} ${s.time ? s.time.join(", ") : ""}`)
            .join("; ")
          : (routeRequest.routeDates || []).join("; ")
      ),
    });
  } else {
    messageOptions.body = `Hi ${nameVal},\n\nYour route request from ${fromVal} to ${toVal} has been accepted and your slot is booked!\n\nBooking Reference: ${bookingNo}`;
  }

  try {
    const result = await getTwilioClient().messages.create(messageOptions);
    console.log("User Route Request Accepted WhatsApp sent", result.sid);
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



