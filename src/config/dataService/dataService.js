import axios from 'axios';
import { notification } from 'antd';
import { setupRetryInterceptor } from './retryInterceptor';
import { getItem } from '../../utility/localStorageControl';

const API_ENDPOINT = `${process.env.REACT_APP_API_ENDPOINT}`;

const authHeader = () => ({
  Authorization: `Bearer ${getItem('access_token')}`,
});

const openNotificationWithIcon = (type, message, description) => {
  notification[type]({
    message,
    description,
  });
};

const client = axios.create({
  baseURL: API_ENDPOINT,
  withCredentials: true,
  timeout: 30000, // 30 secondes timeout
  headers: {
    Authorization: `Bearer ${getItem('access_token')}`,
    'Content-Type': 'application/json',
  },
});

// Configurer l'intercepteur de retry pour la gestion intelligente des erreurs
setupRetryInterceptor(client);

class DataService {
  static get(path = '') {
    return client({
      method: 'GET',
      url: path,
      headers: { ...authHeader() },
    });
  }

  static post(path = '', data = {}, optionalHeader = {}) {
    return client({
      method: 'POST',
      url: path,
      data,
      headers: { ...authHeader(), ...optionalHeader },
    });
  }

  static patch(path = '', data = {}) {
    return client({
      method: 'PATCH',
      url: path,
      data: JSON.stringify(data),
      headers: { ...authHeader() },
    });
  }

  static put(path = '', data = {}) {
    return client({
      method: 'PUT',
      url: path,
      data: JSON.stringify(data),
      headers: { ...authHeader() },
    });
  }

  static delete(path = '', data = {}) {
    return client({
      method: 'DELETE',
      url: path,
      data: JSON.stringify(data),
      headers: { ...authHeader() },
    });
  }
}

/**
 * axios interceptors runs before and after a request, letting the developer modify req,req more
 * For more details on axios interceptor see https://github.com/axios/axios#interceptors
 */
client.interceptors.request.use((config) => {
  // do something before executing the request
  // For example tag along the bearer access token to request header or set a cookie
  const requestConfig = config;
  const { headers } = config;
  requestConfig.headers = { ...headers, Authorization: `Bearer ${getItem('access_token')}` };

  return requestConfig;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;

    // Ne pas gérer les erreurs 5xx et réseau - l'intercepteur de retry s'en charge
    if (!response || (response.status >= 500 && response.status < 600)) {
      return Promise.reject(error);
    }

    // Gérer seulement les erreurs client (4xx)
    let errorMessage = 'Une erreur est survenue';
    let description = 'Veuillez réessayer plus tard';

    switch (response.status) {
      case 400:
        errorMessage = 'Requête incorrecte';
        description = response.data?.error || response.data?.message || 'Les données envoyées sont invalides';
        break;
      case 401:
        errorMessage = 'Non autorisé';
        description = response.data?.error || response.data?.message || 'Session expirée, veuillez vous reconnecter';
        break;
      case 403:
        errorMessage = 'Accès refusé';
        description = response.data?.error || response.data?.message || "Vous n'avez pas les permissions nécessaires";
        break;
      case 404:
        errorMessage = 'Ressource non trouvée';
        description = response.data?.error || response.data?.message || "La ressource demandée n'existe pas";
        break;
      case 422:
        errorMessage = 'Données invalides';
        description = response.data?.error || response.data?.message || 'Les données envoyées ne sont pas valides';
        break;
      case 429:
        errorMessage = 'Trop de requêtes';
        description = 'Vous avez fait trop de requêtes. Veuillez patienter avant de réessayer.';
        break;
      default:
        description = response.data?.error || response.data?.message || description;
    }

    // Ajouter les détails de l'erreur pour traitement ultérieur
    error.notification = {
      message: errorMessage,
      description,
      show: true,
    };

    // Afficher la notification d'erreur
    openNotificationWithIcon('error', errorMessage, description);

    return Promise.reject(error);
  },
);
// Exporter aussi l'instance client pour les interceptors
export { DataService, client };
