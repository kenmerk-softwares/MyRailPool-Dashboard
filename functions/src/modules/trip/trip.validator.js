/* eslint-disable max-len */
const Joi = require("joi");

const addTripValidator = (req) => {
  const schema = Joi.object({
    type: Joi.string().valid("add", "edit").required(),
    id: Joi.string().when("type", {
      is: "edit",
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
    fields: Joi.object({
      available_seats: Joi.object().pattern(Joi.string(), Joi.number()).required(),
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
      notes: Joi.string().allow("", null),
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
