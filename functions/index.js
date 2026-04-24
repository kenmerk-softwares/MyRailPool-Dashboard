
const {setGlobalOptions} = require("firebase-functions");
setGlobalOptions({region: "asia-south1"});

const {addUser} = require("./Users/add_user");
exports.addUser = addUser;

const {manageDesignation} = require("./Settings/manage_designation");
exports.manageDesignation = manageDesignation;

const {manageDepartment} = require("./Settings/manage_dapartment");
exports.manageDepartment = manageDepartment;
