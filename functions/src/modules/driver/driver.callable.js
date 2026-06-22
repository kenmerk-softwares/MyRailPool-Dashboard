const {callableWrapper} = require("../../shared/utils/callable.wrapper");
const {addDriverService, updatePaymentDriverService} = require("./driver.service");
const {addDriverValidator, updatePaymentDriverValidator, updateTripDriverAppValidator} = require("./driver.validation");

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
  return await (req.data || {}, req);
});

module.exports = {addDriver, updatePaymentDriver, updateTripDriverApp};

