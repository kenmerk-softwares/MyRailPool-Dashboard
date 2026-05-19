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

module.exports = {
  tripBookingValidation,
};