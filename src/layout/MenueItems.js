import { UilCircle } from '@iconscout/react-unicons';

import { Menu } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';

import UilEllipsisV from '@iconscout/react-unicons/icons/uil-ellipsis-v';
import UilUser from '@iconscout/react-unicons/icons/uil-user';
import UilDollarSign from '@iconscout/react-unicons/icons/uil-dollar-sign';
import UilHeadphones from '@iconscout/react-unicons/icons/uil-headphones';
import UilUsersAlt from '@iconscout/react-unicons/icons/uil-users-alt';
import UilChart from '@iconscout/react-unicons/icons/uil-chart';
import propTypes from 'prop-types';

// Import du système de permissions
import { usePermissions, ROLES } from '../components/utilities/protectedRoute';

function MenuItems({ toggleCollapsed }) {
  const { t } = useTranslation();
  // eslint-disable-next-line no-unused-vars
  const { hasRole, hasAnyRole, isAdmin, user } = usePermissions();

  function getItem(label, key, icon, children, type, requiredRole = null, allowedRoles = null) {
    return {
      key,
      icon,
      children,
      label,
      type,
      requiredRole,
      allowedRoles,
    };
  }

  const { topMenu } = useSelector((state) => {
    return {
      topMenu: state.ChangeLayoutMode.topMenu,
    };
  });

  const path = '/admin';
  const pathName = window.location.pathname;
  const pathArray = pathName && pathName !== '/' ? pathName.split(path) : [];
  const mainPath = pathArray.length > 1 ? pathArray[1] : '';
  const mainPathSplit = mainPath.split('/');

  const [openKeys, setOpenKeys] = React.useState(
    !topMenu ? [`${mainPathSplit.length > 2 ? mainPathSplit[1] : 'dashboard'}`] : [],
  );

  const onOpenChange = (keys) => {
    setOpenKeys(keys[keys.length - 1] !== 'recharts' ? [keys.length && keys[keys.length - 1]] : keys);
  };

  const onClick = (item) => {
    if (item.keyPath.length === 1) setOpenKeys([]);
  };

  // Définition des éléments de menu avec leurs restrictions de rôles
  const allItems = [
    // Tableau de bord - Accessible à tous les utilisateurs connectés
    getItem(
      <NavLink onClick={toggleCollapsed} to={`${path}/dashboard`}>
        Tableau de bord
      </NavLink>,
      'dashboard',
      !topMenu && (
        <NavLink className="menuItem-iocn" to={`${path}/dashboard`}>
          <UilChart />
        </NavLink>
      ),
      null,
      null,
      null,
      [ROLES.USER, ROLES.MODERATOR, ROLES.TREASURER, ROLES.ADMIN],
    ),

    // Mon Profil - Accessible à tous les utilisateurs connectés
    getItem(
      <NavLink onClick={toggleCollapsed} to={`${path}/profile`}>
        Mon Profil
      </NavLink>,
      'profile',
      !topMenu && (
        <NavLink className="menuItem-iocn" to={`${path}/profile`}>
          <UilUser />
        </NavLink>
      ),
      null,
      null,
      null,
      [ROLES.USER, ROLES.MODERATOR, ROLES.TREASURER, ROLES.ADMIN],
    ),

    // Donations - Accessible selon les rôles (trésorier et admin pour gestion complète)
    getItem(
      <NavLink onClick={toggleCollapsed} to={`${path}/donations`}>
        {hasAnyRole([ROLES.TREASURER, ROLES.ADMIN]) ? 'Gestion des Donations' : 'Mes Donations'}
      </NavLink>,
      'donations',
      !topMenu && (
        <NavLink className="menuItem-iocn" to={`${path}/donations`}>
          <UilDollarSign />
        </NavLink>
      ),
      null,
      null,
      null,
      [ROLES.USER, ROLES.MODERATOR, ROLES.TREASURER, ROLES.ADMIN],
    ),

    // Centre de support - Modérateur et admin pour gestion complète, utilisateurs pour création
    getItem(
      <NavLink onClick={toggleCollapsed} to={`${path}/support`}>
        {hasAnyRole([ROLES.MODERATOR, ROLES.ADMIN]) ? 'Gestion du Support' : 'Support'}
      </NavLink>,
      'support',
      !topMenu && (
        <NavLink className="menuItem-iocn" to={`${path}/support`}>
          <UilHeadphones />
        </NavLink>
      ),
      null,
      null,
      null,
      [ROLES.USER, ROLES.MODERATOR, ROLES.TREASURER, ROLES.ADMIN],
    ),

    // Gestion des utilisateurs - Admin et modérateur seulement
    getItem(
      <NavLink onClick={toggleCollapsed} to={`${path}/users`}>
        Gestion Utilisateurs
      </NavLink>,
      'users',
      !topMenu && (
        <NavLink className="menuItem-iocn" to={`${path}/users`}>
          <UilUsersAlt />
        </NavLink>
      ),
      null,
      null,
      null,
      [ROLES.MODERATOR, ROLES.ADMIN],
    ),

    // Page de test (seulement en développement)
    ...(process.env.NODE_ENV === 'development'
      ? [
          getItem(
            <NavLink onClick={toggleCollapsed} to={`${path}/pages/starter`}>
              {t('blank')} {t('page')}
            </NavLink>,
            'starter',
            !topMenu && (
              <NavLink className="menuItem-iocn" to={`${path}/pages/starter`}>
                <UilCircle />
              </NavLink>
            ),
            null,
            null,
            ROLES.ADMIN,
          ),
        ]
      : []),
  ];

  // Filtrer les éléments selon les permissions de l'utilisateur
  const items = allItems.filter((item) => {
    if (!item || !user) return false;

    // Si l'élément a des rôles autorisés, vérifier si l'utilisateur en a un
    if (item.allowedRoles && item.allowedRoles.length > 0) {
      return hasAnyRole(item.allowedRoles);
    }

    // Si l'élément a un rôle requis, vérifier si l'utilisateur l'a
    if (item.requiredRole) {
      return hasRole(item.requiredRole);
    }

    // Par défaut, autoriser l'élément (ne devrait pas arriver avec notre configuration)
    return true;
  });

  return (
    <Menu
      onOpenChange={onOpenChange}
      onClick={onClick}
      mode={!topMenu || window.innerWidth <= 991 ? 'inline' : 'horizontal'}
      // // eslint-disable-next-line no-nested-ternary
      defaultSelectedKeys={
        !topMenu
          ? [
              `${
                mainPathSplit.length === 1 ? 'home' : mainPathSplit.length === 2 ? mainPathSplit[1] : mainPathSplit[2]
              }`,
            ]
          : []
      }
      defaultOpenKeys={!topMenu ? [`${mainPathSplit.length > 2 ? mainPathSplit[1] : 'dashboard'}`] : []}
      overflowedIndicator={<UilEllipsisV />}
      openKeys={openKeys}
      items={items}
    />
  );
}

MenuItems.propTypes = {
  toggleCollapsed: propTypes.func,
};

export default MenuItems;
