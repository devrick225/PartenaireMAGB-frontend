// Types d'actions pour la gestion des utilisateurs
export const USER_PROFILE_REQUEST = 'USER_PROFILE_REQUEST';
export const USER_PROFILE_SUCCESS = 'USER_PROFILE_SUCCESS';
export const USER_PROFILE_FAILURE = 'USER_PROFILE_FAILURE';

export const USER_PROFILE_UPDATE_REQUEST = 'USER_PROFILE_UPDATE_REQUEST';
export const USER_PROFILE_UPDATE_SUCCESS = 'USER_PROFILE_UPDATE_SUCCESS';
export const USER_PROFILE_UPDATE_FAILURE = 'USER_PROFILE_UPDATE_FAILURE';

export const USER_GET_REQUEST = 'USER_GET_REQUEST';
export const USER_GET_SUCCESS = 'USER_GET_SUCCESS';
export const USER_GET_FAILURE = 'USER_GET_FAILURE';

export const USERS_LIST_REQUEST = 'USERS_LIST_REQUEST';
export const USERS_LIST_SUCCESS = 'USERS_LIST_SUCCESS';
export const USERS_LIST_FAILURE = 'USERS_LIST_FAILURE';

export const USER_ROLE_UPDATE_REQUEST = 'USER_ROLE_UPDATE_REQUEST';
export const USER_ROLE_UPDATE_SUCCESS = 'USER_ROLE_UPDATE_SUCCESS';
export const USER_ROLE_UPDATE_FAILURE = 'USER_ROLE_UPDATE_FAILURE';

export const USER_STATUS_UPDATE_REQUEST = 'USER_STATUS_UPDATE_REQUEST';
export const USER_STATUS_UPDATE_SUCCESS = 'USER_STATUS_UPDATE_SUCCESS';
export const USER_STATUS_UPDATE_FAILURE = 'USER_STATUS_UPDATE_FAILURE';

export const USER_DONATIONS_REQUEST = 'USER_DONATIONS_REQUEST';
export const USER_DONATIONS_SUCCESS = 'USER_DONATIONS_SUCCESS';
export const USER_DONATIONS_FAILURE = 'USER_DONATIONS_FAILURE';

export const USER_STATS_REQUEST = 'USER_STATS_REQUEST';
export const USER_STATS_SUCCESS = 'USER_STATS_SUCCESS';
export const USER_STATS_FAILURE = 'USER_STATS_FAILURE';

export const AVATAR_UPLOAD_REQUEST = 'AVATAR_UPLOAD_REQUEST';
export const AVATAR_UPLOAD_SUCCESS = 'AVATAR_UPLOAD_SUCCESS';
export const AVATAR_UPLOAD_FAILURE = 'AVATAR_UPLOAD_FAILURE';

export const USER_PREFERENCES_UPDATE_REQUEST = 'USER_PREFERENCES_UPDATE_REQUEST';
export const USER_PREFERENCES_UPDATE_SUCCESS = 'USER_PREFERENCES_UPDATE_SUCCESS';
export const USER_PREFERENCES_UPDATE_FAILURE = 'USER_PREFERENCES_UPDATE_FAILURE';

export const USER_ACCOUNT_DELETE_REQUEST = 'USER_ACCOUNT_DELETE_REQUEST';
export const USER_ACCOUNT_DELETE_SUCCESS = 'USER_ACCOUNT_DELETE_SUCCESS';
export const USER_ACCOUNT_DELETE_FAILURE = 'USER_ACCOUNT_DELETE_FAILURE';

export const LEADERBOARD_REQUEST = 'LEADERBOARD_REQUEST';
export const LEADERBOARD_SUCCESS = 'LEADERBOARD_SUCCESS';
export const LEADERBOARD_FAILURE = 'LEADERBOARD_FAILURE';

export const CLEAR_USER_ERRORS = 'CLEAR_USER_ERRORS';
export const RESET_USER_STATE = 'RESET_USER_STATE';

// Action creators pour le profil utilisateur
export const userProfileRequest = () => ({
  type: USER_PROFILE_REQUEST,
});

export const userProfileSuccess = (profile) => ({
  type: USER_PROFILE_SUCCESS,
  payload: profile,
});

export const userProfileFailure = (error) => ({
  type: USER_PROFILE_FAILURE,
  payload: error,
});

// Action creators pour la mise à jour du profil
export const userProfileUpdateRequest = () => ({
  type: USER_PROFILE_UPDATE_REQUEST,
});

export const userProfileUpdateSuccess = (profile) => ({
  type: USER_PROFILE_UPDATE_SUCCESS,
  payload: profile,
});

export const userProfileUpdateFailure = (error) => ({
  type: USER_PROFILE_UPDATE_FAILURE,
  payload: error,
});

// Action creators pour obtenir un utilisateur
export const userGetRequest = () => ({
  type: USER_GET_REQUEST,
});

export const userGetSuccess = (user) => ({
  type: USER_GET_SUCCESS,
  payload: user,
});

export const userGetFailure = (error) => ({
  type: USER_GET_FAILURE,
  payload: error,
});

// Action creators pour la liste des utilisateurs
export const usersListRequest = () => ({
  type: USERS_LIST_REQUEST,
});

export const usersListSuccess = (data) => ({
  type: USERS_LIST_SUCCESS,
  payload: data,
});

export const usersListFailure = (error) => ({
  type: USERS_LIST_FAILURE,
  payload: error,
});

// Action creators pour la mise à jour du rôle
export const userRoleUpdateRequest = () => ({
  type: USER_ROLE_UPDATE_REQUEST,
});

export const userRoleUpdateSuccess = (data) => ({
  type: USER_ROLE_UPDATE_SUCCESS,
  payload: data,
});

export const userRoleUpdateFailure = (error) => ({
  type: USER_ROLE_UPDATE_FAILURE,
  payload: error,
});

// Action creators pour la mise à jour du statut
export const userStatusUpdateRequest = () => ({
  type: USER_STATUS_UPDATE_REQUEST,
});

export const userStatusUpdateSuccess = (data) => ({
  type: USER_STATUS_UPDATE_SUCCESS,
  payload: data,
});

export const userStatusUpdateFailure = (error) => ({
  type: USER_STATUS_UPDATE_FAILURE,
  payload: error,
});

// Action creators pour les donations de l'utilisateur
export const userDonationsRequest = () => ({
  type: USER_DONATIONS_REQUEST,
});

export const userDonationsSuccess = (data) => ({
  type: USER_DONATIONS_SUCCESS,
  payload: data,
});

export const userDonationsFailure = (error) => ({
  type: USER_DONATIONS_FAILURE,
  payload: error,
});

// Action creators pour les statistiques de l'utilisateur
export const userStatsRequest = () => ({
  type: USER_STATS_REQUEST,
});

export const userStatsSuccess = (stats) => ({
  type: USER_STATS_SUCCESS,
  payload: stats,
});

export const userStatsFailure = (error) => ({
  type: USER_STATS_FAILURE,
  payload: error,
});

// Action creators pour l'upload d'avatar
export const avatarUploadRequest = () => ({
  type: AVATAR_UPLOAD_REQUEST,
});

export const avatarUploadSuccess = (avatarUrl) => ({
  type: AVATAR_UPLOAD_SUCCESS,
  payload: avatarUrl,
});

export const avatarUploadFailure = (error) => ({
  type: AVATAR_UPLOAD_FAILURE,
  payload: error,
});

// Action creators pour les préférences
export const userPreferencesUpdateRequest = () => ({
  type: USER_PREFERENCES_UPDATE_REQUEST,
});

export const userPreferencesUpdateSuccess = (preferences) => ({
  type: USER_PREFERENCES_UPDATE_SUCCESS,
  payload: preferences,
});

export const userPreferencesUpdateFailure = (error) => ({
  type: USER_PREFERENCES_UPDATE_FAILURE,
  payload: error,
});

// Action creators pour la suppression de compte
export const userAccountDeleteRequest = () => ({
  type: USER_ACCOUNT_DELETE_REQUEST,
});

export const userAccountDeleteSuccess = () => ({
  type: USER_ACCOUNT_DELETE_SUCCESS,
});

export const userAccountDeleteFailure = (error) => ({
  type: USER_ACCOUNT_DELETE_FAILURE,
  payload: error,
});

// Action creators pour le leaderboard
export const leaderboardRequest = () => ({
  type: LEADERBOARD_REQUEST,
});

export const leaderboardSuccess = (data) => ({
  type: LEADERBOARD_SUCCESS,
  payload: data,
});

export const leaderboardFailure = (error) => ({
  type: LEADERBOARD_FAILURE,
  payload: error,
});

// Actions utilitaires
export const clearUserErrors = () => ({
  type: CLEAR_USER_ERRORS,
});

export const resetUserState = () => ({
  type: RESET_USER_STATE,
});
