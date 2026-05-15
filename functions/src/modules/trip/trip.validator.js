/* eslint-disable max-len */
const Joi = require("joi");

const addTripValidator = (req) => {
  const schema = Joi.object({
    fields: Joi.object({
      available_seats: Joi.object().pattern(Joi.string(), Joi.number()).required(),
      createdAt: Joi.any().optional(),
      fareMatrix: Joi.object().required(),
      order: Joi.number().required(),
      routePairs: Joi.array().items(Joi.string()).required(),
      routeTiming: Joi.object().required(),
      route_id: Joi.string().required(),
      route_name: Joi.string().required(),
      route_type: Joi.string().required(),
      routes: Joi.array().items(Joi.string()).required(),
      selectedDates: Joi.array().items(Joi.string()).required(),
      status: Joi.string().required(),
      total_seats: Joi.number().required(),
      driver_name: Joi.string().required(),
      driver_id: Joi.string().required(),
      vehicle_id: Joi.string().required(),
      vehicle_reg: Joi.string().required(),
    }).required(),
  });

  const {error, value} = schema.validate(req.data, {
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

module.exports = {addTripValidator};
