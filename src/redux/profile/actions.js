const actions = {
  // Profile data actions
  PROFILE_READ_BEGIN: 'PROFILE_READ_BEGIN',
  PROFILE_READ_SUCCESS: 'PROFILE_READ_SUCCESS',
  PROFILE_READ_ERR: 'PROFILE_READ_ERR',

  PROFILE_UPDATE_BEGIN: 'PROFILE_UPDATE_BEGIN',
  PROFILE_UPDATE_SUCCESS: 'PROFILE_UPDATE_SUCCESS',
  PROFILE_UPDATE_ERR: 'PROFILE_UPDATE_ERR',

  // Password actions
  PASSWORD_CHANGE_BEGIN: 'PASSWORD_CHANGE_BEGIN',
  PASSWORD_CHANGE_SUCCESS: 'PASSWORD_CHANGE_SUCCESS',
  PASSWORD_CHANGE_ERR: 'PASSWORD_CHANGE_ERR',

  // Avatar actions
  AVATAR_UPLOAD_BEGIN: 'AVATAR_UPLOAD_BEGIN',
  AVATAR_UPLOAD_SUCCESS: 'AVATAR_UPLOAD_SUCCESS',
  AVATAR_UPLOAD_ERR: 'AVATAR_UPLOAD_ERR',

  // Notifications settings actions
  NOTIFICATIONS_UPDATE_BEGIN: 'NOTIFICATIONS_UPDATE_BEGIN',
  NOTIFICATIONS_UPDATE_SUCCESS: 'NOTIFICATIONS_UPDATE_SUCCESS',
  NOTIFICATIONS_UPDATE_ERR: 'NOTIFICATIONS_UPDATE_ERR',

  // Security settings actions
  SECURITY_UPDATE_BEGIN: 'SECURITY_UPDATE_BEGIN',
  SECURITY_UPDATE_SUCCESS: 'SECURITY_UPDATE_SUCCESS',
  SECURITY_UPDATE_ERR: 'SECURITY_UPDATE_ERR',

  // Two Factor Auth actions
  TWO_FACTOR_ENABLE_BEGIN: 'TWO_FACTOR_ENABLE_BEGIN',
  TWO_FACTOR_ENABLE_SUCCESS: 'TWO_FACTOR_ENABLE_SUCCESS',
  TWO_FACTOR_ENABLE_ERR: 'TWO_FACTOR_ENABLE_ERR',

  TWO_FACTOR_DISABLE_BEGIN: 'TWO_FACTOR_DISABLE_BEGIN',
  TWO_FACTOR_DISABLE_SUCCESS: 'TWO_FACTOR_DISABLE_SUCCESS',
  TWO_FACTOR_DISABLE_ERR: 'TWO_FACTOR_DISABLE_ERR',

  // Action creators
  profileReadBegin: () => ({
    type: actions.PROFILE_READ_BEGIN,
  }),

  profileReadSuccess: (data) => ({
    type: actions.PROFILE_READ_SUCCESS,
    data,
  }),

  profileReadErr: (err) => ({
    type: actions.PROFILE_READ_ERR,
    err,
  }),

  profileUpdateBegin: () => ({
    type: actions.PROFILE_UPDATE_BEGIN,
  }),

  profileUpdateSuccess: (data) => ({
    type: actions.PROFILE_UPDATE_SUCCESS,
    data,
  }),

  profileUpdateErr: (err) => ({
    type: actions.PROFILE_UPDATE_ERR,
    err,
  }),

  passwordChangeBegin: () => ({
    type: actions.PASSWORD_CHANGE_BEGIN,
  }),

  passwordChangeSuccess: () => ({
    type: actions.PASSWORD_CHANGE_SUCCESS,
  }),

  passwordChangeErr: (err) => ({
    type: actions.PASSWORD_CHANGE_ERR,
    err,
  }),

  avatarUploadBegin: () => ({
    type: actions.AVATAR_UPLOAD_BEGIN,
  }),

  avatarUploadSuccess: (avatarUrl) => ({
    type: actions.AVATAR_UPLOAD_SUCCESS,
    avatarUrl,
  }),

  avatarUploadErr: (err) => ({
    type: actions.AVATAR_UPLOAD_ERR,
    err,
  }),

  notificationsUpdateBegin: () => ({
    type: actions.NOTIFICATIONS_UPDATE_BEGIN,
  }),

  notificationsUpdateSuccess: (data) => ({
    type: actions.NOTIFICATIONS_UPDATE_SUCCESS,
    data,
  }),

  notificationsUpdateErr: (err) => ({
    type: actions.NOTIFICATIONS_UPDATE_ERR,
    err,
  }),

  securityUpdateBegin: () => ({
    type: actions.SECURITY_UPDATE_BEGIN,
  }),

  securityUpdateSuccess: (data) => ({
    type: actions.SECURITY_UPDATE_SUCCESS,
    data,
  }),

  securityUpdateErr: (err) => ({
    type: actions.SECURITY_UPDATE_ERR,
    err,
  }),

  twoFactorEnableBegin: () => ({
    type: actions.TWO_FACTOR_ENABLE_BEGIN,
  }),

  twoFactorEnableSuccess: () => ({
    type: actions.TWO_FACTOR_ENABLE_SUCCESS,
  }),

  twoFactorEnableErr: (err) => ({
    type: actions.TWO_FACTOR_ENABLE_ERR,
    err,
  }),

  twoFactorDisableBegin: () => ({
    type: actions.TWO_FACTOR_DISABLE_BEGIN,
  }),

  twoFactorDisableSuccess: () => ({
    type: actions.TWO_FACTOR_DISABLE_SUCCESS,
  }),

  twoFactorDisableErr: (err) => ({
    type: actions.TWO_FACTOR_DISABLE_ERR,
    err,
  }),
};

export default actions;
