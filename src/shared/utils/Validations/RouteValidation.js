import joi from "joi";

export const routeValidation = joi.object({
  action: joi.string().required().valid("add", "edit"),
  id: joi.string().optional().allow(null, ""),
  name: joi.string().min(3).required().messages({
    "string.empty": "Route name is required",
    "string.min": "Route name must be at least 3 characters long",
  }),
  status: joi.string().required().valid("Active", "Inactive").messages({
    "string.empty": "Status is required",
    "any.only": "Status must be either Active or Inactive",
  }),
  activationDate: joi.string().required().messages({
    "string.empty": "Activation date is required",
  }),
  deactivationDate: joi.string().required().messages({
    "string.empty": "Deactivation date is required",
  }),
  description: joi.string().optional().allow("", null).max(1000).messages({
    "string.max": "Description must be at most 1000 characters long",
  }),
  selectedDates: joi.array().items(joi.string()).min(1).required().messages({
    "array.min": "At least one operating date must be selected",
  }),
  routes: joi.array().items(joi.string()).min(2).required().messages({
    "array.min":
      "At least two geographical nodes (Origin and Destination) are required",
  }),
  routesData: joi
    .array().items(
      joi.object({
        name: joi.string().required(),

        distanceFromStart: joi.number().required().messages({
          "number.base": "Distance must be a valid number",
          "any.required": "Distance is required",
        }),

        formatted_address: joi.string().optional(),

        lat: joi.number().optional(),

        lng: joi.number().optional(),

        place_id: joi.string().optional(),
      })
    )
    .required(),
  fareMatrix: joi.object().min(1).required().messages({
    "object.base": "Fare configuration matrix is required",
    "object.min": "At least one fare configuration is required",
  }),
  start: joi.string().required(),
  end: joi.string().required(),
});