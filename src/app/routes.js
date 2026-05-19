import React from 'react';
import { BookingList } from '../modules/bookings/Pages/BookingList';
import { AddBooking } from '../modules/bookings/Pages/AddBooking';
import { EditBooking } from '../modules/bookings/Pages/EditBooking';
import { ViewBooking } from '../modules/bookings/Pages/ViewBooking';
import { TripList } from '../modules/trips/pages/TripList';
import { AddTrip } from '../modules/trips/pages/AddTrip';
import { EditTrip } from '../modules/trips/pages/EditTrip';
import { ViewTrip } from '../modules/trips/pages/ViewTrip';
import { RouteList } from '../modules/routes/pages/RouteList';
import { AddRoute } from '../modules/routes/pages/AddRoute';
import ViewRoute from '../modules/routes/pages/ViewRoute';
import { DriverList } from '../modules/drivers/pages/DriverList';
import { AddDriver } from '../modules/drivers/pages/AddDriver';
import { EditDriver } from '../modules/drivers/pages/EditDriver';
import { VehicleList } from '../modules/vehicles/pages/VehicleList';
import { AddVehicle } from '../modules/vehicles/pages/AddVehicle';
import { EditVehicle } from '../modules/vehicles/pages/EditVehicle';
import { ViewVehicle } from '../modules/vehicles/pages/ViewVehicle';
import { NotificationList } from '../modules/notifications/NotificationList';
import { SendNotification } from '../modules/notifications/SendNotification';
import { NotificationModalList } from '../modules/notifications/NotificationModalList';
import { Dashboard } from '../modules/dashboard/Dashboard';
import { AdminUserList } from '../modules/user/pages/AdminUserList';
import { AdminSettings } from '../pages/Settings/AdminSettings';
import ViewDriver from '../modules/drivers/pages/ViewDriver';
import AdminLogs from '../modules/admin/pages/AdminLogs';
import RouteReq from '../pages/RouteReq/RouteReq';
import Settings from '../pages/Settings/Settings';
import Company from '../pages/Settings/Company';
import Payment from '../modules/payment/Payment';

// ======================== ROUTES CONFIG ======================== //
export const routesConfig = [
  { path: '/', element: <Dashboard />, permission: null },
  { path: '/bookings', element: <BookingList />, permission: '/bookings' },
  { path: '/bookings/add', element: <AddBooking />, permission: '/bookings' },
  { path: '/bookings/edit/:id', element: <EditBooking />, permission: '/bookings' },
  { path: '/bookings/view/:id', element: <ViewBooking />, permission: '/bookings' },
  { path: '/trips', element: <TripList />, permission: '/trips' },
  { path: '/trips/add', element: <AddTrip />, permission: '/trips' },
  { path: '/trips/edit/:id', element: <EditTrip />, permission: '/trips' },
  { path: '/trips/view/:id', element: <ViewTrip />, permission: '/trips' },
  { path: '/routes', element: <RouteList />, permission: '/routes' },
  { path: '/routes/add', element: <AddRoute />, permission: '/routes' },
  { path: '/routes/view/:id', element: <ViewRoute />, permission: '/routes' },
  { path: '/drivers', element: <DriverList />, permission: '/drivers' },
  { path: '/drivers/add', element: <AddDriver />, permission: '/drivers' },
  { path: '/drivers/edit/:id', element: <EditDriver />, permission: '/drivers' },
  { path: '/drivers/view/:id', element: <ViewDriver />, permission: '/drivers' },
  { path: '/vehicles', element: <VehicleList />, permission: '/vehicles' },
  { path: '/vehicles/add', element: <AddVehicle />, permission: '/vehicles' },
  { path: '/vehicles/edit/:id', element: <EditVehicle />, permission: '/vehicles' },
  { path: '/vehicles/view/:id', element: <ViewVehicle />, permission: '/vehicles' },
  { path: '/route-req', element: <RouteReq />, permission: '/route-req' },
  { path: '/notifications', element: <NotificationList />, permission: '/notifications' },
  { path: '/notifications/send', element: <SendNotification />, permission: '/notifications' },
  { path: '/notification-modals', element: <NotificationModalList />, permission: '/notification-modals' },
  { path: '/admin-users', element: <AdminUserList />, permission: '/admin-users' },
  { path: '/admin-settings', element: <AdminSettings />, permission: '/admin-settings' },
  { path: '/admin-logs', element: <AdminLogs />, permission: '/admin-logs' },
  { path: '/settings', element: <Settings />, permission: '/settings' },
  { path: '/company-settings', element: <Company />, permission: '/company-settings' },
  { path: '/payment', element: <Payment />, permission: '/payment' }
];

export const systemRoutes = [...new Map(
  routesConfig
    .filter(r => r.permission)
    .map(r => [r.permission, {
      name: r.permission.substring(1).split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      path: r.permission,
    }])
).values()];
