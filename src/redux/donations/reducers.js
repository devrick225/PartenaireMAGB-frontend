import actions from './actions';
/* eslint no-underscore-dangle: 0 */

const {
  DONATIONS_READ_BEGIN,
  DONATIONS_READ_SUCCESS,
  DONATIONS_READ_ERR,
  DONATION_CREATE_BEGIN,
  DONATION_CREATE_SUCCESS,
  DONATION_CREATE_ERR,
  DONATION_UPDATE_BEGIN,
  DONATION_UPDATE_SUCCESS,
  DONATION_UPDATE_ERR,
  DONATION_DELETE_BEGIN,
  DONATION_DELETE_SUCCESS,
  DONATION_DELETE_ERR,
  RECURRING_DONATIONS_READ_BEGIN,
  RECURRING_DONATIONS_READ_SUCCESS,
  RECURRING_DONATIONS_READ_ERR,
  RECURRING_DONATION_STOP_BEGIN,
  RECURRING_DONATION_STOP_SUCCESS,
  RECURRING_DONATION_STOP_ERR,
  DONATION_STATS_READ_BEGIN,
  DONATION_STATS_READ_SUCCESS,
  DONATION_STATS_READ_ERR,
  PAYMENT_PROCESS_BEGIN,
  PAYMENT_PROCESS_SUCCESS,
  PAYMENT_PROCESS_ERR,
  RECEIPT_GENERATE_BEGIN,
  RECEIPT_GENERATE_SUCCESS,
  RECEIPT_GENERATE_ERR,
  RECEIPT_DOWNLOAD_BEGIN,
  RECEIPT_DOWNLOAD_SUCCESS,
  RECEIPT_DOWNLOAD_ERR,
  DONATIONS_FILTER_UPDATE,
  DONATIONS_SEARCH_UPDATE,
} = actions;

const initialState = {
  // Liste des donations
  donations: [],
  donationsLoading: false,
  donationsError: null,

  // Pagination et filtres
  pagination: {
    current: 1,
    pageSize: 10,
    total: 0,
  },
  filters: {
    status: null,
    category: null,
    type: null,
    dateRange: null,
    amountRange: null,
  },
  searchTerm: '',

  // Donations récurrentes
  recurringDonations: [],
  recurringLoading: false,
  recurringError: null,

  // Statistiques
  stats: null,
  statsLoading: false,
  statsError: null,

  // Création de donation
  creating: false,
  createError: null,

  // Mise à jour de donation
  updating: false,
  updateError: null,

  // Suppression de donation
  deleting: false,
  deleteError: null,

  // Arrêt de donation récurrente
  stoppingRecurring: false,
  stopRecurringError: null,

  // Traitement de paiement
  processingPayment: false,
  paymentError: null,

  // Génération de reçu
  generatingReceipt: false,
  receiptError: null,

  // Téléchargement de reçu
  downloadingReceipt: false,
  downloadError: null,

  // Donation sélectionnée
  selectedDonation: null,
};

const DonationsReducer = (state = initialState, action) => {
  const { type, data, err, id, filters, searchTerm } = action;

  switch (type) {
    // Lecture des donations
    case DONATIONS_READ_BEGIN:
      return {
        ...state,
        donationsLoading: true,
        donationsError: null,
      };

    case DONATIONS_READ_SUCCESS:
      return {
        ...state,
        donations: data.donations || data.docs || data,
        pagination: {
          current: data.page || 1,
          pageSize: data.limit || 10,
          total: data.totalDocs || data.total || (Array.isArray(data) ? data.length : 0),
        },
        donationsLoading: false,
        donationsError: null,
      };

    case DONATIONS_READ_ERR:
      return {
        ...state,
        donationsLoading: false,
        donationsError: err,
      };

    // Création de donation
    case DONATION_CREATE_BEGIN:
      return {
        ...state,
        creating: true,
        createError: null,
      };

    case DONATION_CREATE_SUCCESS:
      return {
        ...state,
        donations: [data, ...state.donations],
        creating: false,
        createError: null,
      };

    case DONATION_CREATE_ERR:
      return {
        ...state,
        creating: false,
        createError: err,
      };

    // Mise à jour de donation
    case DONATION_UPDATE_BEGIN:
      return {
        ...state,
        updating: true,
        updateError: null,
      };

    case DONATION_UPDATE_SUCCESS:
      return {
        ...state,
        donations: state.donations.map((donation) => (donation._id === data._id ? data : donation)),
        selectedDonation: state.selectedDonation?._id === data._id ? data : state.selectedDonation,
        updating: false,
        updateError: null,
      };

    case DONATION_UPDATE_ERR:
      return {
        ...state,
        updating: false,
        updateError: err,
      };

    // Suppression de donation
    case DONATION_DELETE_BEGIN:
      return {
        ...state,
        deleting: true,
        deleteError: null,
      };

    case DONATION_DELETE_SUCCESS:
      return {
        ...state,
        donations: state.donations.filter((donation) => donation._id !== id),
        deleting: false,
        deleteError: null,
      };

    case DONATION_DELETE_ERR:
      return {
        ...state,
        deleting: false,
        deleteError: err,
      };

    // Donations récurrentes
    case RECURRING_DONATIONS_READ_BEGIN:
      return {
        ...state,
        recurringLoading: true,
        recurringError: null,
      };

    case RECURRING_DONATIONS_READ_SUCCESS:
      return {
        ...state,
        recurringDonations: Array.isArray(data) ? data : [],
        recurringLoading: false,
        recurringError: null,
      };

    case RECURRING_DONATIONS_READ_ERR:
      return {
        ...state,
        recurringDonations: [],
        recurringLoading: false,
        recurringError: err,
      };

    // Arrêt donation récurrente
    case RECURRING_DONATION_STOP_BEGIN:
      return {
        ...state,
        stoppingRecurring: true,
        stopRecurringError: null,
      };

    case RECURRING_DONATION_STOP_SUCCESS:
      return {
        ...state,
        recurringDonations: state.recurringDonations.map((donation) =>
          donation._id === id ? { ...donation, recurring: { ...donation.recurring, isActive: false } } : donation,
        ),
        donations: state.donations.map((donation) =>
          donation._id === id ? { ...donation, recurring: { ...donation.recurring, isActive: false } } : donation,
        ),
        stoppingRecurring: false,
        stopRecurringError: null,
      };

    case RECURRING_DONATION_STOP_ERR:
      return {
        ...state,
        stoppingRecurring: false,
        stopRecurringError: err,
      };

    // Statistiques
    case DONATION_STATS_READ_BEGIN:
      return {
        ...state,
        statsLoading: true,
        statsError: null,
      };

    case DONATION_STATS_READ_SUCCESS:
      return {
        ...state,
        stats: data,
        statsLoading: false,
        statsError: null,
      };

    case DONATION_STATS_READ_ERR:
      return {
        ...state,
        statsLoading: false,
        statsError: err,
      };

    // Traitement de paiement
    case PAYMENT_PROCESS_BEGIN:
      return {
        ...state,
        processingPayment: true,
        paymentError: null,
      };

    case PAYMENT_PROCESS_SUCCESS:
      return {
        ...state,
        donations: state.donations.map((donation) => (donation._id === data._id ? data : donation)),
        processingPayment: false,
        paymentError: null,
      };

    case PAYMENT_PROCESS_ERR:
      return {
        ...state,
        processingPayment: false,
        paymentError: err,
      };

    // Génération de reçu
    case RECEIPT_GENERATE_BEGIN:
      return {
        ...state,
        generatingReceipt: true,
        receiptError: null,
      };

    case RECEIPT_GENERATE_SUCCESS:
      return {
        ...state,
        donations: state.donations.map((donation) => (donation._id === data._id ? data : donation)),
        generatingReceipt: false,
        receiptError: null,
      };

    case RECEIPT_GENERATE_ERR:
      return {
        ...state,
        generatingReceipt: false,
        receiptError: err,
      };

    // Téléchargement de reçu
    case RECEIPT_DOWNLOAD_BEGIN:
      return {
        ...state,
        downloadingReceipt: true,
        downloadError: null,
      };

    case RECEIPT_DOWNLOAD_SUCCESS:
      return {
        ...state,
        downloadingReceipt: false,
        downloadError: null,
      };

    case RECEIPT_DOWNLOAD_ERR:
      return {
        ...state,
        downloadingReceipt: false,
        downloadError: err,
      };

    // Filtres et recherche
    case DONATIONS_FILTER_UPDATE:
      return {
        ...state,
        filters: { ...state.filters, ...filters },
      };

    case DONATIONS_SEARCH_UPDATE:
      return {
        ...state,
        searchTerm,
      };

    default:
      return state;
  }
};

export default DonationsReducer;
