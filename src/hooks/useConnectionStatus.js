import { useState, useEffect, useCallback } from 'react';
import { notification } from 'antd';

// Hook personnalisé pour gérer l'état de connexion
const useConnectionStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [hasConnectionError, setHasConnectionError] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [lastErrorTime, setLastErrorTime] = useState(null);
  const [failedRequests, setFailedRequests] = useState([]);

  // Gérer les changements de statut de connexion
  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 Connexion internet rétablie');
      setIsOnline(true);
      
      // Afficher notification de reconnexion si on était déconnecté
      if (!isOnline || hasConnectionError) {
        notification.success({
          message: 'Connexion rétablie',
          description: 'Vous êtes de nouveau connecté à internet.',
          duration: 3,
          placement: 'topRight'
        });
      }
      
      setHasConnectionError(false);
    };

    const handleOffline = () => {
      console.log('❌ Connexion internet perdue');
      setIsOnline(false);
      setHasConnectionError(true);
      setLastErrorTime(new Date());
      
      notification.warning({
        message: 'Connexion perdue',
        description: 'Vous êtes hors ligne. Les actions seront sauvegardées et exécutées à la reconnexion.',
        duration: 5,
        placement: 'topRight'
      });
    };

    // Écouter les événements natifs du navigateur
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isOnline, hasConnectionError]);

  // Écouter les erreurs de connexion personnalisées
  useEffect(() => {
    const handleConnectionError = (event) => {
      console.log('❌ Erreur de connexion détectée:', event.detail);
      setHasConnectionError(true);
      setLastErrorTime(new Date());
      
      // Ajouter la requête échouée à la liste
      if (event.detail?.request) {
        setFailedRequests(prev => [...prev, {
          id: Date.now(),
          request: event.detail.request,
          timestamp: new Date(),
          retryCount: 0
        }]);
      }
    };

    const handleConnectionRestored = () => {
      console.log('✅ Connexion au serveur rétablie');
      setHasConnectionError(false);
      
      notification.success({
        message: 'Serveur accessible',
        description: 'La connexion au serveur a été rétablie.',
        duration: 3,
        placement: 'topRight'
      });
    };

    // Écouter les événements personnalisés
    window.addEventListener('connection-error', handleConnectionError);
    window.addEventListener('connection-restored', handleConnectionRestored);

    return () => {
      window.removeEventListener('connection-error', handleConnectionError);
      window.removeEventListener('connection-restored', handleConnectionRestored);
    };
  }, []);

  // Fonction pour tester la connexion
  const testConnection = useCallback(async () => {
    try {
      setIsRetrying(true);
      
      // Test simple avec une requête HEAD vers l'API
      const response = await fetch(`${process.env.REACT_APP_API_ENDPOINT}/health`, {
        method: 'HEAD',
        timeout: 5000
      });

      if (response.ok) {
        setHasConnectionError(false);
        
        // Déclencher événement de restauration
        window.dispatchEvent(new CustomEvent('connection-restored'));
        
        return true;
      } else {
        throw new Error(`Serveur non accessible (${response.status})`);
      }
    } catch (error) {
      console.error('Test de connexion échoué:', error);
      setHasConnectionError(true);
      setLastErrorTime(new Date());
      
      // Déclencher événement d'erreur
      window.dispatchEvent(new CustomEvent('connection-error', {
        detail: { error: error.message }
      }));
      
      return false;
    } finally {
      setIsRetrying(false);
    }
  }, []);

  // Fonction pour réessayer les requêtes échouées
  const retryFailedRequests = useCallback(async () => {
    if (failedRequests.length === 0) return;

    console.log(`🔄 Tentative de retry pour ${failedRequests.length} requêtes échouées`);
    
    const retryPromises = failedRequests.map(async (failedRequest) => {
      try {
        // TODO: Implémenter la logique de retry des requêtes
        console.log('🔄 Retry requête:', failedRequest.request);
        
        // Simulation du retry (à remplacer par la vraie logique)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return { success: true, id: failedRequest.id };
      } catch (error) {
        console.error('Retry échoué pour requête:', failedRequest.id, error);
        return { success: false, id: failedRequest.id, error };
      }
    });

    const results = await Promise.allSettled(retryPromises);
    
    // Retirer les requêtes qui ont réussi
    const successfulIds = results
      .filter(result => result.status === 'fulfilled' && result.value.success)
      .map(result => result.value.id);
    
    setFailedRequests(prev => prev.filter(req => !successfulIds.includes(req.id)));
    
    if (successfulIds.length > 0) {
      notification.success({
        message: 'Requêtes synchronisées',
        description: `${successfulIds.length} requête(s) ont été exécutées avec succès.`,
        duration: 3
      });
    }
  }, [failedRequests]);

  // Auto-retry des requêtes échouées quand la connexion est rétablie
  useEffect(() => {
    if (isOnline && !hasConnectionError && failedRequests.length > 0) {
      retryFailedRequests();
    }
  }, [isOnline, hasConnectionError, failedRequests.length, retryFailedRequests]);

  // Fonction pour marquer une requête comme échouée
  const markRequestAsFailed = useCallback((requestData) => {
    setFailedRequests(prev => [...prev, {
      id: Date.now() + Math.random(),
      request: requestData,
      timestamp: new Date(),
      retryCount: 0
    }]);
  }, []);

  // Fonction pour nettoyer les requêtes échouées
  const clearFailedRequests = useCallback(() => {
    setFailedRequests([]);
  }, []);

  return {
    // État de connexion
    isOnline,
    hasConnectionError,
    isRetrying,
    lastErrorTime,
    
    // Requêtes échouées
    failedRequests,
    failedRequestsCount: failedRequests.length,
    
    // Actions
    testConnection,
    retryFailedRequests,
    markRequestAsFailed,
    clearFailedRequests,
    
    // État combiné
    isConnected: isOnline && !hasConnectionError,
    needsAttention: !isOnline || hasConnectionError || failedRequests.length > 0
  };
};

export default useConnectionStatus; 