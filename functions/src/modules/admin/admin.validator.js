/* eslint-disable max-len */
const Joi = require("joi");

const addAdminValidator = (data) => {
  const schema = Joi.object({
    action: Joi.string().valid("add", "update").default("add"),

    id: Joi.string().when("action", {
      is: "update",
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    }),
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).when("action", {
      is: "add",
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
    mobile: Joi.string().required(),
    permissionId: Joi.string().required(),
    designation: Joi.string().required(),
    department: Joi.string().required(),
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

const changePasswordValidator = (req, data) => {
  if (!data || Object.keys(data).length === 0) {
    return {success: false, error: "Missing required fields"};
  }
  const schema = Joi.object({
    id: Joi.string().required(),
    password: Joi.string().required(),
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

// ====================== EDIT PERMISSIONS VALIDATOR ==================== //
const editPermissionsValidator = (req, data) => {
  if (!data || Object.keys(data).length === 0) {
    return {success: false, error: "Missing required fields"};
  }
  const schema = Joi.object({
    id: Joi.string().required(),
    operation: Joi.string()
        .required()
        .valid("edit", "delete", "revoke", "restore"),
    payload: Joi.object().optional(),
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

// ====================== EDIT EMPLOYEE SETTINGS VALIDATOR ==================== //
const updateEmployeeSettingsValidator = (req, data) => {
  if (!data || Object.keys(data).length === 0) {
    return {success: false, error: "Missing required fields"};
  }
  const schema = Joi.object({
    id: Joi.string().required(),
    type: Joi.string().required().valid("department", "designation"),
    operation: Joi.string().required().valid("edit", "delete"),
    formData: Joi.object({
      name: Joi.string().required(),
    }),
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

// ====================== CANCEL TRIP VALIDATOR ==================== //
const cancelTripValidator = (req, data) => {
  if (!data || Object.keys(data).length === 0) {
    return {success: false, error: "Missing required fields"};
  }
  const schema = Joi.object({
    bookingId: Joi.string().required(),
    userId: Joi.string().required(),
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

module.exports = {
  addAdminValidator,
  changePasswordValidator,
  editPermissionsValidator,
  updateEmployeeSettingsValidator,
  cancelTripValidator,
};
