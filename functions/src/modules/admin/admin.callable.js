/* eslint-disable max-len */
const {callableWrapper} = require("../../shared/utils/callable.wrapper");
const {addAdminUserService, changePasswordService, editPermissionsService, updateEmployeeSettingsService, cancelTripService} = require("./admin.service");
const {addAdminValidator, changePasswordValidator, editPermissionsValidator, updateEmployeeSettingsValidator, cancelTripValidator} = require("./admin.validator");

// ==================== ADD ADMIN USER ==================== //
const addAdminUser = callableWrapper(async (req) => {
  const validateData = addAdminValidator(req, req.data);
  if (!validateData.success) {
    return validateData;
  }
  return await addAdminUserService(req.data || {}, req);
});

// =================== CHANGE PASSWORD ==================== //
const changePassword = callableWrapper(async (req) => {
  const validateData = changePasswordValidator(req, req.data);
  if (!validateData.success) {
    return validateData;
  }
  return await changePasswordService(req);
});

// ====================== EDIT PERMISSIONS ==================== //
const editPermissions = callableWrapper(async (req) => {
  const validateData = editPermissionsValidator(req, req.data);
  if (!validateData.success) {
    return validateData;
  }
  return await editPermissionsService(req);
});

// ===================== UPDATE DESIGNATION/DEPARTMENT ==================== //
const updateEmployeeSettings = callableWrapper(async (req) => {
  const validateData = updateEmployeeSettingsValidator(req, req.data);
  if (!validateData.success) {
    return validateData;
  }
  return await updateEmployeeSettingsService(req);
});

// ===================== CANCEL TRIP ==================== //
const cancelTrip = callableWrapper(async (req) => {
  const validateData = cancelTripValidator(req, req.data);
  if (!validateData.success) {
    console.log("Validation Failed: ", validateData);
    return validateData;
  }
  return await cancelTripService(req);
});

module.exports = {addAdminUser, changePassword, editPermissions, updateEmployeeSettings, cancelTrip};
