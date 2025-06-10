import Cookies from 'js-cookie';
import { notification } from 'antd';
import actions from './actions';
import { DataService, client } from '../../config/dataService/dataService';

const {
  loginBegin,
  loginSuccess,
  loginErr,
  logoutBegin,
  logoutSuccess,
  logoutErr,
  refreshTokenBegin,
  refreshTokenSuccess,
  refreshTokenErr,
  forgotPasswordBegin,
  forgotPasswordSuccess,
  forgotPasswordErr,
  resetPasswordBegin,
  resetPasswordSuccess,
  resetPasswordErr,
  verifyEmailBegin,
  verifyEmailSuccess,
  verifyEmailErr,
  changePasswordBegin,
  changePasswordSuccess,
  changePasswordErr,
  loadUserBegin,
  loadUserSuccess,
  loadUserErr,
  clearError,
} = actions;

const login = (values, callback) => {
  return async (dispatch) => {
    dispatch(loginBegin());
    try {
      const response = await DataService.post('/auth/login', values);
      if (response.data.success) {
        const { token, refreshToken, user } = response.data.data;

        // Stocker les tokens et l'état de connexion
        Cookies.set('access_token', token, { expires: 7 });
        Cookies.set('refresh_token', refreshToken, { expires: 30 });
        Cookies.set('logedIn', 'true', { expires: 30 });
        Cookies.set('user', JSON.stringify(user), { expires: 30 });

        // Configurer l'intercepteur pour les futures requêtes
        client.defaults.headers.common.Authorization = `Bearer ${token}`;

        notification.success({
          message: 'Authentification réussie',
          description: `Bienvenue ${user.firstName} ${user.lastName}!`,
        });

        dispatch(
          loginSuccess({
            isLoggedIn: true,
            user,
            token,
            refreshToken,
          }),
        );

        if (callback) callback();
      } else {
        dispatch(loginErr(response.data.error || 'Erreur de connexion'));
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Erreur de connexion';
      notification.error({
        message: 'Erreur de connexion',
        description: errorMessage,
      });
      dispatch(loginErr(errorMessage));
    }
  };
};

const register = (values, callback) => {
  return async (dispatch) => {
    dispatch(loginBegin());
    try {
      const response = await DataService.post('/auth/register', values);
      if (response.data.success) {
        const { token, refreshToken, user } = response.data.data;

        // Stocker les tokens et l'état de connexion
        Cookies.set('access_token', token, { expires: 7 });
        Cookies.set('refresh_token', refreshToken, { expires: 30 });
        Cookies.set('logedIn', 'true', { expires: 30 });
        Cookies.set('user', JSON.stringify(user), { expires: 30 });

        // Configurer l'intercepteur pour les futures requêtes
        client.defaults.headers.common.Authorization = `Bearer ${token}`;

        notification.success({
          message: 'Inscription réussie!',
          description: response.data.message || 'Veuillez vérifier votre email pour confirmer votre compte.',
        });

        dispatch(
          loginSuccess({
            isLoggedIn: true,
            user,
            token,
            refreshToken,
          }),
        );

        if (callback) callback();
      } else {
        const errorMessage = response.data.error || "Erreur lors de l'inscription";
        notification.error({
          message: "Erreur d'inscription",
          description: errorMessage,
        });
        dispatch(loginErr(errorMessage));
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || "Erreur lors de l'inscription";
      notification.error({
        message: "Erreur d'inscription",
        description: errorMessage,
      });
      dispatch(loginErr(errorMessage));
    }
  };
};

const logOut = (callback) => {
  return async (dispatch) => {
    dispatch(logoutBegin());
    try {
      // Tenter de notifier le serveur de la déconnexion
      try {
        await DataService.post('/auth/logout');
      } catch (serverError) {
        console.warn('Erreur lors de la déconnexion côté serveur:', serverError);
      }

      // Nettoyer le stockage local
      Cookies.remove('logedIn');
      Cookies.remove('access_token');
      Cookies.remove('refresh_token');
      Cookies.remove('user');

      // Nettoyer l'en-tête d'autorisation
      delete client.defaults.headers.common.Authorization;

      dispatch(logoutSuccess({ isLoggedIn: false, user: null, token: null }));

      notification.info({
        message: 'Déconnexion réussie',
        description: 'À bientôt!',
      });

      if (callback) callback();
    } catch (err) {
      console.error('Erreur logout:', err);
      // Même en cas d'erreur, on déconnecte côté client
      Cookies.remove('logedIn');
      Cookies.remove('access_token');
      Cookies.remove('refresh_token');
      Cookies.remove('user');
      delete client.defaults.headers.common.Authorization;

      dispatch(logoutErr(err.response?.data?.error || err.message));
      if (callback) callback();
    }
  };
};

// Refresh Token
const refreshAuthToken = () => {
  return async (dispatch) => {
    dispatch(refreshTokenBegin());
    try {
      const refreshToken = Cookies.get('refresh_token');
      if (!refreshToken) {
        throw new Error('Pas de refresh token disponible');
      }

      const response = await DataService.post('/auth/refresh', { refreshToken });

      if (response.data.success) {
        const { token, refreshToken: newRefreshToken } = response.data.data;

        // Mettre à jour les tokens
        Cookies.set('access_token', token, { expires: 7 });
        Cookies.set('refresh_token', newRefreshToken, { expires: 30 });

        // Configurer l'intercepteur
        client.defaults.headers.common.Authorization = `Bearer ${token}`;

        dispatch(refreshTokenSuccess({ token, refreshToken: newRefreshToken }));
        return token;
      }
      throw new Error(response.data.error || 'Erreur de rafraîchissement');
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Session expirée';
      dispatch(refreshTokenErr(errorMessage));

      // Déconnecter l'utilisateur si le refresh échoue
      dispatch(logOut());
      throw err;
    }
  };
};

// Mot de passe oublié
const forgotPassword = (email) => {
  return async (dispatch) => {
    dispatch(forgotPasswordBegin());
    try {
      const response = await DataService.post('/auth/forgot-password', { email });

      if (response.data.success) {
        notification.success({
          message: 'Email envoyé',
          description: response.data.message || 'Instructions envoyées par email.',
        });
        dispatch(forgotPasswordSuccess(response.data.message));
      } else {
        throw new Error(response.data.error || "Erreur lors de l'envoi");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || "Erreur lors de l'envoi";
      notification.error({
        message: 'Erreur',
        description: errorMessage,
      });
      dispatch(forgotPasswordErr(errorMessage));
    }
  };
};

// Réinitialisation du mot de passe
const resetPassword = (token, password, callback) => {
  return async (dispatch) => {
    dispatch(resetPasswordBegin());
    try {
      const response = await DataService.post(`/auth/reset-password/${token}`, { password });

      if (response.data.success) {
        notification.success({
          message: 'Mot de passe réinitialisé',
          description: response.data.message || 'Votre mot de passe a été réinitialisé avec succès.',
        });
        dispatch(resetPasswordSuccess(response.data.message));
        if (callback) callback();
      } else {
        throw new Error(response.data.error || 'Erreur lors de la réinitialisation');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Erreur lors de la réinitialisation';
      notification.error({
        message: 'Erreur',
        description: errorMessage,
      });
      dispatch(resetPasswordErr(errorMessage));
    }
  };
};

// Changement de mot de passe
const changePassword = (currentPassword, newPassword, callback) => {
  return async (dispatch) => {
    dispatch(changePasswordBegin());
    try {
      const response = await DataService.put('/auth/change-password', {
        currentPassword,
        newPassword,
      });

      if (response.data.success) {
        notification.success({
          message: 'Mot de passe modifié',
          description: response.data.message || 'Votre mot de passe a été modifié avec succès.',
        });
        dispatch(changePasswordSuccess(response.data.message));
        if (callback) callback();
      } else {
        throw new Error(response.data.error || 'Erreur lors de la modification');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Erreur lors de la modification';
      notification.error({
        message: 'Erreur',
        description: errorMessage,
      });
      dispatch(changePasswordErr(errorMessage));
    }
  };
};

// Vérification d'email
const verifyEmail = (token, callback) => {
  return async (dispatch) => {
    dispatch(verifyEmailBegin());
    try {
      const response = await DataService.get(`/auth/verify-email/${token}`);

      if (response.data.success) {
        notification.success({
          message: 'Email vérifié',
          description: response.data.message || 'Votre email a été vérifié avec succès.',
        });
        dispatch(verifyEmailSuccess(response.data.message));
        if (callback) callback();
      } else {
        throw new Error(response.data.error || 'Erreur lors de la vérification');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Erreur lors de la vérification';
      notification.error({
        message: 'Erreur',
        description: errorMessage,
      });
      dispatch(verifyEmailErr(errorMessage));
    }
  };
};

// Charger l'utilisateur actuel
const loadUser = () => {
  return async (dispatch) => {
    dispatch(loadUserBegin());
    try {
      const response = await DataService.get('/auth/me');

      if (response.data.success) {
        const { user } = response.data.data;

        // Mettre à jour le cookie utilisateur
        Cookies.set('user', JSON.stringify(user), { expires: 30 });

        dispatch(loadUserSuccess(user));
        return user;
      }
      throw new Error(response.data.error || 'Erreur lors du chargement du profil');
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Erreur lors du chargement du profil';
      dispatch(loadUserErr(errorMessage));
      throw err;
    }
  };
};

// Initialiser l'authentification à partir des cookies
const initializeAuth = () => {
  return async (dispatch) => {
    try {
      const token = Cookies.get('access_token');
      const userCookie = Cookies.get('user');
      const isLoggedIn = Cookies.get('logedIn') === 'true';

      if (token && userCookie && isLoggedIn) {
        // Configurer l'intercepteur
        client.defaults.headers.common.Authorization = `Bearer ${token}`;

        // Parser l'utilisateur depuis le cookie
        const user = JSON.parse(userCookie);

        dispatch(
          loginSuccess({
            isLoggedIn: true,
            user,
            token,
            refreshToken: Cookies.get('refresh_token'),
          }),
        );

        // Tenter de recharger les données utilisateur
        try {
          await dispatch(loadUser());
        } catch (loadError) {
          console.warn('Impossible de recharger les données utilisateur:', loadError);
        }
      } else {
        // Nettoyer si les données sont incomplètes
        dispatch(logOut());
      }
    } catch (err) {
      console.error('Erreur initialisation auth:', err);
      dispatch(logOut());
    }
  };
};

// Nettoyer les erreurs
const clearAuthError = () => {
  return (dispatch) => {
    dispatch(clearError());
  };
};

export {
  login,
  logOut,
  register,
  refreshAuthToken,
  forgotPassword,
  resetPassword,
  changePassword,
  verifyEmail,
  loadUser,
  initializeAuth,
  clearAuthError,
};
