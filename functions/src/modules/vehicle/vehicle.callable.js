const {callableWrapper} = require("../../shared/utils/callable.wrapper");
const {addVehicleValidator} = require("./vehicle.validator");
const {addVehicleService} = require("./vehicle.service");

// ======================== ADD/EDIT VEHICLE ======================== //
const addVehicle = callableWrapper(async (req) => {
  const validateData = addVehicleValidator(req);
  if (!validateData.success) {
    return validateData;
  }
  return await addVehicleService(req.data, req);
});

module.exports = {
  addVehicle,
};
