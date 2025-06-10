// Types d'actions pour les paiements
export const PAYMENT_INITIALIZE_REQUEST = 'PAYMENT_INITIALIZE_REQUEST';
export const PAYMENT_INITIALIZE_SUCCESS = 'PAYMENT_INITIALIZE_SUCCESS';
export const PAYMENT_INITIALIZE_FAILURE = 'PAYMENT_INITIALIZE_FAILURE';

export const PAYMENT_VERIFY_REQUEST = 'PAYMENT_VERIFY_REQUEST';
export const PAYMENT_VERIFY_SUCCESS = 'PAYMENT_VERIFY_SUCCESS';
export const PAYMENT_VERIFY_FAILURE = 'PAYMENT_VERIFY_FAILURE';

export const PAYMENT_GET_REQUEST = 'PAYMENT_GET_REQUEST';
export const PAYMENT_GET_SUCCESS = 'PAYMENT_GET_SUCCESS';
export const PAYMENT_GET_FAILURE = 'PAYMENT_GET_FAILURE';

export const PAYMENTS_LIST_REQUEST = 'PAYMENTS_LIST_REQUEST';
export const PAYMENTS_LIST_SUCCESS = 'PAYMENTS_LIST_SUCCESS';
export const PAYMENTS_LIST_FAILURE = 'PAYMENTS_LIST_FAILURE';

export const PAYMENT_REFUND_REQUEST = 'PAYMENT_REFUND_REQUEST';
export const PAYMENT_REFUND_SUCCESS = 'PAYMENT_REFUND_SUCCESS';
export const PAYMENT_REFUND_FAILURE = 'PAYMENT_REFUND_FAILURE';

export const PAYMENT_STATS_REQUEST = 'PAYMENT_STATS_REQUEST';
export const PAYMENT_STATS_SUCCESS = 'PAYMENT_STATS_SUCCESS';
export const PAYMENT_STATS_FAILURE = 'PAYMENT_STATS_FAILURE';

export const CLEAR_PAYMENT_ERRORS = 'CLEAR_PAYMENT_ERRORS';
export const RESET_PAYMENT_STATE = 'RESET_PAYMENT_STATE';

// Action creators
export const paymentInitializeRequest = () => ({
  type: PAYMENT_INITIALIZE_REQUEST,
});

export const paymentInitializeSuccess = (data) => ({
  type: PAYMENT_INITIALIZE_SUCCESS,
  payload: data,
});

export const paymentInitializeFailure = (error) => ({
  type: PAYMENT_INITIALIZE_FAILURE,
  payload: error,
});

export const paymentVerifyRequest = () => ({
  type: PAYMENT_VERIFY_REQUEST,
});

export const paymentVerifySuccess = (data) => ({
  type: PAYMENT_VERIFY_SUCCESS,
  payload: data,
});

export const paymentVerifyFailure = (error) => ({
  type: PAYMENT_VERIFY_FAILURE,
  payload: error,
});

export const paymentGetRequest = () => ({
  type: PAYMENT_GET_REQUEST,
});

export const paymentGetSuccess = (payment) => ({
  type: PAYMENT_GET_SUCCESS,
  payload: payment,
});

export const paymentGetFailure = (error) => ({
  type: PAYMENT_GET_FAILURE,
  payload: error,
});

export const paymentsListRequest = () => ({
  type: PAYMENTS_LIST_REQUEST,
});

export const paymentsListSuccess = (data) => ({
  type: PAYMENTS_LIST_SUCCESS,
  payload: data,
});

export const paymentsListFailure = (error) => ({
  type: PAYMENTS_LIST_FAILURE,
  payload: error,
});

export const paymentRefundRequest = () => ({
  type: PAYMENT_REFUND_REQUEST,
});

export const paymentRefundSuccess = (data) => ({
  type: PAYMENT_REFUND_SUCCESS,
  payload: data,
});

export const paymentRefundFailure = (error) => ({
  type: PAYMENT_REFUND_FAILURE,
  payload: error,
});

export const paymentStatsRequest = () => ({
  type: PAYMENT_STATS_REQUEST,
});

export const paymentStatsSuccess = (stats) => ({
  type: PAYMENT_STATS_SUCCESS,
  payload: stats,
});

export const paymentStatsFailure = (error) => ({
  type: PAYMENT_STATS_FAILURE,
  payload: error,
});

export const clearPaymentErrors = () => ({
  type: CLEAR_PAYMENT_ERRORS,
});

export const resetPaymentState = () => ({
  type: RESET_PAYMENT_STATE,
});
