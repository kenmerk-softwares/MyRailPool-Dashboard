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
module.exports = {
  addRouteValidator,
};
