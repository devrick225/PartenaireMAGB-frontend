import React, { useState, useEffect, useCallback } from 'react';
import {
  Row,
  Col,
  Card,
  Statistic,
  Typography,
  Avatar,
  Badge,
  Progress,
  List,
  Tag,
  Select,
  Space,
  Timeline,
  Alert,
  Spin,
} from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import {
  UserOutlined,
  TrophyOutlined,
  DollarOutlined,
  StarOutlined,
  RiseOutlined,
  GiftOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import moment from 'moment';
import {
  getUserStats,
  getLeaderboard,
  formatCurrency,
  calculateUserLevel,
  generateUserBadges,
} from '../../redux/users/actionCreator';

const { Title, Text } = Typography;
const { Option } = Select;

function UserDashboard() {
  const [leaderboardPeriod, setLeaderboardPeriod] = useState('month');
  const dispatch = useDispatch();

  const {
    currentProfile,
    userStats,
    statsLoading,
    leaderboard,
    leaderboardLoading,
    userRank,
    totalParticipants,
    levels,
    profileLoading,
    profileError,
    statsError,
  } = useSelector((state) => ({
    currentProfile: state.users.currentProfile,
    userStats: state.users.userStats,
    statsLoading: state.users.statsLoading,
    leaderboard: state.users.leaderboard || [],
    leaderboardLoading: state.users.leaderboardLoading,
    userRank: state.users.userRank,
    totalParticipants: state.users.totalParticipants,
    levels: state.users.levels || [],
    profileLoading: state.users.profileLoading,
    profileError: state.users.profileError,
    statsError: state.users.statsError,
  }));

  // Mémoriser la fonction de chargement des stats utilisateur (SEULEMENT)
  const loadUserStats = useCallback(
    (userId) => {
      if (userId) {
        dispatch(getUserStats(userId));
      }
    },
    [dispatch],
  );

  // Fonction pour charger le leaderboard avec une période spécifique
  const loadLeaderboardWithPeriod = useCallback(
    (period) => {
      // Seulement si la période est différente de 'month' (défaut)
      if (period !== 'month') {
        dispatch(getLeaderboard(period));
      }
    },
    [dispatch],
  );

  // NE PAS charger le profil - c'est fait par users/index.js
  // Charger SEULEMENT les stats quand l'ID utilisateur est disponible
  useEffect(() => {
    const currentUserId = currentProfile?.user?.id;
    if (currentUserId) {
      loadUserStats(currentUserId);
    }
  }, [currentProfile?.user?.id, loadUserStats]);

  // Charger le leaderboard SEULEMENT si la période change (pas au montage initial)
  useEffect(() => {
    if (leaderboardPeriod !== 'month') {
      loadLeaderboardWithPeriod(leaderboardPeriod);
    }
  }, [leaderboardPeriod, loadLeaderboardWithPeriod]);

  const handleLeaderboardPeriodChange = useCallback((period) => {
    setLeaderboardPeriod(period);
  }, []);

  // Gestion sécurisée des données utilisateur
  const currentUser = currentProfile?.user || {};
  const safeUserStats = userStats || {};
  const safeLevels =
    levels.length > 0
      ? levels
      : [{ level: 1, name: 'Nouveau membre', minPoints: 0, color: '#d9d9d9', benefits: ['Accès de base'] }];

  // Calculer le niveau actuel et les badges avec des gardes de sécurité
  const currentLevel = currentUser.points !== undefined ? calculateUserLevel(currentUser.points) : safeLevels[0];

  const nextLevel = safeLevels.find((level) => level.level === currentLevel.level + 1);
  const badges = Object.keys(safeUserStats).length > 0 ? generateUserBadges(safeUserStats) : [];

  // Progression vers le niveau suivant
  const progressToNextLevel = nextLevel
    ? (((currentUser.points || 0) - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)) * 100
    : 100;

  // Gestion des erreurs
  if (profileError) {
    return (
      <Alert
        message="Erreur de chargement"
        description={`Impossible de charger votre profil: ${profileError}`}
        type="error"
        showIcon
        style={{ marginBottom: 24 }}
      />
    );
  }

  // Affichage de chargement
  if (profileLoading && !currentProfile) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 0' }}>
        <Spin size="large" />
        <br />
        <Text type="secondary">Chargement de votre profil...</Text>
      </div>
    );
  }

  // Vérification que l'utilisateur est bien chargé
  if (!currentProfile || !currentUser.id) {
    return (
      <Alert
        message="Profil non disponible"
        description="Votre profil n'a pas pu être chargé. Veuillez rafraîchir la page."
        type="warning"
        showIcon
        style={{ marginBottom: 24 }}
      />
    );
  }

  return (
    <div>
      {/* En-tête avec informations utilisateur */}
      <Card style={{ marginBottom: 24 }}>
        <Row align="middle" gutter={24}>
          <Col>
            <Avatar
              size={80}
              src={currentUser.avatar}
              icon={<UserOutlined />}
              style={{ border: `3px solid ${currentLevel?.color || '#d9d9d9'}` }}
            />
          </Col>
          <Col flex="auto">
            <div>
              <Title level={3} style={{ margin: 0 }}>
                {currentUser.firstName || 'Prénom'} {currentUser.lastName || 'Nom'}
                <Tag color={currentLevel?.color || 'default'} style={{ marginLeft: 12 }}>
                  {currentLevel?.name || 'Nouveau membre'}
                </Tag>
              </Title>
              <Text type="secondary" style={{ fontSize: 16 }}>
                {currentUser.email || 'Email non disponible'}
              </Text>
              <br />
              <Space style={{ marginTop: 8 }}>
                <Text>
                  <StarOutlined style={{ color: '#faad14' }} />
                  {currentUser.points || 0} points
                </Text>
                <Text>•</Text>
                <Text>
                  Membre depuis{' '}
                  {currentUser.createdAt ? moment(currentUser.createdAt).format('MMMM YYYY') : 'Date inconnue'}
                </Text>
              </Space>
            </div>
          </Col>
          <Col>
            <div style={{ textAlign: 'center' }}>
              <Text strong>Position</Text>
              <br />
              <Text style={{ fontSize: 24, color: '#1890ff' }}>#{userRank || '-'}</Text>
              <br />
              <Text type="secondary">sur {totalParticipants}</Text>
            </div>
          </Col>
        </Row>

        {/* Progression vers le niveau suivant */}
        {nextLevel && (
          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text>Progression vers {nextLevel.name}</Text>
              <Text>
                {currentUser.points || 0} / {nextLevel.minPoints} points
              </Text>
            </div>
            <Progress
              percent={Math.min(Math.max(progressToNextLevel, 0), 100)}
              strokeColor={{
                '0%': currentLevel.color || '#d9d9d9',
                '100%': nextLevel.color || '#52c41a',
              }}
              showInfo={false}
            />
          </div>
        )}
      </Card>

      <Row gutter={[16, 16]}>
        {/* Statistiques personnelles */}
        <Col xs={24} lg={16}>
          <Card title="Mes statistiques" loading={statsLoading}>
            {statsError ? (
              <Alert message="Erreur de chargement des statistiques" description={statsError} type="warning" showIcon />
            ) : (
              <>
                <Row gutter={16}>
                  <Col xs={24} sm={12} md={6}>
                    <Statistic
                      title="Total donné"
                      value={safeUserStats.totalDonations || 0}
                      formatter={(value) => formatCurrency(value, currentUser.currency || 'XOF')}
                      prefix={<DollarOutlined />}
                      valueStyle={{ color: '#52c41a', fontSize: '20px' }}
                    />
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Statistic
                      title="Nombre de dons"
                      value={safeUserStats.donationCount || 0}
                      prefix={<GiftOutlined />}
                      valueStyle={{ color: '#1890ff', fontSize: '20px' }}
                    />
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Statistic
                      title="Don moyen"
                      value={safeUserStats.averageDonation || 0}
                      formatter={(value) => formatCurrency(value, currentUser.currency || 'XOF')}
                      prefix={<RiseOutlined />}
                      valueStyle={{ color: '#722ed1', fontSize: '20px' }}
                    />
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Statistic
                      title="Dons récurrents"
                      value={safeUserStats.activeRecurringDonations || 0}
                      prefix={<ThunderboltOutlined />}
                      valueStyle={{ color: '#fa8c16', fontSize: '20px' }}
                    />
                  </Col>
                </Row>

                {/* Dernier don */}
                {safeUserStats.lastDonation && (
                  <div style={{ marginTop: 24, padding: 16, backgroundColor: '#f8f9fa', borderRadius: 6 }}>
                    <Text strong>Dernier don:</Text>
                    <br />
                    <Text>
                      {formatCurrency(safeUserStats.lastDonation.amount, safeUserStats.lastDonation.currency || 'XOF')}{' '}
                      •{safeUserStats.lastDonation.category} •
                      {moment(safeUserStats.lastDonation.date).format('DD/MM/YYYY')}
                    </Text>
                  </div>
                )}
              </>
            )}
          </Card>

          {/* Badges et réalisations */}
          <Card title="Mes badges" style={{ marginTop: 16 }}>
            {badges.length > 0 ? (
              <Row gutter={[16, 16]}>
                {badges.map((badge, index) => (
                  <Col key={index} xs={12} sm={8} md={6}>
                    <Card size="small" style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>{badge.icon}</div>
                      <Text strong style={{ fontSize: 12 }}>
                        {badge.name}
                      </Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 10 }}>
                        {badge.description}
                      </Text>
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : (
              <Alert
                message="Aucun badge pour le moment"
                description="Effectuez des donations pour débloquer des badges !"
                type="info"
                showIcon
              />
            )}
          </Card>
        </Col>

        {/* Leaderboard */}
        <Col xs={24} lg={8}>
          <Card
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space>
                  <TrophyOutlined />
                  <span>Classement</span>
                </Space>
                <Select
                  value={leaderboardPeriod}
                  onChange={handleLeaderboardPeriodChange}
                  size="small"
                  style={{ width: 100 }}
                >
                  <Option value="week">Semaine</Option>
                  <Option value="month">Mois</Option>
                  <Option value="year">Année</Option>
                  <Option value="all">Tout temps</Option>
                </Select>
              </div>
            }
            loading={leaderboardLoading}
          >
            {leaderboard.length > 0 ? (
              <List
                dataSource={leaderboard}
                renderItem={(item, index) => (
                  <List.Item style={{ padding: '8px 0' }}>
                    <List.Item.Meta
                      avatar={
                        <Badge
                          count={index + 1}
                          style={{
                            backgroundColor: index < 3 ? ['#ffd700', '#c0c0c0', '#cd7f32'][index] : '#d9d9d9',
                            color: index < 3 ? '#000' : '#fff',
                          }}
                        >
                          <Avatar src={item.avatar} icon={<UserOutlined />} size={40} />
                        </Badge>
                      }
                      title={
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Text strong>
                            {item.firstName || 'Prénom'} {item.lastName || 'Nom'}
                          </Text>
                          {item.level && safeLevels.length > 0 && (
                            <Tag size="small" color={safeLevels.find((l) => l.level === item.level)?.color}>
                              Niv. {item.level}
                            </Tag>
                          )}
                        </div>
                      }
                      description={
                        <div>
                          <Text strong style={{ color: '#52c41a' }}>
                            {formatCurrency(item.totalAmount || 0, 'XOF')}
                          </Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: 11 }}>
                            {item.donationCount || 0} donation{(item.donationCount || 0) > 1 ? 's' : ''}
                          </Text>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <TrophyOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
                <br />
                <Text type="secondary">Aucun classement disponible</Text>
              </div>
            )}

            {/* Position de l'utilisateur actuel */}
            {userRank && userRank > 10 && (
              <div
                style={{
                  marginTop: 16,
                  padding: 12,
                  backgroundColor: '#e6f7ff',
                  borderRadius: 6,
                  border: '1px solid #91d5ff',
                }}
              >
                <Text strong>Votre position: #{userRank}</Text>
                <br />
                <Text type="secondary">Continuez à donner pour améliorer votre classement !</Text>
              </div>
            )}
          </Card>

          {/* Niveaux et avantages */}
          <Card title="Niveaux et avantages" style={{ marginTop: 16 }}>
            {safeLevels.length > 0 ? (
              <Timeline>
                {safeLevels.map((level) => (
                  <Timeline.Item
                    key={level.level}
                    color={level.color}
                    dot={
                      currentLevel.level >= level.level ? (
                        <CheckCircleOutlined style={{ fontSize: 16 }} />
                      ) : (
                        <div
                          style={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: level.color,
                            opacity: 0.3,
                          }}
                        />
                      )
                    }
                  >
                    <div>
                      <Text strong>{level.name}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {level.minPoints} points
                      </Text>
                      <br />
                      {level.benefits &&
                        level.benefits.map((benefit, idx) => (
                          <Tag key={idx} size="small" style={{ marginTop: 4 }}>
                            {benefit}
                          </Tag>
                        ))}
                    </div>
                  </Timeline.Item>
                ))}
              </Timeline>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <Text type="secondary">Système de niveaux en cours de chargement...</Text>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default UserDashboard;
