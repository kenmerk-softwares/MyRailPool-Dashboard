import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "./firebase";

const functions = getFunctions(app, "asia-south1");
const callFunction = async (name, data = {}) => {
  const fn = httpsCallable(functions, name);
  const res = await fn(data);
  return res.data;
};

export const FunctionsAPI = {
  addAdminUser: (data) => callFunction("addAdminUser", data),
  changePassword: (data) => callFunction("changePassword", data),
  addDriver: (data) => callFunction("addDriver", data),
  addVehicle: (data) => callFunction("addVehicle", data),
  editVehicle: (data) => callFunction("editVehicle", data),
  addTrip: (data) => callFunction("addTrip", data),
  cancelTrip: (data) => callFunction("cancelTrip", data),
};