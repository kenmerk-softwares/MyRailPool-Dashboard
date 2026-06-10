const { onSchedule } = require("firebase-functions/v2/scheduler");
const twilio = require("twilio");
const { db } = require("../../shared/config/firebase");
const { formatWhatsAppNumber } = require("./whatsapp.service");

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

const TEMPLATE_SID = process.env.TWILIO_REMINDER_TEMPLATE_SID || "HX6c22bf0dc3c52b6e44c5815f56a16e2c";

exports.tripReminderScheduler = onSchedule(
  {
    schedule: "every 30 minutes",
    region: "asia-south1",
    timeZone: "Asia/Kolkata",
  },
  async () => {
    const now = new Date();

    const tripsSnap = await db.collection("trips")
      .where("status", "==", "Active")
      .get();

    for (const tripDoc of tripsSnap.docs) {
      const trip = tripDoc.data();

      for (const date of trip.selectedDates || []) {
        const startTime = trip.routeTiming?.[trip.routes?.[0]];

        if (!startTime) continue;

        const tripDateTime = new Date(`${date}T${startTime}:00`);

        const diffHours =
          (tripDateTime.getTime() - now.getTime()) /
          (1000 * 60 * 60);

        if (diffHours > 1.5 && diffHours <= 2) {
          const bookingSnap = await db.collection("bookings")
            .where("tripId", "==", tripDoc.id)
            .get();

          for (const bookingDoc of bookingSnap.docs) {
            const booking = bookingDoc.data();

            for (const passenger of booking.users || []) {
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
                  contentSid: TEMPLATE_SID,
                  contentVariables: JSON.stringify({
                    1: String(user.name || ""),
                    2: String(booking.bookingNo || ""),
                    3: String(booking.route_name || ""),
                    4: String(booking.selectedDate || ""),
                    5: String(booking.bookedCount || "0"),
                  })
                });

                console.log("Twilio SID:", result.sid);
              }
              catch (err) {
                console.error("Twilio Error:", err);
              }
              await getTwilioClient().messages.create({
                from: process.env.TWILIO_WHATSAPP_NUMBER,
                to: `whatsapp:${formattedMobile}`,
                contentSid: TEMPLATE_SID,
                contentVariables: JSON.stringify({
                  1: String(user.name || ""),
                  2: String(booking.bookingNo || ""),
                  3: String(booking.route_name || ""),
                  4: String(booking.selectedDate || ""),
                  5: String(booking.bookedCount || "0"),
                }),
              });
            }
          }
        }
      }
    }
  }
);
