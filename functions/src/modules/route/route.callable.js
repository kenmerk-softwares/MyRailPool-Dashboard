const {callableWrapper} = require("../../shared/utils/callable.wrapper");
const {addRouteValidator} = require("./route.validator");
const {addRouteService} = require("./route.service");

// ======================== ADD/EDIT ROUTE ======================== //
const addRoute = callableWrapper(async (req) => {
  const validateData = addRouteValidator(req);
  if (!validateData.success) {
    return validateData;
  }
  return await addRouteService(req.data, req);
});

module.exports = {
  addRoute,
};

