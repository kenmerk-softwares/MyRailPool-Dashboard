const Joi = require("joi");
const addRouteValidator = (req) => {
  const action = req.data.action;
  let schema = null;
  if (action === "add") {
    schema = Joi.object({
      action: Joi.string().required(),
      id: Joi.string().optional().allow(null, ""),
      name: Joi.string().required(),
      status: Joi.string().required(),
      activationDate: Joi.date().required(),
      deactivationDate: Joi.date().required(),
      description: Joi.string().optional().allow(null, ""),
      selectedDates: Joi.array().required(),
      routes: Joi.array().required(),
      routesData: Joi.array().required(),
      fareMatrix: Joi.object().required(),
      start: Joi.string().required(),
      end: Joi.string().required(),
    });
  }
  if (action === "edit") {
    schema = Joi.object({
      action: Joi.string().required(),
      id: Joi.string().required(),
      name: Joi.string().required(),
      status: Joi.string().required(),
      activationDate: Joi.date().required(),
      deactivationDate: Joi.date().required(),
      description: Joi.string().optional().allow(null, ""),
      selectedDates: Joi.array().required(),
      routes: Joi.array().required(),
      routesData: Joi.array().required(),
      fareMatrix: Joi.object().required(),
      start: Joi.string().required(),
      end: Joi.string().required(),
    });
  }

  const {error, value} = schema.validate(req.data);
  if (error) {
    return {error: error.message, success: false};
  }
  return {data: value, success: true};
};

const routeRequestValidator = (req) => {
  const schema = Joi.object({
    name: Joi.string().optional().allow(null, ""),
    phone: Joi.string().optional().allow(null, ""),
    from: Joi.alternatives().try(Joi.string(), Joi.object()).optional().allow(null, ""),
    to: Joi.alternatives().try(Joi.string(), Joi.object()).optional().allow(null, ""),
    schedules: Joi.array().items(
      Joi.object({
        date: Joi.string().required(),
        time: Joi.array().items(Joi.string()).optional(),
      })
    ).optional(),
    passenger_count: Joi.number().integer().min(1).optional().allow(null),
    share_intrest: Joi.boolean().optional().allow(null),
  });

  const {error, value} = schema.validate(req.data, {
    abortEarly: false,
    stripUnknown: true,
  });
  if (error) {
    return {error: error.message, success: false};
  }
  return {data: value, success: true};
};

module.exports = {
  addRouteValidator,
  routeRequestValidator,
};

