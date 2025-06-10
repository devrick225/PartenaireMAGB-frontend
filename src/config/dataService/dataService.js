import axios from 'axios';
import { notification } from 'antd';
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
  headers: {
    Authorization: `Bearer ${getItem('access_token')}`,
    'Content-Type': 'application/json',
  },
});

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
    if (response) {
      let errorMessage = 'Une erreur est survenue';
      let description = 'Veuillez réessayer plus tard';

      switch (response.status) {
        case 400:
          errorMessage = 'Requête incorrecte';
          description = response.data?.message || 'Les données envoyées sont invalides';
          break;
        case 401:
          errorMessage = 'Non autorisé';
          description = response.data?.message || 'Veuillez vous connecter';
          break;
        case 403:
          errorMessage = 'Accès refusé';
          description = "Vous n'avez pas les permissions nécessaires";
          break;
        case 404:
          errorMessage = 'Ressource non trouvée';
          description = "La ressource demandée n'existe pas";
          break;
        case 500:
          errorMessage = 'Erreur serveur';
          description = 'Une erreur est survenue sur le serveur';
          break;
        default:
          description = response.data?.message || description;
      }
      // Ajoutez les détails de l'erreur à l'objet error pour un traitement ultérieur
      error.notification = {
        message: errorMessage,
        description,
        show: true, // Permet de désactiver la notification dans des cas spécifiques
      };
      // Affiche la notification seulement si elle n'a pas été désactivée
      if (error.notification.show) {
        openNotificationWithIcon('error', errorMessage, description);
      }
    } else {
      // Erreur réseau
      error.notification = {
        message: 'Erreur réseau',
        description: 'Impossible de se connecter au serveur',
        show: true,
      };
      openNotificationWithIcon('error', 'Erreur réseau', 'Impossible de se connecter au serveur');
    }
    return Promise.reject(error);
  },
);
// Exporter aussi l'instance client pour les interceptors
export { DataService, client };
