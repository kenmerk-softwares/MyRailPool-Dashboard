const {onCall} = require("firebase-functions/v2/https");
const {logError} = require("../../shared/utils/logger");
const {addRouteValidator} = require("./route.validator");
const {addRouteService} = require("./route.service");


const addRoute = onCall(async (req) => {
  try {
    const validateData = await addRouteValidator(req);
    if (!validateData.success) {
      return validateData;
    }
    return await addRouteService(req);
  } catch (error) {
    logError(error);
    return {error: error.message, success: false};
  }
});
module.exports = {
  addRoute,
};
