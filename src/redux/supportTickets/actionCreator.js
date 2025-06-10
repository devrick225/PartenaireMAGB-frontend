import actions from './actions';
import { DataService } from '../../config/dataService/dataService';

const {
  ticketReadBegin,
  ticketReadSuccess,
  ticketReadErr,
  filterSinglePageReadBegin,
  filterSinglePageReadSuccess,
  filterSinglePageReadErr,
  ticketCreateBegin,
  ticketCreateSuccess,
  ticketCreateErr,
  ticketUpdateBegin,
  ticketUpdateSuccess,
  ticketUpdateErr,
  ticketDeleteBegin,
  ticketDeleteSuccess,
  ticketDeleteErr,
  ticketAssignBegin,
  ticketAssignSuccess,
  ticketAssignErr,
  ticketStatusChangeBegin,
  ticketStatusChangeSuccess,
  ticketStatusChangeErr,
  ticketCommentBegin,
  ticketCommentSuccess,
  ticketCommentErr,
  ticketRatingBegin,
  ticketRatingSuccess,
  ticketRatingErr,
  ticketStatsBegin,
  ticketStatsSuccess,
  ticketStatsErr,
} = actions;

// Récupérer la liste des tickets
const ticketReadData = (filters = {}) => {
  return async (dispatch) => {
    try {
      dispatch(ticketReadBegin());
      const queryParams = new URLSearchParams(filters).toString();
      const url = queryParams ? `/tickets?${queryParams}` : '/tickets';
      const response = await DataService.get(url);
      dispatch(ticketReadSuccess(response.data.data));
    } catch (err) {
      dispatch(ticketReadErr(err));
    }
  };
};

// Récupérer un ticket spécifique
const ticketSinglePageReadData = (id) => {
  return async (dispatch) => {
    try {
      dispatch(filterSinglePageReadBegin());
      const response = await DataService.get(`/tickets/${id}`);
      dispatch(filterSinglePageReadSuccess(response.data.data));
    } catch (err) {
      dispatch(filterSinglePageReadErr(err));
    }
  };
};

// Créer un nouveau ticket
const ticketCreateData = (ticketData) => {
  return async (dispatch) => {
    try {
      dispatch(ticketCreateBegin());
      const response = await DataService.post('/tickets', ticketData);
      dispatch(ticketCreateSuccess(response.data.data));
      // Rafraîchir la liste des tickets après création
      dispatch(ticketReadData());
      return response.data.data;
    } catch (err) {
      dispatch(ticketCreateErr(err));
      throw err;
    }
  };
};

// Mettre à jour un ticket
const ticketUpdateData = (id, ticketData) => {
  return async (dispatch) => {
    try {
      dispatch(ticketUpdateBegin());
      const response = await DataService.put(`/tickets/${id}`, ticketData);
      dispatch(ticketUpdateSuccess(response.data.data));
      return response.data.data;
    } catch (err) {
      dispatch(ticketUpdateErr(err));
      throw err;
    }
  };
};

// Supprimer un ticket (CORRIGÉ: utilise DELETE au lieu de POST)
const ticketDeleteData = (id) => {
  return async (dispatch) => {
    try {
      dispatch(ticketDeleteBegin());
      await DataService.delete(`/tickets/${id}`);
      dispatch(ticketDeleteSuccess(id));
      // Rafraîchir la liste après suppression
      dispatch(ticketReadData());
    } catch (err) {
      dispatch(ticketDeleteErr(err));
      throw err;
    }
  };
};

// Assigner un ticket (NOUVEAU)
const ticketAssignData = (id, assignedTo) => {
  return async (dispatch) => {
    try {
      dispatch(ticketAssignBegin());
      const response = await DataService.post(`/tickets/${id}/assign`, { assignedTo });
      dispatch(ticketAssignSuccess(response.data.data));
      return response.data.data;
    } catch (err) {
      dispatch(ticketAssignErr(err));
      throw err;
    }
  };
};

// Changer le statut d'un ticket (NOUVEAU)
const ticketChangeStatus = (id, status, reason = null, resolution = null) => {
  return async (dispatch) => {
    try {
      dispatch(ticketStatusChangeBegin());
      const response = await DataService.post(`/tickets/${id}/status`, {
        status,
        reason,
        resolution,
      });
      dispatch(ticketStatusChangeSuccess(response.data.data));
      return response.data.data;
    } catch (err) {
      dispatch(ticketStatusChangeErr(err));
      throw err;
    }
  };
};

// Fermer un ticket (NOUVEAU)
const ticketCloseData = (id, reason = null, resolution = null) => {
  return async (dispatch) => {
    try {
      dispatch(ticketStatusChangeBegin());
      const response = await DataService.post(`/tickets/${id}/close`, {
        reason,
        resolution,
      });
      dispatch(ticketStatusChangeSuccess(response.data.data));
      return response.data.data;
    } catch (err) {
      dispatch(ticketStatusChangeErr(err));
      throw err;
    }
  };
};

// Escalader un ticket (NOUVEAU)
const ticketEscalateData = (id, escalatedTo, reason) => {
  return async (dispatch) => {
    try {
      dispatch(ticketAssignBegin());
      const response = await DataService.post(`/tickets/${id}/escalate`, {
        escalatedTo,
        reason,
      });
      dispatch(ticketAssignSuccess(response.data.data));
      return response.data.data;
    } catch (err) {
      dispatch(ticketAssignErr(err));
      throw err;
    }
  };
};

// Ajouter un commentaire/réponse (NOUVEAU)
const ticketAddComment = (id, comment, isInternal = false) => {
  return async (dispatch) => {
    try {
      dispatch(ticketCommentBegin());
      const response = await DataService.post(`/tickets/${id}/comments`, {
        comment,
        isInternal,
      });
      dispatch(ticketCommentSuccess(response.data.data));
      return response.data.data;
    } catch (err) {
      dispatch(ticketCommentErr(err));
      throw err;
    }
  };
};

// Évaluer le support (NOUVEAU)
const ticketAddRating = (id, score, comment = null) => {
  return async (dispatch) => {
    try {
      dispatch(ticketRatingBegin());
      const response = await DataService.post(`/tickets/${id}/rating`, {
        score,
        comment,
      });
      dispatch(ticketRatingSuccess(response.data.data));
      return response.data.data;
    } catch (err) {
      dispatch(ticketRatingErr(err));
      throw err;
    }
  };
};

// Upload de pièce jointe (NOUVEAU)
const ticketUploadAttachment = (id, file) => {
  return async () => {
    try {
      const formData = new FormData();
      formData.append('attachment', file);

      const response = await DataService.post(`/tickets/${id}/attachments`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.data;
    } catch (err) {
      throw err;
    }
  };
};

// Obtenir les statistiques des tickets (NOUVEAU)
const ticketGetStats = (filters = {}) => {
  return async (dispatch) => {
    try {
      dispatch(ticketStatsBegin());
      const queryParams = new URLSearchParams(filters).toString();
      const url = queryParams ? `/tickets/stats?${queryParams}` : '/tickets/stats';
      const response = await DataService.get(url);
      dispatch(ticketStatsSuccess(response.data.data));
      return response.data.data;
    } catch (err) {
      dispatch(ticketStatsErr(err));
      throw err;
    }
  };
};

export {
  ticketReadData,
  ticketSinglePageReadData,
  ticketCreateData,
  ticketUpdateData,
  ticketDeleteData,
  ticketAssignData,
  ticketChangeStatus,
  ticketCloseData,
  ticketEscalateData,
  ticketAddComment,
  ticketAddRating,
  ticketUploadAttachment,
  ticketGetStats,
};
