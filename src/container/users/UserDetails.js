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
  Table,
  Tag,
  Descriptions,
  Button,
  Tooltip,
  Space,
  Tabs,
  Alert,
} from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import {
  UserOutlined,
  ArrowLeftOutlined,
  DollarOutlined,
  CalendarOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  StarOutlined,
  GiftOutlined,
  CreditCardOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import moment from 'moment';
import {
  getUserById,
  getUserStats,
  getUserDonations,
  calculateUserLevel,
  formatCurrency,
  generateUserBadges,
} from '../../redux/users/actionCreator';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

function UserDetails({ userId, onBack }) {
  const [activeTab, setActiveTab] = useState('profile');
  const [donationFilters, setDonationFilters] = useState({});
  const dispatch = useDispatch();

  console.log(donationFilters);
  const {
    selectedUser,
    userLoading,
    userStats,
    statsLoading,
    userDonations,
    donationsLoading,
    donationsPagination,
    donationsStats,
    levels,
  } = useSelector((state) => ({
    selectedUser: state.users.selectedUser,
    userLoading: state.users.userLoading,
    userStats: state.users.userStats,
    statsLoading: state.users.statsLoading,
    userDonations: state.users.userDonations,
    donationsLoading: state.users.donationsLoading,
    donationsPagination: state.users.donationsPagination,
    donationsStats: state.users.donationsStats,
    levels: state.users.levels,
  }));

  useEffect(() => {
    if (userId) {
      dispatch(getUserById(userId));
      dispatch(getUserStats(userId));
      dispatch(getUserDonations(userId));
    }
  }, [dispatch, userId]);

  const handleDonationTableChange = (pagination, filters) => {
    const newFilters = {
      page: pagination.current,
      limit: pagination.pageSize,
      ...filters,
    };
    setDonationFilters(newFilters);
    dispatch(getUserDonations(userId, newFilters));
  };

  if (!selectedUser && !userLoading) {
    return (
      <Alert
        message="Utilisateur non trouvé"
        description="L'utilisateur demandé n'existe pas ou vous n'avez pas les permissions pour le voir."
        type="error"
        showIcon
      />
    );
  }

  // Calculer le niveau et les badges
  const currentLevel = selectedUser ? calculateUserLevel(selectedUser.points || 0) : levels[0];
  const nextLevel = levels.find((level) => level.level === currentLevel.level + 1);
  const badges = userStats ? generateUserBadges(userStats) : [];

  // Colonnes pour le tableau des donations
  const donationColumns = [
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date) => (
        <div>
          <CalendarOutlined style={{ marginRight: 4, color: '#666' }} />
          <Text>{moment(date).format('DD/MM/YYYY')}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 11 }}>
            {moment(date).format('HH:mm')}
          </Text>
        </div>
      ),
      sorter: true,
    },
    {
      title: 'Montant',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      render: (amount, record) => (
        <Text strong style={{ color: '#52c41a', fontSize: 16 }}>
          {formatCurrency(amount, record.currency)}
        </Text>
      ),
      sorter: true,
    },
    {
      title: 'Catégorie',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (category) => <Tag>{category}</Tag>,
      filters: [
        { text: 'Dîme', value: 'tithe' },
        { text: 'Offrande', value: 'offering' },
        { text: 'Construction', value: 'building' },
        { text: 'Missions', value: 'missions' },
      ],
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type) => (
        <Tag color={type === 'recurring' ? 'blue' : 'green'}>{type === 'recurring' ? 'Récurrent' : 'Unique'}</Tag>
      ),
      filters: [
        { text: 'Unique', value: 'one_time' },
        { text: 'Récurrent', value: 'recurring' },
      ],
    },
    {
      title: 'Statut',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const statusConfig = {
          completed: { color: 'success', text: 'Complété', icon: <CheckCircleOutlined /> },
          pending: { color: 'processing', text: 'En attente', icon: <ClockCircleOutlined /> },
          failed: { color: 'error', text: 'Échoué', icon: <ClockCircleOutlined /> },
        };
        const config = statusConfig[status] || statusConfig.pending;
        return <Badge status={config.color} text={config.text} />;
      },
      filters: [
        { text: 'Complété', value: 'completed' },
        { text: 'En attente', value: 'pending' },
        { text: 'Échoué', value: 'failed' },
      ],
    },
    {
      title: 'Paiement',
      key: 'payment',
      width: 100,
      render: (_, record) =>
        record.payment ? (
          <Space>
            <CreditCardOutlined />
            <Text>{record.payment.provider}</Text>
          </Space>
        ) : (
          <Text type="secondary">-</Text>
        ),
    },
  ];

  return (
    <div>
      {/* Bouton retour */}
      <Button type="text" icon={<ArrowLeftOutlined />} onClick={onBack} style={{ marginBottom: 16 }}>
        Retour à la liste
      </Button>

      {/* En-tête utilisateur */}
      <Card loading={userLoading} style={{ marginBottom: 24 }}>
        <Row align="middle" gutter={24}>
          <Col>
            <Avatar
              size={80}
              src={selectedUser?.avatar}
              icon={<UserOutlined />}
              style={{ border: `3px solid ${currentLevel?.color}` }}
            />
          </Col>
          <Col flex="auto">
            <div>
              <Title level={3} style={{ margin: 0 }}>
                {selectedUser?.firstName} {selectedUser?.lastName}
                <Tag color={currentLevel?.color} style={{ marginLeft: 12 }}>
                  {currentLevel?.name}
                </Tag>
              </Title>
              <Text type="secondary" style={{ fontSize: 16 }}>
                {selectedUser?.email}
              </Text>
              <br />
              <Space style={{ marginTop: 8 }}>
                <Text>
                  <StarOutlined style={{ color: '#faad14' }} />
                  {selectedUser?.points || 0} points
                </Text>
                <Text>•</Text>
                <Text>Niveau {selectedUser?.level || 1}</Text>
                <Text>•</Text>
                <Badge
                  status={selectedUser?.isActive ? 'success' : 'error'}
                  text={selectedUser?.isActive ? 'Actif' : 'Inactif'}
                />
              </Space>
            </div>
          </Col>
          <Col>
            <Space direction="vertical" style={{ textAlign: 'center' }}>
              <Statistic
                title="Total donné"
                value={selectedUser?.totalDonations || 0}
                formatter={(value) => formatCurrency(value, selectedUser?.currency)}
                valueStyle={{ color: '#52c41a', fontSize: '18px' }}
              />
              <Text type="secondary">
                {selectedUser?.donationCount || 0} donation{(selectedUser?.donationCount || 0) > 1 ? 's' : ''}
              </Text>
            </Space>
          </Col>
        </Row>

        {/* Progression vers le niveau suivant */}
        {nextLevel && (
          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text>Progression vers {nextLevel.name}</Text>
              <Text>
                {selectedUser?.points || 0} / {nextLevel.minPoints} points
              </Text>
            </div>
            <Progress
              percent={Math.min(
                (((selectedUser?.points || 0) - currentLevel.minPoints) /
                  (nextLevel.minPoints - currentLevel.minPoints)) *
                  100,
                100,
              )}
              strokeColor={{
                '0%': currentLevel.color,
                '100%': nextLevel.color,
              }}
              showInfo={false}
            />
          </div>
        )}
      </Card>

      {/* Onglets de détails */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Profil" key="profile">
            <Row gutter={24}>
              <Col xs={24} lg={12}>
                <Descriptions title="Informations personnelles" column={1}>
                  <Descriptions.Item label="Nom complet">
                    {selectedUser?.firstName} {selectedUser?.lastName}
                  </Descriptions.Item>
                  <Descriptions.Item label="Email">
                    <Space>
                      <MailOutlined />
                      {selectedUser?.email}
                      {selectedUser?.isEmailVerified && <CheckCircleOutlined style={{ color: '#52c41a' }} />}
                    </Space>
                  </Descriptions.Item>
                  <Descriptions.Item label="Téléphone">
                    {selectedUser?.phone ? (
                      <Space>
                        <PhoneOutlined />
                        {selectedUser.phone}
                        {selectedUser?.isPhoneVerified && <CheckCircleOutlined style={{ color: '#52c41a' }} />}
                      </Space>
                    ) : (
                      <Text type="secondary">Non renseigné</Text>
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Localisation">
                    <Space>
                      <HomeOutlined />
                      {selectedUser?.city && `${selectedUser.city}, `}
                      {selectedUser?.country}
                    </Space>
                  </Descriptions.Item>
                  <Descriptions.Item label="Langue">{selectedUser?.language || 'Français'}</Descriptions.Item>
                  <Descriptions.Item label="Devise">{selectedUser?.currency || 'XOF'}</Descriptions.Item>
                  <Descriptions.Item label="Membre depuis">
                    {moment(selectedUser?.createdAt).format('DD MMMM YYYY')}
                  </Descriptions.Item>
                  <Descriptions.Item label="Dernière connexion">
                    {selectedUser?.lastLogin ? moment(selectedUser.lastLogin).fromNow() : 'Jamais connecté'}
                  </Descriptions.Item>
                </Descriptions>

                {/* Badges */}
                {badges.length > 0 && (
                  <div style={{ marginTop: 24 }}>
                    <Title level={5}>Badges obtenus</Title>
                    <Row gutter={[16, 16]}>
                      {badges.map((badge, index) => (
                        <Col key={index} xs={12} sm={8}>
                          <Tooltip title={badge.description}>
                            <Card size="small" style={{ textAlign: 'center' }}>
                              <div style={{ fontSize: 24, marginBottom: 4 }}>{badge.icon}</div>
                              <Text strong style={{ fontSize: 11 }}>
                                {badge.name}
                              </Text>
                            </Card>
                          </Tooltip>
                        </Col>
                      ))}
                    </Row>
                  </div>
                )}
              </Col>

              <Col xs={24} lg={12}>
                {/* Statistiques détaillées */}
                <Card title="Statistiques" size="small" loading={statsLoading}>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Statistic
                        title="Total donné"
                        value={userStats?.totalDonations || 0}
                        formatter={(value) => formatCurrency(value, selectedUser?.currency)}
                        prefix={<DollarOutlined />}
                        valueStyle={{ fontSize: '16px' }}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="Nombre de dons"
                        value={userStats?.donationCount || 0}
                        prefix={<GiftOutlined />}
                        valueStyle={{ fontSize: '16px' }}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="Don moyen"
                        value={userStats?.averageDonation || 0}
                        formatter={(value) => formatCurrency(value, selectedUser?.currency)}
                        valueStyle={{ fontSize: '14px' }}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="Dons récurrents"
                        value={userStats?.activeRecurringDonations || 0}
                        valueStyle={{ fontSize: '14px' }}
                      />
                    </Col>
                  </Row>

                  {userStats?.lastDonation && (
                    <div style={{ marginTop: 16, padding: 12, backgroundColor: '#f8f9fa', borderRadius: 4 }}>
                      <Text strong>Dernier don:</Text>
                      <br />
                      <Text>
                        {formatCurrency(userStats.lastDonation.amount, userStats.lastDonation.currency)} •
                        {userStats.lastDonation.category} •{moment(userStats.lastDonation.date).format('DD/MM/YYYY')}
                      </Text>
                    </div>
                  )}
                </Card>

                {/* Profil étendu si disponible */}
                {selectedUser?.profile && (
                  <Card title="Profil étendu" size="small" style={{ marginTop: 16 }}>
                    <Descriptions column={1} size="small">
                      {selectedUser.profile.dateOfBirth && (
                        <Descriptions.Item label="Date de naissance">
                          {moment(selectedUser.profile.dateOfBirth).format('DD/MM/YYYY')}({selectedUser.profile.age}{' '}
                          ans)
                        </Descriptions.Item>
                      )}
                      {selectedUser.profile.gender && (
                        <Descriptions.Item label="Genre">{selectedUser.profile.gender}</Descriptions.Item>
                      )}
                      {selectedUser.profile.occupation && (
                        <Descriptions.Item label="Profession">{selectedUser.profile.occupation}</Descriptions.Item>
                      )}
                      {selectedUser.profile.monthlyIncome && (
                        <Descriptions.Item label="Revenu mensuel">
                          {formatCurrency(selectedUser.profile.monthlyIncome, selectedUser.currency)}
                        </Descriptions.Item>
                      )}
                    </Descriptions>

                    <Progress
                      percent={selectedUser.profile.completionPercentage || 0}
                      size="small"
                      format={(percent) => `Profil ${percent}% complété`}
                    />
                  </Card>
                )}
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="Historique des donations" key="donations">
            {/* Résumé des donations */}
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col xs={24} sm={8}>
                <Card size="small">
                  <Statistic
                    title="Total"
                    value={donationsStats?.totalAmount || 0}
                    formatter={(value) => formatCurrency(value, selectedUser?.currency)}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card size="small">
                  <Statistic title="Nombre" value={donationsStats?.totalCount || 0} valueStyle={{ color: '#1890ff' }} />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card size="small">
                  <Statistic
                    title="Moyenne"
                    value={donationsStats?.averageAmount || 0}
                    formatter={(value) => formatCurrency(value, selectedUser?.currency)}
                    valueStyle={{ color: '#722ed1' }}
                  />
                </Card>
              </Col>
            </Row>

            {/* Tableau des donations */}
            <Table
              columns={donationColumns}
              dataSource={userDonations}
              rowKey="_id"
              loading={donationsLoading}
              pagination={{
                current: donationsPagination.current,
                pageSize: donationsPagination.pageSize,
                total: donationsPagination.total,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} sur ${total} donations`,
              }}
              onChange={handleDonationTableChange}
              scroll={{ x: 800 }}
              size="small"
            />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
}

export default UserDetails;
