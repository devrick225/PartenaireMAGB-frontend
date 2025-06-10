const actions = {
  TICKET_READ_BEGIN: 'TICKET_READ_BEGIN',
  TICKET_READ_SUCCESS: 'TICKET_READ_SUCCESS',
  TICKET_READ_ERR: 'TICKET_READ_ERR',

  TICKET_SINGLE_PAGE_READ_BEGIN: 'TICKET_SINGLE_PAGE_READ_BEGIN',
  TICKET_SINGLE_PAGE_READ_SUCCESS: 'TICKET_SINGLE_PAGE_READ_SUCCESS',
  TICKET_SINGLE_PAGE_READ_ERR: 'TICKET_SINGLE_PAGE_READ_ERR',

  TICKET_CREATE_BEGIN: 'TICKET_CREATE_BEGIN',
  TICKET_CREATE_SUCCESS: 'TICKET_CREATE_SUCCESS',
  TICKET_CREATE_ERR: 'TICKET_CREATE_ERR',

  TICKET_UPDATE_BEGIN: 'TICKET_UPDATE_BEGIN',
  TICKET_UPDATE_SUCCESS: 'TICKET_UPDATE_SUCCESS',
  TICKET_UPDATE_ERR: 'TICKET_UPDATE_ERR',

  TICKET_DELETE_BEGIN: 'TICKET_DELETE_BEGIN',
  TICKET_DELETE_SUCCESS: 'TICKET_DELETE_SUCCESS',
  TICKET_DELETE_ERR: 'TICKET_DELETE_ERR',

  // Nouvelles actions pour les fonctionnalités avancées
  TICKET_ASSIGN_BEGIN: 'TICKET_ASSIGN_BEGIN',
  TICKET_ASSIGN_SUCCESS: 'TICKET_ASSIGN_SUCCESS',
  TICKET_ASSIGN_ERR: 'TICKET_ASSIGN_ERR',

  TICKET_STATUS_CHANGE_BEGIN: 'TICKET_STATUS_CHANGE_BEGIN',
  TICKET_STATUS_CHANGE_SUCCESS: 'TICKET_STATUS_CHANGE_SUCCESS',
  TICKET_STATUS_CHANGE_ERR: 'TICKET_STATUS_CHANGE_ERR',

  TICKET_COMMENT_BEGIN: 'TICKET_COMMENT_BEGIN',
  TICKET_COMMENT_SUCCESS: 'TICKET_COMMENT_SUCCESS',
  TICKET_COMMENT_ERR: 'TICKET_COMMENT_ERR',

  TICKET_RATING_BEGIN: 'TICKET_RATING_BEGIN',
  TICKET_RATING_SUCCESS: 'TICKET_RATING_SUCCESS',
  TICKET_RATING_ERR: 'TICKET_RATING_ERR',

  TICKET_STATS_BEGIN: 'TICKET_STATS_BEGIN',
  TICKET_STATS_SUCCESS: 'TICKET_STATS_SUCCESS',
  TICKET_STATS_ERR: 'TICKET_STATS_ERR',

  ticketReadBegin: () => {
    return {
      type: actions.TICKET_READ_BEGIN,
    };
  },

  ticketReadSuccess: (data) => {
    return {
      type: actions.TICKET_READ_SUCCESS,
      data,
    };
  },

  ticketReadErr: (err) => {
    return {
      type: actions.TICKET_READ_ERR,
      err,
    };
  },

  filterSinglePageReadBegin: () => {
    return {
      type: actions.TICKET_SINGLE_PAGE_READ_BEGIN,
    };
  },

  filterSinglePageReadSuccess: (data) => {
    return {
      type: actions.TICKET_SINGLE_PAGE_READ_SUCCESS,
      data,
    };
  },

  filterSinglePageReadErr: (err) => {
    return {
      type: actions.TICKET_SINGLE_PAGE_READ_ERR,
      err,
    };
  },

  ticketCreateBegin: () => {
    return {
      type: actions.TICKET_CREATE_BEGIN,
    };
  },

  ticketCreateSuccess: (data) => {
    return {
      type: actions.TICKET_CREATE_SUCCESS,
      data,
    };
  },

  ticketCreateErr: (err) => {
    return {
      type: actions.TICKET_CREATE_ERR,
      err,
    };
  },

  ticketUpdateBegin: () => {
    return {
      type: actions.TICKET_UPDATE_BEGIN,
    };
  },

  ticketUpdateSuccess: (data) => {
    return {
      type: actions.TICKET_UPDATE_SUCCESS,
      data,
    };
  },

  ticketUpdateErr: (err) => {
    return {
      type: actions.TICKET_UPDATE_ERR,
      err,
    };
  },

  ticketDeleteBegin: () => {
    return {
      type: actions.TICKET_DELETE_BEGIN,
    };
  },

  ticketDeleteSuccess: (id) => {
    return {
      type: actions.TICKET_DELETE_SUCCESS,
      id,
    };
  },

  ticketDeleteErr: (err) => {
    return {
      type: actions.TICKET_DELETE_ERR,
      err,
    };
  },

  // Nouvelles actions pour l'assignation
  ticketAssignBegin: () => {
    return {
      type: actions.TICKET_ASSIGN_BEGIN,
    };
  },

  ticketAssignSuccess: (data) => {
    return {
      type: actions.TICKET_ASSIGN_SUCCESS,
      data,
    };
  },

  ticketAssignErr: (err) => {
    return {
      type: actions.TICKET_ASSIGN_ERR,
      err,
    };
  },

  // Actions pour le changement de statut
  ticketStatusChangeBegin: () => {
    return {
      type: actions.TICKET_STATUS_CHANGE_BEGIN,
    };
  },

  ticketStatusChangeSuccess: (data) => {
    return {
      type: actions.TICKET_STATUS_CHANGE_SUCCESS,
      data,
    };
  },

  ticketStatusChangeErr: (err) => {
    return {
      type: actions.TICKET_STATUS_CHANGE_ERR,
      err,
    };
  },

  // Actions pour les commentaires
  ticketCommentBegin: () => {
    return {
      type: actions.TICKET_COMMENT_BEGIN,
    };
  },

  ticketCommentSuccess: (data) => {
    return {
      type: actions.TICKET_COMMENT_SUCCESS,
      data,
    };
  },

  ticketCommentErr: (err) => {
    return {
      type: actions.TICKET_COMMENT_ERR,
      err,
    };
  },

  // Actions pour l'évaluation
  ticketRatingBegin: () => {
    return {
      type: actions.TICKET_RATING_BEGIN,
    };
  },

  ticketRatingSuccess: (data) => {
    return {
      type: actions.TICKET_RATING_SUCCESS,
      data,
    };
  },

  ticketRatingErr: (err) => {
    return {
      type: actions.TICKET_RATING_ERR,
      err,
    };
  },

  // Actions pour les statistiques
  ticketStatsBegin: () => {
    return {
      type: actions.TICKET_STATS_BEGIN,
    };
  },

  ticketStatsSuccess: (data) => {
    return {
      type: actions.TICKET_STATS_SUCCESS,
      data,
    };
  },

  ticketStatsErr: (err) => {
    return {
      type: actions.TICKET_STATS_ERR,
      err,
    };
  },
};

export default actions;
