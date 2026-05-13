import Joi from 'joi';

export const VehicleValidationSchema = Joi.object({
  make: Joi.string().trim().required().messages({
    'string.empty': 'Vehicle make is required',
    'any.required': 'Vehicle make is a mandatory field'
  }),

  model: Joi.string().trim().required().messages({
    'string.empty': 'Vehicle model is required',
    'any.required': 'Vehicle model is a mandatory field'
  }),

  colour: Joi.string().trim().required().messages({
    'string.empty': 'Vehicle colour is required',
    'any.required': 'Vehicle colour is a mandatory field'
  }),

  type: Joi.string()
    .valid(
      'Sedan',
      'SUV',
      'Hatchback',
      'Van',
      'Mini Van',
      'Luxury',
      'Electric'
    )
    .default('Sedan'),

  seatingCapacity: Joi.number()
    .integer()
    .min(1)
    .required()
    .messages({
      'number.base': 'Seating capacity must be a number',
      'number.min': 'Seating capacity must be at least 1',
      'any.required': 'Seating capacity is required'
    }),

  registrationNo: Joi.string().trim().required().messages({
    'string.empty': 'Registration number is required',
    'any.required': 'Registration number is a mandatory field'
  }),

  phVehicleLicence: Joi.string().trim().required().messages({
    'string.empty': 'PH License Number is required',
    'any.required': 'PH License is mandatory'
  }),

  licenceExpiry: Joi.date().required().messages({
    'date.base': 'Licence expiry must be a valid date',
    'any.required': 'Licence expiry date is required'
  }),

  providerName: Joi.string().trim().required().messages({
    'string.empty': 'Insurance provider is required',
    'any.required': 'Insurance provider is mandatory'
  }),

  policyNumber: Joi.string().trim().required().messages({
    'string.empty': 'Policy number is required',
    'any.required': 'Policy number is mandatory'
  }),

  insuranceExpiry: Joi.date().required().messages({
    'date.base': 'Insurance expiry must be a valid date',
    'any.required': 'Insurance expiry date is required'
  }),

  assignedDriver: Joi.string().trim().required().messages({
    'string.empty': 'Please assign a driver to this vehicle',
    'any.required': 'Assigned driver is mandatory'
  }),

  driverId: Joi.string().allow(''),

  operationalStatus: Joi.string()
    .valid(
      'Active',
      'Inactive',
      'Maintenance',
      'Suspended'
    )
    .required()
    .messages({
      'any.required': 'Operational status is required'
    })
    .default('Active'),
});