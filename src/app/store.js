// src/app/store.js
import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../modules/user/user.slice";
import authReducer from "../modules/auth/auth.slice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    auth: authReducer,
  },
});