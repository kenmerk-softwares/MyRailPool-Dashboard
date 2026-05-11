
const {setGlobalOptions} = require("firebase-functions");
setGlobalOptions({region: "asia-south1"});

const {addUser} = require("./admin/operations/add_user");
exports.addUser = addUser;


const {changePassword} = require("./admin/operations/add_user");
exports.changePassword = changePassword;
