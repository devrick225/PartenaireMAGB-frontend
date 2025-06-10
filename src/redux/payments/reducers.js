import {
  PAYMENT_INITIALIZE_REQUEST,
  PAYMENT_INITIALIZE_SUCCESS,
  PAYMENT_INITIALIZE_FAILURE,
  PAYMENT_VERIFY_REQUEST,
  PAYMENT_VERIFY_SUCCESS,
  PAYMENT_VERIFY_FAILURE,
  PAYMENT_GET_REQUEST,
  PAYMENT_GET_SUCCESS,
  PAYMENT_GET_FAILURE,
  PAYMENTS_LIST_REQUEST,
  PAYMENTS_LIST_SUCCESS,
  PAYMENTS_LIST_FAILURE,
  PAYMENT_REFUND_REQUEST,
  PAYMENT_REFUND_SUCCESS,
  PAYMENT_REFUND_FAILURE,
  PAYMENT_STATS_REQUEST,
  PAYMENT_STATS_SUCCESS,
  PAYMENT_STATS_FAILURE,
  CLEAR_PAYMENT_ERRORS,
  RESET_PAYMENT_STATE,
} from './actions';

const initialState = {
  // État pour l'initialisation de paiement
  initializing: false,
  initializeError: null,
  paymentUrl: null,
  clientSecret: null,
  transactionId: null,
  currentPayment: null,

  // État pour la vérification de paiement
  verifying: false,
  verifyError: null,
  verificationResult: null,

  // État pour les détails d'un paiement
  loading: false,
  payment: null,
  paymentError: null,

  // État pour la liste des paiements
  payments: [],
  paymentsLoading: false,
  paymentsError: null,
  pagination: {
    current: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  },

  // État pour les remboursements
  refunding: false,
  refundError: null,
  refundResult: null,

  // État pour les statistiques
  stats: null,
  statsLoading: false,
  statsError: null,

  // Filtres et recherche
  filters: {
    status: null,
    provider: null,
    dateFrom: null,
    dateTo: null,
  },

  // Fournisseurs de paiement disponibles - Pour l'instant seulement MoneyFusion
  providers: [
    {
      key: 'moneyfusion',
      name: 'MoneyFusion',
      icon: '💳',
      methods: ['mobile_money', 'card'],
      description: 'Mobile Money (Orange, MTN, Moov) et Cartes bancaires',
      active: true,
    },
    // Autres providers désactivés temporairement
    // {
    //   key: 'cinetpay',
    //   name: 'CinetPay',
    //   icon: '💳',
    //   methods: ['card', 'mobile_money'],
    //   active: false,
    // },
    // {
    //   key: 'stripe',
    //   name: 'Stripe',
    //   icon: '💳',
    //   methods: ['card'],
    //   active: false,
    // },
    // {
    //   key: 'paypal',
    //   name: 'PayPal',
    //   icon: '💸',
    //   methods: ['paypal'],
    //   active: false,
    // },
  ],
};

const paymentsReducer = (state = initialState, action) => {
  switch (action.type) {
    // Initialisation de paiement
    case PAYMENT_INITIALIZE_REQUEST:
      return {
        ...state,
        initializing: true,
        initializeError: null,
        paymentUrl: null,
        clientSecret: null,
        transactionId: null,
      };

    case PAYMENT_INITIALIZE_SUCCESS:
      return {
        ...state,
        initializing: false,
        initializeError: null,
        paymentUrl: action.payload.paymentUrl,
        clientSecret: action.payload.clientSecret,
        transactionId: action.payload.transactionId,
        currentPayment: action.payload,
      };

    case PAYMENT_INITIALIZE_FAILURE:
      return {
        ...state,
        initializing: false,
        initializeError: action.payload,
        paymentUrl: null,
        clientSecret: null,
        transactionId: null,
      };

    // Vérification de paiement
    case PAYMENT_VERIFY_REQUEST:
      return {
        ...state,
        verifying: true,
        verifyError: null,
        verificationResult: null,
      };

    case PAYMENT_VERIFY_SUCCESS:
      return {
        ...state,
        verifying: false,
        verifyError: null,
        verificationResult: action.payload,
        // Mettre à jour le paiement actuel si c'est le même
        currentPayment:
          state.currentPayment?.paymentId === action.payload.paymentId
            ? { ...state.currentPayment, status: action.payload.status }
            : state.currentPayment,
      };

    case PAYMENT_VERIFY_FAILURE:
      return {
        ...state,
        verifying: false,
        verifyError: action.payload,
        verificationResult: null,
      };

    // Récupération d'un paiement
    case PAYMENT_GET_REQUEST:
      return {
        ...state,
        loading: true,
        paymentError: null,
      };

    case PAYMENT_GET_SUCCESS:
      return {
        ...state,
        loading: false,
        payment: action.payload,
        paymentError: null,
      };

    case PAYMENT_GET_FAILURE:
      return {
        ...state,
        loading: false,
        payment: null,
        paymentError: action.payload,
      };

    // Liste des paiements
    case PAYMENTS_LIST_REQUEST:
      return {
        ...state,
        paymentsLoading: true,
        paymentsError: null,
      };

    case PAYMENTS_LIST_SUCCESS:
      return {
        ...state,
        paymentsLoading: false,
        payments: action.payload.payments,
        pagination: action.payload.pagination,
        paymentsError: null,
      };

    case PAYMENTS_LIST_FAILURE:
      return {
        ...state,
        paymentsLoading: false,
        payments: [],
        paymentsError: action.payload,
      };

    // Remboursement
    case PAYMENT_REFUND_REQUEST:
      return {
        ...state,
        refunding: true,
        refundError: null,
        refundResult: null,
      };

    case PAYMENT_REFUND_SUCCESS:
      return {
        ...state,
        refunding: false,
        refundError: null,
        refundResult: action.payload,
        // Mettre à jour le paiement dans la liste
        payments: state.payments.map((payment) =>
          // eslint-disable-next-line no-underscore-dangle
          payment._id === action.payload.paymentId ? { ...payment, status: 'refunded' } : payment,
        ),
      };

    case PAYMENT_REFUND_FAILURE:
      return {
        ...state,
        refunding: false,
        refundError: action.payload,
        refundResult: null,
      };

    // Statistiques
    case PAYMENT_STATS_REQUEST:
      return {
        ...state,
        statsLoading: true,
        statsError: null,
      };

    case PAYMENT_STATS_SUCCESS:
      return {
        ...state,
        statsLoading: false,
        stats: action.payload,
        statsError: null,
      };

    case PAYMENT_STATS_FAILURE:
      return {
        ...state,
        statsLoading: false,
        stats: null,
        statsError: action.payload,
      };

    // Actions utilitaires
    case CLEAR_PAYMENT_ERRORS:
      return {
        ...state,
        initializeError: null,
        verifyError: null,
        paymentError: null,
        paymentsError: null,
        refundError: null,
        statsError: null,
      };

    case RESET_PAYMENT_STATE:
      return {
        ...initialState,
      };

    default:
      return state;
  }
};

export default paymentsReducer;
