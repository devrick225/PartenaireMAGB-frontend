const actions = {
  // Actions pour lire les donations
  DONATIONS_READ_BEGIN: 'DONATIONS_READ_BEGIN',
  DONATIONS_READ_SUCCESS: 'DONATIONS_READ_SUCCESS',
  DONATIONS_READ_ERR: 'DONATIONS_READ_ERR',

  // Actions pour créer une donation
  DONATION_CREATE_BEGIN: 'DONATION_CREATE_BEGIN',
  DONATION_CREATE_SUCCESS: 'DONATION_CREATE_SUCCESS',
  DONATION_CREATE_ERR: 'DONATION_CREATE_ERR',

  // Actions pour mettre à jour une donation
  DONATION_UPDATE_BEGIN: 'DONATION_UPDATE_BEGIN',
  DONATION_UPDATE_SUCCESS: 'DONATION_UPDATE_SUCCESS',
  DONATION_UPDATE_ERR: 'DONATION_UPDATE_ERR',

  // Actions pour supprimer une donation
  DONATION_DELETE_BEGIN: 'DONATION_DELETE_BEGIN',
  DONATION_DELETE_SUCCESS: 'DONATION_DELETE_SUCCESS',
  DONATION_DELETE_ERR: 'DONATION_DELETE_ERR',

  // Actions pour les donations récurrentes
  RECURRING_DONATIONS_READ_BEGIN: 'RECURRING_DONATIONS_READ_BEGIN',
  RECURRING_DONATIONS_READ_SUCCESS: 'RECURRING_DONATIONS_READ_SUCCESS',
  RECURRING_DONATIONS_READ_ERR: 'RECURRING_DONATIONS_READ_ERR',

  RECURRING_DONATION_STOP_BEGIN: 'RECURRING_DONATION_STOP_BEGIN',
  RECURRING_DONATION_STOP_SUCCESS: 'RECURRING_DONATION_STOP_SUCCESS',
  RECURRING_DONATION_STOP_ERR: 'RECURRING_DONATION_STOP_ERR',

  // Actions pour les statistiques
  DONATION_STATS_READ_BEGIN: 'DONATION_STATS_READ_BEGIN',
  DONATION_STATS_READ_SUCCESS: 'DONATION_STATS_READ_SUCCESS',
  DONATION_STATS_READ_ERR: 'DONATION_STATS_READ_ERR',

  // Actions pour les paiements
  PAYMENT_PROCESS_BEGIN: 'PAYMENT_PROCESS_BEGIN',
  PAYMENT_PROCESS_SUCCESS: 'PAYMENT_PROCESS_SUCCESS',
  PAYMENT_PROCESS_ERR: 'PAYMENT_PROCESS_ERR',

  // Actions pour les reçus
  RECEIPT_GENERATE_BEGIN: 'RECEIPT_GENERATE_BEGIN',
  RECEIPT_GENERATE_SUCCESS: 'RECEIPT_GENERATE_SUCCESS',
  RECEIPT_GENERATE_ERR: 'RECEIPT_GENERATE_ERR',

  RECEIPT_DOWNLOAD_BEGIN: 'RECEIPT_DOWNLOAD_BEGIN',
  RECEIPT_DOWNLOAD_SUCCESS: 'RECEIPT_DOWNLOAD_SUCCESS',
  RECEIPT_DOWNLOAD_ERR: 'RECEIPT_DOWNLOAD_ERR',

  // Actions pour filtrer et rechercher
  DONATIONS_FILTER_UPDATE: 'DONATIONS_FILTER_UPDATE',
  DONATIONS_SEARCH_UPDATE: 'DONATIONS_SEARCH_UPDATE',

  // Action creators pour les donations
  donationsReadBegin: () => ({
    type: actions.DONATIONS_READ_BEGIN,
  }),

  donationsReadSuccess: (data) => ({
    type: actions.DONATIONS_READ_SUCCESS,
    data,
  }),

  donationsReadErr: (err) => ({
    type: actions.DONATIONS_READ_ERR,
    err,
  }),

  donationCreateBegin: () => ({
    type: actions.DONATION_CREATE_BEGIN,
  }),

  donationCreateSuccess: (data) => ({
    type: actions.DONATION_CREATE_SUCCESS,
    data,
  }),

  donationCreateErr: (err) => ({
    type: actions.DONATION_CREATE_ERR,
    err,
  }),

  donationUpdateBegin: () => ({
    type: actions.DONATION_UPDATE_BEGIN,
  }),

  donationUpdateSuccess: (data) => ({
    type: actions.DONATION_UPDATE_SUCCESS,
    data,
  }),

  donationUpdateErr: (err) => ({
    type: actions.DONATION_UPDATE_ERR,
    err,
  }),

  donationDeleteBegin: () => ({
    type: actions.DONATION_DELETE_BEGIN,
  }),

  donationDeleteSuccess: (id) => ({
    type: actions.DONATION_DELETE_SUCCESS,
    id,
  }),

  donationDeleteErr: (err) => ({
    type: actions.DONATION_DELETE_ERR,
    err,
  }),

  // Action creators pour les donations récurrentes
  recurringDonationsReadBegin: () => ({
    type: actions.RECURRING_DONATIONS_READ_BEGIN,
  }),

  recurringDonationsReadSuccess: (data) => ({
    type: actions.RECURRING_DONATIONS_READ_SUCCESS,
    data,
  }),

  recurringDonationsReadErr: (err) => ({
    type: actions.RECURRING_DONATIONS_READ_ERR,
    err,
  }),

  recurringDonationStopBegin: () => ({
    type: actions.RECURRING_DONATION_STOP_BEGIN,
  }),

  recurringDonationStopSuccess: (id) => ({
    type: actions.RECURRING_DONATION_STOP_SUCCESS,
    id,
  }),

  recurringDonationStopErr: (err) => ({
    type: actions.RECURRING_DONATION_STOP_ERR,
    err,
  }),

  // Action creators pour les statistiques
  donationStatsReadBegin: () => ({
    type: actions.DONATION_STATS_READ_BEGIN,
  }),

  donationStatsReadSuccess: (data) => ({
    type: actions.DONATION_STATS_READ_SUCCESS,
    data,
  }),

  donationStatsReadErr: (err) => ({
    type: actions.DONATION_STATS_READ_ERR,
    err,
  }),

  // Action creators pour les paiements
  paymentProcessBegin: () => ({
    type: actions.PAYMENT_PROCESS_BEGIN,
  }),

  paymentProcessSuccess: (data) => ({
    type: actions.PAYMENT_PROCESS_SUCCESS,
    data,
  }),

  paymentProcessErr: (err) => ({
    type: actions.PAYMENT_PROCESS_ERR,
    err,
  }),

  // Action creators pour les reçus
  receiptGenerateBegin: () => ({
    type: actions.RECEIPT_GENERATE_BEGIN,
  }),

  receiptGenerateSuccess: (data) => ({
    type: actions.RECEIPT_GENERATE_SUCCESS,
    data,
  }),

  receiptGenerateErr: (err) => ({
    type: actions.RECEIPT_GENERATE_ERR,
    err,
  }),

  receiptDownloadBegin: () => ({
    type: actions.RECEIPT_DOWNLOAD_BEGIN,
  }),

  receiptDownloadSuccess: () => ({
    type: actions.RECEIPT_DOWNLOAD_SUCCESS,
  }),

  receiptDownloadErr: (err) => ({
    type: actions.RECEIPT_DOWNLOAD_ERR,
    err,
  }),

  // Action creators pour filtres et recherche
  donationsFilterUpdate: (filters) => ({
    type: actions.DONATIONS_FILTER_UPDATE,
    filters,
  }),

  donationsSearchUpdate: (searchTerm) => ({
    type: actions.DONATIONS_SEARCH_UPDATE,
    searchTerm,
  }),
};

export default actions;
