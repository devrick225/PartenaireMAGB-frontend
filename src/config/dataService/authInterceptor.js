import Cookies from 'js-cookie';
import { notification } from 'antd';

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

export const setupInterceptors = (axiosInstance, store) => {
  // Request interceptor - ajouter le token à chaque requête
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = Cookies.get('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    },
  );

  // Response interceptor - gérer les tokens expirés
  axiosInstance.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      const originalRequest = error.config;

      // Si l'erreur est 401 et qu'on n'a pas déjà tenté de refresh
      // eslint-disable-next-line no-underscore-dangle
      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          // Si un refresh est déjà en cours, mettre en queue
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return axiosInstance(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        // eslint-disable-next-line no-underscore-dangle
        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshToken = Cookies.get('refresh_token');

          if (!refreshToken) {
            throw new Error('Pas de refresh token');
          }

          // Tenter le refresh - utiliser l'instance axios directement
          const response = await axiosInstance.post('/auth/refresh', {
            refreshToken,
          });

          if (response.data.success) {
            const { token, refreshToken: newRefreshToken } = response.data.data;

            // Mettre à jour les cookies
            Cookies.set('access_token', token, { expires: 7 });
            Cookies.set('refresh_token', newRefreshToken, { expires: 30 });

            // Mettre à jour Redux
            store.dispatch({
              type: 'REFRESH_TOKEN_SUCCESS',
              data: { token, refreshToken: newRefreshToken },
            });

            // Traiter la queue
            processQueue(null, token);

            // Réessayer la requête originale
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          }
          throw new Error('Échec du refresh');
        } catch (refreshError) {
          console.error('Erreur refresh token:', refreshError);

          // Nettoyer les cookies et Redux
          Cookies.remove('access_token');
          Cookies.remove('refresh_token');
          Cookies.remove('logedIn');
          Cookies.remove('user');

          store.dispatch({
            type: 'LOGOUT_SUCCESS',
            data: { isLoggedIn: false, user: null, token: null },
          });

          // Notifier l'utilisateur
          notification.error({
            message: 'Session expirée',
            description: 'Veuillez vous reconnecter.',
          });

          processQueue(refreshError, null);

          // Rediriger vers la page de connexion
          if (window.location.pathname !== '/') {
            window.location.href = '/';
          }

          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    },
  );
};

export default setupInterceptors;
