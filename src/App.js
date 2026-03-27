import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';

import { BookingList } from './pages/bookings/BookingList';
import { AddBooking } from './pages/bookings/AddBooking';
import { EditBooking } from './pages/bookings/EditBooking';

import { TripList } from './pages/trips/TripList';
import { AddTrip } from './pages/trips/AddTrip';
import { EditTrip } from './pages/trips/EditTrip';

import { RouteList } from './pages/routes/RouteList';
import { AddRoute } from './pages/routes/AddRoute';
import { EditRoute } from './pages/routes/EditRoute';

import { DriverList } from './pages/drivers/DriverList';
import { AddDriver } from './pages/drivers/AddDriver';
import { EditDriver } from './pages/drivers/EditDriver';

import { VehicleList } from './pages/vehicles/VehicleList';
import { AddVehicle } from './pages/vehicles/AddVehicle';
import { EditVehicle } from './pages/vehicles/EditVehicle';

import { NotificationList } from './pages/notifications/NotificationList';
import { Dashboard } from './pages/dashboard/Dashboard';
import { AdminUserList } from './pages/AdminUsers/AdminUserList';
import { AddAdmin } from './pages/AdminUsers/AddAdmin';
import { AdminSettings } from './pages/Settings/AdminSettings';
import ViewDriver from './pages/drivers/ViewDriver';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Dashboard */}
        <Route index element={<Dashboard />} />

        {/* Bookings */}
        <Route path="bookings">
          <Route index element={<BookingList />} />
          <Route path="add" element={<AddBooking />} />
          <Route path="edit/:id" element={<EditBooking />} />
        </Route>

        {/* Trips */}
        <Route path="trips">
          <Route index element={<TripList />} />
          <Route path="add" element={<AddTrip />} />
          <Route path="edit/:id" element={<EditTrip />} />
        </Route>

        {/* Routes */}
        <Route path="routes">
          <Route index element={<RouteList />} />
          <Route path="add" element={<AddRoute />} />
          <Route path="edit/:id" element={<EditRoute />} />
        </Route>

        {/* Drivers */}
        <Route path="drivers">
          <Route index element={<DriverList />} />
          <Route path="add" element={<AddDriver />} />
          <Route path="edit/:id" element={<EditDriver />} />
          <Route path="view/:id" element={<ViewDriver />} />
        </Route>

        {/* Vehicles */}
        <Route path="vehicles">
          <Route index element={<VehicleList />} />
          <Route path="add" element={<AddVehicle />} />
          <Route path="edit/:id" element={<EditVehicle />} />
        </Route>

        {/* Notifications */}
        <Route path="notifications">
          <Route index element={<NotificationList />} />
        </Route>

        {/* Admin Users */}
        <Route path="admin-users">
          <Route index element={<AdminUserList />} />
          <Route path="add" element={<AddAdmin />} />
          <Route path="edit/:id" element={<AddAdmin />} />
        </Route>

        {/* Admin Settings */}
        <Route path="admin-settings">
          <Route index element={<AdminSettings />} />

        </Route>

      </Route>
    </Routes>
  );
}

export default App;
