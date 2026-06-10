const {callableWrapper} = require("../../shared/utils/callable.wrapper");
const {sendBookingConfirmation, sendBookingCancelled} = require("./whatsapp.service");

const whatsappNotifications = callableWrapper(async (req) => {
  const {type, bookingId} = req.data;

  if (type === "booking_confirmation") {
    await sendBookingConfirmation(bookingId);

    return {
      success: true,
      message: "WhatsApp sent",
    };
  } else if (type === "booking_cancelled") {
    await sendBookingCancelled(bookingId);

    return {
      success: true,
      message: "WhatsApp sent",
    };
  }

  return {
    success: false,
    error: "Invalid type",
  };
});

module.exports = {
  whatsappNotifications,
};