// src/app/store.js
import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../modules/user/user.slice";
import authReducer from "../modules/auth/auth.slice";
import driverReducer from "../modules/drivers/driver.slice";
import vehicleReducer from "../modules/vehicles/vehicle.slice";
import bookingReducer from "../modules/bookings/booking.slice";
import routeReducer from "../modules/routes/route.slice";
import tripReducer from "../modules/trips/trip.slice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    auth: authReducer,
    driver: driverReducer,
    vehicle: vehicleReducer,
    booking: bookingReducer,
    route: routeReducer,
    trip: tripReducer,
  },
});