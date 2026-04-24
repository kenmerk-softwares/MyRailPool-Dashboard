
const {setGlobalOptions} = require("firebase-functions");
setGlobalOptions({region: "asia-south1"});

const {addUser} = require("./Users/add_user");
exports.addUser = addUser;
