const Joi = require("joi");

const tripBookingValidation = (req) => {
  const fields = req.data;
  const schema = Joi.object({
    tripId: Joi.string().required(),
    bookingCount: Joi.number().required(),
    userId: Joi.string().required(),
    paymentType: Joi.string().valid("online", "offline").required(),
    startingPoint: Joi.string().required(),
    dropPoint: Joi.string().required(),
    selectedDate: Joi.string().required(),
    passengers: Joi.array().required(),
  });

  const {error, value} = schema.validate(fields, {
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

  const {error, value} = schema.validate(fields, {
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