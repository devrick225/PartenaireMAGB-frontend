import React, { useState, useEffect } from 'react';
import { Alert, Button, Badge, Space } from 'antd';
import { WifiOutlined, ExclamationCircleOutlined, LoadingOutlined, ReloadOutlined } from '@ant-design/icons';
import { retryLastRequest } from '../../config/dataService/retryInterceptor';
import './ConnectionStatusIndicator.css';

const ConnectionStatusIndicator = ({ 
  showWhenOnline = false, 
  position = 'top-right',
  minimal = false 
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [hasConnectionError, setHasConnectionError] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [lastErrorTime, setLastErrorTime] = useState(null);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setHasConnectionError(false);
      console.log('🌐 Connexion internet rétablie');
    };

    const handleOffline = () => {
      setIsOnline(false);
      setHasConnectionError(true);
      setLastErrorTime(new Date());
      console.log('❌ Connexion internet perdue');
    };

    const handleConnectionError = () => {
      setHasConnectionError(true);
      setLastErrorTime(new Date());
    };

    // Écouter les événements de connexion
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Écouter les erreurs réseau personnalisées
    window.addEventListener('connection-error', handleConnectionError);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('connection-error', handleConnectionError);
    };
  }, []);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await retryLastRequest();
      setHasConnectionError(false);
    } catch (error) {
      console.error('Erreur lors du retry manuel:', error);
    } finally {
      setIsRetrying(false);
    }
  };

  // Ne pas afficher si en ligne et showWhenOnline est false
  if (isOnline && !hasConnectionError && !showWhenOnline) {
    return null;
  }

  // Version minimale (juste un badge)
  if (minimal) {
    return (
      <Badge 
        status={isOnline && !hasConnectionError ? 'success' : 'error'} 
        text={isOnline && !hasConnectionError ? 'Connecté' : 'Hors ligne'}
        className={`connection-badge connection-badge-${position}`}
      />
    );
  }

  // Version complète avec Alert
  if (!isOnline || hasConnectionError) {
    return (
      <div className={`connection-indicator connection-indicator-${position}`}>
        <Alert
          message={!isOnline ? "Pas de connexion internet" : "Problème de connexion au serveur"}
          description={
            <Space direction="vertical" size="small">
              <span>
                {!isOnline 
                  ? "Vérifiez votre connexion internet et réessayez."
                  : "Une erreur de connexion s'est produite. Les requêtes sont automatiquement retentées."
                }
              </span>
              {lastErrorTime && (
                <small style={{ color: '#666' }}>
                  Dernière erreur: {lastErrorTime.toLocaleTimeString()}
                </small>
              )}
              <Button 
                type="primary" 
                size="small"
                icon={isRetrying ? <LoadingOutlined /> : <ReloadOutlined />}
                onClick={handleRetry}
                loading={isRetrying}
              >
                {isRetrying ? 'Reconnexion...' : 'Réessayer'}
              </Button>
            </Space>
          }
          type="error"
          showIcon
          icon={!isOnline ? <ExclamationCircleOutlined /> : <WifiOutlined />}
          closable={false}
          style={{ marginBottom: 8 }}
        />
      </div>
    );
  }

  // Connexion OK et showWhenOnline = true
  if (showWhenOnline) {
    return (
      <div className={`connection-indicator connection-indicator-${position}`}>
        <Alert
          message="Connexion établie"
          type="success"
          showIcon
          icon={<WifiOutlined />}
          closable={true}
          style={{ marginBottom: 8 }}
        />
      </div>
    );
  }

  return null;
};

export default ConnectionStatusIndicator; 