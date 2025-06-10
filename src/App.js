import { ConfigProvider } from 'antd';
import 'antd/dist/antd.less';
import React, { useEffect, useState, lazy } from 'react';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';

import { ThemeProvider } from 'styled-components';
import config from './config/config';
import store from './redux/store';
import { client } from './config/dataService/dataService';
import { setupInterceptors } from './config/dataService/authInterceptor';
import { initializeAuth } from './redux/authentication/actionCreator';

import Admin from './routes/admin';
import Auth from './routes/auth';
import './static/css/style.css';

const NotFound = lazy(() => import('./container/pages/404'));

const { themeColor } = config;

function ProviderConfig() {
  const dispatch = useDispatch();
  const { rtl, isLoggedIn, topMenu, mainContent, authLoading } = useSelector((state) => {
    return {
      rtl: state.ChangeLayoutMode.rtlData,
      topMenu: state.ChangeLayoutMode.topMenu,
      mainContent: state.ChangeLayoutMode.mode,
      isLoggedIn: state.auth.isLoggedIn,
      authLoading: state.auth.loading || state.auth.loadingUser,
    };
  });

  const [path, setPath] = useState(window.location.pathname);
  const [authInitialized, setAuthInitialized] = useState(false);

  // Initialiser l'authentification au chargement de l'app
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Configurer les intercepteurs
        setupInterceptors(client, store);

        // Initialiser l'état d'authentification
        await dispatch(initializeAuth());
      } catch (error) {
        console.error('Erreur initialisation auth:', error);
      } finally {
        setAuthInitialized(true);
      }
    };

    initAuth();
  }, [dispatch]);

  useEffect(() => {
    let unmounted = false;
    if (!unmounted) {
      setPath(window.location.pathname);
    }
    return () => {
      unmounted = true;
    };
  }, [setPath]);

  // Afficher un loader pendant l'initialisation
  if (!authInitialized || authLoading) {
    return (
      <ConfigProvider direction={rtl ? 'rtl' : 'ltr'}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            flexDirection: 'column',
          }}
        >
          <div style={{ fontSize: '18px', marginBottom: '20px' }}>Initialisation...</div>
          <div className="loading-spinner" />
        </div>
      </ConfigProvider>
    );
  }

  return (
    <ConfigProvider direction={rtl ? 'rtl' : 'ltr'}>
      <ThemeProvider theme={{ ...themeColor, rtl, topMenu, mainContent }}>
        <>
          <Router basename={process.env.PUBLIC_URL}>
            {!isLoggedIn ? (
              <Routes>
                <Route path="/*" element={<Auth />} />{' '}
              </Routes>
            ) : (
              <Routes>
                <Route path="/admin/*" element={<Admin />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            )}
            {isLoggedIn && (path === process.env.PUBLIC_URL || path === `${process.env.PUBLIC_URL}/`) && (
              <Routes>
                <Route path="/" element={<Navigate to="/admin" />} />
              </Routes>
            )}
          </Router>
        </>
      </ThemeProvider>
    </ConfigProvider>
  );
}

function App() {
  return (
    <Provider store={store}>
      <ProviderConfig />
    </Provider>
  );
}

export default App;
