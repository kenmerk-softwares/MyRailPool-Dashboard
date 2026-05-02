import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from './Config/Config';
import { Layout } from './components/Layout';

import { BookingList } from './pages/bookings/BookingList';
import { AddBooking } from './pages/bookings/AddBooking';
import { EditBooking } from './pages/bookings/EditBooking';
import { ViewBooking } from './pages/bookings/ViewBooking';

import { TripList } from './pages/trips/TripList';
import { AddTrip } from './pages/trips/AddTrip';
import { ViewTrip } from './pages/trips/ViewTrip';

import { RouteList } from './pages/routes/RouteList';
import { AddRoute } from './pages/routes/AddRoute';
import ViewRoute from './pages/routes/ViewRoute';

import { DriverList } from './pages/drivers/DriverList';
import { AddDriver } from './pages/drivers/AddDriver';
import { EditDriver } from './pages/drivers/EditDriver';

import { VehicleList } from './pages/vehicles/VehicleList';
import { AddVehicle } from './pages/vehicles/AddVehicle';
import { EditVehicle } from './pages/vehicles/EditVehicle';
import { ViewVehicle } from './pages/vehicles/ViewVehicle';

import { NotificationList } from './pages/notifications/NotificationList';
import { Dashboard } from './pages/dashboard/Dashboard';
import { AdminUserList } from './pages/AdminUsers/AdminUserList';
import { AdminSettings } from './pages/Settings/AdminSettings';
import ViewDriver from './pages/drivers/ViewDriver';
import Login from './Login/Login';
import NoAccess from './NoAccess/NoAccess';
import AdminLogs from './pages/AdminLogs/AdminLogs';
import Payment from './pages/Payment/Payment';
import RouteReq from './pages/RouteReq/RouteReq';
import { ToastProvider } from './Toast/ToastContext';
import Settings from './pages/Settings/Settings';
import EmployeeSettings from './pages/Settings/Employee';
import Company from './pages/Settings/Company';

// ======================== ROUTES CONFIG ======================== //
export const routesConfig = [
  { path: '/', element: <Dashboard />, permission: null },
  { path: '/bookings', element: <BookingList />, permission: '/bookings' },
  { path: '/bookings/add', element: <AddBooking />, permission: '/bookings' },
  { path: '/bookings/edit/:id', element: <EditBooking />, permission: '/bookings' },
  { path: '/bookings/view/:id', element: <ViewBooking />, permission: '/bookings' },
  { path: '/trips', element: <TripList />, permission: '/trips' },
  { path: '/trips/add', element: <AddTrip />, permission: '/trips' },
  { path: '/trips/add/:id', element: <AddTrip />, permission: '/trips' },
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
  { path: '/payment', element: <Payment />, permission: '/payment' },
  { path: '/route-req', element: <RouteReq />, permission: '/route-req' },
  { path: '/notifications', element: <NotificationList />, permission: '/notifications' },
  { path: '/admin-users', element: <AdminUserList />, permission: '/admin-users' },
  { path: '/admin-settings', element: <AdminSettings />, permission: '/admin-settings' },
  { path: '/admin-logs', element: <AdminLogs />, permission: '/admin-logs' },
  { path: '/settings', element: <Settings />, permission: '/settings'},
  { path: '/employee-settings', element: <EmployeeSettings />, permission: '/employee-settings'},
  { path: '/company-settings', element: <Company/>, permission: '/company-settings'}
];

function App() {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [allowedRoutes, setAllowedRoutes] = useState(null); // null = loading/legacy, [] = no permissions

  // Auth listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setCheckingAuth(false);
    });
    return () => unsub();
  }, []);

  // Fetch user's permissions when logged in
  useEffect(() => {
    if (!user) {
      setAllowedRoutes(null);
      return;
    }

    let unsubPermissions = null;

    const fetchPermissions = async () => {
      try {
        const userDocRef = doc(db, 'admin-users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
          setAllowedRoutes([]);
          return;
        }

        const userData = userDocSnap.data();
        const designationId = userData.designationId;

        if (!designationId) {
          // No designationId → grant all access (fallback for legacy users)
          setAllowedRoutes(null);
          return;
        }

        // Listen to permissions doc in real-time
        const permDocRef = doc(db, 'permissions', designationId);
        unsubPermissions = onSnapshot(permDocRef, (permSnap) => {
          if (permSnap.exists()) {
            const permData = permSnap.data();
            setAllowedRoutes(permData.allowedRoutes || []);
          } else {
            setAllowedRoutes([]);
          }
        }, (err) => {
          console.error("Error fetching permissions:", err);
          setAllowedRoutes(null);
        });
      } catch (error) {
        console.error("Error fetching user permissions:", error);
        setAllowedRoutes(null);
      }
    };

    fetchPermissions();

    return () => {
      if (unsubPermissions) unsubPermissions();
    };
  }, [user]);

  const isRouteAllowed = (permission) => {
    if (permission === null) return true;
    if (allowedRoutes === null) return true;
    return allowedRoutes.includes(permission);
  };

  if (checkingAuth) return null;

  return (
    <ToastProvider>
      <Routes>
        <Route
          path="/"
          element={user ? <Layout /> : <Login />}
        >
          <Route index element={<Dashboard />} />

          {/* Logged-in routes with permission check */}
          {user && routesConfig.map((route) => {
            if (route.path === '/') return null;
            return (
              <Route
                key={route.path}
                path={route.path.substring(1)}
                element={
                  isRouteAllowed(route.permission)
                    ? route.element
                    : <NoAccess />
                }
              />
            );
          })}
        </Route>

        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route path="/no-access" element={<NoAccess />} />
        {/* Logged-in routes with permission check */}
        {user && (
          <>
            {routesConfig.map((route) => {
              // Skip root — already handled above
              if (route.path === '/') return null;

              return (
                <Route
                  key={route.path}
                  path={route.path}
                  element={
                    isRouteAllowed(route.permission)
                      ? route.element
                      : <NoAccess />
                  }
                />
              );
            })}
          </>
        )}
        {!user && <Route path="*" element={<Navigate to="/" />} />}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </ToastProvider>
  );
}

export default App;
