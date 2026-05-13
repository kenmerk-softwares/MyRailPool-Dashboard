/* eslint-disable max-len */
const Joi = require("joi");

const addVehicleValidator = (req) => {
  const schema = Joi.object({
    type: Joi.string().valid("add", "edit").required(),
    id: Joi.string().when("type", {
      is: "edit",
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
    fields: Joi.object({
      make: Joi.string().required(),
      model: Joi.string().required(),
      colour: Joi.string().required(),
      type: Joi.string().valid("Sedan", "SUV", "Hatchback", "MPV", "Van").required(),
      seatingCapacity: Joi.string().required(),
      registrationNo: Joi.string().required(),
      phVehicleLicence: Joi.string().required(),
      licenceExpiry: Joi.string().required(),
      providerName: Joi.string().required(),
      policyNumber: Joi.string().required(),
      insuranceExpiry: Joi.string().required(),
      assignedDriver: Joi.string().allow("", null),
      operationalStatus: Joi.string().valid("Active", "Maintenance", "Inactive").required(),
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

module.exports = {addVehicleValidator};
