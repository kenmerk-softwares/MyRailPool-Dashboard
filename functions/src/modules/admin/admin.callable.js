/* eslint-disable max-len */
const {onCall} = require("firebase-functions/v2/https");
const {addAdminUserService, changePasswordService, editPermissionsService, updateEmployeeSettingsService} = require("./admin.service");
const {addAdminValidator, changePasswordValidator, editPermissionsValidator, updateEmployeeSettingsValidator} = require("./admin.validator");
const {logError} = require("../../shared/utils/logger");

// ==================== ADD ADMIN USER ==================== //
const addAdminUser = onCall(async (req) => {
  try {
    const validateData = await addAdminValidator(req, req.data);
    if (!validateData.success) {
      return validateData;
    }
    const data = req.data || {};
    return await addAdminUserService(data, req);
  } catch (error) {
    return {error: error.message, success: false};
  }
});

module.exports = {addAdminUser};

// =================== CHANGE PASSWORD ==================== //
const changePassword = onCall(async (req) => {
  try {
    const validateData = await changePasswordValidator(req, req.data);
    if (!validateData.success) {
      return validateData;
    }
    return await changePasswordService(req);
  } catch (error) {
    logError(error);
    return {error: error.message, success: false};
  }
});

// ====================== EDIT PERMISSIONS ==================== //
const editPermissions = onCall(async (req) => {
  try {
    const validateData = await editPermissionsValidator(req, req.data);
    if (!validateData.success) {
      return validateData;
    }
    return await editPermissionsService(req);
  } catch (error) {
    logError(error);
    return {error: error.message, success: false};
  }
});

// ===================== UPDATE DESIGNATION/DEPARTMENT ==================== //
const updateEmployeeSettings = onCall(async (req) => {
  try {
    const validateData = await updateEmployeeSettingsValidator(req, req.data);
    if (!validateData.success) {
      return validateData;
    }
    return await updateEmployeeSettingsService(req);
  } catch (error) {
    logError(error);
    return {error: error.message, success: false};
  }
});


module.exports = {addAdminUser, changePassword, editPermissions, updateEmployeeSettings};

