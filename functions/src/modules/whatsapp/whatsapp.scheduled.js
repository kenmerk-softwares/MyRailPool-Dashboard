const { onSchedule } = require("firebase-functions/v2/scheduler");
const twilio = require("twilio");
const { db } = require("../../shared/config/firebase");
const { formatWhatsAppNumber } = require("./whatsapp.service");

let client;

const getTwilioClient = () => {
  if (!client) {
    client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }
  return client;
};

const TEMPLATE_SID = process.env.TWILIO_REMINDER_TEMPLATE_SID;

const tripReminderScheduler = onSchedule(
  {
    schedule: "every 15 minutes",
    region: "asia-south1",
    timeZone: "Asia/Kolkata",
  },
  async () => {
    try {
      const now = new Date();
      
      // Timezone helper to parse trip times in Europe/London
      const getTripUTCDateTime = (dateStr, timeStr) => {
        const [year, month, day] = dateStr.split("-").map(Number);
        const [hour, minute] = timeStr.split(":").map(Number);
        const utcDate = new Date(Date.UTC(year, month - 1, day, hour, minute));
        const tzString = utcDate.toLocaleString("en-US", { timeZone: "Europe/London", timeZoneName: "longOffset" });
        const match = tzString.match(/GMT([+-]\d+)?(:?\d+)?/);
        let offsetMinutes = 0;
        if (match && match[1]) {
          const hours = parseInt(match[1], 10);
          const minutes = match[2] ? parseInt(match[2].replace(":", ""), 10) : 0;
          offsetMinutes = hours * 60 + (hours < 0 ? -minutes : minutes);
        }
        return new Date(utcDate.getTime() - offsetMinutes * 60 * 1000);
      };

      const tripsSnap = await db.collection("trips").where("status", "==", "Active").get();
      for (const tripDoc of tripsSnap.docs) {
        const trip = tripDoc.data();
        for (const travelDate of trip.selectedDates || []) {
          const startLocation = trip.routes?.[0];
          if (!startLocation) continue;
          const startTime = trip.routeTiming?.[startLocation];
          if (!startTime) continue;
          const tripDateTime = getTripUTCDateTime(travelDate, startTime);
          const diffMinutes = Math.floor((tripDateTime.getTime() - now.getTime()) / (1000 * 60));

          let reminderType = null;
          if (diffMinutes <= 60 && diffMinutes > 30) {
            reminderType = "oneHourSent";
          }
          if (diffMinutes <= 30 && diffMinutes > 0) {
            reminderType = "thirtyMinSent";
          }
          if (!reminderType) continue;
          const bookingSnap = await db.collection("bookings").where("tripId", "==", tripDoc.id).where("selectedDate", "==", travelDate).get();

          for (const bookingDoc of bookingSnap.docs) {
            const booking = bookingDoc.data();
            const reminders = booking.reminders || {};
            if (reminders[reminderType]) {
              continue;
            }
            for (const passenger of booking.users || []) {
              if (passenger.status !== "Confirmed") {
                continue;
              }
              const userDoc = await db.collection("users").doc(passenger.userId).get();
              if (!userDoc.exists) continue;
              const user = userDoc.data();
              const mobile = user.mobile || user.phone || "";
              if (!mobile) continue;
              const formattedMobile = formatWhatsAppNumber(mobile);

              if (!formattedMobile) continue;

              try {
                const result = await getTwilioClient().messages.create({
                      from: process.env.TWILIO_WHATSAPP_NUMBER,
                      to: `whatsapp:${formattedMobile}`,
                      contentSid: TEMPLATE_SID,
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

                console.log("Reminder Sent:", result.sid);
              } catch (error) {
                console.error("Twilio Reminder Error:", error);
              }
            }
            await bookingDoc.ref.set(
              {
                reminders: {
                  ...reminders,
                  [reminderType]: true,
                },
              },
              { merge: true }
            );
          }
        }
      }
    } catch (error) {
      console.error(
        "Trip Reminder Scheduler Error:",
        error
      );
    }
  }
);

module.exports = {
  tripReminderScheduler,
};