const {callableWrapper} = require("../../shared/utils/callable.wrapper");
const {addDriverService} = require("./driver.service");
const {addDriverValidator} = require("./driver.validation");

// ==================== ADD DRIVER ==================== //
const addDriver = callableWrapper(async (req) => {
  const validateData = addDriverValidator(req, req.data);
  if (!validateData.success) {
    return validateData;
  }
  return await addDriverService(req.data || {}, req);
});

module.exports = {addDriver};
