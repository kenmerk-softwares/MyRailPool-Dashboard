const {callableWrapper} = require("../../shared/utils/callable.wrapper");
const {addDriverService, updatePaymentDriverService, updateTripDriverAppService, updateUserBoardingStatusDriverService} = require("./driver.service");
const {addDriverValidator, updatePaymentDriverValidator, updateTripDriverAppValidator, updateUserBoardingStatusDriverValidator} = require("./driver.validation");

// ==================== ADD DRIVER ==================== //
const addDriver = callableWrapper(async (req) => {
  const validateData = addDriverValidator(req, req.data);
  if (!validateData.success) {
    return validateData;
  }
  return await addDriverService(req.data || {}, req);
});

// ================= UPDATE TRIP ================= //
const updatePaymentDriver = callableWrapper(async (req) => {
  const validateData = updatePaymentDriverValidator(req, req.data);
  if (!validateData.success) {
    return validateData;
  }
  return await updatePaymentDriverService(req.data || {}, req);
});

// ================== UPDATE TRIP DRIVER APP ==================== //
const updateTripDriverApp = callableWrapper(async (req) => {
  const validateData = updateTripDriverAppValidator(req, req.data);
  if (!validateData.success) {
    return validateData;
  }
  return await updateTripDriverAppService(req.data || {}, req);
});

// ================== UPDATE USER BOARDING STATUS ==================== //
const updateUserBoardingStatus = callableWrapper(async (req) => {
  const validateData = updateUserBoardingStatusDriverValidator(req, req.data);
  if (!validateData.success) {
    return validateData;
  }
  return await updateUserBoardingStatusDriverService(req.data || {}, req);
});

module.exports = {
  addDriver,
  updatePaymentDriver,
  updateTripDriverApp,
  updateUserBoardingStatus,
};

