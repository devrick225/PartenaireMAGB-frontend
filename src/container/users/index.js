import React, { useEffect, useState } from 'react';
import { Row, Col, Tabs, Spin, message, Button } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import {
  UserOutlined,
  DashboardOutlined,
  UnorderedListOutlined,
  FileTextOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import UsersList from './UsersList';
import UserDashboard from './UserDashboard';
import UserDetails from './UserDetails';
import { PageHeader } from '../../components/page-headers/page-headers';
import { Main } from '../styled';
import { Cards } from '../../components/cards/frame/cards-frame';
import { getUsersList, getUserProfile, getLeaderboard } from '../../redux/users/actionCreator';

// Import du système de permissions
// eslint-disable-next-line no-unused-vars
import { usePermissions, PermissionGate, RoleIndicator, ROLES } from '../../components/utilities/protectedRoute';
import RolePermissionsHelp from '../../components/utilities/RolePermissionsHelp';

function Users() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showRoleHelp, setShowRoleHelp] = useState(false);
  const dispatch = useDispatch();

  // Utiliser le système de permissions
  // eslint-disable-next-line no-unused-vars
  const { hasAnyRole, user, userRole } = usePermissions();

  const { usersLoading, usersError, profileLoading, leaderboardLoading } = useSelector((state) => ({
    usersLoading: state.users.usersLoading,
    usersError: state.users.usersError,
    profileLoading: state.users.profileLoading,
    leaderboardLoading: state.users.leaderboardLoading,
  }));

  // Vérifier les permissions pour la gestion des utilisateurs
  const canViewUsersList = hasAnyRole([ROLES.MODERATOR, ROLES.ADMIN]);
  const canManageUsers = hasAnyRole([ROLES.ADMIN]);
  // eslint-disable-next-line no-unused-vars
  const canViewStatistics = hasAnyRole([ROLES.MODERATOR, ROLES.TREASURER, ROLES.ADMIN]);

  const PageRoutes = [
    {
      path: 'index',
      breadcrumbName: 'Tableau de bord',
    },
    {
      path: '',
      breadcrumbName: canViewUsersList ? 'Gestion des Utilisateurs' : 'Mon Espace',
    },
  ];

  useEffect(() => {
    if (dispatch) {
      // Charger les données initiales
      dispatch(getUserProfile());
      dispatch(getLeaderboard());

      // Charger la liste des utilisateurs seulement si autorisé
      if (canViewUsersList) {
        dispatch(getUsersList());
      }
    }
  }, [dispatch, canViewUsersList]);

  useEffect(() => {
    if (usersError) {
      message.error('Erreur lors du chargement des données utilisateurs');
    }
  }, [usersError]);

  const handleTabChange = (key) => {
    setActiveTab(key);
    setSelectedUserId(null);
  };

  const handleViewUser = (userId) => {
    setSelectedUserId(userId);
    setActiveTab('details');
  };

  const tabItems = [
    {
      key: 'dashboard',
      label: (
        <span>
          <DashboardOutlined />
          Mon Tableau de Bord
        </span>
      ),
      children: <UserDashboard />,
    },
  ];

  // Ajouter l'onglet liste des utilisateurs seulement pour les admins/modérateurs
  if (canViewUsersList) {
    tabItems.push({
      key: 'users',
      label: (
        <span>
          <UnorderedListOutlined />
          Liste des Utilisateurs
        </span>
      ),
      children: <UsersList onViewUser={handleViewUser} />,
    });
  }

  // Ajouter l'onglet détails si un utilisateur est sélectionné
  if (selectedUserId) {
    tabItems.push({
      key: 'details',
      label: (
        <span>
          <FileTextOutlined />
          Détails Utilisateur
        </span>
      ),
      children: (
        <UserDetails
          userId={selectedUserId}
          onBack={() => {
            setSelectedUserId(null);
            setActiveTab(canViewUsersList ? 'users' : 'dashboard');
          }}
        />
      ),
    });
  }

  if (profileLoading && activeTab === 'dashboard') {
    return (
      <>
        <PageHeader className="ninjadash-page-header-main" title="Gestion des Utilisateurs" routes={PageRoutes} />
        <Main>
          <div style={{ textAlign: 'center', marginTop: 50 }}>
            <Spin size="large" tip="Chargement du profil..." />
          </div>
        </Main>
      </>
    );
  }

  return (
    <>
      <PageHeader className="ninjadash-page-header-main" title="Gestion des Utilisateurs" routes={PageRoutes} />
      <Main>
        <Row gutter={25}>
          <Col span={24}>
            <Cards headless>
              <div style={{ padding: '20px' }}>
                {/* Header avec résumé rapide */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 30,
                    padding: '20px 0',
                    borderBottom: '1px solid #f0f0f0',
                  }}
                >
                  <div>
                    <h2 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>
                      <UserOutlined style={{ marginRight: 12, color: '#1890ff' }} />
                      {activeTab === 'dashboard' && 'Mon Tableau de Bord'}
                      {activeTab === 'users' && 'Gestion des Utilisateurs'}
                      {activeTab === 'details' && "Détails de l'Utilisateur"}
                      <span style={{ marginLeft: 16, fontSize: 16 }}>
                        <RoleIndicator />
                      </span>
                    </h2>
                    <p style={{ margin: '8px 0 0 0', color: '#666', fontSize: 16 }}>
                      {activeTab === 'dashboard' && 'Vos statistiques, badges et classement'}
                      {activeTab === 'users' && canManageUsers && 'Gérez les rôles et statuts des utilisateurs'}
                      {activeTab === 'users' && !canManageUsers && 'Consulter la liste des utilisateurs'}
                      {activeTab === 'details' && 'Informations complètes et historique'}
                    </p>
                  </div>

                  {/* Indicateurs de charge et actions */}
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <Button
                      type="text"
                      icon={<QuestionCircleOutlined />}
                      onClick={() => setShowRoleHelp(true)}
                      title="Aide sur les rôles et permissions"
                    >
                      Aide
                    </Button>
                    {usersLoading && <Spin size="small" />}
                    {leaderboardLoading && <Spin size="small" />}
                  </div>
                </div>

                {/* Messages informatifs selon le rôle */}
                {!canViewUsersList && (
                  <div style={{ marginBottom: 20 }}>
                    <div
                      style={{
                        padding: 16,
                        backgroundColor: '#e6f7ff',
                        border: '1px solid #91d5ff',
                        borderRadius: 6,
                        textAlign: 'center',
                      }}
                    >
                      <UserOutlined style={{ fontSize: 24, color: '#1890ff', marginBottom: 8 }} />
                      <p style={{ margin: 0, fontWeight: 500 }}>
                        Bienvenue {user?.firstName} dans votre espace personnel !
                      </p>
                      <p style={{ margin: 0, fontSize: 14, color: '#666' }}>
                        Consultez vos statistiques, suivez votre progression et votre classement.
                      </p>
                    </div>
                  </div>
                )}

                {canViewUsersList && !canManageUsers && (
                  <div style={{ marginBottom: 20 }}>
                    <div
                      style={{
                        padding: 16,
                        backgroundColor: '#f6ffed',
                        border: '1px solid #b7eb8f',
                        borderRadius: 6,
                        textAlign: 'center',
                      }}
                    >
                      <UserOutlined style={{ fontSize: 24, color: '#52c41a', marginBottom: 8 }} />
                      <p style={{ margin: 0, fontWeight: 500 }}>Accès modérateur</p>
                      <p style={{ margin: 0, fontSize: 14, color: '#666' }}>
                        Vous pouvez consulter la liste des utilisateurs et gérer le support.
                      </p>
                    </div>
                  </div>
                )}

                {canManageUsers && (
                  <div style={{ marginBottom: 20 }}>
                    <div
                      style={{
                        padding: 16,
                        backgroundColor: '#fff2e8',
                        border: '1px solid #ffbb96',
                        borderRadius: 6,
                        textAlign: 'center',
                      }}
                    >
                      <UserOutlined style={{ fontSize: 24, color: '#fa8c16', marginBottom: 8 }} />
                      <p style={{ margin: 0, fontWeight: 500 }}>Accès administrateur</p>
                      <p style={{ margin: 0, fontSize: 14, color: '#666' }}>
                        Vous avez tous les droits pour gérer les utilisateurs, rôles et l&#39;ensemble du système.
                      </p>
                    </div>
                  </div>
                )}

                {/* Onglets de navigation */}
                <Tabs
                  activeKey={activeTab}
                  onChange={handleTabChange}
                  type="line"
                  tabPosition="top"
                  items={tabItems}
                  style={{
                    '& .ant-tabs-nav': {
                      marginBottom: 24,
                    },
                    '& .ant-tabs-tab': {
                      padding: '12px 16px',
                      fontSize: 14,
                    },
                    '& .ant-tabs-content-holder': {
                      padding: '0 4px',
                    },
                  }}
                />
              </div>
            </Cards>
          </Col>
        </Row>

        {/* Modal d'aide pour les rôles et permissions */}
        <RolePermissionsHelp visible={showRoleHelp} onClose={() => setShowRoleHelp(false)} />
      </Main>
    </>
  );
}

export default Users;
