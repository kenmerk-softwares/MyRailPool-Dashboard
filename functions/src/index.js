/* eslint-disable max-len */

const {setGlobalOptions} = require("firebase-functions");
setGlobalOptions({region: "asia-south1"});
// ================ ADMIN MODULES ==================== //
const {addAdminUser, changePassword, editPermissions, updateEmployeeSettings, cancelTrip, cancelBooking} = require("./modules/admin/admin.callable");
exports.addAdminUser = addAdminUser;
exports.changePassword = changePassword;
exports.editPermissions = editPermissions;
exports.updateEmployeeSettings = updateEmployeeSettings;
exports.cancelTrip = cancelTrip;
exports.cancelBooking = cancelBooking;

// ================ ROUTE MODULES ==================== //
const {addRoute, routeRequest, processRouteRequest} = require("./modules/route/route.callable");
exports.addRoute = addRoute;
exports.routeRequest = routeRequest;
exports.processRouteRequest = processRouteRequest;




// ================ DRIVER MODULES ==================== //
const {addDriver} = require("./modules/driver/driver.callable");
exports.addDriver = addDriver;

// ================ VEHICLE MODULES ==================== //
const {addVehicle} = require("./modules/vehicle/vehicle.callable");
exports.addVehicle = addVehicle;

// ================ TRIP MODULES ==================== //
const {addTrip} = require("./modules/trip/trip.callable");
exports.addTrip = addTrip;

const {autoCompleteExpiredTrips} = require("./modules/trip/trip.scheduled");
exports.autoCompleteExpiredTrips = autoCompleteExpiredTrips;

const {onTripWritten} = require("./modules/trip/trip.trigger");
exports.onTripWritten = onTripWritten;

// ================ USER MODULES ==================== //
const {tripBooking, createUser} = require("./modules/user/user.callable");
exports.tripBooking = tripBooking;
exports.createUser = createUser;

// ================ PAYMENT MODULES ==================== //
const {stripeWebhook} = require("./modules/payment/payment.webhook");
exports.stripeWebhook = stripeWebhook;

const {cleanupExpiredBookings} = require("./modules/payment/payment.scheduled");
exports.cleanupExpiredBookings = cleanupExpiredBookings;

const {onFinanceUpdated} = require("./modules/payment/payment.analytics");
exports.onFinanceUpdated = onFinanceUpdated;

// ================ NOTIFICATION MODULES ==================== //
const {onBookingUpdated} = require("./modules/notifications/trip.notifications");
exports.onBookingUpdated = onBookingUpdated;

// ================ WHATSAPP ================================ //
const {whatsappNotifications} = require("./modules/whatsapp/whatsapp.callable");
exports.whatsappNotifications = whatsappNotifications;

const {tripReminderScheduler} = require("./modules/whatsapp/whatsapp.scheduled");
exports.tripReminderScheduler = tripReminderScheduler;

// ================== PAYMENT DRIVER ==================== //
const {updatePaymentDriver, updateTripDriverApp, updateUserBoardingStatus} = require("./modules/driver/driver.callable");
exports.updatePaymentDriver = updatePaymentDriver;
exports.updateTripDriverApp = updateTripDriverApp;
exports.updateUserBoardingStatus = updateUserBoardingStatus;


