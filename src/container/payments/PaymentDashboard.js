import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Table, Tag, Typography, Select, Space, Alert, Tooltip, List, Badge } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import {
  DollarOutlined,
  CreditCardOutlined,
  MoneyCollectOutlined,
  BankOutlined,
  PercentageOutlined,
} from '@ant-design/icons';
import { PageHeader } from '../../components/page-headers/page-headers';
import { Main } from '../styled';
import { Cards } from '../../components/cards/frame/cards-frame';
import { getPaymentStats, getPaymentsList } from '../../redux/payments/actionCreator';

const { Text } = Typography;
const { Option } = Select;

function PaymentDashboard() {
  const dispatch = useDispatch();
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const { payments, stats, loadingStats, user } = useSelector((state) => ({
    payments: state.payments.payments || [],
    stats: state.payments.stats,
    loadingStats: state.payments.statsLoading,
    user: state.auth?.user,
  }));

  const isAdmin = user?.role && ['admin', 'treasurer'].includes(user.role);

  useEffect(() => {
    if (dispatch) {
      dispatch(getPaymentsList());
      dispatch(getPaymentStats({ period: selectedPeriod }));
    }
  }, [dispatch, selectedPeriod]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  // Calculer les statistiques localement (fallback)
  const calculateStatsFromPayments = () => {
    if (!payments.length) {
      return {
        totalVolume: 0,
        totalTransactions: 0,
        successRate: 0,
        totalFees: 0,
        providerBreakdown: [],
        recentTransactions: [],
        isPersonalStats: !isAdmin,
      };
    }

    const totalVolume = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const completedPayments = payments.filter((p) => p.status === 'completed');
    const successRate = payments.length ? (completedPayments.length / payments.length) * 100 : 0;
    const totalFees = payments.reduce((sum, p) => sum + (p.fees?.processingFee || 0), 0);

    // Répartition par fournisseur
    const providerStats = {};
    payments.forEach((payment) => {
      if (!providerStats[payment.provider]) {
        providerStats[payment.provider] = {
          _id: payment.provider,
          count: 0,
          totalAmount: 0,
          successCount: 0,
        };
      }
      // eslint-disable-next-line no-plusplus
      providerStats[payment.provider].count++;
      providerStats[payment.provider].totalAmount += payment.amount;
      if (payment.status === 'completed') {
        // eslint-disable-next-line no-plusplus
        providerStats[payment.provider].successCount++;
      }
    });

    const providerBreakdown = Object.values(providerStats).map((provider) => ({
      ...provider,
      successRate: provider.count ? (provider.successCount / provider.count) * 100 : 0,
    }));

    return {
      totalVolume,
      totalTransactions: payments.length,
      successRate: Math.round(successRate * 100) / 100,
      totalFees,
      providerBreakdown,
      recentTransactions: payments.slice(0, isAdmin ? 10 : 5),
      isPersonalStats: !isAdmin,
    };
  };
  // Utiliser les statistiques du backend ou calculer localement en fallback
  const getEffectiveStats = () => {
    if (stats) {
      return {
        totalVolume: stats.totalVolume || 0,
        totalTransactions: stats.totalTransactions || 0,
        successRate: stats.successRate || 0,
        totalFees: stats.totalFees || 0,
        providerBreakdown: stats.providerBreakdown || [],
        recentTransactions: stats.recentTransactions || [],
        isPersonalStats: stats.isPersonalStats || false,
      };
    }

    // Fallback: calculer localement si pas de stats du backend
    return calculateStatsFromPayments();
  };

  // Préparer les données pour les graphiques
  const prepareChartData = () => {
    const effective = getEffectiveStats();

    // Données pour le graphique des fournisseurs
    const providerNames = {
      cinetpay: 'CinetPay',
      stripe: 'Stripe',
      paypal: 'PayPal',
      fusionpay: 'FusionPay',
      moneyfusion: 'MoneyFusion',
      orange_money: 'Orange Money',
      mtn_mobile_money: 'MTN Mobile Money',
      moov_money: 'Moov Money',
    };

    const providerChartData = effective.providerBreakdown.map((provider) => ({
      // eslint-disable-next-line no-underscore-dangle
      name: providerNames[provider._id] || provider._id,
      transactions: provider.count,
      volume: provider.totalAmount,
      taux: Math.round(provider.successRate || 0),
    }));

    // Données pour l'évolution temporelle
    const timeData = Array.from({ length: 7 }, (_, i) => {
      const date = moment().subtract(6 - i, 'days');
      const dayPayments = payments.filter(
        (p) => moment(p.createdAt).format('YYYY-MM-DD') === date.format('YYYY-MM-DD'),
      );
      return {
        name: date.format('DD/MM'),
        transactions: dayPayments.length,
        volume: dayPayments.reduce((sum, p) => sum + p.amount, 0),
        succès: dayPayments.filter((p) => p.status === 'completed').length,
      };
    });

    return { providerChartData, timeData };
  };

  const effective = getEffectiveStats();
  const { providerChartData, timeData } = prepareChartData();

  // Colonnes pour le tableau des transactions récentes
  const recentTransactionsColumns = [
    {
      title: 'Référence',
      dataIndex: 'transaction',
      key: 'reference',
      render: (transaction) => <Text code>{transaction?.reference || 'N/A'}</Text>,
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
    },
    {
      title: 'Fournisseur',
      dataIndex: 'provider',
      key: 'provider',
      render: (provider) => <Tag color="blue">{provider}</Tag>,
    },
    {
      title: 'Statut',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusConfig = {
          completed: { color: 'success', icon: '✅', text: 'Complété' },
          pending: { color: 'warning', icon: '⏳', text: 'En attente' },
          processing: { color: 'processing', icon: '🔄', text: 'Traitement' },
          failed: { color: 'error', icon: '❌', text: 'Échoué' },
          cancelled: { color: 'default', icon: '⛔', text: 'Annulé' },
        };
        const config = statusConfig[status] || statusConfig.pending;
        return (
          <Tag color={config.color}>
            {config.icon} {config.text}
          </Tag>
        );
      },
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => <Tooltip title={moment(date).format('DD/MM/YYYY HH:mm')}>{moment(date).fromNow()}</Tooltip>,
    },
  ];

  return (
    <>
      <PageHeader
        className="ninjadash-page-header-main"
        title="Tableau de bord - Paiements"
        routes={[
          { path: '/admin/dashboard', breadcrumbName: 'Tableau de bord' },
          { path: '', breadcrumbName: 'Paiements Dashboard' },
        ]}
      />

      <Main>
        {/* Indicateur de type de stats */}
        {!loadingStats && effective && (
          <Alert
            style={{ marginBottom: 16 }}
            message={
              effective.isPersonalStats
                ? '💳 Vos statistiques de paiement personnelles'
                : '🌐 Statistiques globales des paiements'
            }
            description={
              effective.isPersonalStats
                ? 'Vous consultez vos propres paiements et statistiques.'
                : 'Vous consultez les statistiques de tous les paiements du système.'
            }
            type={effective.isPersonalStats ? 'info' : 'success'}
            showIcon
            closable
          />
        )}

        {/* Filtres */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col>
            <Select value={selectedPeriod} onChange={setSelectedPeriod} style={{ width: 150 }} loading={loadingStats}>
              <Option value="week">Cette semaine</Option>
              <Option value="month">Ce mois</Option>
              <Option value="year">Cette année</Option>
            </Select>
          </Col>
        </Row>

        {/* Métriques principales */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Volume Total"
                value={effective.totalVolume}
                prefix={<DollarOutlined />}
                suffix="XOF"
                valueStyle={{ color: '#3f8600' }}
                formatter={(value) => new Intl.NumberFormat('fr-FR').format(value)}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Transactions"
                value={effective.totalTransactions}
                prefix={<CreditCardOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Taux de Succès"
                value={effective.successRate}
                prefix={<PercentageOutlined />}
                suffix="%"
                valueStyle={{ color: effective.successRate >= 90 ? '#52c41a' : '#fa8c16' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Frais Totaux"
                value={effective.totalFees}
                prefix={<BankOutlined />}
                suffix="XOF"
                valueStyle={{ color: '#722ed1' }}
                formatter={(value) => new Intl.NumberFormat('fr-FR').format(value)}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          {/* Graphiques */}
          <Col xs={24} lg={12}>
            <Cards title="Répartition par Fournisseur">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={providerChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="transactions"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {providerChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(value, name) => [name === 'transactions' ? `${value} transactions` : value, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Cards>
          </Col>

          <Col xs={24} lg={12}>
            <Cards title="Évolution (7 derniers jours)">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Line type="monotone" dataKey="transactions" stroke="#1890ff" strokeWidth={2} />
                  <Line type="monotone" dataKey="succès" stroke="#52c41a" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Cards>
          </Col>

          <Col xs={24} lg={12}>
            <Cards title="Performance par Fournisseur">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={providerChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="taux" fill="#52c41a" name="Taux de succès (%)" />
                </BarChart>
              </ResponsiveContainer>
            </Cards>
          </Col>

          <Col xs={24} lg={12}>
            <Cards title="Top Fournisseurs">
              <List
                size="small"
                dataSource={providerChartData.slice(0, 5)}
                renderItem={(item, index) => (
                  <List.Item>
                    <Space>
                      <Badge count={index + 1} style={{ backgroundColor: index === 0 ? '#52c41a' : '#1890ff' }} />
                      <Text>{item.name}</Text>
                    </Space>
                    <div style={{ textAlign: 'right' }}>
                      <Text strong>{item.transactions} transactions</Text>
                      <br />
                      <Text type="secondary">{item.taux}% succès</Text>
                    </div>
                  </List.Item>
                )}
              />
            </Cards>
          </Col>

          {/* Transactions récentes */}
          <Col xs={24}>
            <Cards
              title={
                <Space>
                  <MoneyCollectOutlined />
                  Transactions Récentes
                </Space>
              }
            >
              {effective.recentTransactions.length > 0 ? (
                <Table
                  columns={recentTransactionsColumns}
                  dataSource={effective.recentTransactions}
                  pagination={false}
                  size="small"
                  rowKey="_id"
                />
              ) : (
                <div style={{ textAlign: 'center', padding: 32, color: '#999' }}>
                  <CreditCardOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                  <div>Aucune transaction récente</div>
                </div>
              )}
            </Cards>
          </Col>
        </Row>

        {/* Alerte pour faible taux de succès */}
        {effective.successRate < 80 && (
          <Alert
            style={{ marginTop: 16 }}
            message="Attention: Taux de succès faible"
            description={`Le taux de succès des paiements est de ${effective.successRate}%. Veuillez vérifier la configuration des fournisseurs de paiement.`}
            type="warning"
            showIcon
            closable
          />
        )}
      </Main>
    </>
  );
}

export default PaymentDashboard;
