const {logger} = require("firebase-functions");

// ============== INFO LOG =============== //
const logInfo = (message, meta = {}) => {
  logger.info(message, {
    timestamp: new Date().toISOString(),
    ...meta,
  });
};

// ============== WARNING LOG =============== //
const logWarn = (message, meta = {}) => {
  logger.warn(message, {
    timestamp: new Date().toISOString(),
    ...meta,
  });
};

// ============== ERROR LOG ================== //
const logError = (message, error = {}, meta = {}) => {
  logger.error(message, {
    timestamp: new Date().toISOString(),
    error: error?.message || error,
    stack: error?.stack,
    ...meta,
  });
};

// ============== DEBUG LOG =============== //
const logDebug = (message, meta = {}) => {
  logger.debug(message, {
    timestamp: new Date().toISOString(),
    ...meta,
  });
};

module.exports = {
  logInfo,
  logWarn,
  logError,
  logDebug,
};
