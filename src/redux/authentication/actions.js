const actions = {
  // Login/Logout
  LOGIN_BEGIN: 'LOGIN_BEGIN',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_ERR: 'LOGIN_ERR',
  LOGOUT_BEGIN: 'LOGOUT_BEGIN',
  LOGOUT_SUCCESS: 'LOGOUT_SUCCESS',
  LOGOUT_ERR: 'LOGOUT_ERR',

  // Refresh Token
  REFRESH_TOKEN_BEGIN: 'REFRESH_TOKEN_BEGIN',
  REFRESH_TOKEN_SUCCESS: 'REFRESH_TOKEN_SUCCESS',
  REFRESH_TOKEN_ERR: 'REFRESH_TOKEN_ERR',

  // Forgot Password
  FORGOT_PASSWORD_BEGIN: 'FORGOT_PASSWORD_BEGIN',
  FORGOT_PASSWORD_SUCCESS: 'FORGOT_PASSWORD_SUCCESS',
  FORGOT_PASSWORD_ERR: 'FORGOT_PASSWORD_ERR',

  // Reset Password
  RESET_PASSWORD_BEGIN: 'RESET_PASSWORD_BEGIN',
  RESET_PASSWORD_SUCCESS: 'RESET_PASSWORD_SUCCESS',
  RESET_PASSWORD_ERR: 'RESET_PASSWORD_ERR',

  // Change Password
  CHANGE_PASSWORD_BEGIN: 'CHANGE_PASSWORD_BEGIN',
  CHANGE_PASSWORD_SUCCESS: 'CHANGE_PASSWORD_SUCCESS',
  CHANGE_PASSWORD_ERR: 'CHANGE_PASSWORD_ERR',

  // Email Verification
  VERIFY_EMAIL_BEGIN: 'VERIFY_EMAIL_BEGIN',
  VERIFY_EMAIL_SUCCESS: 'VERIFY_EMAIL_SUCCESS',
  VERIFY_EMAIL_ERR: 'VERIFY_EMAIL_ERR',

  // Load User
  LOAD_USER_BEGIN: 'LOAD_USER_BEGIN',
  LOAD_USER_SUCCESS: 'LOAD_USER_SUCCESS',
  LOAD_USER_ERR: 'LOAD_USER_ERR',

  // Clear Error
  CLEAR_ERROR: 'CLEAR_ERROR',

  // Login Actions
  loginBegin: () => ({
    type: actions.LOGIN_BEGIN,
  }),

  loginSuccess: (data) => ({
    type: actions.LOGIN_SUCCESS,
    data,
  }),

  loginErr: (err) => ({
    type: actions.LOGIN_ERR,
    err,
  }),

  // Logout Actions
  logoutBegin: () => ({
    type: actions.LOGOUT_BEGIN,
  }),

  logoutSuccess: (data) => ({
    type: actions.LOGOUT_SUCCESS,
    data,
  }),

  logoutErr: (err) => ({
    type: actions.LOGOUT_ERR,
    err,
  }),

  // Refresh Token Actions
  refreshTokenBegin: () => ({
    type: actions.REFRESH_TOKEN_BEGIN,
  }),

  refreshTokenSuccess: (data) => ({
    type: actions.REFRESH_TOKEN_SUCCESS,
    data,
  }),

  refreshTokenErr: (err) => ({
    type: actions.REFRESH_TOKEN_ERR,
    err,
  }),

  // Forgot Password Actions
  forgotPasswordBegin: () => ({
    type: actions.FORGOT_PASSWORD_BEGIN,
  }),

  forgotPasswordSuccess: (data) => ({
    type: actions.FORGOT_PASSWORD_SUCCESS,
    data,
  }),

  forgotPasswordErr: (err) => ({
    type: actions.FORGOT_PASSWORD_ERR,
    err,
  }),

  // Reset Password Actions
  resetPasswordBegin: () => ({
    type: actions.RESET_PASSWORD_BEGIN,
  }),

  resetPasswordSuccess: (data) => ({
    type: actions.RESET_PASSWORD_SUCCESS,
    data,
  }),

  resetPasswordErr: (err) => ({
    type: actions.RESET_PASSWORD_ERR,
    err,
  }),

  // Change Password Actions
  changePasswordBegin: () => ({
    type: actions.CHANGE_PASSWORD_BEGIN,
  }),

  changePasswordSuccess: (data) => ({
    type: actions.CHANGE_PASSWORD_SUCCESS,
    data,
  }),

  changePasswordErr: (err) => ({
    type: actions.CHANGE_PASSWORD_ERR,
    err,
  }),

  // Email Verification Actions
  verifyEmailBegin: () => ({
    type: actions.VERIFY_EMAIL_BEGIN,
  }),

  verifyEmailSuccess: (data) => ({
    type: actions.VERIFY_EMAIL_SUCCESS,
    data,
  }),

  verifyEmailErr: (err) => ({
    type: actions.VERIFY_EMAIL_ERR,
    err,
  }),

  // Load User Actions
  loadUserBegin: () => ({
    type: actions.LOAD_USER_BEGIN,
  }),

  loadUserSuccess: (data) => ({
    type: actions.LOAD_USER_SUCCESS,
    data,
  }),

  loadUserErr: (err) => ({
    type: actions.LOAD_USER_ERR,
    err,
  }),

  // Clear Error Action
  clearError: () => ({
    type: actions.CLEAR_ERROR,
  }),
};

export default actions;
