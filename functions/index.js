
const {setGlobalOptions} = require("firebase-functions");
setGlobalOptions({region: "asia-south1"});

const {addUser} = require("./admin/operations/add_user");
exports.addUser = addUser;

const {changePassword} = require("./admin/operations/add_user");
exports.changePassword = changePassword;

const {editSettings} = require("./admin/settings/editSettings");
exports.editSettings = editSettings;

const {editPermissions} = require("./admin/settings/editPermissions");
exports.editPermissions = editPermissions;
