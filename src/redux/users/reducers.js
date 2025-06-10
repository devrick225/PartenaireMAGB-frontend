import {
  USER_PROFILE_REQUEST,
  USER_PROFILE_SUCCESS,
  USER_PROFILE_FAILURE,
  USER_PROFILE_UPDATE_REQUEST,
  USER_PROFILE_UPDATE_SUCCESS,
  USER_PROFILE_UPDATE_FAILURE,
  USER_GET_REQUEST,
  USER_GET_SUCCESS,
  USER_GET_FAILURE,
  USERS_LIST_REQUEST,
  USERS_LIST_SUCCESS,
  USERS_LIST_FAILURE,
  USER_ROLE_UPDATE_REQUEST,
  USER_ROLE_UPDATE_SUCCESS,
  USER_ROLE_UPDATE_FAILURE,
  USER_STATUS_UPDATE_REQUEST,
  USER_STATUS_UPDATE_SUCCESS,
  USER_STATUS_UPDATE_FAILURE,
  USER_DONATIONS_REQUEST,
  USER_DONATIONS_SUCCESS,
  USER_DONATIONS_FAILURE,
  USER_STATS_REQUEST,
  USER_STATS_SUCCESS,
  USER_STATS_FAILURE,
  AVATAR_UPLOAD_REQUEST,
  AVATAR_UPLOAD_SUCCESS,
  AVATAR_UPLOAD_FAILURE,
  USER_PREFERENCES_UPDATE_REQUEST,
  USER_PREFERENCES_UPDATE_SUCCESS,
  USER_PREFERENCES_UPDATE_FAILURE,
  USER_ACCOUNT_DELETE_REQUEST,
  USER_ACCOUNT_DELETE_SUCCESS,
  USER_ACCOUNT_DELETE_FAILURE,
  LEADERBOARD_REQUEST,
  LEADERBOARD_SUCCESS,
  LEADERBOARD_FAILURE,
  CLEAR_USER_ERRORS,
  RESET_USER_STATE,
} from './actions';

const initialState = {
  // État pour le profil utilisateur actuel
  currentProfile: null,
  profileLoading: false,
  profileError: null,
  profileUpdating: false,
  profileUpdateError: null,

  // État pour un utilisateur spécifique
  selectedUser: null,
  userLoading: false,
  userError: null,

  // État pour la liste des utilisateurs
  users: [],
  usersLoading: false,
  usersError: null,
  pagination: {
    current: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  },
  filters: {
    role: null,
    isActive: null,
    search: '',
  },

  // État pour la mise à jour du rôle
  roleUpdating: false,
  roleUpdateError: null,

  // État pour la mise à jour du statut
  statusUpdating: false,
  statusUpdateError: null,

  // État pour les donations de l'utilisateur
  userDonations: [],
  donationsLoading: false,
  donationsError: null,
  donationsPagination: {
    current: 1,
    pageSize: 10,
    total: 0,
  },
  donationsStats: {
    totalAmount: 0,
    totalCount: 0,
    averageAmount: 0,
  },

  // État pour les statistiques de l'utilisateur
  userStats: null,
  statsLoading: false,
  statsError: null,

  // État pour l'upload d'avatar
  avatarUploading: false,
  avatarUploadError: null,

  // État pour les préférences
  preferencesUpdating: false,
  preferencesUpdateError: null,

  // État pour la suppression de compte
  accountDeleting: false,
  accountDeleteError: null,

  // État pour le leaderboard
  leaderboard: [],
  leaderboardLoading: false,
  leaderboardError: null,
  userRank: null,
  totalParticipants: 0,
  leaderboardPeriod: 'month',

  // Données de référence
  roles: [
    { value: 'user', label: 'Utilisateur', color: 'default', description: 'Utilisateur standard' },
    { value: 'admin', label: 'Administrateur', color: 'red', description: 'Accès complet au système' },
    { value: 'moderator', label: 'Modérateur', color: 'orange', description: 'Gestion des utilisateurs et contenus' },
    { value: 'treasurer', label: 'Trésorier', color: 'green', description: 'Gestion financière et donations' },
  ],

  levels: [
    { level: 1, name: 'Nouveau membre', minPoints: 0, color: '#d9d9d9', benefits: ['Accès de base'] },
    {
      level: 2,
      name: 'Membre actif',
      minPoints: 100,
      color: '#52c41a',
      benefits: ['Badge spécial', 'Notifications prioritaires'],
    },
    {
      level: 3,
      name: 'Donateur fidèle',
      minPoints: 500,
      color: '#1890ff',
      benefits: ['Reçus personnalisés', 'Accès événements VIP'],
    },
    {
      level: 4,
      name: 'Bienfaiteur',
      minPoints: 1000,
      color: '#722ed1',
      benefits: ['Consultation prioritaire', 'Rapport personnalisé'],
    },
    {
      level: 5,
      name: 'Grand donateur',
      minPoints: 5000,
      color: '#fa8c16',
      benefits: ['Reconnaissance publique', 'Siège au conseil'],
    },
  ],
};

const usersReducer = (state = initialState, action) => {
  switch (action.type) {
    // Profil utilisateur
    case USER_PROFILE_REQUEST:
      return {
        ...state,
        profileLoading: true,
        profileError: null,
      };

    case USER_PROFILE_SUCCESS:
      return {
        ...state,
        profileLoading: false,
        currentProfile: action.payload,
        profileError: null,
      };

    case USER_PROFILE_FAILURE:
      return {
        ...state,
        profileLoading: false,
        profileError: action.payload,
        currentProfile: null,
      };

    // Mise à jour du profil
    case USER_PROFILE_UPDATE_REQUEST:
      return {
        ...state,
        profileUpdating: true,
        profileUpdateError: null,
      };

    case USER_PROFILE_UPDATE_SUCCESS:
      return {
        ...state,
        profileUpdating: false,
        currentProfile: {
          ...state.currentProfile,
          ...action.payload,
        },
        profileUpdateError: null,
      };

    case USER_PROFILE_UPDATE_FAILURE:
      return {
        ...state,
        profileUpdating: false,
        profileUpdateError: action.payload,
      };

    // Obtenir un utilisateur
    case USER_GET_REQUEST:
      return {
        ...state,
        userLoading: true,
        userError: null,
      };

    case USER_GET_SUCCESS:
      return {
        ...state,
        userLoading: false,
        selectedUser: action.payload,
        userError: null,
      };

    case USER_GET_FAILURE:
      return {
        ...state,
        userLoading: false,
        userError: action.payload,
        selectedUser: null,
      };

    // Liste des utilisateurs
    case USERS_LIST_REQUEST:
      return {
        ...state,
        usersLoading: true,
        usersError: null,
      };

    case USERS_LIST_SUCCESS:
      return {
        ...state,
        usersLoading: false,
        users: action.payload.users,
        pagination: action.payload.pagination,
        filters: action.payload.filters,
        usersError: null,
      };

    case USERS_LIST_FAILURE:
      return {
        ...state,
        usersLoading: false,
        users: [],
        usersError: action.payload,
      };

    // Mise à jour du rôle
    case USER_ROLE_UPDATE_REQUEST:
      return {
        ...state,
        roleUpdating: true,
        roleUpdateError: null,
      };

    case USER_ROLE_UPDATE_SUCCESS:
      return {
        ...state,
        roleUpdating: false,
        roleUpdateError: null,
        // Mettre à jour l'utilisateur dans la liste
        users: state.users.map((user) =>
          user.id === action.payload.userId ? { ...user, role: action.payload.newRole } : user,
        ),
        // Mettre à jour l'utilisateur sélectionné si c'est le même
        selectedUser:
          state.selectedUser && state.selectedUser.id === action.payload.userId
            ? { ...state.selectedUser, role: action.payload.newRole }
            : state.selectedUser,
      };

    case USER_ROLE_UPDATE_FAILURE:
      return {
        ...state,
        roleUpdating: false,
        roleUpdateError: action.payload,
      };

    // Mise à jour du statut
    case USER_STATUS_UPDATE_REQUEST:
      return {
        ...state,
        statusUpdating: true,
        statusUpdateError: null,
      };

    case USER_STATUS_UPDATE_SUCCESS:
      return {
        ...state,
        statusUpdating: false,
        statusUpdateError: null,
        // Mettre à jour l'utilisateur dans la liste
        users: state.users.map((user) =>
          user.id === action.payload.userId ? { ...user, isActive: action.payload.isActive } : user,
        ),
        // Mettre à jour l'utilisateur sélectionné si c'est le même
        selectedUser:
          state.selectedUser && state.selectedUser.id === action.payload.userId
            ? { ...state.selectedUser, isActive: action.payload.isActive }
            : state.selectedUser,
      };

    case USER_STATUS_UPDATE_FAILURE:
      return {
        ...state,
        statusUpdating: false,
        statusUpdateError: action.payload,
      };

    // Donations de l'utilisateur
    case USER_DONATIONS_REQUEST:
      return {
        ...state,
        donationsLoading: true,
        donationsError: null,
      };

    case USER_DONATIONS_SUCCESS:
      return {
        ...state,
        donationsLoading: false,
        userDonations: action.payload.donations,
        donationsPagination: action.payload.pagination,
        donationsStats: action.payload.stats,
        donationsError: null,
      };

    case USER_DONATIONS_FAILURE:
      return {
        ...state,
        donationsLoading: false,
        donationsError: action.payload,
        userDonations: [],
      };

    // Statistiques de l'utilisateur
    case USER_STATS_REQUEST:
      return {
        ...state,
        statsLoading: true,
        statsError: null,
      };

    case USER_STATS_SUCCESS:
      return {
        ...state,
        statsLoading: false,
        userStats: action.payload,
        statsError: null,
      };

    case USER_STATS_FAILURE:
      return {
        ...state,
        statsLoading: false,
        statsError: action.payload,
        userStats: null,
      };

    // Upload d'avatar
    case AVATAR_UPLOAD_REQUEST:
      return {
        ...state,
        avatarUploading: true,
        avatarUploadError: null,
      };

    case AVATAR_UPLOAD_SUCCESS:
      return {
        ...state,
        avatarUploading: false,
        avatarUploadError: null,
        currentProfile: state.currentProfile
          ? {
              ...state.currentProfile,
              user: {
                ...state.currentProfile.user,
                avatar: action.payload,
              },
            }
          : state.currentProfile,
      };

    case AVATAR_UPLOAD_FAILURE:
      return {
        ...state,
        avatarUploading: false,
        avatarUploadError: action.payload,
      };

    // Préférences utilisateur
    case USER_PREFERENCES_UPDATE_REQUEST:
      return {
        ...state,
        preferencesUpdating: true,
        preferencesUpdateError: null,
      };

    case USER_PREFERENCES_UPDATE_SUCCESS:
      return {
        ...state,
        preferencesUpdating: false,
        preferencesUpdateError: null,
        currentProfile: state.currentProfile
          ? {
              ...state.currentProfile,
              user: {
                ...state.currentProfile.user,
                ...action.payload,
              },
            }
          : state.currentProfile,
      };

    case USER_PREFERENCES_UPDATE_FAILURE:
      return {
        ...state,
        preferencesUpdating: false,
        preferencesUpdateError: action.payload,
      };

    // Suppression de compte
    case USER_ACCOUNT_DELETE_REQUEST:
      return {
        ...state,
        accountDeleting: true,
        accountDeleteError: null,
      };

    case USER_ACCOUNT_DELETE_SUCCESS:
      return {
        ...state,
        accountDeleting: false,
        accountDeleteError: null,
      };

    case USER_ACCOUNT_DELETE_FAILURE:
      return {
        ...state,
        accountDeleting: false,
        accountDeleteError: action.payload,
      };

    // Leaderboard
    case LEADERBOARD_REQUEST:
      return {
        ...state,
        leaderboardLoading: true,
        leaderboardError: null,
      };

    case LEADERBOARD_SUCCESS:
      return {
        ...state,
        leaderboardLoading: false,
        leaderboard: action.payload.leaderboard,
        userRank: action.payload.userRank,
        totalParticipants: action.payload.totalParticipants,
        leaderboardPeriod: action.payload.period,
        leaderboardError: null,
      };

    case LEADERBOARD_FAILURE:
      return {
        ...state,
        leaderboardLoading: false,
        leaderboardError: action.payload,
        leaderboard: [],
      };

    // Actions utilitaires
    case CLEAR_USER_ERRORS:
      return {
        ...state,
        profileError: null,
        profileUpdateError: null,
        userError: null,
        usersError: null,
        roleUpdateError: null,
        statusUpdateError: null,
        donationsError: null,
        statsError: null,
        avatarUploadError: null,
        preferencesUpdateError: null,
        accountDeleteError: null,
        leaderboardError: null,
      };

    case RESET_USER_STATE:
      return {
        ...initialState,
      };

    default:
      return state;
  }
};

export default usersReducer;
