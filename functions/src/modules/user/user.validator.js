const Joi = require("joi");

const tripBookingValidation = (req) => {
  const fields = req.data;
  const schema = Joi.object({
    platform: Joi.string().optional().allow(""),
    tripId: Joi.string().required(),
    bookingCount: Joi.number().required(),
    userId: Joi.string().required(),
    paymentType: Joi.string().valid("online", "offline", "cash").required(),
    startingPoint: Joi.string().required(),
    dropPoint: Joi.string().required(),
    selectedDate: Joi.array().items(Joi.string()).required(),
    passengers: Joi.array().required(),
    boardingPoint: Joi.object().required(),
    dropOffPoint: Joi.object().required(),
    multiBookings: Joi.boolean().required(),
    returnTripId: Joi.string().optional().allow(""),
    returnSelectedDate: Joi.array().items(Joi.string()).optional(),
    returnMultiBookings: Joi.boolean().optional(),
    returnBoardingPoint: Joi.object().optional(),
    returnDropOffPoint: Joi.object().optional(),
  });

  const { error, value } = schema.validate(fields, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return {
      success: false,
      error: error.details.map((err) => err.message),
    };
  }

  return {
    success: true,
    data: value,
  };
};

const createUserValidation = (req) => {
  const fields = req.data;
  const uid = req.auth?.uid;

  if (!uid) {
    return { success: false, error: "User is not authenticated" };
  }

  const schema = Joi.object({
    name: Joi.string().allow("").optional(),
    email: Joi.string().email().allow("").optional(),
    mobile: Joi.string().required(),
    fcmToken: Joi.alternatives().try(Joi.string().allow(""), Joi.object()).optional(),
    platform: Joi.string().valid("android", "ios", "web").optional(),
    address: Joi.string().allow("").optional(),
    profileImage: Joi.string().allow("").optional(),
  });

  const { error, value } = schema.validate(fields, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return {
      success: false,
      error: error.details.map((err) => err.message),
    };
  }

  return {
    success: true,
    data: { ...value, uid },
  };
};

module.exports = {
  tripBookingValidation,
  createUserValidation,
};