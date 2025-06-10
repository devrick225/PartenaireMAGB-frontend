import actions from './actions';
import { client } from '../../config/dataService/dataService';

const {
  profileReadBegin,
  profileReadSuccess,
  profileReadErr,
  profileUpdateBegin,
  profileUpdateSuccess,
  profileUpdateErr,
  passwordChangeBegin,
  passwordChangeSuccess,
  passwordChangeErr,
  avatarUploadBegin,
  avatarUploadSuccess,
  avatarUploadErr,
  notificationsUpdateBegin,
  notificationsUpdateSuccess,
  notificationsUpdateErr,
  securityUpdateBegin,
  securityUpdateSuccess,
  securityUpdateErr,
  twoFactorEnableBegin,
  twoFactorEnableSuccess,
  twoFactorEnableErr,
  twoFactorDisableBegin,
  twoFactorDisableSuccess,
  twoFactorDisableErr,
} = actions;

// Récupérer les données du profil
const profileReadData = () => {
  return async (dispatch) => {
    try {
      dispatch(profileReadBegin());
      const response = await client.get('/users/profile');
      dispatch(profileReadSuccess(response.data.data.profile));
    } catch (err) {
      dispatch(profileReadErr(err));
    }
  };
};

// Mettre à jour les informations du profil
const profileUpdateData = (profileData) => {
  return async (dispatch) => {
    try {
      dispatch(profileUpdateBegin());
      const response = await client.put('/users/profile', profileData);
      // Le backend retourne {user, profile}, on reconstruit la structure complète
      const completeProfile = {
        user: response.data.data.user,
        ...response.data.data.profile,
      };
      dispatch(profileUpdateSuccess(completeProfile));
      return completeProfile;
    } catch (err) {
      dispatch(profileUpdateErr(err));
      throw err;
    }
  };
};

// Changer le mot de passe
const changePassword = (passwordData) => {
  return async (dispatch) => {
    try {
      dispatch(passwordChangeBegin());
      await client.put('/auth/change-password', passwordData);
      dispatch(passwordChangeSuccess());
    } catch (err) {
      dispatch(passwordChangeErr(err));
      throw err;
    }
  };
};

// Upload avatar
const uploadAvatar = (avatarFile) => {
  return async (dispatch) => {
    try {
      dispatch(avatarUploadBegin());
      const formData = new FormData();
      formData.append('avatar', avatarFile);

      const response = await client.post('/users/upload-avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      dispatch(avatarUploadSuccess(response.data.data.avatarUrl));
      return response.data.data.avatarUrl;
    } catch (err) {
      dispatch(avatarUploadErr(err));
      throw err;
    }
  };
};

// Mettre à jour les préférences de notifications
const updateNotifications = (notificationSettings) => {
  return async (dispatch) => {
    try {
      dispatch(notificationsUpdateBegin());
      const response = await client.put('/users/preferences', notificationSettings);
      dispatch(notificationsUpdateSuccess(response.data.data));
      return response.data.data;
    } catch (err) {
      dispatch(notificationsUpdateErr(err));
      throw err;
    }
  };
};

// Mettre à jour les paramètres de sécurité
const updateSecuritySettings = (securityData) => {
  return async (dispatch) => {
    try {
      dispatch(securityUpdateBegin());
      const response = await client.put('/users/preferences', securityData);
      dispatch(securityUpdateSuccess(response.data.data));
      return response.data.data;
    } catch (err) {
      dispatch(securityUpdateErr(err));
      throw err;
    }
  };
};

// Activer l'authentification à deux facteurs
const enableTwoFactor = (twoFactorData) => {
  return async (dispatch) => {
    try {
      dispatch(twoFactorEnableBegin());
      await client.post('/auth/two-factor/enable', twoFactorData);
      dispatch(twoFactorEnableSuccess());
    } catch (err) {
      dispatch(twoFactorEnableErr(err));
      throw err;
    }
  };
};

// Désactiver l'authentification à deux facteurs
const disableTwoFactor = (password) => {
  return async (dispatch) => {
    try {
      dispatch(twoFactorDisableBegin());
      await client.post('/auth/two-factor/disable', { password });
      dispatch(twoFactorDisableSuccess());
    } catch (err) {
      dispatch(twoFactorDisableErr(err));
      throw err;
    }
  };
};

// Demander une réinitialisation de mot de passe
const requestPasswordReset = (email) => {
  return async () => {
    try {
      await client.post('/auth/forgot-password', { email });
    } catch (err) {
      throw err;
    }
  };
};

// Confirmer la réinitialisation de mot de passe
const confirmPasswordReset = (token, newPassword) => {
  return async () => {
    try {
      await client.post('/auth/reset-password', { token, password: newPassword });
    } catch (err) {
      throw err;
    }
  };
};

// Supprimer le compte
const deleteAccount = (password) => {
  return async () => {
    try {
      await client.delete('/users/account', { data: { password, confirmation: 'DELETE' } });
    } catch (err) {
      throw err;
    }
  };
};

// Télécharger les données personnelles (RGPD)
const downloadPersonalData = () => {
  return async () => {
    try {
      const response = await client.get('/users/profile/download-data', {
        responseType: 'blob',
      });

      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'mes-donnees-personnelles.json');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      throw err;
    }
  };
};

export {
  profileReadData,
  profileUpdateData,
  changePassword,
  uploadAvatar,
  updateNotifications,
  updateSecuritySettings,
  enableTwoFactor,
  disableTwoFactor,
  requestPasswordReset,
  confirmPasswordReset,
  deleteAccount,
  downloadPersonalData,
};
