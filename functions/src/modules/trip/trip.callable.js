const {callableWrapper} = require("../../shared/utils/callable.wrapper");
const {addTripValidator} = require("./trip.validator");
const {addTripService} = require("./trip.service");

// ======================= ADD TRIP ======================= //
const addTrip = callableWrapper(async (req) => {
  const validateData = addTripValidator(req);
  if (!validateData.success) {
    return validateData;
  }
  return await addTripService(req.data, req);
});

module.exports = {
  addTrip,
};
