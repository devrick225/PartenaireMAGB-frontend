import {
  userProfileRequest,
  userProfileSuccess,
  userProfileFailure,
  userProfileUpdateRequest,
  userProfileUpdateSuccess,
  userProfileUpdateFailure,
  userGetRequest,
  userGetSuccess,
  userGetFailure,
  usersListRequest,
  usersListSuccess,
  usersListFailure,
  userRoleUpdateRequest,
  userRoleUpdateSuccess,
  userRoleUpdateFailure,
  userStatusUpdateRequest,
  userStatusUpdateSuccess,
  userStatusUpdateFailure,
  userDonationsRequest,
  userDonationsSuccess,
  userDonationsFailure,
  userStatsRequest,
  userStatsSuccess,
  userStatsFailure,
  avatarUploadRequest,
  avatarUploadSuccess,
  avatarUploadFailure,
  userPreferencesUpdateRequest,
  userPreferencesUpdateSuccess,
  userPreferencesUpdateFailure,
  userAccountDeleteRequest,
  userAccountDeleteSuccess,
  userAccountDeleteFailure,
  leaderboardRequest,
  leaderboardSuccess,
  leaderboardFailure,
  clearUserErrors,
} from './actions';
import { DataService } from '../../config/dataService/dataService';

// @desc    Obtenir le profil de l'utilisateur connecté
export const getUserProfile = () => async (dispatch) => {
  try {
    dispatch(userProfileRequest());

    const response = await DataService.get('/users/profile');

    if (response.data.success) {
      dispatch(userProfileSuccess(response.data.data.profile));
      return response.data.data.profile;
    }
    dispatch(userProfileFailure(response.data.error));
    throw new Error(response.data.error);
  } catch (error) {
    const errorMessage = error.response?.data?.error || error.message || 'Erreur lors de la récupération du profil';
    dispatch(userProfileFailure(errorMessage));
    throw error;
  }
};

// @desc    Mettre à jour le profil de l'utilisateur
export const updateUserProfile = (profileData) => async (dispatch) => {
  try {
    dispatch(userProfileUpdateRequest());

    const response = await DataService.put('/users/profile', profileData);

    if (response.data.success) {
      dispatch(userProfileUpdateSuccess(response.data.data.profile));
      return response.data.data.profile;
    }
    dispatch(userProfileUpdateFailure(response.data.error));
    throw new Error(response.data.error);
  } catch (error) {
    const errorMessage = error.response?.data?.error || error.message || 'Erreur lors de la mise à jour du profil';
    dispatch(userProfileUpdateFailure(errorMessage));
    throw error;
  }
};

// @desc    Obtenir un utilisateur par ID
export const getUserById = (userId) => async (dispatch) => {
  try {
    dispatch(userGetRequest());

    const response = await DataService.get(`/users/${userId}`);

    if (response.data.success) {
      dispatch(userGetSuccess(response.data.data.user));
      return response.data.data.user;
    }
    dispatch(userGetFailure(response.data.error));
    throw new Error(response.data.error);
  } catch (error) {
    const errorMessage =
      error.response?.data?.error || error.message || "Erreur lors de la récupération de l'utilisateur";
    dispatch(userGetFailure(errorMessage));
    throw error;
  }
};

// @desc    Obtenir la liste des utilisateurs
export const getUsersList =
  (filters = {}) =>
  async (dispatch) => {
    try {
      dispatch(usersListRequest());

      const queryParams = new URLSearchParams();

      // Ajouter les paramètres de pagination
      queryParams.append('page', filters.page || 1);
      queryParams.append('limit', filters.limit || 10);

      // Ajouter les filtres
      if (filters.role) queryParams.append('role', filters.role);
      if (filters.isActive !== undefined) queryParams.append('isActive', filters.isActive);
      if (filters.search) queryParams.append('search', filters.search);

      const response = await DataService.get(`/users?${queryParams.toString()}`);

      if (response.data.success) {
        dispatch(usersListSuccess(response.data.data));
        return response.data.data;
      }
      dispatch(usersListFailure(response.data.error));
      throw new Error(response.data.error);
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || error.message || 'Erreur lors de la récupération des utilisateurs';
      dispatch(usersListFailure(errorMessage));
      throw error;
    }
  };

// @desc    Modifier le rôle d'un utilisateur
export const updateUserRole = (userId, role) => async (dispatch) => {
  try {
    dispatch(userRoleUpdateRequest());

    const response = await DataService.put(`/users/${userId}/role`, { role });

    if (response.data.success) {
      dispatch(userRoleUpdateSuccess(response.data.data));
      return response.data.data;
    }
    dispatch(userRoleUpdateFailure(response.data.error));
    throw new Error(response.data.error);
  } catch (error) {
    const errorMessage = error.response?.data?.error || error.message || 'Erreur lors de la modification du rôle';
    dispatch(userRoleUpdateFailure(errorMessage));
    throw error;
  }
};

// @desc    Activer/Désactiver un utilisateur
export const updateUserStatus = (userId, isActive, reason) => async (dispatch) => {
  try {
    dispatch(userStatusUpdateRequest());

    const response = await DataService.put(`/users/${userId}/status`, { isActive, reason });

    if (response.data.success) {
      dispatch(userStatusUpdateSuccess(response.data.data));
      return response.data.data;
    }
    dispatch(userStatusUpdateFailure(response.data.error));
    throw new Error(response.data.error);
  } catch (error) {
    const errorMessage = error.response?.data?.error || error.message || 'Erreur lors de la modification du statut';
    dispatch(userStatusUpdateFailure(errorMessage));
    throw error;
  }
};

// @desc    Obtenir les donations d'un utilisateur
export const getUserDonations =
  (userId, filters = {}) =>
  async (dispatch) => {
    try {
      dispatch(userDonationsRequest());

      const queryParams = new URLSearchParams();

      // Ajouter les paramètres de pagination
      queryParams.append('page', filters.page || 1);
      queryParams.append('limit', filters.limit || 10);

      // Ajouter les filtres
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.period) queryParams.append('period', filters.period);

      const response = await DataService.get(`/users/${userId}/donations?${queryParams.toString()}`);

      if (response.data.success) {
        dispatch(userDonationsSuccess(response.data.data));
        return response.data.data;
      }
      dispatch(userDonationsFailure(response.data.error));
      throw new Error(response.data.error);
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || error.message || 'Erreur lors de la récupération des donations';
      dispatch(userDonationsFailure(errorMessage));
      throw error;
    }
  };

// @desc    Obtenir les statistiques d'un utilisateur
export const getUserStats = (userId) => async (dispatch) => {
  try {
    dispatch(userStatsRequest());

    const response = await DataService.get(`/users/${userId}/stats`);

    if (response.data.success) {
      dispatch(userStatsSuccess(response.data.data.stats));
      return response.data.data.stats;
    }
    dispatch(userStatsFailure(response.data.error));
    throw new Error(response.data.error);
  } catch (error) {
    const errorMessage =
      error.response?.data?.error || error.message || 'Erreur lors de la récupération des statistiques';
    dispatch(userStatsFailure(errorMessage));
    throw error;
  }
};

// @desc    Upload d'avatar
export const uploadAvatar = (formData) => async (dispatch) => {
  try {
    dispatch(avatarUploadRequest());

    const response = await DataService.post('/users/upload-avatar', formData, {
      'Content-Type': 'multipart/form-data',
    });

    if (response.data.success) {
      dispatch(avatarUploadSuccess(response.data.data.avatarUrl));
      return response.data.data.avatarUrl;
    }
    dispatch(avatarUploadFailure(response.data.error));
    throw new Error(response.data.error);
  } catch (error) {
    const errorMessage = error.response?.data?.error || error.message || "Erreur lors de l'upload de l'avatar";
    dispatch(avatarUploadFailure(errorMessage));
    throw error;
  }
};

// @desc    Mettre à jour les préférences utilisateur
export const updateUserPreferences = (preferences) => async (dispatch) => {
  try {
    dispatch(userPreferencesUpdateRequest());

    const response = await DataService.put('/users/preferences', preferences);

    if (response.data.success) {
      dispatch(userPreferencesUpdateSuccess(response.data.data.preferences));
      return response.data.data.preferences;
    }
    dispatch(userPreferencesUpdateFailure(response.data.error));
    throw new Error(response.data.error);
  } catch (error) {
    const errorMessage =
      error.response?.data?.error || error.message || 'Erreur lors de la mise à jour des préférences';
    dispatch(userPreferencesUpdateFailure(errorMessage));
    throw error;
  }
};

// @desc    Supprimer son compte
export const deleteUserAccount = (password, confirmation) => async (dispatch) => {
  try {
    dispatch(userAccountDeleteRequest());

    const response = await DataService.delete('/users/account', { password, confirmation });

    if (response.data.success) {
      dispatch(userAccountDeleteSuccess());
      return response.data;
    }
    dispatch(userAccountDeleteFailure(response.data.error));
    throw new Error(response.data.error);
  } catch (error) {
    const errorMessage = error.response?.data?.error || error.message || 'Erreur lors de la suppression du compte';
    dispatch(userAccountDeleteFailure(errorMessage));
    throw error;
  }
};

// @desc    Obtenir le leaderboard
export const getLeaderboard =
  (period = 'month', limit = 10) =>
  async (dispatch) => {
    try {
      dispatch(leaderboardRequest());

      const queryParams = new URLSearchParams();
      queryParams.append('period', period);
      queryParams.append('limit', limit);

      const response = await DataService.get(`/users/leaderboard?${queryParams.toString()}`);

      if (response.data.success) {
        dispatch(leaderboardSuccess(response.data.data));
        return response.data.data;
      }
      dispatch(leaderboardFailure(response.data.error));
      throw new Error(response.data.error);
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || error.message || 'Erreur lors de la récupération du leaderboard';
      dispatch(leaderboardFailure(errorMessage));
      throw error;
    }
  };

// @desc    Effacer les erreurs
export const clearErrors = () => (dispatch) => {
  dispatch(clearUserErrors());
};

// @desc    Valider les données de profil
export const validateProfileData = (profileData) => {
  const errors = [];

  // Validation de l'âge
  if (profileData.dateOfBirth) {
    const age = new Date().getFullYear() - new Date(profileData.dateOfBirth).getFullYear();
    if (age < 13) {
      errors.push("L'âge minimum est de 13 ans");
    }
    if (age > 120) {
      errors.push('Âge invalide');
    }
  }

  // Validation du numéro de téléphone d'urgence
  if (profileData.emergencyContact?.phone) {
    const phoneRegex = /^(\+\d{1,3}[- ]?)?\d{8,15}$/;
    if (!phoneRegex.test(profileData.emergencyContact.phone)) {
      errors.push("Format de numéro de téléphone d'urgence invalide");
    }
  }

  // Validation du revenu mensuel
  if (profileData.monthlyIncome && profileData.monthlyIncome < 0) {
    errors.push('Le revenu mensuel ne peut pas être négatif');
  }

  return errors;
};

// @desc Calculer le niveau de l'utilisateur
export const calculateUserLevel = (points) => {
  const levels = [
    { level: 1, name: 'Nouveau membre', minPoints: 0 },
    { level: 2, name: 'Membre actif', minPoints: 100 },
    { level: 3, name: 'Donateur fidèle', minPoints: 500 },
    { level: 4, name: 'Bienfaiteur', minPoints: 1000 },
    { level: 5, name: 'Grand donateur', minPoints: 5000 },
  ];

  // eslint-disable-next-line no-plusplus
  for (let i = levels.length - 1; i >= 0; i--) {
    if (points >= levels[i].minPoints) {
      return levels[i];
    }
  }

  return levels[0];
};

// @desc    Formater le montant avec la devise
export const formatCurrency = (amount, currency = 'XOF') => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
};

// @desc    Obtenir la couleur du rôle
export const getRoleColor = (role) => {
  const roleColors = {
    user: 'default',
    admin: 'red',
    moderator: 'orange',
    treasurer: 'green',
  };
  return roleColors[role] || 'default';
};

// @desc    Obtenir le pourcentage de completion du profil
export const calculateProfileCompletion = (profile) => {
  if (!profile) return 0;

  const fields = [
    'dateOfBirth',
    'gender',
    'occupation',
    'address.street',
    'address.country',
    'emergencyContact.name',
    'emergencyContact.phone',
    'emergencyContact.relationship',
  ];

  const completedFields = fields.filter((field) => {
    const keys = field.split('.');
    let value = profile;

    // eslint-disable-next-line no-restricted-syntax
    for (const key of keys) {
      value = value?.[key];
    }

    return value !== null && value !== undefined && value !== '';
  });

  return Math.round((completedFields.length / fields.length) * 100);
};

// @desc    Générer les badges utilisateur
export const generateUserBadges = (stats) => {
  const badges = [];

  if (stats.donationCount >= 1) {
    badges.push({ name: 'Premier don', icon: '🎯', description: 'A effectué son premier don' });
  }

  if (stats.donationCount >= 10) {
    badges.push({ name: 'Donateur régulier', icon: '🏅', description: '10 donations effectuées' });
  }

  if (stats.donationCount >= 50) {
    badges.push({ name: 'Donateur fidèle', icon: '⭐', description: '50 donations effectuées' });
  }

  if (stats.totalDonations >= 100000) {
    badges.push({ name: 'Grand bienfaiteur', icon: '👑', description: 'Plus de 100 000 XOF donnés' });
  }

  if (stats.activeRecurringDonations >= 1) {
    badges.push({ name: 'Soutien récurrent', icon: '🔄', description: 'A des donations récurrentes actives' });
  }

  return badges;
};
