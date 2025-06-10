import moment from 'moment';

// Configuration des statuts de tickets
export const TICKET_STATUS = {
  open: { text: 'Ouvert', color: 'processing', icon: 'ExclamationCircleOutlined' },
  in_progress: { text: 'En cours', color: 'warning', icon: 'ClockCircleOutlined' },
  waiting_user: { text: "En attente utilisateur", color: 'default', icon: 'UserOutlined' },
  waiting_admin: { text: "En attente admin", color: 'purple', icon: 'TeamOutlined' },
  resolved: { text: 'Résolu', color: 'success', icon: 'CheckCircleOutlined' },
  closed: { text: 'Fermé', color: 'default', icon: 'FileTextOutlined' },
  cancelled: { text: 'Annulé', color: 'error', icon: 'AlertOutlined' },
};

// Configuration des priorités
export const TICKET_PRIORITY = {
  low: { text: 'Basse', color: 'default', level: 1 },
  medium: { text: 'Moyenne', color: 'warning', level: 2 },
  high: { text: 'Haute', color: 'error', level: 3 },
  urgent: { text: 'Critique', color: 'magenta', level: 4 },
};

// Configuration des catégories
export const TICKET_CATEGORY = {
  technical: { text: 'Problème technique', color: 'blue' },
  payment: { text: 'Problème de paiement', color: 'green' },
  account: { text: 'Problème de compte', color: 'orange' },
  donation: { text: 'Question sur les dons', color: 'purple' },
  bug_report: { text: 'Rapport de bug', color: 'red' },
  feature_request: { text: 'Demande de fonctionnalité', color: 'cyan' },
  general: { text: 'Question générale', color: 'default' },
  complaint: { text: 'Réclamation', color: 'volcano' },
  suggestion: { text: 'Suggestion', color: 'lime' },
};

// Seuils SLA par priorité (en heures)
export const SLA_THRESHOLDS = {
  urgent: 2,
  high: 8,
  medium: 24,
  low: 72
};

// Configuration des rôles et permissions
export const USER_PERMISSIONS = {
  admin: {
    canManageAll: true,
    canAssign: true,
    canEscalate: true,
    canViewInternal: true,
    canChangeStatus: true,
    canDeleteTickets: true
  },
  moderator: {
    canManageAll: false,
    canAssign: true,
    canEscalate: true,
    canViewInternal: true,
    canChangeStatus: true,
    canDeleteTickets: false
  },
  support_agent: {
    canManageAll: false,
    canAssign: false,
    canEscalate: true,
    canViewInternal: true,
    canChangeStatus: true,
    canDeleteTickets: false
  },
  user: {
    canManageAll: false,
    canAssign: false,
    canEscalate: false,
    canViewInternal: false,
    canChangeStatus: false,
    canDeleteTickets: false
  }
};

// Routes de navigation
export const SUPPORT_ROUTES = {
  dashboard: '/admin/support',
  tickets: '/admin/support/tickets',
  ticketDetails: (id) => `/admin/support/ticket/${id}`,
  newTicket: '/admin/support/new',
  editTicket: (id) => `/admin/support/edit/${id}`,
  legacy: '/admin/support/legacy',
  legacyDetails: (id) => `/admin/support/ticketDetails/${id}`
};

// Messages d'erreur et de succès
export const MESSAGES = {
  success: {
    ticketCreated: 'Ticket créé avec succès !',
    ticketUpdated: 'Ticket mis à jour avec succès !',
    ticketDeleted: 'Ticket supprimé avec succès !',
    commentAdded: 'Commentaire ajouté avec succès !',
    statusChanged: 'Statut mis à jour avec succès !',
    ratingAdded: 'Évaluation ajoutée avec succès !',
    fileUploaded: 'Fichier téléchargé avec succès !'
  },
  errors: {
    ticketNotFound: 'Ticket non trouvé',
    unauthorized: 'Vous n\'avez pas les droits pour cette action',
    networkError: 'Erreur de connexion',
    validationError: 'Veuillez vérifier les données saisies',
    fileUploadError: 'Erreur lors du téléchargement du fichier'
  }
};

// Configuration des tableaux
export const TABLE_CONFIG = {
  pagination: {
    defaultPageSize: 10,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total, range) => `${range[0]}-${range[1]} sur ${total} tickets`,
    pageSizeOptions: ['10', '20', '50', '100']
  },
  scroll: { x: 1000 }
};

// Configurations par défaut des formulaires
export const FORM_RULES = {
  subject: [
    { required: true, message: 'Veuillez saisir un sujet' },
    { min: 5, message: 'Le sujet doit contenir au moins 5 caractères' },
    { max: 100, message: 'Le sujet ne peut pas dépasser 100 caractères' }
  ],
  description: [
    { required: true, message: 'Veuillez fournir une description' },
    { min: 20, message: 'La description doit contenir au moins 20 caractères' }
  ],
  comment: [
    { required: true, message: 'Veuillez saisir votre commentaire' },
    { min: 5, message: 'Le commentaire doit contenir au moins 5 caractères' }
  ],
  category: [
    { required: true, message: 'Veuillez sélectionner une catégorie' }
  ],
  priority: [
    { required: true, message: 'Veuillez sélectionner une priorité' }
  ]
};

// Utilitaires de formatage
export const formatters = {
  formatDate: (date) => {
    return moment(date).format('DD/MM/YYYY HH:mm');
  },
  formatDateShort: (date) => {
    return moment(date).format('DD/MM/YYYY');
  },
  formatRelativeTime: (date) => {
    return moment(date).fromNow();
  },
  formatDuration: (minutes) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins}min`;
  }
};

// Couleurs pour les graphiques
export const CHART_COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8',
  '#82ca9d', '#ffc658', '#8dd1e1', '#d084d0', '#87d068'
];

export default {
  TICKET_STATUS,
  TICKET_PRIORITY,
  TICKET_CATEGORY,
  SLA_THRESHOLDS,
  USER_PERMISSIONS,
  SUPPORT_ROUTES,
  MESSAGES,
  TABLE_CONFIG,
  FORM_RULES,
  formatters,
  CHART_COLORS
}; 