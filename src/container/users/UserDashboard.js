import React, { useState, useEffect } from 'react';
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
  getUserProfile,
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
  } = useSelector((state) => ({
    currentProfile: state.users.currentProfile,
    userStats: state.users.userStats,
    statsLoading: state.users.statsLoading,
    leaderboard: state.users.leaderboard,
    leaderboardLoading: state.users.leaderboardLoading,
    userRank: state.users.userRank,
    totalParticipants: state.users.totalParticipants,
    levels: state.users.levels,
  }));

  useEffect(() => {
    if (dispatch) {
      dispatch(getUserProfile());
      // Utiliser l'ID utilisateur connecté pour les stats
      const currentUserId = currentProfile?.user?.id;
      if (currentUserId) {
        dispatch(getUserStats(currentUserId));
      }
      dispatch(getLeaderboard(leaderboardPeriod));
    }
  }, [dispatch, leaderboardPeriod, currentProfile?.user?.id]);

  const handleLeaderboardPeriodChange = (period) => {
    setLeaderboardPeriod(period);
    dispatch(getLeaderboard(period));
  };

  // Calculer le niveau actuel et les badges
  const currentLevel = currentProfile?.user ? calculateUserLevel(currentProfile.user.points) : levels[0];
  const nextLevel = levels.find((level) => level.level === currentLevel.level + 1);
  const badges = userStats ? generateUserBadges(userStats) : [];

  // Progression vers le niveau suivant
  const progressToNextLevel = nextLevel
    ? (((currentProfile?.user?.points || 0) - currentLevel.minPoints) /
        (nextLevel.minPoints - currentLevel.minPoints)) *
      100
    : 100;

  return (
    <div>
      {/* En-tête avec informations utilisateur */}
      <Card style={{ marginBottom: 24 }}>
        <Row align="middle" gutter={24}>
          <Col>
            <Avatar
              size={80}
              src={currentProfile?.user?.avatar}
              icon={<UserOutlined />}
              style={{ border: `3px solid ${currentLevel?.color}` }}
            />
          </Col>
          <Col flex="auto">
            <div>
              <Title level={3} style={{ margin: 0 }}>
                {currentProfile?.user?.firstName} {currentProfile?.user?.lastName}
                <Tag color={currentLevel?.color} style={{ marginLeft: 12 }}>
                  {currentLevel?.name}
                </Tag>
              </Title>
              <Text type="secondary" style={{ fontSize: 16 }}>
                {currentProfile?.user?.email}
              </Text>
              <br />
              <Space style={{ marginTop: 8 }}>
                <Text>
                  <StarOutlined style={{ color: '#faad14' }} />
                  {currentProfile?.user?.points || 0} points
                </Text>
                <Text>•</Text>
                <Text>Membre depuis {moment(currentProfile?.user?.createdAt).format('MMMM YYYY')}</Text>
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
                {currentProfile?.user?.points || 0} / {nextLevel.minPoints} points
              </Text>
            </div>
            <Progress
              percent={Math.min(progressToNextLevel, 100)}
              strokeColor={{
                '0%': currentLevel.color,
                '100%': nextLevel.color,
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
            <Row gutter={16}>
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title="Total donné"
                  value={userStats?.totalDonations || 0}
                  formatter={(value) => formatCurrency(value, currentProfile?.user?.currency)}
                  prefix={<DollarOutlined />}
                  valueStyle={{ color: '#52c41a', fontSize: '20px' }}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title="Nombre de dons"
                  value={userStats?.donationCount || 0}
                  prefix={<GiftOutlined />}
                  valueStyle={{ color: '#1890ff', fontSize: '20px' }}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title="Don moyen"
                  value={userStats?.averageDonation || 0}
                  formatter={(value) => formatCurrency(value, currentProfile?.user?.currency)}
                  prefix={<RiseOutlined />}
                  valueStyle={{ color: '#722ed1', fontSize: '20px' }}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title="Dons récurrents"
                  value={userStats?.activeRecurringDonations || 0}
                  prefix={<ThunderboltOutlined />}
                  valueStyle={{ color: '#fa8c16', fontSize: '20px' }}
                />
              </Col>
            </Row>

            {/* Dernier don */}
            {userStats?.lastDonation && (
              <div style={{ marginTop: 24, padding: 16, backgroundColor: '#f8f9fa', borderRadius: 6 }}>
                <Text strong>Dernier don:</Text>
                <br />
                <Text>
                  {formatCurrency(userStats.lastDonation.amount, userStats.lastDonation.currency)} •
                  {userStats.lastDonation.category} •{moment(userStats.lastDonation.date).format('DD/MM/YYYY')}
                </Text>
              </div>
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
                          {item.firstName} {item.lastName}
                        </Text>
                        {item.level && (
                          <Tag size="small" color={levels.find((l) => l.level === item.level)?.color}>
                            Niv. {item.level}
                          </Tag>
                        )}
                      </div>
                    }
                    description={
                      <div>
                        <Text strong style={{ color: '#52c41a' }}>
                          {formatCurrency(item.totalAmount || 0)}
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
            <Timeline>
              {levels.map((level) => (
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
                    {level.benefits.map((benefit, idx) => (
                      <Tag key={idx} size="small" style={{ marginTop: 4 }}>
                        {benefit}
                      </Tag>
                    ))}
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default UserDashboard;
