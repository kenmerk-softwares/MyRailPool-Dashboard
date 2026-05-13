/* eslint-disable max-len */
const {onCall} = require("firebase-functions/v2/https");
const {logError} = require("./logger");

// ======================== WRAPPER FOR FIREBASE CALLABLE FUNCTIONS ======================== //
const callableWrapper = (handler) => onCall({
  region: "asia-south1",
}, async (req) => {
  try {
    if (!req.auth) {
      return {
        success: false,
        error: "Unauthorized: You must be logged in to perform this action.",
      };
    }
    const result = await handler(req);
    if (result && typeof result === "object" && result.success === undefined) {
      return {success: true, ...result};
    }
    return result;
  } catch (error) {
    logError(error);
    return {
      success: false,
      error: error.message || "An unexpected server error occurred.",
    };
  }
});

module.exports = {callableWrapper};
