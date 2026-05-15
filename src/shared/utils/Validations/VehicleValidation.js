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
      'MPV',
      'Van',
      'Mini Van',
      'Luxury',
      'Electric'
    )
    .required()
    .messages({
      'any.only': 'Please select a valid vehicle type',
      'any.required': 'Vehicle type is required'
    }),

  seatingCapacity: Joi.string()
    .trim()
    .required()
    .messages({
      'string.empty': 'Seating capacity is required',
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

  licenceExpiry: Joi.string().trim().required().messages({
    'string.empty': 'Licence expiry is required',
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

  insuranceExpiry: Joi.string().trim().required().messages({
    'string.empty': 'Insurance expiry is required',
    'any.required': 'Insurance expiry date is required'
  }),

  assignedDriver: Joi.string().trim().allow('', null),
  
  driverId: Joi.string().trim().allow('', null),

  operationalStatus: Joi.string()
    .valid('Active', 'Inactive', 'Maintenance')
    .required()
    .messages({
      'any.required': 'Operational status is required'
    })
    .default('Active'),

  notes: Joi.string().trim().allow('', null)
});