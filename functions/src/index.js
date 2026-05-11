/* eslint-disable max-len */

const {setGlobalOptions} = require("firebase-functions");
setGlobalOptions({region: "asia-south1"});
// ================ ADMIN MODULES ==================== //
const {addAdminUser, changePassword, editPermissions, updateEmployeeSettings} = require("./modules/admin/admin.callable");
exports.addAdminUser = addAdminUser;
exports.addUser = addAdminUser; // Keep for backward compatibility if needed
exports.changePassword = changePassword;
exports.editPermissions = editPermissions;
exports.updateEmployeeSettings = updateEmployeeSettings;

// ================ ROUTE MODULES ==================== //
const {addRoute} = require("./modules/route/route.admin.callable");
exports.addRoute = addRoute;
