import actions from './actions';
import { DataService } from '../../config/dataService/dataService';

const {
  donationsReadBegin,
  donationsReadSuccess,
  donationsReadErr,
  donationCreateBegin,
  donationCreateSuccess,
  donationCreateErr,
  donationUpdateBegin,
  donationUpdateSuccess,
  donationUpdateErr,
  donationDeleteBegin,
  donationDeleteSuccess,
  donationDeleteErr,
  recurringDonationsReadBegin,
  recurringDonationsReadSuccess,
  recurringDonationsReadErr,
  recurringDonationStopBegin,
  recurringDonationStopSuccess,
  recurringDonationStopErr,
  donationStatsReadBegin,
  donationStatsReadSuccess,
  donationStatsReadErr,
  paymentProcessBegin,
  paymentProcessSuccess,
  paymentProcessErr,
  receiptGenerateBegin,
  receiptGenerateSuccess,
  receiptGenerateErr,
  receiptDownloadBegin,
  receiptDownloadSuccess,
  receiptDownloadErr,
  donationsFilterUpdate,
  donationsSearchUpdate,
} = actions;

// Lire toutes les donations avec pagination et filtres
const donationsReadData = (params = {}) => {
  return async (dispatch) => {
    try {
      dispatch(donationsReadBegin());

      const queryParams = new URLSearchParams();

      // Pagination
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);

      // Filtres
      if (params.status) queryParams.append('status', params.status);
      if (params.category) queryParams.append('category', params.category);
      if (params.type) queryParams.append('type', params.type);
      if (params.search) queryParams.append('search', params.search);
      if (params.dateFrom) queryParams.append('dateFrom', params.dateFrom);
      if (params.dateTo) queryParams.append('dateTo', params.dateTo);
      if (params.amountMin) queryParams.append('amountMin', params.amountMin);
      if (params.amountMax) queryParams.append('amountMax', params.amountMax);

      // Option pour inclure toutes les donations (pas seulement les complétées)
      if (params.includeAll) queryParams.append('includeAll', 'true');

      const response = await DataService.get(`/donations?${queryParams.toString()}`);
      dispatch(donationsReadSuccess(response.data.data));
    } catch (err) {
      dispatch(donationsReadErr(err));
    }
  };
};

// Créer une nouvelle donation
const donationCreateData = (donationData) => {
  return async (dispatch) => {
    try {
      dispatch(donationCreateBegin());

      console.log('🚀 === ENVOI DONATION AU BACKEND ===');
      console.log('donationData envoyée:', donationData);

      const response = await DataService.post('/donations', donationData);

      console.log('✅ === RÉPONSE BACKEND BRUTE ===');
      console.log('response.data:', response.data);
      console.log('response.data.data:', response.data.data);
      console.log('response.data.data.donation:', response.data.data?.donation);

      // Le backend retourne { success: true, data: { donation: {...} } }
      // On doit extraire les données de la donation
      const donationResult = response.data.data?.donation || response.data.data;

      console.log('📊 === DONATION EXTRAITE ===');
      console.log('donationResult:', donationResult);
      console.log('donationResult.amount:', donationResult?.amount);
      console.log('donationResult.currency:', donationResult?.currency);
      console.log('=== FIN DEBUG ACTION CREATOR ===');

      dispatch(donationCreateSuccess(donationResult));
      return donationResult;
    } catch (err) {
      console.error('❌ Erreur dans donationCreateData:', err);
      dispatch(donationCreateErr(err));
      throw err;
    }
  };
};

// Mettre à jour une donation
const donationUpdateData = (id, donationData) => {
  return async (dispatch) => {
    try {
      dispatch(donationUpdateBegin());
      const response = await DataService.put(`/donations/${id}`, donationData);
      dispatch(donationUpdateSuccess(response.data.data));
      return response.data.data;
    } catch (err) {
      dispatch(donationUpdateErr(err));
      throw err;
    }
  };
};

// Supprimer une donation
const donationDeleteData = (id) => {
  return async (dispatch) => {
    try {
      dispatch(donationDeleteBegin());
      await DataService.delete(`/donations/${id}`);
      dispatch(donationDeleteSuccess(id));
    } catch (err) {
      dispatch(donationDeleteErr(err));
      throw err;
    }
  };
};

// Lire les donations récurrentes
const recurringDonationsReadData = () => {
  return async (dispatch) => {
    try {
      dispatch(recurringDonationsReadBegin());
      const response = await DataService.get('/donations/recurring');

      // S'assurer que les données sont bien un tableau
      const donations = response.data.data?.donations || response.data.data || [];
      console.log('Donations récurrentes récupérées:', donations);

      dispatch(recurringDonationsReadSuccess(Array.isArray(donations) ? donations : []));
    } catch (err) {
      console.error('Erreur récupération donations récurrentes:', err);
      dispatch(recurringDonationsReadErr(err));
    }
  };
};

// Arrêter une donation récurrente
const stopRecurringDonation = (id, reason = "Arrêté par l'utilisateur") => {
  return async (dispatch) => {
    try {
      dispatch(recurringDonationStopBegin());
      await DataService.post(`/donations/${id}/stop-recurring`, { reason });
      dispatch(recurringDonationStopSuccess(id));
    } catch (err) {
      dispatch(recurringDonationStopErr(err));
      throw err;
    }
  };
};

// Obtenir les statistiques des donations
const donationStatsReadData = (filters = {}) => {
  return async (dispatch) => {
    try {
      dispatch(donationStatsReadBegin());

      console.log('=== CHARGEMENT STATS DONATIONS ===');
      console.log('Filtres envoyés:', filters);

      const queryParams = new URLSearchParams();
      if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) queryParams.append('dateTo', filters.dateTo);
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.period) queryParams.append('period', filters.period);

      const url = `/donations/stats?${queryParams.toString()}`;
      console.log('URL appelée:', url);

      const response = await DataService.get(url);
      console.log('Réponse reçue:', response.data);

      // Extraire les bonnes données selon la structure du backend
      const statsData = response.data.data?.stats || response.data.data || response.data;
      console.log('Stats extraites:', statsData);

      dispatch(donationStatsReadSuccess(statsData));
    } catch (err) {
      console.error('Erreur chargement stats:', err);
      dispatch(donationStatsReadErr(err));
    }
  };
};

// Traiter un paiement
const processPayment = (donationId, paymentData) => {
  return async (dispatch) => {
    try {
      dispatch(paymentProcessBegin());
      const response = await DataService.post(`/donations/${donationId}/process-payment`, paymentData);
      dispatch(paymentProcessSuccess(response.data.data));
      return response.data.data;
    } catch (err) {
      dispatch(paymentProcessErr(err));
      throw err;
    }
  };
};

// Générer un reçu
const generateReceipt = (donationId) => {
  return async (dispatch) => {
    try {
      dispatch(receiptGenerateBegin());
      const response = await DataService.post(`/donations/${donationId}/generate-receipt`);
      dispatch(receiptGenerateSuccess(response.data.data));
      return response.data.data;
    } catch (err) {
      dispatch(receiptGenerateErr(err));
      throw err;
    }
  };
};

// Télécharger un reçu
const downloadReceipt = (donationId) => {
  return async (dispatch) => {
    try {
      dispatch(receiptDownloadBegin());
      const response = await DataService.get(`/donations/${donationId}/download-receipt`, {
        responseType: 'blob',
      });

      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `recu-donation-${donationId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      dispatch(receiptDownloadSuccess());
    } catch (err) {
      dispatch(receiptDownloadErr(err));
      throw err;
    }
  };
};

// Obtenir une donation par ID
const getDonationById = (id) => {
  return async (dispatch) => {
    try {
      dispatch(donationsReadBegin());
      const response = await DataService.get(`/donations/${id}`);
      const donationData = response.data.data;

      // Pas d'action spécifique pour une seule donation, on peut utiliser donationsReadSuccess
      // ou simplement retourner les données
      dispatch(donationsReadSuccess({ donations: [donationData], single: true }));
      return donationData;
    } catch (err) {
      dispatch(donationsReadErr(err));
      throw err;
    }
  };
};

// Obtenir les donations dues aujourd'hui (pour les récurrentes)
const getDonationsDueToday = () => {
  return async () => {
    try {
      const response = await DataService.get('/donations/due-today');
      return response.data.data;
    } catch (err) {
      throw err;
    }
  };
};

// Valider les données de donation avant création
const validateDonationData = (data) => {
  const errors = [];

  if (!data.amount || data.amount < 100) {
    errors.push('Le montant minimum est de 100 XOF');
  }

  if (!data.category) {
    errors.push('La catégorie est requise');
  }

  if (!data.paymentMethod) {
    errors.push('La méthode de paiement est requise');
  }

  if (data.type === 'recurring') {
    if (!data.recurring?.frequency) {
      errors.push('La fréquence est requise pour les dons récurrents');
    }

    if (!data.recurring?.startDate) {
      errors.push('La date de début est requise pour les dons récurrents');
    }

    if (data.recurring?.frequency === 'weekly' && data.recurring?.dayOfWeek === undefined) {
      errors.push('Le jour de la semaine est requis pour les dons hebdomadaires');
    }

    if (['monthly', 'quarterly', 'yearly'].includes(data.recurring?.frequency) && !data.recurring?.dayOfMonth) {
      errors.push('Le jour du mois est requis pour cette fréquence');
    }
  }

  return errors;
};

// Calculer la prochaine date de paiement côté client
const calculateNextPaymentDate = (recurring) => {
  const moment = require('moment');

  if (!recurring || !recurring.frequency) return null;

  const { frequency, interval = 1, dayOfWeek, dayOfMonth, startDate } = recurring;
  const nextDate = moment(startDate);

  switch (frequency) {
    case 'daily':
      nextDate.add(interval, 'days');
      break;

    case 'weekly':
      if (dayOfWeek !== undefined) {
        nextDate.day(dayOfWeek);
        if (nextDate.isSameOrBefore(moment())) {
          nextDate.add(interval, 'weeks');
        }
      } else {
        nextDate.add(interval, 'weeks');
      }
      break;

    case 'monthly':
      if (dayOfMonth) {
        nextDate.date(dayOfMonth);
        if (nextDate.isSameOrBefore(moment())) {
          nextDate.add(interval, 'months').date(dayOfMonth);
        }
      } else {
        nextDate.add(interval, 'months');
      }
      break;

    case 'quarterly':
      if (dayOfMonth) {
        nextDate.date(dayOfMonth);
        if (nextDate.isSameOrBefore(moment())) {
          nextDate.add(interval * 3, 'months').date(dayOfMonth);
        }
      } else {
        nextDate.add(interval * 3, 'months');
      }
      break;

    case 'yearly':
      if (dayOfMonth) {
        nextDate.date(dayOfMonth);
        if (nextDate.isSameOrBefore(moment())) {
          nextDate.add(interval, 'years');
        }
      } else {
        nextDate.add(interval, 'years');
      }
      break;

    default:
      return null;
  }

  return nextDate.toDate();
};

// Mettre à jour les filtres
const updateFilters = (filters) => {
  return (dispatch) => {
    dispatch(donationsFilterUpdate(filters));
  };
};

// Mettre à jour la recherche
const updateSearch = (searchTerm) => {
  return (dispatch) => {
    dispatch(donationsSearchUpdate(searchTerm));
  };
};

// Exporter toutes les donations (pour admin)
const exportDonations = (filters = {}) => {
  return async () => {
    try {
      const queryParams = new URLSearchParams();
      Object.keys(filters).forEach((key) => {
        if (filters[key]) queryParams.append(key, filters[key]);
      });

      const response = await DataService.get(`/donations/export?${queryParams.toString()}`, {
        responseType: 'blob',
      });

      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `donations-export-${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      throw err;
    }
  };
};

// Vérification manuelle des paiements (admin/trésorier)
const verifyPaymentsManually = () => {
  // eslint-disable-next-line no-unused-vars
  return async (dispatch) => {
    try {
      const response = await DataService.post('/donations/verify-payments');
      return response.data;
    } catch (err) {
      throw err;
    }
  };
};

// Obtenir le statut des tâches cron (admin)
const getCronJobsStatus = () => {
  // eslint-disable-next-line no-unused-vars
  return async (dispatch) => {
    try {
      const response = await DataService.get('/donations/cron-status');
      return response.data;
    } catch (err) {
      throw err;
    }
  };
};

export {
  donationsReadData,
  donationCreateData,
  donationUpdateData,
  donationDeleteData,
  recurringDonationsReadData,
  stopRecurringDonation,
  donationStatsReadData,
  processPayment,
  generateReceipt,
  downloadReceipt,
  getDonationById,
  getDonationsDueToday,
  validateDonationData,
  calculateNextPaymentDate,
  updateFilters,
  updateSearch,
  exportDonations,
  verifyPaymentsManually,
  getCronJobsStatus,
};
