import React, { useEffect, useState } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Statistic, 
  Button, 
  DatePicker, 
  Select,
  Typography,
  Space,
  Alert,
  Tabs,
  Table,
  Progress,
  Tag,
  Divider,
  Tooltip,
  message
} from 'antd';
import {
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  DownloadOutlined,
  PrinterOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  CalendarOutlined,
  TrendingUpOutlined,
  TrendingDownOutlined,
  DollarOutlined,
  UserOutlined,
  FilterOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { usePermissions } from '../../components/utilities/protectedRoute';
import { 
  donationStatsReadData,
  exportDonations,
  donationsReadData
} from '../../redux/donations/actionCreator';
import { PageHeader } from '../../components/page-headers/page-headers';
import { Cards } from '../../components/cards/frame/cards-frame';
import { Main } from '../styled';
import moment from 'moment';

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

function DonationReports() {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState([moment().subtract(30, 'days'), moment()]);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('completed');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);

  const dispatch = useDispatch();
  const { hasRole, hasPermission, isAdmin, isTreasurer } = usePermissions();

  const {
    donationStats,
    donations,
    donationsLoading
  } = useSelector(state => ({
    donationStats: state.donations.stats,
    donations: state.donations.donations || [],
    donationsLoading: state.donations.loading
  }));

  const PageRoutes = [
    { path: 'index', breadcrumbName: 'Dashboard' },
    { path: 'donations', breadcrumbName: 'Donations' },
    { path: '', breadcrumbName: 'Rapports & Analytics' }
  ];

  useEffect(() => {
    loadReportData();
  }, [dateRange, filterCategory, filterType, filterStatus]);

  const loadReportData = async () => {
    setLoading(true);
    try {
      const filters = {
        dateFrom: dateRange[0]?.format('YYYY-MM-DD'),
        dateTo: dateRange[1]?.format('YYYY-MM-DD'),
        category: filterCategory !== 'all' ? filterCategory : undefined,
        type: filterType !== 'all' ? filterType : undefined,
        status: filterStatus !== 'all' ? filterStatus : undefined
      };

      await Promise.all([
        dispatch(donationStatsReadData(filters)),
        dispatch(donationsReadData(filters))
      ]);

      // Calculer des données supplémentaires pour les rapports
      generateReportAnalytics();
    } catch (error) {
      message.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const generateReportAnalytics = () => {
    if (!donations.length) return;

    // Analyse par période
    const dailyData = {};
    const monthlyData = {};
    const categoryData = {};
    const userStats = {};
    const paymentMethodStats = {};

    donations.forEach(donation => {
      const date = moment(donation.createdAt);
      const dayKey = date.format('YYYY-MM-DD');
      const monthKey = date.format('YYYY-MM');

      // Données journalières
      if (!dailyData[dayKey]) {
        dailyData[dayKey] = { count: 0, amount: 0 };
      }
      dailyData[dayKey].count += 1;
      dailyData[dayKey].amount += donation.amount;

      // Données mensuelles
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { count: 0, amount: 0 };
      }
      monthlyData[monthKey].count += 1;
      monthlyData[monthKey].amount += donation.amount;

      // Par catégorie
      if (!categoryData[donation.category]) {
        categoryData[donation.category] = { count: 0, amount: 0 };
      }
      categoryData[donation.category].count += 1;
      categoryData[donation.category].amount += donation.amount;

      // Par utilisateur
      const userId = donation.user?._id || donation.user;
      if (!userStats[userId]) {
        userStats[userId] = {
          user: donation.user,
          count: 0,
          amount: 0,
          lastDonation: donation.createdAt
        };
      }
      userStats[userId].count += 1;
      userStats[userId].amount += donation.amount;

      // Par méthode de paiement
      if (!paymentMethodStats[donation.paymentMethod]) {
        paymentMethodStats[donation.paymentMethod] = { count: 0, amount: 0 };
      }
      paymentMethodStats[donation.paymentMethod].count += 1;
      paymentMethodStats[donation.paymentMethod].amount += donation.amount;
    });

    setReportData({
      dailyData,
      monthlyData,
      categoryData,
      userStats,
      paymentMethodStats,
      totalAmount: donations.reduce((sum, d) => sum + d.amount, 0),
      totalCount: donations.length,
      averageAmount: donations.length > 0 ? donations.reduce((sum, d) => sum + d.amount, 0) / donations.length : 0,
      period: {
        start: dateRange[0]?.format('DD/MM/YYYY'),
        end: dateRange[1]?.format('DD/MM/YYYY'),
        days: dateRange[1]?.diff(dateRange[0], 'days') + 1
      }
    });
  };

  const handleExport = async (format) => {
    try {
      const filters = {
        dateFrom: dateRange[0]?.format('YYYY-MM-DD'),
        dateTo: dateRange[1]?.format('YYYY-MM-DD'),
        category: filterCategory !== 'all' ? filterCategory : undefined,
        type: filterType !== 'all' ? filterType : undefined,
        status: filterStatus !== 'all' ? filterStatus : undefined,
        format
      };

      await dispatch(exportDonations(filters));
      message.success(`Export ${format.toUpperCase()} en cours de téléchargement`);
    } catch (error) {
      message.error(`Erreur lors de l'export ${format.toUpperCase()}`);
    }
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

  const getPaymentMethodLabel = (method) => {
    const methods = {
      card: '💳 Carte Bancaire',
      mobile_money: '📱 Mobile Money',
      paypal: '💸 PayPal',
      bank_transfer: '🏦 Virement',
      cash: '💵 Espèces'
    };
    return methods[method] || method;
  };

  // Colonnes pour le tableau des top donateurs
  const topDonatorsColumns = [
    {
      title: 'Rang',
      key: 'rank',
      width: 60,
      render: (_, __, index) => (
        <Tag color={index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'orange' : 'default'}>
          #{index + 1}
        </Tag>
      )
    },
    {
      title: 'Donateur',
      key: 'user',
      render: (_, record) => (
        <div>
          <Text strong>
            {record.user?.firstName} {record.user?.lastName}
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.user?.email}
          </Text>
        </div>
      )
    },
    {
      title: 'Nombre de Dons',
      dataIndex: 'count',
      key: 'count',
      render: (count) => <Text strong>{count}</Text>
    },
    {
      title: 'Montant Total',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => (
        <Text strong style={{ color: '#52c41a' }}>
          {new Intl.NumberFormat('fr-FR').format(amount)} XOF
        </Text>
      )
    },
    {
      title: 'Dernière Donation',
      dataIndex: 'lastDonation',
      key: 'lastDonation',
      render: (date) => moment(date).format('DD/MM/YYYY')
    }
  ];

  // Préparation des données pour les graphiques
  const categoryChartData = reportData ? Object.entries(reportData.categoryData).map(([category, data]) => ({
    category: getCategoryLabel(category),
    count: data.count,
    amount: data.amount,
    percentage: ((data.amount / reportData.totalAmount) * 100).toFixed(1)
  })).sort((a, b) => b.amount - a.amount) : [];

  const paymentMethodChartData = reportData ? Object.entries(reportData.paymentMethodStats).map(([method, data]) => ({
    method: getPaymentMethodLabel(method),
    count: data.count,
    amount: data.amount,
    percentage: ((data.amount / reportData.totalAmount) * 100).toFixed(1)
  })).sort((a, b) => b.amount - a.amount) : [];

  const topDonators = reportData ? Object.values(reportData.userStats)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 10) : [];

  // Comparaison avec la période précédente
  const previousPeriodDays = reportData?.period?.days || 30;
  const previousPeriodStart = dateRange[0]?.clone().subtract(previousPeriodDays, 'days');
  const previousPeriodEnd = dateRange[0]?.clone().subtract(1, 'day');

  const tabItems = [
    {
      key: 'overview',
      label: (
        <span>
          <BarChartOutlined />
          Vue d'ensemble
        </span>
      ),
      children: (
        <div>
          {/* Statistiques principales */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Montant Total"
                  value={reportData?.totalAmount || 0}
                  precision={0}
                  valueStyle={{ color: '#3f8600' }}
                  prefix={<DollarOutlined />}
                  suffix="XOF"
                />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Sur {reportData?.period?.days || 0} jour(s)
                </Text>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Nombre de Donations"
                  value={reportData?.totalCount || 0}
                  valueStyle={{ color: '#1890ff' }}
                  prefix={<UserOutlined />}
                />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Moyenne: {reportData?.period?.days ? (reportData.totalCount / reportData.period.days).toFixed(1) : 0}/jour
                </Text>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Don Moyen"
                  value={reportData?.averageAmount || 0}
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
                  title="Donateurs Uniques"
                  value={Object.keys(reportData?.userStats || {}).length}
                  valueStyle={{ color: '#fa8c16' }}
                  prefix={<UserOutlined />}
                />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {reportData?.totalCount > 0 ? (reportData.totalCount / Object.keys(reportData.userStats || {}).length).toFixed(1) : 0} dons/donateur
                </Text>
              </Card>
            </Col>
          </Row>

          {/* Graphiques de répartition */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} lg={12}>
              <Card title="📊 Répartition par Catégorie" size="small">
                <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                  {categoryChartData.map((item, index) => (
                    <div key={item.category} style={{ marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <Text>{item.category}</Text>
                        <Space>
                          <Text strong>{item.percentage}%</Text>
                          <Text type="secondary">({item.count})</Text>
                        </Space>
                      </div>
                      <Progress 
                        percent={parseFloat(item.percentage)} 
                        showInfo={false}
                        strokeColor={`hsl(${index * 137.5 % 360}, 70%, 50%)`}
                      />
                      <Text style={{ fontSize: 12, color: '#52c41a' }}>
                        {new Intl.NumberFormat('fr-FR').format(item.amount)} XOF
                      </Text>
                    </div>
                  ))}
                </div>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card title="💳 Répartition par Méthode de Paiement" size="small">
                <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                  {paymentMethodChartData.map((item, index) => (
                    <div key={item.method} style={{ marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <Text>{item.method}</Text>
                        <Space>
                          <Text strong>{item.percentage}%</Text>
                          <Text type="secondary">({item.count})</Text>
                        </Space>
                      </div>
                      <Progress 
                        percent={parseFloat(item.percentage)} 
                        showInfo={false}
                        strokeColor={['#52c41a', '#1890ff', '#722ed1', '#fa8c16', '#eb2f96'][index % 5]}
                      />
                      <Text style={{ fontSize: 12, color: '#52c41a' }}>
                        {new Intl.NumberFormat('fr-FR').format(item.amount)} XOF
                      </Text>
                    </div>
                  ))}
                </div>
              </Card>
            </Col>
          </Row>

          {/* Informations de période */}
          <Alert
            message="Période du rapport"
            description={`Du ${reportData?.period?.start} au ${reportData?.period?.end} (${reportData?.period?.days} jours)`}
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
        </div>
      )
    },
    {
      key: 'donators',
      label: (
        <span>
          <UserOutlined />
          Top Donateurs
        </span>
      ),
      children: (
        <div>
          <Card title="🏆 Classement des Donateurs" style={{ marginBottom: 16 }}>
            <Table
              columns={topDonatorsColumns}
              dataSource={topDonators}
              rowKey={(record) => record.user?._id || Math.random()}
              pagination={false}
              size="small"
            />
          </Card>

          {topDonators.length > 0 && (
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={8}>
                <Card size="small">
                  <Statistic
                    title="🥇 Top Donateur"
                    value={topDonators[0]?.amount || 0}
                    precision={0}
                    valueStyle={{ color: '#faad14' }}
                    suffix="XOF"
                  />
                  <Text>{topDonators[0]?.user?.firstName} {topDonators[0]?.user?.lastName}</Text>
                </Card>
              </Col>
              
              <Col xs={24} lg={8}>
                <Card size="small">
                  <Statistic
                    title="🥈 Deuxième Place"
                    value={topDonators[1]?.amount || 0}
                    precision={0}
                    valueStyle={{ color: '#722ed1' }}
                    suffix="XOF"
                  />
                  <Text>{topDonators[1]?.user?.firstName} {topDonators[1]?.user?.lastName}</Text>
                </Card>
              </Col>
              
              <Col xs={24} lg={8}>
                <Card size="small">
                  <Statistic
                    title="🥉 Troisième Place"
                    value={topDonators[2]?.amount || 0}
                    precision={0}
                    valueStyle={{ color: '#fa8c16' }}
                    suffix="XOF"
                  />
                  <Text>{topDonators[2]?.user?.firstName} {topDonators[2]?.user?.lastName}</Text>
                </Card>
              </Col>
            </Row>
          )}
        </div>
      )
    }
  ];

  return (
    <>
      <PageHeader
        className="ninjadash-page-header-main"
        title="Rapports & Analytics"
        routes={PageRoutes}
      />
      <Main>
        <Row gutter={25}>
          <Col span={24}>
            <Cards headless>
              <div style={{ padding: '20px' }}>
                {/* En-tête avec filtres */}
                <div style={{ marginBottom: 24 }}>
                  <Title level={2} style={{ margin: 0 }}>
                    <BarChartOutlined style={{ marginRight: 12 }} />
                    Rapports & Analytics
                  </Title>
                  <Paragraph type="secondary">
                    Analyse détaillée des donations et performance du système
                  </Paragraph>
                </div>

                {/* Filtres */}
                <Card size="small" style={{ marginBottom: 16 }}>
                  <Row gutter={16} align="middle">
                    <Col xs={24} md={8}>
                      <Space>
                        <CalendarOutlined />
                        <Text strong>Période:</Text>
                        <RangePicker
                          value={dateRange}
                          onChange={setDateRange}
                          format="DD/MM/YYYY"
                          style={{ width: 240 }}
                        />
                      </Space>
                    </Col>

                    <Col xs={24} md={4}>
                      <Select
                        value={filterCategory}
                        onChange={setFilterCategory}
                        style={{ width: '100%' }}
                        placeholder="Catégorie"
                      >
                        <Option value="all">Toutes</Option>
                        <Option value="tithe">Dîme</Option>
                        <Option value="offering">Offrande</Option>
                        <Option value="building">Construction</Option>
                        <Option value="missions">Missions</Option>
                        <Option value="charity">Charité</Option>
                      </Select>
                    </Col>

                    <Col xs={24} md={4}>
                      <Select
                        value={filterType}
                        onChange={setFilterType}
                        style={{ width: '100%' }}
                        placeholder="Type"
                      >
                        <Option value="all">Tous types</Option>
                        <Option value="one_time">Unique</Option>
                        <Option value="recurring">Récurrent</Option>
                      </Select>
                    </Col>

                    <Col xs={24} md={4}>
                      <Select
                        value={filterStatus}
                        onChange={setFilterStatus}
                        style={{ width: '100%' }}
                        placeholder="Statut"
                      >
                        <Option value="all">Tous statuts</Option>
                        <Option value="completed">Complétées</Option>
                        <Option value="pending">En attente</Option>
                        <Option value="failed">Échouées</Option>
                      </Select>
                    </Col>

                    <Col xs={24} md={4}>
                      <Space>
                        {(isAdmin || isTreasurer) && (
                          <>
                            <Tooltip title="Exporter en Excel">
                              <Button 
                                icon={<FileExcelOutlined />}
                                onClick={() => handleExport('excel')}
                                type="primary"
                                ghost
                              />
                            </Tooltip>
                            <Tooltip title="Exporter en PDF">
                              <Button 
                                icon={<FilePdfOutlined />}
                                onClick={() => handleExport('pdf')}
                                danger
                                ghost
                              />
                            </Tooltip>
                          </>
                        )}
                      </Space>
                    </Col>
                  </Row>
                </Card>

                {/* Contenu des onglets */}
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
      </Main>
    </>
  );
}

export default DonationReports; 