const {callableWrapper} = require("../../shared/utils/callable.wrapper");
const {addRouteValidator, routeRequestValidator} = require("./route.validator");
const {addRouteService, routeRequestService} = require("./route.service");
const {processRouteRequestValidator} = require("./routeRequest.validator");
const {processRouteRequestService} = require("./routeRequest.service");

// ======================== ADD/EDIT ROUTE ======================== //
const addRoute = callableWrapper(async (req) => {
  const validateData = addRouteValidator(req);
  if (!validateData.success) {
    return validateData;
  }
  return await addRouteService(req.data, req);
});

// ======================== ROUTE REQUEST ======================== //
const routeRequest = callableWrapper(async (req) => {
  const validateData = routeRequestValidator(req);
  if (!validateData.success) {
    return validateData;
  }
  return await routeRequestService(validateData.data, req);
});

// ======================== PROCESS ROUTE REQUEST (CASCADE) ======================== //
const processRouteRequest = callableWrapper(async (req) => {
  const validateData = processRouteRequestValidator(req);
  if (!validateData.success) {
    return validateData;
  }
  return await processRouteRequestService(validateData.data, req);
});

module.exports = {
  addRoute,
  routeRequest,
  processRouteRequest,
};



