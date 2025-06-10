import Cookies from 'js-cookie';
import actions from './actions';

const {
  LOGIN_BEGIN,
  LOGIN_SUCCESS,
  LOGIN_ERR,
  LOGOUT_BEGIN,
  LOGOUT_SUCCESS,
  LOGOUT_ERR,
  REFRESH_TOKEN_BEGIN,
  REFRESH_TOKEN_SUCCESS,
  REFRESH_TOKEN_ERR,
  FORGOT_PASSWORD_BEGIN,
  FORGOT_PASSWORD_SUCCESS,
  FORGOT_PASSWORD_ERR,
  RESET_PASSWORD_BEGIN,
  RESET_PASSWORD_SUCCESS,
  RESET_PASSWORD_ERR,
  CHANGE_PASSWORD_BEGIN,
  CHANGE_PASSWORD_SUCCESS,
  CHANGE_PASSWORD_ERR,
  VERIFY_EMAIL_BEGIN,
  VERIFY_EMAIL_SUCCESS,
  VERIFY_EMAIL_ERR,
  LOAD_USER_BEGIN,
  LOAD_USER_SUCCESS,
  LOAD_USER_ERR,
  CLEAR_ERROR,
} = actions;

// Helper pour parser l'utilisateur depuis les cookies
const getUserFromCookie = () => {
  try {
    const userCookie = Cookies.get('user');
    return userCookie ? JSON.parse(userCookie) : null;
  } catch (error) {
    console.error('Erreur parsing user cookie:', error);
    return null;
  }
};

const initState = {
  // État de connexion
  login: Cookies.get('logedIn') === 'true',
  isLoggedIn: Cookies.get('logedIn') === 'true',

  // Données utilisateur
  user: getUserFromCookie(),

  // Tokens
  token: Cookies.get('access_token') || null,
  refreshToken: Cookies.get('refresh_token') || null,

  // États de chargement
  loading: false,
  refreshingToken: false,
  forgettingPassword: false,
  resettingPassword: false,
  changingPassword: false,
  verifyingEmail: false,
  loadingUser: false,

  // Erreurs
  error: null,

  // Messages de succès
  message: null,
};

const AuthReducer = (state = initState, action) => {
  const { type, data, err } = action;

  switch (type) {
    // Login Actions
    case LOGIN_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
        message: null,
      };

    case LOGIN_SUCCESS:
      return {
        ...state,
        loading: false,
        login: data.isLoggedIn,
        isLoggedIn: data.isLoggedIn,
        user: data.user,
        token: data.token,
        refreshToken: data.refreshToken,
        error: null,
      };

    case LOGIN_ERR:
      return {
        ...state,
        loading: false,
        login: false,
        isLoggedIn: false,
        user: null,
        token: null,
        refreshToken: null,
        error: err,
      };

    // Logout Actions
    case LOGOUT_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case LOGOUT_SUCCESS:
      return {
        ...state,
        loading: false,
        login: false,
        isLoggedIn: false,
        user: null,
        token: null,
        refreshToken: null,
        error: null,
        message: null,
      };

    case LOGOUT_ERR:
      return {
        ...state,
        loading: false,
        login: false,
        isLoggedIn: false,
        user: null,
        token: null,
        refreshToken: null,
        error: err,
      };

    // Refresh Token Actions
    case REFRESH_TOKEN_BEGIN:
      return {
        ...state,
        refreshingToken: true,
        error: null,
      };

    case REFRESH_TOKEN_SUCCESS:
      return {
        ...state,
        refreshingToken: false,
        token: data.token,
        refreshToken: data.refreshToken,
        error: null,
      };

    case REFRESH_TOKEN_ERR:
      return {
        ...state,
        refreshingToken: false,
        error: err,
      };

    // Forgot Password Actions
    case FORGOT_PASSWORD_BEGIN:
      return {
        ...state,
        forgettingPassword: true,
        error: null,
        message: null,
      };

    case FORGOT_PASSWORD_SUCCESS:
      return {
        ...state,
        forgettingPassword: false,
        message: data,
        error: null,
      };

    case FORGOT_PASSWORD_ERR:
      return {
        ...state,
        forgettingPassword: false,
        error: err,
        message: null,
      };

    // Reset Password Actions
    case RESET_PASSWORD_BEGIN:
      return {
        ...state,
        resettingPassword: true,
        error: null,
        message: null,
      };

    case RESET_PASSWORD_SUCCESS:
      return {
        ...state,
        resettingPassword: false,
        message: data,
        error: null,
      };

    case RESET_PASSWORD_ERR:
      return {
        ...state,
        resettingPassword: false,
        error: err,
        message: null,
      };

    // Change Password Actions
    case CHANGE_PASSWORD_BEGIN:
      return {
        ...state,
        changingPassword: true,
        error: null,
        message: null,
      };

    case CHANGE_PASSWORD_SUCCESS:
      return {
        ...state,
        changingPassword: false,
        message: data,
        error: null,
      };

    case CHANGE_PASSWORD_ERR:
      return {
        ...state,
        changingPassword: false,
        error: err,
        message: null,
      };

    // Email Verification Actions
    case VERIFY_EMAIL_BEGIN:
      return {
        ...state,
        verifyingEmail: true,
        error: null,
        message: null,
      };

    case VERIFY_EMAIL_SUCCESS:
      return {
        ...state,
        verifyingEmail: false,
        message: data,
        error: null,
        // Mettre à jour le statut de vérification de l'utilisateur
        user: state.user ? { ...state.user, isEmailVerified: true } : null,
      };

    case VERIFY_EMAIL_ERR:
      return {
        ...state,
        verifyingEmail: false,
        error: err,
        message: null,
      };

    // Load User Actions
    case LOAD_USER_BEGIN:
      return {
        ...state,
        loadingUser: true,
        error: null,
      };

    case LOAD_USER_SUCCESS:
      return {
        ...state,
        loadingUser: false,
        user: data,
        error: null,
      };

    case LOAD_USER_ERR:
      return {
        ...state,
        loadingUser: false,
        error: err,
      };

    // Clear Error
    case CLEAR_ERROR:
      return {
        ...state,
        error: null,
        message: null,
      };

    default:
      return state;
  }
};
export default AuthReducer;
