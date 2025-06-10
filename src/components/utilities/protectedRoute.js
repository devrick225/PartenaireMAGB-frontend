import React from 'react';
import { useSelector } from 'react-redux';
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { LockOutlined, UserOutlined } from '@ant-design/icons';

// Définition des rôles et leurs hiérarchies
const ROLES = {
  USER: 'user',
  MODERATOR: 'moderator',
  TREASURER: 'treasurer',
  ADMIN: 'admin',
};

// Permissions par rôle (basé sur le backend)
const ROLE_PERMISSIONS = {
  [ROLES.USER]: ['read_own_profile', 'update_own_profile', 'create_donation', 'create_ticket'],
  [ROLES.MODERATOR]: [
    'read_own_profile',
    'update_own_profile',
    'create_donation',
    'create_ticket',
    'read_users',
    'update_tickets',
    'read_donations',
    'moderate_content',
  ],
  [ROLES.TREASURER]: [
    'read_own_profile',
    'update_own_profile',
    'create_donation',
    'create_ticket',
    'read_all_donations',
    'read_payments',
    'generate_reports',
    'manage_refunds',
  ],
  [ROLES.ADMIN]: ['*'], // Toutes les permissions
};

// Hiérarchie des rôles (un rôle supérieur inclut les permissions des rôles inférieurs)
const ROLE_HIERARCHY = {
  [ROLES.USER]: 0,
  [ROLES.MODERATOR]: 1,
  [ROLES.TREASURER]: 1,
  [ROLES.ADMIN]: 2,
};

// Hook pour vérifier les permissions
export const usePermissions = () => {
  const { user } = useSelector((state) => ({
    user: state.auth.user,
  }));

  const hasRole = (requiredRole) => {
    if (!user || !user.role) return false;

    const userRoleLevel = ROLE_HIERARCHY[user.role] || 0;
    const requiredRoleLevel = ROLE_HIERARCHY[requiredRole] || 0;

    // Admin a toujours accès
    if (user.role === ROLES.ADMIN) return true;

    // Vérifier la hiérarchie pour les autres rôles
    return userRoleLevel >= requiredRoleLevel;
  };

  const hasPermission = (permission) => {
    if (!user || !user.role) return false;

    const userPermissions = ROLE_PERMISSIONS[user.role] || [];

    // Admin a toutes les permissions
    if (userPermissions.includes('*')) return true;

    return userPermissions.includes(permission);
  };

  const hasAnyRole = (roles) => {
    if (!user || !user.role) return false;
    return roles.includes(user.role);
  };

  const isAdmin = () => hasRole(ROLES.ADMIN);
  const isModerator = () => hasRole(ROLES.MODERATOR);
  const isTreasurer = () => hasRole(ROLES.TREASURER);
  const isUser = () => user && user.role === ROLES.USER;

  return {
    user,
    hasRole,
    hasPermission,
    hasAnyRole,
    isAdmin,
    isModerator,
    isTreasurer,
    isUser,
    userRole: user?.role,
  };
};

// Composant de protection des routes
function ProtectedRoute({
  children,
  requiredRole,
  requiredPermission,
  allowedRoles,
  fallback,
  showUnauthorized = true,
}) {
  const navigate = useNavigate();
  const { user, hasRole, hasPermission, hasAnyRole } = usePermissions();

  // Vérifier l'authentification
  if (!user) {
    return (
      <Result
        status="403"
        title="Authentification requise"
        subTitle="Vous devez être connecté pour accéder à cette page."
        icon={<UserOutlined />}
        extra={
          <Button type="primary" onClick={() => navigate('/')}>
            Se connecter
          </Button>
        }
      />
    );
  }

  // Vérifier les permissions
  let hasAccess = true;

  if (requiredRole) {
    hasAccess = hasRole(requiredRole);
  } else if (requiredPermission) {
    hasAccess = hasPermission(requiredPermission);
  } else if (allowedRoles) {
    hasAccess = hasAnyRole(allowedRoles);
  }

  if (!hasAccess) {
    if (fallback) {
      return fallback;
    }

    if (showUnauthorized) {
      return (
        <Result
          status="403"
          title="Accès refusé"
          subTitle={`Vous n'avez pas les permissions nécessaires pour accéder à cette page. Rôle requis: ${
            requiredRole || allowedRoles?.join(', ') || 'Permission spéciale'
          }`}
          icon={<LockOutlined />}
          extra={
            <Button type="primary" onClick={() => navigate('/admin')}>
              Retour au tableau de bord
            </Button>
          }
        />
      );
    }

    return null;
  }

  return children;
}

// Composant pour masquer/afficher des éléments selon les permissions
export function PermissionGate({
  children,
  requiredRole,
  requiredPermission,
  allowedRoles,
  fallback = null,
  hideIfNoAccess = true,
}) {
  const { hasRole, hasPermission, hasAnyRole, user } = usePermissions();

  if (!user) return hideIfNoAccess ? null : fallback;

  let hasAccess = true;

  if (requiredRole) {
    hasAccess = hasRole(requiredRole);
  } else if (requiredPermission) {
    hasAccess = hasPermission(requiredPermission);
  } else if (allowedRoles) {
    hasAccess = hasAnyRole(allowedRoles);
  }

  if (!hasAccess) {
    return hideIfNoAccess ? null : fallback;
  }

  return children;
}

// Composant pour afficher des informations de rôle
export function RoleIndicator({ showIcon = true, showText = true }) {
  const { user, userRole } = usePermissions();

  if (!user || !userRole) return null;

  const roleConfig = {
    [ROLES.ADMIN]: {
      color: '#ff4d4f',
      icon: '👑',
      label: 'Administrateur',
    },
    [ROLES.MODERATOR]: {
      color: '#722ed1',
      icon: '🛡️',
      label: 'Modérateur',
    },
    [ROLES.TREASURER]: {
      color: '#13c2c2',
      icon: '💰',
      label: 'Trésorier',
    },
    [ROLES.USER]: {
      color: '#52c41a',
      icon: '👤',
      label: 'Utilisateur',
    },
  };

  const config = roleConfig[userRole] || roleConfig[ROLES.USER];

  return (
    <span style={{ color: config.color, fontSize: '14px' }}>
      {showIcon && <span style={{ marginRight: 4 }}>{config.icon}</span>}
      {showText && config.label}
    </span>
  );
}

// Export des constantes pour utilisation externe
export { ROLES, ROLE_PERMISSIONS, ROLE_HIERARCHY };

export default ProtectedRoute;
