import actions from './actions';
/* eslint no-underscore-dangle: 0 */

const {
  TICKET_READ_BEGIN,
  TICKET_READ_SUCCESS,
  TICKET_READ_ERR,
  TICKET_SINGLE_PAGE_READ_BEGIN,
  TICKET_SINGLE_PAGE_READ_SUCCESS,
  TICKET_SINGLE_PAGE_READ_ERR,
  TICKET_CREATE_BEGIN,
  TICKET_CREATE_SUCCESS,
  TICKET_CREATE_ERR,
  TICKET_UPDATE_BEGIN,
  TICKET_UPDATE_SUCCESS,
  TICKET_UPDATE_ERR,
  TICKET_DELETE_BEGIN,
  TICKET_DELETE_SUCCESS,
  TICKET_DELETE_ERR,
  TICKET_ASSIGN_BEGIN,
  TICKET_ASSIGN_SUCCESS,
  TICKET_ASSIGN_ERR,
  TICKET_STATUS_CHANGE_BEGIN,
  TICKET_STATUS_CHANGE_SUCCESS,
  TICKET_STATUS_CHANGE_ERR,
  TICKET_COMMENT_BEGIN,
  TICKET_COMMENT_SUCCESS,
  TICKET_COMMENT_ERR,
  TICKET_RATING_BEGIN,
  TICKET_RATING_SUCCESS,
  TICKET_RATING_ERR,
  TICKET_STATS_BEGIN,
  TICKET_STATS_SUCCESS,
  TICKET_STATS_ERR,
} = actions;

const initialState = {
  data: [],
  ticket: [],
  stats: null,
  loading: false,
  error: null,
  creating: false,
  updating: false,
  deleting: false,
  assigning: false,
  changingStatus: false,
  addingComment: false,
  addingRating: false,
  loadingStats: false,
};

const SupportTicketReducer = (state = initialState, action) => {
  const { type, data, err, id } = action;
  switch (type) {
    case TICKET_READ_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case TICKET_READ_SUCCESS:
      return {
        ...state,
        data,
        loading: false,
        error: null,
      };
    case TICKET_READ_ERR:
      return {
        ...state,
        error: err,
        loading: false,
      };
    case TICKET_SINGLE_PAGE_READ_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case TICKET_SINGLE_PAGE_READ_SUCCESS:
      return {
        ...state,
        ticket: data,
        loading: false,
        error: null,
      };
    case TICKET_SINGLE_PAGE_READ_ERR:
      return {
        ...state,
        error: err,
        loading: false,
      };
    case TICKET_CREATE_BEGIN:
      return {
        ...state,
        creating: true,
        error: null,
      };
    case TICKET_CREATE_SUCCESS:
      return {
        ...state,
        data: {
          ...state.data,
          tickets: state.data.tickets ? [data, ...state.data.tickets] : [data],
        },
        creating: false,
        error: null,
      };
    case TICKET_CREATE_ERR:
      return {
        ...state,
        error: err,
        creating: false,
      };
    case TICKET_UPDATE_BEGIN:
      return {
        ...state,
        updating: true,
        error: null,
      };
    case TICKET_UPDATE_SUCCESS:
      return {
        ...state,
        data: {
          ...state.data,
          tickets: state.data.tickets
            ? state.data.tickets.map((ticket) => (ticket._id === data._id ? data : ticket))
            : [],
        },
        ticket: state.ticket && state.ticket._id === data._id ? data : state.ticket,
        updating: false,
        error: null,
      };
    case TICKET_UPDATE_ERR:
      return {
        ...state,
        error: err,
        updating: false,
      };
    case TICKET_DELETE_BEGIN:
      return {
        ...state,
        deleting: true,
        error: null,
      };
    case TICKET_DELETE_SUCCESS:
      return {
        ...state,
        data: {
          ...state.data,
          // eslint-disable-next-line no-underscore-dangle
          tickets: state.data.tickets ? state.data.tickets.filter((ticket) => ticket._id !== id) : [],
        },
        deleting: false,
        error: null,
      };
    case TICKET_DELETE_ERR:
      return {
        ...state,
        error: err,
        deleting: false,
      };

    // Gestion de l'assignation
    case TICKET_ASSIGN_BEGIN:
      return {
        ...state,
        assigning: true,
        error: null,
      };
    case TICKET_ASSIGN_SUCCESS:
      return {
        ...state,
        data: {
          ...state.data,
          tickets: state.data.tickets
            ? state.data.tickets.map((ticket) =>
                ticket._id === data.ticketId
                  ? { ...ticket, assignedTo: data.assignedTo, status: 'in_progress' }
                  : ticket,
              )
            : [],
        },
        ticket:
          state.ticket && state.ticket._id === data.ticketId
            ? { ...state.ticket, assignedTo: data.assignedTo, status: 'in_progress' }
            : state.ticket,
        assigning: false,
        error: null,
      };
    case TICKET_ASSIGN_ERR:
      return {
        ...state,
        error: err,
        assigning: false,
      };

    // Gestion du changement de statut
    case TICKET_STATUS_CHANGE_BEGIN:
      return {
        ...state,
        changingStatus: true,
        error: null,
      };
    case TICKET_STATUS_CHANGE_SUCCESS:
      return {
        ...state,
        data: {
          ...state.data,
          tickets: state.data.tickets
            ? state.data.tickets.map((ticket) =>
                ticket._id === data.ticketId
                  ? { ...ticket, status: data.newStatus, resolution: data.resolution }
                  : ticket,
              )
            : [],
        },
        ticket:
          state.ticket && state.ticket._id === data.ticketId
            ? { ...state.ticket, status: data.newStatus, resolution: data.resolution }
            : state.ticket,
        changingStatus: false,
        error: null,
      };
    case TICKET_STATUS_CHANGE_ERR:
      return {
        ...state,
        error: err,
        changingStatus: false,
      };

    // Gestion des commentaires
    case TICKET_COMMENT_BEGIN:
      return {
        ...state,
        addingComment: true,
        error: null,
      };
    case TICKET_COMMENT_SUCCESS:
      return {
        ...state,
        ticket:
          state.ticket && state.ticket._id === data.ticketId
            ? {
                ...state.ticket,
                comments: [...(state.ticket.comments || []), data.comment],
                metrics: {
                  ...state.ticket.metrics,
                  responseCount: (state.ticket.metrics?.responseCount || 0) + 1,
                },
              }
            : state.ticket,
        addingComment: false,
        error: null,
      };
    case TICKET_COMMENT_ERR:
      return {
        ...state,
        error: err,
        addingComment: false,
      };

    // Gestion de l'évaluation
    case TICKET_RATING_BEGIN:
      return {
        ...state,
        addingRating: true,
        error: null,
      };
    case TICKET_RATING_SUCCESS:
      return {
        ...state,
        ticket:
          state.ticket && state.ticket._id === data.ticketId ? { ...state.ticket, rating: data.rating } : state.ticket,
        addingRating: false,
        error: null,
      };
    case TICKET_RATING_ERR:
      return {
        ...state,
        error: err,
        addingRating: false,
      };

    // Gestion des statistiques
    case TICKET_STATS_BEGIN:
      return {
        ...state,
        loadingStats: true,
        error: null,
      };
    case TICKET_STATS_SUCCESS:
      return {
        ...state,
        stats: data,
        loadingStats: false,
        error: null,
      };
    case TICKET_STATS_ERR:
      return {
        ...state,
        error: err,
        loadingStats: false,
      };

    default:
      return state;
  }
};

export default SupportTicketReducer;
