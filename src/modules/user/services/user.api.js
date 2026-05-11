import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "../../../Config/Config";

const functions = getFunctions(app, "asia-south1");
const callFunction = async (name, data = {}) => {
  const fn = httpsCallable(functions, name);
  const res = await fn(data);
  return res.data;
};

export const userAPI = {
    addAdminUser: (data) => callFunction("addAdminUser", data),
    changePassword: (data) => callFunction("changePassword", data),
};
