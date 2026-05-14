/* eslint-disable max-len */

const {setGlobalOptions} = require("firebase-functions");
setGlobalOptions({region: "asia-south1"});
// ================ ADMIN MODULES ==================== //
const {addAdminUser, changePassword, editPermissions, updateEmployeeSettings} = require("./modules/admin/admin.callable");
exports.addAdminUser = addAdminUser;
exports.changePassword = changePassword;
exports.editPermissions = editPermissions;
exports.updateEmployeeSettings = updateEmployeeSettings;

// ================ ROUTE MODULES ==================== //
const {addRoute} = require("./modules/route/route.callable");
exports.addRoute = addRoute;

// ================ DRIVER MODULES ==================== //
const {addDriver} = require("./modules/driver/driver.callable");
exports.addDriver = addDriver;

// ================ VEHICLE MODULES ==================== //
const {addVehicle} = require("./modules/vehicle/vehicle.callable");
exports.addVehicle = addVehicle;

// ================ TRIP MODULES ==================== //
const {addTrip} = require("./modules/trip/trip.callable");
exports.addTrip = addTrip;
