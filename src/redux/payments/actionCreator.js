import {
  paymentInitializeRequest,
  paymentInitializeSuccess,
  paymentInitializeFailure,
  paymentVerifyRequest,
  paymentVerifySuccess,
  paymentVerifyFailure,
  paymentGetRequest,
  paymentGetSuccess,
  paymentGetFailure,
  paymentsListRequest,
  paymentsListSuccess,
  paymentsListFailure,
  paymentRefundRequest,
  paymentRefundSuccess,
  paymentRefundFailure,
  paymentStatsRequest,
  paymentStatsSuccess,
  paymentStatsFailure,
  clearPaymentErrors,
} from './actions';
import { DataService } from '../../config/dataService/dataService';

// @desc    Initialiser un paiement
export const initializePayment = (paymentData) => async (dispatch) => {
  try {
    dispatch(paymentInitializeRequest());

    const response = await DataService.post('/payments/initialize', paymentData);

    if (response.data.success) {
      dispatch(paymentInitializeSuccess(response.data.data));
      return response.data.data;
    }
    dispatch(paymentInitializeFailure(response.data.error));
    throw new Error(response.data.error);
  } catch (error) {
    const errorMessage = error.response?.data?.error || error.message || "Erreur lors de l'initialisation du paiement";
    dispatch(paymentInitializeFailure(errorMessage));
    throw error;
  }
};

// @desc    Vérifier un paiement
export const verifyPayment = (paymentId) => async (dispatch) => {
  try {
    dispatch(paymentVerifyRequest());

    const response = await DataService.post(`/payments/${paymentId}/verify`);

    if (response.data.success) {
      dispatch(paymentVerifySuccess(response.data.data));
      return response.data.data;
    }
    dispatch(paymentVerifyFailure(response.data.error));
    throw new Error(response.data.error);
  } catch (error) {
    const errorMessage = error.response?.data?.error || error.message || 'Erreur lors de la vérification du paiement';
    dispatch(paymentVerifyFailure(errorMessage));
    throw error;
  }
};

// @desc    Obtenir les détails d'un paiement
export const getPaymentById = (paymentId) => async (dispatch) => {
  try {
    dispatch(paymentGetRequest());

    const response = await DataService.get(`/payments/${paymentId}`);

    if (response.data.success) {
      dispatch(paymentGetSuccess(response.data.data.payment));
      return response.data.data.payment;
    }
    dispatch(paymentGetFailure(response.data.error));
    throw new Error(response.data.error);
  } catch (error) {
    const errorMessage = error.response?.data?.error || error.message || 'Erreur lors de la récupération du paiement';
    dispatch(paymentGetFailure(errorMessage));
    throw error;
  }
};

// @desc    Obtenir la liste des paiements
export const getPaymentsList =
  (filters = {}) =>
  async (dispatch) => {
    try {
      dispatch(paymentsListRequest());

      const queryParams = new URLSearchParams();

      // Ajouter les paramètres de pagination
      queryParams.append('page', filters.page || 1);
      queryParams.append('limit', filters.limit || 10);

      // Ajouter les filtres
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.provider) queryParams.append('provider', filters.provider);
      if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) queryParams.append('dateTo', filters.dateTo);

      const response = await DataService.get(`/payments?${queryParams.toString()}`);

      if (response.data.success) {
        dispatch(paymentsListSuccess(response.data.data));
        return response.data.data;
      }
      dispatch(paymentsListFailure(response.data.error));
      throw new Error(response.data.error);
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || error.message || 'Erreur lors de la récupération des paiements';
      dispatch(paymentsListFailure(errorMessage));
      throw error;
    }
  };

// @desc    Rembourser un paiement
export const refundPayment = (paymentId, refundData) => async (dispatch) => {
  try {
    dispatch(paymentRefundRequest());

    const response = await DataService.post(`/payments/${paymentId}/refund`, refundData);

    if (response.data.success) {
      dispatch(
        paymentRefundSuccess({
          ...response.data.data,
          paymentId,
        }),
      );
      return response.data.data;
    }
    dispatch(paymentRefundFailure(response.data.error));
    throw new Error(response.data.error);
  } catch (error) {
    const errorMessage = error.response?.data?.error || error.message || 'Erreur lors du remboursement';
    dispatch(paymentRefundFailure(errorMessage));
    throw error;
  }
};

// @desc    Obtenir les statistiques des paiements
export const getPaymentStats =
  (filters = {}) =>
  async (dispatch) => {
    try {
      dispatch(paymentStatsRequest());

      const queryParams = new URLSearchParams();

      if (filters.period) queryParams.append('period', filters.period);
      if (filters.provider) queryParams.append('provider', filters.provider);
      if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) queryParams.append('dateTo', filters.dateTo);

      const response = await DataService.get(`/payments/stats?${queryParams.toString()}`);

      if (response.data.success) {
        dispatch(paymentStatsSuccess(response.data.data.stats));
        return response.data.data.stats;
      }
      dispatch(paymentStatsFailure(response.data.error));
      throw new Error(response.data.error);
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || error.message || 'Erreur lors de la récupération des statistiques';
      dispatch(paymentStatsFailure(errorMessage));
      throw error;
    }
  };

// @desc    Effacer les erreurs de paiement
export const clearErrors = () => (dispatch) => {
  dispatch(clearPaymentErrors());
};

// @desc    Obtenir les fournisseurs de paiement disponibles
export const getAvailableProviders = () => async (dispatch, getState) => {
  // Pour l'instant, on utilise la liste statique du reducer
  // Mais cela pourrait être récupéré dynamiquement du backend
  const { providers } = getState().payments;
  return providers;
};

// @desc    Valider les données de paiement
export const validatePaymentData = (paymentData) => {
  const errors = [];

  if (!paymentData.donationId) {
    errors.push("L'ID de la donation est requis");
  }

  if (!paymentData.provider) {
    errors.push('Le fournisseur de paiement est requis');
  }

  if (!paymentData.paymentMethod) {
    errors.push('La méthode de paiement est requise');
  }

  // Validation spécifique pour mobile money
  if (['orange_money', 'mtn_mobile_money', 'moov_money', 'fusionpay', 'moneyfusion'].includes(paymentData.provider)) {
    if (!paymentData.customerPhone) {
      errors.push('Le numéro de téléphone est requis pour le paiement mobile');
    } else {
      // Validation du format du numéro de téléphone
      const phoneRegex = /^(\+225|225)?[0-9]{8,10}$/;
      if (!phoneRegex.test(paymentData.customerPhone.replace(/\s/g, ''))) {
        errors.push('Format de numéro de téléphone invalide');
      }
    }
  }

  return errors;
};

// @desc    Calculer les frais de paiement (côté client pour estimation)
export const calculatePaymentFees = (amount, provider, currency = 'XOF') => {
  let feePercentage = 0;
  let fixedFee = 0;

  switch (provider) {
    case 'cinetpay':
      feePercentage = 3.5; // 3.5%
      fixedFee = 0;
      break;
    case 'stripe':
      feePercentage = 2.9; // 2.9%
      fixedFee = currency === 'USD' ? 30 : 0; // 30 cents USD
      break;
    case 'paypal':
      feePercentage = 3.4; // 3.4%
      fixedFee = 0;
      break;
    case 'fusionpay':
      feePercentage = 2.5; // 2.5%
      fixedFee = 0;
      break;
    case 'moneyfusion':
      feePercentage = 1.5; // 1.5%
      fixedFee = 0;
      break;
    case 'orange_money':
    case 'mtn_mobile_money':
    case 'moov_money':
      feePercentage = 1.0; // 1%
      fixedFee = 0;
      break;
    default:
      feePercentage = 3.0; // 3% par défaut
      fixedFee = 0;
  }

  const percentageFee = (amount * feePercentage) / 100;
  const totalFee = percentageFee + fixedFee;

  return {
    percentageFee: Math.round(percentageFee),
    fixedFee,
    totalFee: Math.round(totalFee),
    amountWithFees: amount + Math.round(totalFee),
    feePercentage,
  };
};

// @desc    Obtenir le statut d'un paiement en temps réel
export const pollPaymentStatus =
  (paymentId, maxAttempts = 10) =>
  async (dispatch) => {
    let attempts = 0;

    const poll = async () => {
      try {
        // eslint-disable-next-line no-plusplus
        attempts++;
        const payment = await dispatch(getPaymentById(paymentId));

        // Si le paiement est complété ou échoué, arrêter le polling
        if (['completed', 'failed', 'cancelled', 'refunded'].includes(payment.status)) {
          return payment;
        }

        // Si on n'a pas atteint le max d'tentatives, continuer le polling
        if (attempts < maxAttempts) {
          setTimeout(poll, 3000); // Attendre 3 secondes avant le prochain essai
        }

        return payment;
      } catch (error) {
        console.error('Erreur lors du polling du statut:', error);
        if (attempts < maxAttempts) {
          setTimeout(poll, 5000); // Attendre 5 secondes en cas d'erreur
        }
      }
    };

    return poll();
  };

// @desc    Écouter les webhooks de confirmation en temps réel
export const setupPaymentWebhookListener = (paymentId, onStatusUpdate) => {
  // Utilise WebSocket ou Server-Sent Events pour les mises à jour temps réel
  const eventSource = new EventSource(`${process.env.REACT_APP_API_ENDPOINT}/payments/${paymentId}/events`);

  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'payment_status_update') {
      onStatusUpdate(data.payment);
    }
  };

  eventSource.onerror = () => {
    console.error('Erreur de connexion webhook');
    eventSource.close();
  };

  return eventSource;
};

// @desc    Traitement de paiement récurrent automatique
export const processRecurringPayment = (donationId) => async () => {
  try {
    const response = await DataService.post(`/payments/${donationId}/process-recurring`);

    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.error);
  } catch (error) {
    console.error('Erreur traitement récurrent:', error);
    throw error;
  }
};
