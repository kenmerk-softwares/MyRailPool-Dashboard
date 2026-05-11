import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from './Config/Config';
import { Layout } from './components/Layout';
import { BookingList } from './modules/bookings/BookingList';
import { AddBooking } from './modules/bookings/AddBooking';
import { EditBooking } from './modules/bookings/EditBooking';
import { ViewBooking } from './modules/bookings/ViewBooking';
import { TripList } from './modules/trips/TripList';
import { AddTrip } from './modules/trips/AddTrip';
import { ViewTrip } from './modules/trips/ViewTrip';
import { RouteList } from './modules/routes/RouteList';
import { AddRoute } from './modules/routes/AddRoute';
import ViewRoute from './modules/routes/ViewRoute';
import { DriverList } from './modules/drivers/DriverList';
import { AddDriver } from './modules/drivers/AddDriver';
import { EditDriver } from './modules/drivers/EditDriver';
import { VehicleList } from './modules/vehicles/VehicleList';
import { AddVehicle } from './modules/vehicles/AddVehicle';
import { EditVehicle } from './modules/vehicles/EditVehicle';
import { ViewVehicle } from './modules/vehicles/ViewVehicle';
import { NotificationList } from './modules/notifications/NotificationList';
import { Dashboard } from './modules/dashboard/Dashboard';
import { AdminUserList } from './modules/user/pages/AdminUserList';
import { AdminSettings } from './pages/Settings/AdminSettings';
import ViewDriver from './modules/drivers/ViewDriver';
import Login from './modules/auth/Login';
import NoAccess from './utils/NoAccess';
import AdminLogs from './modules/admin/AdminLogs';
import RouteReq from './pages/RouteReq/RouteReq';
import { ToastProvider } from './hooks/ToastContext';
import Settings from './pages/Settings/Settings';
import Company from './pages/Settings/Company';
import Payment from './modules/payment/Payment';

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
  { path: '/company-settings', element: <Company/>, permission: '/company-settings'}
];


export const systemRoutes = [...new Map(
  routesConfig
    .filter(r => r.permission)
    .map(r => [r.permission, {
      name: r.permission.substring(1).split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      path: r.permission,
    }])
).values()];
function App() {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [allowedRoutes, setAllowedRoutes] = useState(null); // null = loading/legacy, [] = no permissions

  // =================== AUTH LISTENER =================== //
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setCheckingAuth(false);
    });
    return () => unsub();
  }, []);

  // =================== FETCH USER'S PERMISSIONS =================== //
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
        const permissionId = userData.permissionId;

        if (!permissionId) {
          setAllowedRoutes(null);
          return;
        }

        const permDocRef = doc(db, 'permissions', permissionId);
        unsubPermissions = onSnapshot(permDocRef, (permSnap) => {
          if (permSnap.exists()) {
            const permData = permSnap.data();
            setAllowedRoutes(permData.permissions || []);
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
        {user && (
          <>
            {routesConfig.map((route) => {
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
