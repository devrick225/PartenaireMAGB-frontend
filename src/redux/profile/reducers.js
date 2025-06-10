import actions from './actions';

const {
  PROFILE_READ_BEGIN,
  PROFILE_READ_SUCCESS,
  PROFILE_READ_ERR,
  PROFILE_UPDATE_BEGIN,
  PROFILE_UPDATE_SUCCESS,
  PROFILE_UPDATE_ERR,
  PASSWORD_CHANGE_BEGIN,
  PASSWORD_CHANGE_SUCCESS,
  PASSWORD_CHANGE_ERR,
  AVATAR_UPLOAD_BEGIN,
  AVATAR_UPLOAD_SUCCESS,
  AVATAR_UPLOAD_ERR,
  NOTIFICATIONS_UPDATE_BEGIN,
  NOTIFICATIONS_UPDATE_SUCCESS,
  NOTIFICATIONS_UPDATE_ERR,
  SECURITY_UPDATE_BEGIN,
  SECURITY_UPDATE_SUCCESS,
  SECURITY_UPDATE_ERR,
  TWO_FACTOR_ENABLE_BEGIN,
  TWO_FACTOR_ENABLE_SUCCESS,
  TWO_FACTOR_ENABLE_ERR,
  TWO_FACTOR_DISABLE_BEGIN,
  TWO_FACTOR_DISABLE_SUCCESS,
  TWO_FACTOR_DISABLE_ERR,
} = actions;

const initialState = {
  // Profile data
  profile: null,
  loading: false,
  error: null,

  // Update states
  updating: false,
  updateError: null,

  // Password change states
  changingPassword: false,
  passwordChangeError: null,
  passwordChangeSuccess: false,

  // Avatar upload states
  uploadingAvatar: false,
  avatarUploadError: null,

  // Notifications update states
  updatingNotifications: false,
  notificationsError: null,

  // Security update states
  updatingSecurity: false,
  securityError: null,

  // Two factor auth states
  enablingTwoFactor: false,
  disablingTwoFactor: false,
  twoFactorError: null,
};

const ProfileReducer = (state = initialState, action) => {
  const { type, data, err, avatarUrl } = action;

  switch (type) {
    // Profile read actions
    case PROFILE_READ_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case PROFILE_READ_SUCCESS:
      return {
        ...state,
        profile: data,
        loading: false,
        error: null,
      };

    case PROFILE_READ_ERR:
      return {
        ...state,
        loading: false,
        error: err,
      };

    // Profile update actions
    case PROFILE_UPDATE_BEGIN:
      return {
        ...state,
        updating: true,
        updateError: null,
      };

    case PROFILE_UPDATE_SUCCESS:
      return {
        ...state,
        profile: data,
        updating: false,
        updateError: null,
      };

    case PROFILE_UPDATE_ERR:
      return {
        ...state,
        updating: false,
        updateError: err,
      };

    // Password change actions
    case PASSWORD_CHANGE_BEGIN:
      return {
        ...state,
        changingPassword: true,
        passwordChangeError: null,
        passwordChangeSuccess: false,
      };

    case PASSWORD_CHANGE_SUCCESS:
      return {
        ...state,
        changingPassword: false,
        passwordChangeError: null,
        passwordChangeSuccess: true,
      };

    case PASSWORD_CHANGE_ERR:
      return {
        ...state,
        changingPassword: false,
        passwordChangeError: err,
        passwordChangeSuccess: false,
      };

    // Avatar upload actions
    case AVATAR_UPLOAD_BEGIN:
      return {
        ...state,
        uploadingAvatar: true,
        avatarUploadError: null,
      };

    case AVATAR_UPLOAD_SUCCESS:
      return {
        ...state,
        profile: state.profile
          ? {
              ...state.profile,
              avatar: avatarUrl,
            }
          : null,
        uploadingAvatar: false,
        avatarUploadError: null,
      };

    case AVATAR_UPLOAD_ERR:
      return {
        ...state,
        uploadingAvatar: false,
        avatarUploadError: err,
      };

    // Notifications update actions
    case NOTIFICATIONS_UPDATE_BEGIN:
      return {
        ...state,
        updatingNotifications: true,
        notificationsError: null,
      };

    case NOTIFICATIONS_UPDATE_SUCCESS:
      return {
        ...state,
        profile: state.profile
          ? {
              ...state.profile,
              emailNotifications: data.emailNotifications || state.profile.emailNotifications,
              smsNotifications: data.smsNotifications || state.profile.smsNotifications,
            }
          : null,
        updatingNotifications: false,
        notificationsError: null,
      };

    case NOTIFICATIONS_UPDATE_ERR:
      return {
        ...state,
        updatingNotifications: false,
        notificationsError: err,
      };

    // Security update actions
    case SECURITY_UPDATE_BEGIN:
      return {
        ...state,
        updatingSecurity: true,
        securityError: null,
      };

    case SECURITY_UPDATE_SUCCESS:
      return {
        ...state,
        profile: state.profile
          ? {
              ...state.profile,
              ...data,
            }
          : null,
        updatingSecurity: false,
        securityError: null,
      };

    case SECURITY_UPDATE_ERR:
      return {
        ...state,
        updatingSecurity: false,
        securityError: err,
      };

    // Two factor enable actions
    case TWO_FACTOR_ENABLE_BEGIN:
      return {
        ...state,
        enablingTwoFactor: true,
        twoFactorError: null,
      };

    case TWO_FACTOR_ENABLE_SUCCESS:
      return {
        ...state,
        profile: state.profile
          ? {
              ...state.profile,
              twoFactorEnabled: true,
            }
          : null,
        enablingTwoFactor: false,
        twoFactorError: null,
      };

    case TWO_FACTOR_ENABLE_ERR:
      return {
        ...state,
        enablingTwoFactor: false,
        twoFactorError: err,
      };

    // Two factor disable actions
    case TWO_FACTOR_DISABLE_BEGIN:
      return {
        ...state,
        disablingTwoFactor: true,
        twoFactorError: null,
      };

    case TWO_FACTOR_DISABLE_SUCCESS:
      return {
        ...state,
        profile: state.profile
          ? {
              ...state.profile,
              twoFactorEnabled: false,
            }
          : null,
        disablingTwoFactor: false,
        twoFactorError: null,
      };

    case TWO_FACTOR_DISABLE_ERR:
      return {
        ...state,
        disablingTwoFactor: false,
        twoFactorError: err,
      };

    default:
      return state;
  }
};

export default ProfileReducer;
