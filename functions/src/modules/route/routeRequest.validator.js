const Joi = require("joi");

const processRouteRequestValidator = (req) => {
  const schema = Joi.object({
    routeRequestId: Joi.string().required(),
    fare: Joi.number().min(0.01).required(),
    driverId: Joi.string().required(),
    driverName: Joi.string().required(),
    vehicleId: Joi.string().required(),
    vehicleReg: Joi.string().required(),
  }).unknown(true);

  const {error, value} = schema.validate(req.data, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
    data: value,
  };
};

module.exports = {
  processRouteRequestValidator,
};
