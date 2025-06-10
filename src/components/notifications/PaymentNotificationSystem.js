import React, { useEffect, useState, useRef } from 'react';
import { notification, message, Progress, Card, Typography, Button, Space } from 'antd';
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  LoadingOutlined,
  ExclamationCircleOutlined,
  SyncOutlined,
  BellOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { verifyPayment } from '../../redux/payments/actionCreator';
import { donationsReadData } from '../../redux/donations/actionCreator';

const { Text } = Typography;

// Configuration WebSocket
const WS_BASE_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:5000';

class PaymentNotificationSystem {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 3000;
    this.listeners = new Map();
    this.isConnected = false;
    this.userId = null;
  }

  // Initialiser la connexion WebSocket
  initialize(userId, onStatusChange = null) {
    this.userId = userId;
    this.onStatusChange = onStatusChange;
    this.connect();
  }

  // Se connecter au WebSocket
  connect() {
    try {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        return; // Déjà connecté
      }

      const token = localStorage.getItem('token');
      const wsUrl = `${WS_BASE_URL}/payments?token=${token}&userId=${this.userId}`;
      
      console.log('🔌 Connexion WebSocket payments:', wsUrl);
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('✅ WebSocket payments connecté');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.onStatusChange?.(true);
        
        // S'abonner aux notifications de paiement pour cet utilisateur
        this.send({
          type: 'subscribe',
          channel: `payments:${this.userId}`,
          userId: this.userId
        });
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📨 Message WebSocket reçu:', data);
          this.handleWebSocketMessage(data);
        } catch (error) {
          console.error('❌ Erreur parsing message WebSocket:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('❌ WebSocket payments fermé:', event.code, event.reason);
        this.isConnected = false;
        this.onStatusChange?.(false);
        
        // Reconnexion automatique
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          console.log(`🔄 Tentative de reconnexion ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
          setTimeout(() => this.connect(), this.reconnectInterval);
        }
      };

      this.ws.onerror = (error) => {
        console.error('❌ Erreur WebSocket:', error);
        this.isConnected = false;
        this.onStatusChange?.(false);
      };

    } catch (error) {
      console.error('❌ Erreur initialisation WebSocket:', error);
      this.isConnected = false;
      this.onStatusChange?.(false);
    }
  }

  // Gérer les messages WebSocket reçus
  handleWebSocketMessage(data) {
    const { type, payload, paymentId, donationId } = data;

    switch (type) {
      case 'payment_status_update':
        this.handlePaymentStatusUpdate(payload);
        break;
      
      case 'payment_completed':
        this.handlePaymentCompleted(payload);
        break;
      
      case 'payment_failed':
        this.handlePaymentFailed(payload);
        break;
      
      case 'donation_created':
        this.handleDonationCreated(payload);
        break;
      
      case 'webhook_received':
        this.handleWebhookReceived(payload);
        break;
      
      default:
        console.log('📢 Message WebSocket non géré:', type, payload);
    }

    // Notifier les listeners spécifiques
    if (paymentId && this.listeners.has(paymentId)) {
      this.listeners.get(paymentId)(data);
    }
  }

  // Gestion mise à jour statut paiement
  handlePaymentStatusUpdate(payload) {
    const { payment, previousStatus, newStatus } = payload;
    
    notification.info({
      message: 'Statut de paiement mis à jour',
      description: `Paiement ${payment.id} : ${previousStatus} → ${newStatus}`,
      icon: <SyncOutlined style={{ color: '#1890ff' }} />,
      duration: 4
    });
  }

  // Gestion paiement complété
  handlePaymentCompleted(payload) {
    const { payment, donation } = payload;
    
    // Notification visuelle
    notification.success({
      message: '🎉 Paiement Réussi !',
      description: (
        <Space direction="vertical" size="small">
          <Text>Votre don de <Text strong>{donation.formattedAmount}</Text> a été traité avec succès</Text>
          <Text type="secondary">Transaction: {payment.transactionId}</Text>
        </Space>
      ),
      icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      duration: 8,
      style: {
        background: '#f6ffed',
        border: '1px solid #b7eb8f'
      }
    });

    // Son de notification (optionnel)
    this.playNotificationSound('success');

    // Déclencher des actions automatiques
    this.triggerPostPaymentActions(payment, donation);
  }

  // Gestion paiement échoué
  handlePaymentFailed(payload) {
    const { payment, donation, error } = payload;
    
    notification.error({
      message: '❌ Paiement Échoué',
      description: (
        <Space direction="vertical" size="small">
          <Text>Échec du paiement pour votre don de <Text strong>{donation.formattedAmount}</Text></Text>
          <Text type="secondary">Raison: {error?.message || 'Erreur inconnue'}</Text>
          <Button size="small" type="link" onClick={() => this.retryPayment(payment.id)}>
            Réessayer
          </Button>
        </Space>
      ),
      icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
      duration: 10,
      style: {
        background: '#fff2f0',
        border: '1px solid #ffccc7'
      }
    });

    this.playNotificationSound('error');
  }

  // Gestion nouvelle donation créée
  handleDonationCreated(payload) {
    const { donation } = payload;
    
    message.success(`Donation de ${donation.formattedAmount} créée avec succès !`, 3);
  }

  // Gestion webhook reçu
  handleWebhookReceived(payload) {
    const { provider, status, paymentId } = payload;
    
    message.info(`Webhook ${provider} reçu pour paiement ${paymentId}`, 2);
  }

  // Actions post-paiement
  triggerPostPaymentActions(payment, donation) {
    // Déclencher refresh des données
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('payment-completed', {
        detail: { payment, donation }
      }));
    }, 1000);
  }

  // Jouer un son de notification
  playNotificationSound(type) {
    if (!('Audio' in window)) return;
    
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      if (type === 'success') {
        // Son de succès (notes montantes)
        this.playTone(audioContext, 523, 100); // C
        setTimeout(() => this.playTone(audioContext, 659, 100), 100); // E
        setTimeout(() => this.playTone(audioContext, 784, 200), 200); // G
      } else if (type === 'error') {
        // Son d'erreur (notes descendantes)
        this.playTone(audioContext, 400, 150);
        setTimeout(() => this.playTone(audioContext, 300, 150), 150);
        setTimeout(() => this.playTone(audioContext, 200, 200), 300);
      }
    } catch (error) {
      console.log('Son notification non disponible:', error);
    }
  }

  // Jouer une note
  playTone(audioContext, frequency, duration) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration / 1000);
  }

  // Envoyer un message WebSocket
  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn('⚠️ WebSocket non connecté, impossible d\'envoyer:', data);
    }
  }

  // S'abonner aux updates d'un paiement spécifique
  listenToPayment(paymentId, callback) {
    this.listeners.set(paymentId, callback);
    
    // S'abonner via WebSocket
    this.send({
      type: 'subscribe',
      channel: `payment:${paymentId}`,
      paymentId
    });

    // Retourner une fonction de nettoyage
    return () => {
      this.listeners.delete(paymentId);
      this.send({
        type: 'unsubscribe',
        channel: `payment:${paymentId}`,
        paymentId
      });
    };
  }

  // Arrêter d'écouter un paiement
  stopListeningToPayment(paymentId) {
    this.listeners.delete(paymentId);
    this.send({
      type: 'unsubscribe',
      channel: `payment:${paymentId}`,
      paymentId
    });
  }

  // Réessayer un paiement
  retryPayment(paymentId) {
    window.location.href = `/admin/payments/${paymentId}/retry`;
  }

  // Fermer la connexion
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.listeners.clear();
    this.isConnected = false;
  }
}

// Instance singleton
const notificationSystem = new PaymentNotificationSystem();

// Hook React pour utiliser le système de notifications
export function usePaymentNotifications() {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const dispatch = useDispatch();
  
  const { user } = useSelector(state => ({
    user: state.auth.user
  }));

  useEffect(() => {
    if (user?.id) {
      // Initialiser le système de notifications
      notificationSystem.initialize(user.id, (connected) => {
        setIsConnected(connected);
        setConnectionStatus(connected ? 'connected' : 'disconnected');
      });

      // Écouter les événements de paiement complété
      const handlePaymentCompleted = (event) => {
        const { payment, donation } = event.detail;
        console.log('🔄 Événement payment-completed reçu, refresh des données...');
        
        // Actualiser les donations
        dispatch(donationsReadData());
      };

      window.addEventListener('payment-completed', handlePaymentCompleted);

      return () => {
        window.removeEventListener('payment-completed', handlePaymentCompleted);
      };
    }

    return () => {
      notificationSystem.disconnect();
    };
  }, [user?.id, dispatch]);

  // Méthodes exposées
  const listenToPayment = (paymentId, callback) => {
    return notificationSystem.listenToPayment(paymentId, callback);
  };

  const stopListeningToPayment = (paymentId) => {
    notificationSystem.stopListeningToPayment(paymentId);
  };

  return {
    isConnected,
    connectionStatus,
    listenToPayment,
    stopListeningToPayment,
    notificationSystem
  };
}

// Composant indicateur de statut de connexion
export function PaymentNotificationStatus() {
  const { isConnected, connectionStatus } = usePaymentNotifications();

  if (!isConnected) {
    return (
      <Card size="small" style={{ margin: '8px 0', background: '#fff7e6', border: '1px solid #ffd591' }}>
        <Space>
          <LoadingOutlined style={{ color: '#fa8c16' }} />
          <Text style={{ fontSize: 12 }}>
            Notifications en temps réel: {connectionStatus === 'disconnected' ? 'Déconnectées' : 'Connexion...'}
          </Text>
        </Space>
      </Card>
    );
  }

  return (
    <Card size="small" style={{ margin: '8px 0', background: '#f6ffed', border: '1px solid #b7eb8f' }}>
      <Space>
        <BellOutlined style={{ color: '#52c41a' }} />
        <Text style={{ fontSize: 12 }}>Notifications temps réel actives</Text>
      </Space>
    </Card>
  );
}

// Composant de suivi de paiement en temps réel
export function PaymentTracker({ paymentId, onStatusChange }) {
  const [status, setStatus] = useState('pending');
  const [progress, setProgress] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(null);
  const unsubscribeRef = useRef(null);
  
  const { listenToPayment, stopListeningToPayment } = usePaymentNotifications();

  useEffect(() => {
    if (paymentId) {
      // Écouter les mises à jour du paiement
      unsubscribeRef.current = listenToPayment(paymentId, (data) => {
        console.log('📊 Mise à jour paiement:', data);
        
        if (data.type === 'payment_status_update') {
          setStatus(data.payload.newStatus);
          setLastUpdate(new Date());
          onStatusChange?.(data.payload.newStatus);
          
          // Mettre à jour la progress bar
          const progressMap = {
            'pending': 20,
            'processing': 50,
            'completed': 100,
            'failed': 100
          };
          setProgress(progressMap[data.payload.newStatus] || 0);
        }
      });
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [paymentId, listenToPayment, onStatusChange]);

  const getStatusColor = () => {
    const colors = {
      'pending': '#faad14',
      'processing': '#1890ff',
      'completed': '#52c41a',
      'failed': '#ff4d4f'
    };
    return colors[status] || '#d9d9d9';
  };

  const getStatusIcon = () => {
    const icons = {
      'pending': <ExclamationCircleOutlined />,
      'processing': <LoadingOutlined />,
      'completed': <CheckCircleOutlined />,
      'failed': <CloseCircleOutlined />
    };
    return icons[status] || <LoadingOutlined />;
  };

  return (
    <Card size="small" title="🔍 Suivi du Paiement en Temps Réel">
      <Space direction="vertical" style={{ width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: getStatusColor() }}>{getStatusIcon()}</span>
          <Text strong>Statut: {status}</Text>
        </div>
        
        <Progress 
          percent={progress} 
          strokeColor={getStatusColor()}
          showInfo={false}
          size="small"
        />
        
        {lastUpdate && (
          <Text type="secondary" style={{ fontSize: 12 }}>
            Dernière mise à jour: {lastUpdate.toLocaleTimeString()}
          </Text>
        )}
      </Space>
    </Card>
  );
}

export default PaymentNotificationSystem; 