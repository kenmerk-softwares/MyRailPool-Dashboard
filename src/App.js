import React, {  useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { listenToAuth } from './modules/auth/auth.listner';
import { Layout } from './components/Layout';
import { Dashboard } from './modules/dashboard/Dashboard';
import Login from './modules/auth/pages/Login';
import { ToastProvider } from './shared/hooks/ToastContext';
import Loading from './shared/utils/Loading';
import NoAccess from './shared/utils/NoAccess';
import { routesConfig } from './app/routes';

function App() {
  const dispatch = useDispatch();
  
  // Get Auth state from Redux
  const { 
    user, 
    permissions: allowedRoutes, 
    loading: checkingAuth, 
    isAuthenticated 
  } = useSelector((state) => state.auth);

  // =================== AUTH LISTENER =================== //
  useEffect(() => {
    listenToAuth(dispatch);
  }, [dispatch]);

  const isRouteAllowed = (permission) => {
    if (permission === null) return true;
    if (allowedRoutes === null) return true;
    return allowedRoutes.includes(permission);
  };

  if (checkingAuth) return <Loading message= "Loading data's & Initializing " />;

  return (
    <ToastProvider>
      <Routes>
        <Route
          path="/"
          element={isAuthenticated ? <Layout /> : <Login />}
        >
          <Route index element={<Dashboard />} />
          {isAuthenticated && routesConfig.map((route) => {
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
