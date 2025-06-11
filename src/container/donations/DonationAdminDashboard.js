import React, { useEffect, useState } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Statistic, 
  Table, 
  Button, 
  Tag, 
  Space, 
  Tabs, 
  DatePicker, 
  Select,
  Alert,
  Typography,
  Progress,
  List,
  Avatar,
  Tooltip,
  Modal,
  Form,
  Input,
  InputNumber,
  message,
  Badge,
  Divider
} from 'antd';
import {
  DollarOutlined,
  TrendingUpOutlined,
  TrendingDownOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  DownloadOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  RefundOutlined,
  NotificationOutlined,
  DashboardOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  MoneyCollectOutlined,
  BankOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { usePermissions } from '../../components/utilities/protectedRoute';
import { 
  donationsReadData, 
  donationStatsReadData,
  exportDonations,
  getDonationById
} from '../../redux/donations/actionCreator';
import { getPaymentsList, getPaymentStats } from '../../redux/payments/actionCreator';
import { PaymentNotificationStatus, usePaymentNotifications } from '../../components/notifications/PaymentNotificationSystem';
import { PageHeader } from '../../components/page-headers/page-headers';
import { Cards } from '../../components/cards/frame/cards-frame';
import { Main } from '../styled';

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

function DonationAdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [refundModalVisible, setRefundModalVisible] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(null);

  const dispatch = useDispatch();
  const { hasRole, hasPermission, isAdmin, isTreasurer, isModerator } = usePermissions();
  const { isConnected } = usePaymentNotifications();

  const {
    donations,
    donationsLoading,
    donationStats,
    payments,
    paymentsLoading,
    paymentStats,
    user
  } = useSelector(state => ({
    donations: state.donations.donations || [],
    donationsLoading: state.donations.loading,
    donationStats: state.donations.stats,
    payments: state.payments.payments || [],
    paymentsLoading: state.payments.loading,
    paymentStats: state.payments.stats,
    user: state.auth?.user
  }));

  const PageRoutes = [
    { path: 'index', breadcrumbName: 'Dashboard' },
    { path: '', breadcrumbName: 'Administration Donations' }
  ];

  useEffect(() => {
    loadData();
  }, [selectedPeriod, filterCategory, filterStatus]);

  // useEffect séparé pour l'auto-refresh qui ne dépend pas des filtres
  useEffect(() => {
    setupAutoRefresh();

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, []); // Pas de dépendances pour éviter de recréer l'intervalle

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        dispatch(donationsReadData({ 
          status: filterStatus !== 'all' ? filterStatus : undefined,
          category: filterCategory !== 'all' ? filterCategory : undefined
        })),
        dispatch(donationStatsReadData({ period: selectedPeriod })),
        dispatch(getPaymentsList()),
        dispatch(getPaymentStats({ period: selectedPeriod }))
      ]);
    } catch (error) {
      message.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const setupAutoRefresh = () => {
    // Nettoyer l'ancien intervalle s'il existe
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }
    
    // Refresh automatique toutes les 30 secondes
    const interval = setInterval(() => {
      if (!donationsLoading && !paymentsLoading) {
        // Ne pas appeler loadData() pour éviter la boucle, juste les stats
        dispatch(donationStatsReadData({ period: selectedPeriod }));
        dispatch(getPaymentStats({ period: selectedPeriod }));
      }
    }, 30000);

    setRefreshInterval(interval);
  };

  // Fonction pour forcer le refresh manuel
  const handleManualRefresh = async () => {
    await loadData();
  };

  const handleExportData = async () => {
    try {
      await dispatch(exportDonations({
        status: filterStatus !== 'all' ? filterStatus : undefined,
        category: filterCategory !== 'all' ? filterCategory : undefined,
        period: selectedPeriod
      }));
      message.success('Export en cours de téléchargement');
    } catch (error) {
      message.error('Erreur lors de l\'export');
    }
  };

  const handleRefund = async (values) => {
    try {
      // TODO: Implémenter l'API de remboursement
      message.success(`Remboursement de ${values.amount} XOF initié`);
      setRefundModalVisible(false);
      setSelectedDonation(null);
      loadData();
    } catch (error) {
      message.error('Erreur lors du remboursement');
    }
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      pending: { color: 'orange', text: '⏳ En attente' },
      processing: { color: 'blue', text: '🔄 Traitement' },
      completed: { color: 'green', text: '✅ Complété' },
      failed: { color: 'red', text: '❌ Échoué' },
      cancelled: { color: 'default', text: '⛔ Annulé' },
      refunded: { color: 'purple', text: '💸 Remboursé' }
    };
    const config = statusConfig[status] || statusConfig.pending;
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getCategoryLabel = (category) => {
    const categories = {
      tithe: '🙏 Dîme',
      offering: '💝 Offrande',
      building: '🏗️ Construction',
      missions: '🌍 Missions',
      charity: '❤️ Charité',
      education: '📚 Éducation',
      youth: '👨‍👩‍👧‍👦 Jeunesse',
      women: '👩 Femmes',
      men: '👨 Hommes',
      special: '⭐ Spécial',
      emergency: '🚨 Urgence'
    };
    return categories[category] || category;
  };

  // Statistiques calculées
  const totalAmount = donationStats?.totalAmount || 0;
  const totalCount = donationStats?.totalCount || 0;
  const averageAmount = donationStats?.averageAmount || 0;
  const completedDonations = donations.filter(d => d.status === 'completed').length;
  const pendingDonations = donations.filter(d => d.status === 'pending').length;
  const failedDonations = donations.filter(d => d.status === 'failed').length;

  // Calcul du taux de succès
  const successRate = totalCount > 0 ? (completedDonations / totalCount * 100) : 0;

  // Données pour les graphiques
  const categoryData = donationStats?.categoriesBreakdown || [];
  const monthlyData = donationStats?.monthlyEvolution || [];

  // Colonnes du tableau des donations
  const donationsColumns = [
    {
      title: 'ID',
      dataIndex: '_id',
      key: '_id',
      width: 120,
      render: (id) => <Text code>{id.substring(0, 8)}...</Text>
    },
    {
      title: 'Utilisateur',
      dataIndex: 'user',
      key: 'user',
      render: (user) => (
        <div>
          <Text strong>{user?.firstName} {user?.lastName}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>{user?.email}</Text>
        </div>
      )
    },
    {
      title: 'Montant',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount, record) => (
        <Text strong style={{ color: '#52c41a' }}>
          {new Intl.NumberFormat('fr-FR').format(amount)} {record.currency}
        </Text>
      ),
      sorter: (a, b) => a.amount - b.amount
    },
    {
      title: 'Catégorie',
      dataIndex: 'category',
      key: 'category',
      render: (category) => <Text>{getCategoryLabel(category)}</Text>
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={type === 'recurring' ? 'purple' : 'blue'}>
          {type === 'recurring' ? '🔄 Récurrent' : '💰 Unique'}
        </Tag>
      )
    },
    {
      title: 'Statut',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status)
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString('fr-FR'),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Voir détails">
            <Button 
              icon={<EyeOutlined />} 
              size="small"
              onClick={() => window.open(`/admin/donations/${record._id}`, '_blank')}
            />
          </Tooltip>
          
          {(isAdmin || isTreasurer) && record.status === 'completed' && (
            <Tooltip title="Remboursement">
              <Button 
                icon={<RefundOutlined />} 
                size="small"
                danger
                onClick={() => {
                  setSelectedDonation(record);
                  setRefundModalVisible(true);
                }}
              />
            </Tooltip>
          )}
          
          {isAdmin && (
            <Tooltip title="Modifier">
              <Button 
                icon={<EditOutlined />} 
                size="small"
                type="primary"
                ghost
              />
            </Tooltip>
          )}
        </Space>
      )
    }
  ];

  // Contenu des onglets
  const tabItems = [
    {
      key: 'overview',
      label: (
        <span>
          <DashboardOutlined />
          Vue d'ensemble
        </span>
      ),
      children: (
        <div>
          {/* Indicateur de connexion temps réel */}
          {isConnected && <PaymentNotificationStatus />}
          
          {/* Statistiques principales */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Total Donations"
                  value={totalAmount}
                  precision={0}
                  valueStyle={{ color: '#3f8600' }}
                  prefix={<DollarOutlined />}
                  suffix="XOF"
                />
              </Card>
            </Col>
            
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Nombre de Donations"
                  value={totalCount}
                  valueStyle={{ color: '#1890ff' }}
                  prefix={<MoneyCollectOutlined />}
                />
              </Card>
            </Col>
            
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Don Moyen"
                  value={averageAmount}
                  precision={0}
                  valueStyle={{ color: '#722ed1' }}
                  prefix={<BarChartOutlined />}
                  suffix="XOF"
                />
              </Card>
            </Col>
            
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Taux de Succès"
                  value={successRate}
                  precision={1}
                  valueStyle={{ color: successRate > 90 ? '#3f8600' : '#cf1322' }}
                  prefix={successRate > 90 ? <TrendingUpOutlined /> : <TrendingDownOutlined />}
                  suffix="%"
                />
              </Card>
            </Col>
          </Row>

          {/* Graphique de répartition des statuts */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} lg={12}>
              <Card title="📊 Répartition par Statut" size="small">
                <Row gutter={16}>
                  <Col span={12}>
                    <Progress
                      type="dashboard"
                      percent={successRate}
                      strokeColor={{
                        '0%': '#108ee9',
                        '100%': '#87d068',
                      }}
                      format={() => `${Math.round(successRate)}%`}
                    />
                    <Text style={{ display: 'block', textAlign: 'center', marginTop: 8 }}>
                      Taux de Succès
                    </Text>
                  </Col>
                  <Col span={12}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Text>✅ Complétées:</Text>
                        <Text strong>{completedDonations}</Text>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Text>⏳ En attente:</Text>
                        <Text>{pendingDonations}</Text>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Text>❌ Échouées:</Text>
                        <Text>{failedDonations}</Text>
                      </div>
                    </Space>
                  </Col>
                </Row>
              </Card>
            </Col>
            
            <Col xs={24} lg={12}>
              <Card title="🎯 Top Catégories" size="small">
                <List
                  size="small"
                  dataSource={categoryData.slice(0, 5)}
                  renderItem={(item, index) => (
                    <List.Item>
                      <Space>
                        <Badge 
                          count={index + 1} 
                          style={{ backgroundColor: index === 0 ? '#52c41a' : '#1890ff' }}
                        />
                        <Text>{getCategoryLabel(item._id)}</Text>
                      </Space>
                      <Text strong>
                        {new Intl.NumberFormat('fr-FR').format(item.totalAmount)} XOF
                      </Text>
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>

          {/* Alertes et notifications */}
          {pendingDonations > 0 && (
            <Alert
              message="Donations en attente"
              description={`${pendingDonations} donation(s) nécessitent votre attention`}
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
              action={
                <Button size="small" onClick={() => setActiveTab('donations')}>
                  Voir tout
                </Button>
              }
            />
          )}

          {failedDonations > 0 && (
            <Alert
              message="Donations échouées"
              description={`${failedDonations} donation(s) ont échoué et peuvent nécessiter un suivi`}
              type="error"
              showIcon
              style={{ marginBottom: 16 }}
              action={
                <Button size="small" onClick={() => setActiveTab('donations')}>
                  Examiner
                </Button>
              }
            />
          )}
        </div>
      )
    },
    {
      key: 'donations',
      label: (
        <span>
          <MoneyCollectOutlined />
          Toutes les Donations
        </span>
      ),
      children: (
        <div>
          {/* Filtres */}
          <Card size="small" style={{ marginBottom: 16 }}>
            <Row gutter={16} align="middle">
              <Col xs={24} sm={6}>
                <Select
                  value={filterStatus}
                  onChange={setFilterStatus}
                  style={{ width: '100%' }}
                  placeholder="Filtrer par statut"
                >
                  <Option value="all">Tous les statuts</Option>
                  <Option value="pending">En attente</Option>
                  <Option value="completed">Complétées</Option>
                  <Option value="failed">Échouées</Option>
                  <Option value="cancelled">Annulées</Option>
                </Select>
              </Col>
              
              <Col xs={24} sm={6}>
                <Select
                  value={filterCategory}
                  onChange={setFilterCategory}
                  style={{ width: '100%' }}
                  placeholder="Filtrer par catégorie"
                >
                  <Option value="all">Toutes les catégories</Option>
                  <Option value="tithe">Dîme</Option>
                  <Option value="offering">Offrande</Option>
                  <Option value="building">Construction</Option>
                  <Option value="missions">Missions</Option>
                  <Option value="charity">Charité</Option>
                </Select>
              </Col>
              
              <Col xs={24} sm={6}>
                <Select
                  value={selectedPeriod}
                  onChange={setSelectedPeriod}
                  style={{ width: '100%' }}
                >
                  <Option value="week">Cette semaine</Option>
                  <Option value="month">Ce mois</Option>
                  <Option value="quarter">Ce trimestre</Option>
                  <Option value="year">Cette année</Option>
                  <Option value="all">Toutes les périodes</Option>
                </Select>
              </Col>
              
              <Col xs={24} sm={6}>
                <Space>
                  <Button 
                    icon={<ReloadOutlined />}
                    onClick={handleManualRefresh}
                    loading={loading}
                  >
                    Actualiser
                  </Button>
                  
                  {(isAdmin || isTreasurer) && (
                    <Button 
                      icon={<DownloadOutlined />}
                      onClick={handleExportData}
                    >
                      Export
                    </Button>
                  )}
                </Space>
              </Col>
            </Row>
          </Card>

          {/* Tableau des donations */}
          <Card>
            <Table
              columns={donationsColumns}
              dataSource={donations}
              rowKey="_id"
              loading={donationsLoading}
              pagination={{
                pageSize: 20,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => 
                  `${range[0]}-${range[1]} sur ${total} donations`
              }}
              scroll={{ x: 1200 }}
            />
          </Card>
        </div>
      )
    }
  ];

  return (
    <>
      <PageHeader
        className="ninjadash-page-header-main"
        title="Administration des Donations"
        routes={PageRoutes}
      />
      <Main>
        <Row gutter={25}>
          <Col span={24}>
            <Cards headless>
              <div style={{ padding: '20px' }}>
                <div style={{ marginBottom: 24 }}>
                  <Title level={2} style={{ margin: 0 }}>
                    <DashboardOutlined style={{ marginRight: 12 }} />
                    Dashboard Donations
                  </Title>
                  <Paragraph type="secondary">
                    Monitoring et gestion complète du système de donations
                  </Paragraph>
                </div>

                <Tabs
                  activeKey={activeTab}
                  onChange={setActiveTab}
                  items={tabItems}
                  type="line"
                />
              </div>
            </Cards>
          </Col>
        </Row>

        {/* Modal de remboursement */}
        <Modal
          title="💸 Traiter un Remboursement"
          open={refundModalVisible}
          onCancel={() => {
            setRefundModalVisible(false);
            setSelectedDonation(null);
          }}
          footer={null}
        >
          {selectedDonation && (
            <Form
              layout="vertical"
              onFinish={handleRefund}
              initialValues={{
                amount: selectedDonation.amount,
                reason: ''
              }}
            >
              <Alert
                message="Donation à rembourser"
                description={
                  <div>
                    <Text>ID: {selectedDonation._id}</Text><br />
                    <Text>Montant: {selectedDonation.amount} {selectedDonation.currency}</Text><br />
                    <Text>Utilisateur: {selectedDonation.user?.firstName} {selectedDonation.user?.lastName}</Text>
                  </div>
                }
                type="info"
                style={{ marginBottom: 16 }}
              />

              <Form.Item
                label="Montant à rembourser"
                name="amount"
                rules={[
                  { required: true, message: 'Montant requis' },
                  { type: 'number', min: 0, max: selectedDonation.amount, message: 'Montant invalide' }
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  suffix={selectedDonation.currency}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                />
              </Form.Item>

              <Form.Item
                label="Raison du remboursement"
                name="reason"
                rules={[{ required: true, message: 'Raison requise' }]}
              >
                <Input.TextArea rows={3} placeholder="Expliquer la raison du remboursement..." />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button type="primary" danger htmlType="submit">
                    Confirmer le Remboursement
                  </Button>
                  <Button onClick={() => setRefundModalVisible(false)}>
                    Annuler
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          )}
        </Modal>
      </Main>
    </>
  );
}

export default DonationAdminDashboard; 