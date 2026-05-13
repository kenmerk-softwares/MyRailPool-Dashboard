/* eslint-disable max-len */
const Joi = require("joi");

const addDriverValidator = (req, data) => {
  const schema = Joi.object({
    type: Joi.string().valid("add", "update").required(),
    fields: Joi.object({
      name: Joi.string().required(),
      status: Joi.string().valid("active", "inactive", "on_leave", "suspended").required(),
      mobile: Joi.string().required(),
      email: Joi.string().email().required(),
      address: Joi.string().required(),
      phLicenseNumber: Joi.string().required(),
      phExpiryDate: Joi.string().required(),
      dvlaLicenseNumber: Joi.string().required(),
      dvlaExpiryDate: Joi.string().required(),
      dbsCertificateNumber: Joi.string().required(),
      dbsDateOfIssue: Joi.string().required(),
      medicalExemption: Joi.string().valid("Yes", "No").required(),
      trainingStatus: Joi.string().valid("Yes", "No").required(),
      trainingSignedDate: Joi.string().allow("", null),
      councilNotified: Joi.string().valid("Yes", "No").required(),
      rtwVerifiedDate: Joi.string().allow("", null),
      rtwNote: Joi.string().allow("", null),
      serviceStartDate: Joi.string().allow("", null),
      contractEndDate: Joi.string().allow("", null),
      terminationReason: Joi.string().allow("", null),
      confidentialNotes: Joi.string().allow("", null),
    }).required(),
  });

  const {error, value} = schema.validate(data, {
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

module.exports = {addDriverValidator};
