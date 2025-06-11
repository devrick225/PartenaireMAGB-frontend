import { notification } from 'antd';

// Configuration des retry
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1 seconde
  maxDelay: 10000, // 10 secondes max
  retryCondition: (error) => {
    const status = error?.response?.status;
    // Retry pour erreurs serveur (5xx) et timeouts
    return (
      (status >= 500 && status < 600) ||
      error.code === 'ECONNABORTED' ||
      error.code === 'NETWORK_ERROR' ||
      !error.response
    );
  },
};

// Calculer le délai avec backoff exponentiel
const calculateDelay = (attempt) => {
  const delay = RETRY_CONFIG.baseDelay * 2 ** (attempt - 1);
  return Math.min(delay, RETRY_CONFIG.maxDelay);
};

// Attendre un délai
const wait = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

// Ajouter les métadonnées de retry à la requête
const addRetryMetadata = (config) => {
  if (!config.retryMeta) {
    config.retryMeta = {
      retryCount: 0,
      startTime: Date.now(),
      originalUrl: config.url,
      originalMethod: config.method?.toUpperCase(),
    };
  }
  return config;
};

// Notification pour erreurs après tous les retry
const showErrorNotification = (error, config) => {
  const { retryMeta } = config;
  const status = error?.response?.status;
  const totalTime = Date.now() - retryMeta.startTime;

  let message = 'Erreur de connexion';
  let description = 'Une erreur est survenue';

  if (status >= 500) {
    message = 'Erreur serveur';
    description = `Le serveur a rencontré une erreur (${status}). Nous avons tenté ${
      retryMeta.retryCount
    } fois sur ${Math.round(totalTime / 1000)} secondes.`;
  } else if (!error.response) {
    message = 'Erreur réseau';
    description = 'Impossible de se connecter au serveur. Vérifiez votre connexion internet.';
  } else {
    description = error?.response?.data?.error || error.message || description;
  }

  notification.error({
    message,
    description,
    duration: 6,
    placement: 'topRight',
  });
};

// Notification pour retry en cours
const showRetryNotification = (config, attempt) => {
  const nextDelay = calculateDelay(attempt + 1);

  notification.warning({
    message: 'Reconnexion en cours...',
    description: `Tentative ${attempt + 1}/${RETRY_CONFIG.maxRetries}. Nouvelle tentative dans ${Math.round(
      nextDelay / 1000,
    )}s.`,
    duration: 3,
    key: `retry-${config.retryMeta.originalUrl}`, // Éviter les doublons
    placement: 'topRight',
  });
};

// Setup de l'intercepteur de retry
export const setupRetryInterceptor = (axiosInstance) => {
  // Request interceptor - ajouter métadonnées
  axiosInstance.interceptors.request.use(
    (config) => {
      return addRetryMetadata(config);
    },
    (error) => Promise.reject(error),
  );

  // Response interceptor - gérer les retry
  axiosInstance.interceptors.response.use(
    (response) => {
      // Succès - nettoyer les notifications de retry en cours
      if (response.config.retryMeta?.retryCount > 0) {
        notification.destroy(`retry-${response.config.retryMeta.originalUrl}`);
        notification.success({
          message: 'Connexion rétablie',
          description: 'La requête a réussi après reconnexion.',
          duration: 3,
          placement: 'topRight',
        });
      }
      return response;
    },
    async (error) => {
      const { config } = error;

      if (!config || !config.retryMeta) {
        return Promise.reject(error);
      }

      const { retryMeta } = config;
      const shouldRetry = RETRY_CONFIG.retryCondition(error);
      const canRetry = retryMeta.retryCount < RETRY_CONFIG.maxRetries;

      // Si on peut et doit retry
      if (shouldRetry && canRetry) {
        // eslint-disable-next-line no-plusplus
        retryMeta.retryCount++;

        // Afficher notification de retry (sauf pour la première tentative)
        if (retryMeta.retryCount > 1) {
          showRetryNotification(config, retryMeta.retryCount);
        }

        // Calculer et attendre le délai
        const delay = calculateDelay(retryMeta.retryCount);
        await wait(delay);

        // Log pour debug
        console.log(
          `🔄 Retry ${retryMeta.retryCount}/${RETRY_CONFIG.maxRetries} pour ${retryMeta.originalMethod} ${retryMeta.originalUrl} après ${delay}ms`,
        );

        // Nettoyer la notification précédente
        notification.destroy(`retry-${retryMeta.originalUrl}`);

        // Retry la requête
        try {
          return await axiosInstance(config);
        } catch (retryError) {
          // Si le retry échoue, continuer avec la logique normale
          return Promise.reject(retryError);
        }
      }

      // Plus de retry possible ou pas de retry nécessaire
      if (shouldRetry && retryMeta.retryCount > 0) {
        // Nettoyer les notifications de retry
        notification.destroy(`retry-${retryMeta.originalUrl}`);

        // Afficher erreur finale après tous les retry
        showErrorNotification(error, config);

        console.error(
          `❌ Échec final après ${retryMeta.retryCount} tentatives pour ${retryMeta.originalMethod} ${retryMeta.originalUrl}`,
        );
      }

      return Promise.reject(error);
    },
  );

  return axiosInstance;
};

// Fonction utilitaire pour forcer un retry immédiat
export const retryLastRequest = () => {
  notification.info({
    message: 'Nouvelle tentative en cours...',
    description: 'Reconnexion au serveur...',
    duration: 2,
  });
};

export default setupRetryInterceptor;
