import React, { useEffect, useState } from 'react';
import {
  Row,
  Col,
  Card,
  Statistic,
  Table,
  Tag,
  Avatar,
  Typography,
  Select,
  DatePicker,
  Space,
  Badge,
  Tooltip,
  Alert,
} from 'antd';
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
  ClockCircleOutlined,
  UserOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  TeamOutlined,
  StarOutlined,
  AlertOutlined,
} from '@ant-design/icons';
import SupportNavigation from './SupportNavigation';
import { PageHeader } from '../../components/page-headers/page-headers';
import { Main } from '../styled';
import { Cards } from '../../components/cards/frame/cards-frame';
import { ticketGetStats, ticketReadData } from '../../redux/supportTickets/actionCreator';

const { Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

function TicketDashboard() {
  const dispatch = useDispatch();
  const [dateRange, setDateRange] = useState([moment().subtract(30, 'days'), moment()]);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const { tickets, stats, loadingStats, user } = useSelector((state) => ({
    tickets: state.tickets.data.tickets || [],
    stats: state.tickets.stats,
    loadingStats: state.tickets.loadingStats,
    user: state.auth?.user,
  }));

  const isAdmin = user?.role && ['admin', 'moderator', 'support_agent'].includes(user.role);

  useEffect(() => {
    if (dispatch) {
      dispatch(ticketReadData());
      dispatch(ticketGetStats({ period: selectedPeriod }));
    }
  }, [dispatch, selectedPeriod]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  // Calculer les métriques localement (fallback)
  const calculateMetricsFromTickets = () => {
    if (!tickets.length) {
      return {
        total: 0,
        open: 0,
        resolved: 0,
        closed: 0,
        avgResponseTime: 0,
        avgResolutionTime: 0,
        overdueTickets: 0,
        categoryBreakdown: [],
        priorityBreakdown: [],
        isPersonalStats: !isAdmin,
      };
    }

    const openTickets = tickets.filter((t) =>
      ['open', 'in_progress', 'waiting_user', 'waiting_admin'].includes(t.status),
    );
    const resolvedTickets = tickets.filter((t) => t.status === 'resolved');
    const closedTickets = tickets.filter((t) => t.status === 'closed');

    // Calcul temps de réponse moyen
    const responseTimes = tickets.filter((t) => t.metrics?.firstResponseTime).map((t) => t.metrics.firstResponseTime);
    const avgResponseTime = responseTimes.length ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length : 0;

    // Calcul temps de résolution moyen
    const resolutionTimes = tickets.filter((t) => t.metrics?.resolutionTime).map((t) => t.metrics.resolutionTime);
    const avgResolutionTime = resolutionTimes.length
      ? resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length
      : 0;

    // Tickets en retard
    const overdueTickets = tickets.filter((t) => {
      if (!['open', 'in_progress'].includes(t.status)) return false;
      const ageHours = moment().diff(moment(t.createdAt), 'hours');
      const slaThreshold = { urgent: 2, high: 8, medium: 24, low: 72 }[t.priority] || 24;
      return ageHours > slaThreshold;
    }).length;

    // Répartition par catégorie
    const categoryBreakdown = [
      { _id: 'technical', count: tickets.filter((t) => t.category === 'technical').length },
      { _id: 'payment', count: tickets.filter((t) => t.category === 'payment').length },
      { _id: 'account', count: tickets.filter((t) => t.category === 'account').length },
      { _id: 'donation', count: tickets.filter((t) => t.category === 'donation').length },
      { _id: 'general', count: tickets.filter((t) => t.category === 'general').length },
    ].filter((item) => item.count > 0);

    // Répartition par priorité
    const priorityBreakdown = [
      { _id: 'low', count: tickets.filter((t) => t.priority === 'low').length },
      { _id: 'medium', count: tickets.filter((t) => t.priority === 'medium').length },
      { _id: 'high', count: tickets.filter((t) => t.priority === 'high').length },
      { _id: 'urgent', count: tickets.filter((t) => t.priority === 'urgent').length },
    ].filter((item) => item.count > 0);

    return {
      total: tickets.length,
      open: openTickets.length,
      resolved: resolvedTickets.length,
      closed: closedTickets.length,
      avgResponseTime: Math.round(avgResponseTime),
      avgResolutionTime: Math.round(avgResolutionTime),
      overdueTickets,
      categoryBreakdown,
      priorityBreakdown,
      isPersonalStats: !isAdmin,
    };
  };

  // Utiliser les statistiques du backend ou calculer localement en fallback
  const getEffectiveStats = () => {
    if (stats) {
      return {
        total: stats.totalTickets || 0,
        open: stats.openTickets || 0,
        resolved: stats.resolvedTickets || 0,
        closed: stats.closedTickets || 0,
        avgResponseTime: Math.round(stats.averageFirstResponseTime || 0),
        avgResolutionTime: Math.round(stats.averageResolutionTime || 0),
        overdueTickets: stats.overdueTickets || 0,
        categoryBreakdown: stats.categoryBreakdown || [],
        priorityBreakdown: stats.priorityBreakdown || [],
        isPersonalStats: stats.isPersonalStats || false,
      };
    }

    // Fallback: calculer localement si pas de stats du backend
    return calculateMetricsFromTickets();
  };

  // Données pour les graphiques
  const prepareChartData = () => {
    const effective = getEffectiveStats();

    // Répartition par statut
    const statusData = [
      { name: 'Ouverts', value: effective.open, color: '#ff4d4f' },
      { name: 'Résolus', value: effective.resolved, color: '#52c41a' },
      { name: 'Fermés', value: effective.closed, color: '#d9d9d9' },
    ].filter((item) => item.value > 0);

    // Répartition par catégorie (utiliser les données du backend ou fallback local)
    const categoryNames = {
      technical: 'Technique',
      payment: 'Paiement',
      account: 'Compte',
      donation: 'Dons',
      general: 'Général',
      bug_report: 'Bug Report',
      feature_request: 'Demande de fonctionnalité',
      complaint: 'Plainte',
      suggestion: 'Suggestion',
    };

    const categoryData = effective.categoryBreakdown
      .map((cat) => ({
        // eslint-disable-next-line no-underscore-dangle
        name: categoryNames[cat._id] || cat._id,
        value: cat.count,
      }))
      .filter((item) => item.value > 0);

    // Evolution temporelle (7 derniers jours)
    const timeData = Array.from({ length: 7 }, (_, i) => {
      const date = moment().subtract(6 - i, 'days');
      const dayTickets = tickets.filter((t) => moment(t.createdAt).format('YYYY-MM-DD') === date.format('YYYY-MM-DD'));
      return {
        name: date.format('DD/MM'),
        créés: dayTickets.length,
        résolus: dayTickets.filter((t) => t.status === 'resolved').length,
      };
    });

    return { statusData, categoryData, timeData };
  };

  // Top agents de support
  const getTopAgents = () => {
    const agentStats = {};

    tickets.forEach((ticket) => {
      if (ticket.assignedTo) {
        // eslint-disable-next-line no-underscore-dangle
        const agentId = ticket.assignedTo._id || ticket.assignedTo;
        if (!agentStats[agentId]) {
          agentStats[agentId] = {
            id: agentId,
            name: `${ticket.assignedTo.firstName || ''} ${ticket.assignedTo.lastName || ''}`.trim(),
            avatar: ticket.assignedTo.avatar,
            assigned: 0,
            resolved: 0,
            avgRating: 0,
            totalRatings: 0,
          };
        }
        // eslint-disable-next-line no-plusplus
        agentStats[agentId].assigned++;
        if (['resolved', 'closed'].includes(ticket.status)) {
          // eslint-disable-next-line no-plusplus
          agentStats[agentId].resolved++;
        }

        if (ticket.rating?.score) {
          // eslint-disable-next-line no-plusplus
          agentStats[agentId].totalRatings++;
          agentStats[agentId].avgRating =
            (agentStats[agentId].avgRating * (agentStats[agentId].totalRatings - 1) + ticket.rating.score) /
            agentStats[agentId].totalRatings;
        }
      }
    });

    return Object.values(agentStats)
      .sort((a, b) => b.resolved - a.resolved)
      .slice(0, 5);
  };

  // Tickets urgents
  const getUrgentTickets = () => {
    return tickets
      .filter((t) => ['urgent', 'high'].includes(t.priority) && ['open', 'in_progress'].includes(t.status))
      .sort((a, b) => {
        const priorityOrder = { urgent: 4, high: 3 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      })
      .slice(0, 5);
  };

  const metrics = getEffectiveStats();
  const { statusData, categoryData, timeData } = prepareChartData();
  const topAgents = getTopAgents();
  const urgentTickets = getUrgentTickets();

  const urgentColumns = [
    {
      title: 'Ticket',
      dataIndex: 'ticketNumber',
      key: 'ticketNumber',
      render: (text) => <Text code>#{text}</Text>,
    },
    {
      title: 'Utilisateur',
      dataIndex: 'user',
      key: 'user',
      // eslint-disable-next-line no-shadow
      render: (user) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar size="small" src={user?.avatar} icon={<UserOutlined />} style={{ marginRight: 8 }} />
          <div>
            <div>
              {user?.firstName} {user?.lastName}
            </div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Niveau {user?.level || 1} • {user?.donationCount || 0} dons
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Priorité',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => (
        <Tag color={priority === 'urgent' ? 'red' : 'orange'}>{priority === 'urgent' ? 'URGENT' : 'HAUTE'}</Tag>
      ),
    },
    {
      title: 'Âge',
      dataIndex: 'createdAt',
      key: 'age',
      render: (date) => <Tooltip title={moment(date).format('DD/MM/YYYY HH:mm')}>{moment(date).fromNow()}</Tooltip>,
    },
  ];

  return (
    <>
      <PageHeader
        className="ninjadash-page-header-main"
        title="Tableau de bord - Support"
        routes={[
          { path: '/admin/dashboard', breadcrumbName: 'Tableau de bord' },
          { path: '', breadcrumbName: 'Support Dashboard' },
        ]}
      />

      <Main>
        <SupportNavigation />

        {/* Indicateur de type de stats */}
        {!loadingStats && metrics && (
          <Alert
            style={{ marginBottom: 16 }}
            message={
              metrics.isPersonalStats ? '📊 Vos statistiques personnelles' : '🌐 Statistiques globales du système'
            }
            description={
              metrics.isPersonalStats
                ? 'Vous consultez vos propres tickets et statistiques.'
                : 'Vous consultez les statistiques de tous les utilisateurs du système.'
            }
            type={metrics.isPersonalStats ? 'info' : 'success'}
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
          <Col>
            <RangePicker value={dateRange} onChange={setDateRange} format="DD/MM/YYYY" />
          </Col>
        </Row>

        {/* Métriques principales */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} lg={4}>
            <Card>
              <Statistic
                title="Total Tickets"
                value={metrics.total}
                prefix={<ExclamationCircleOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Card>
              <Statistic
                title="Tickets Ouverts"
                value={metrics.open}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Card>
              <Statistic
                title="Résolus"
                value={metrics.resolved}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Card>
              <Statistic
                title="Temps Réponse"
                value={metrics.avgResponseTime}
                suffix="min"
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Card>
              <Statistic
                title="Temps Résolution"
                value={metrics.avgResolutionTime}
                suffix="min"
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Card>
              <Statistic
                title="Tickets en retard"
                value={metrics.overdueTickets}
                prefix={<ExclamationCircleOutlined />}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          {/* Graphiques */}
          <Col xs={24} lg={12}>
            <Cards title="Répartition par Statut">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
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
                  <Line type="monotone" dataKey="créés" stroke="#1890ff" strokeWidth={2} />
                  <Line type="monotone" dataKey="résolus" stroke="#52c41a" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Cards>
          </Col>

          <Col xs={24} lg={12}>
            <Cards title="Répartition par Catégorie">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="value" fill="#1890ff" />
                </BarChart>
              </ResponsiveContainer>
            </Cards>
          </Col>

          <Col xs={24} lg={12}>
            <Cards title="Top Agents de Support">
              <div style={{ padding: 16 }}>
                {topAgents.length > 0 ? (
                  <Space direction="vertical" style={{ width: '100%' }}>
                    {topAgents.map((agent, index) => (
                      <div
                        key={agent.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: 12,
                          background: index === 0 ? '#fff7e6' : '#fafafa',
                          borderRadius: 6,
                          border: index === 0 ? '1px solid #ffd591' : '1px solid #f0f0f0',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <Badge
                            count={index + 1}
                            style={{
                              backgroundColor: index === 0 ? '#faad14' : '#d9d9d9',
                              marginRight: 12,
                            }}
                          />
                          <Avatar src={agent.avatar} icon={<UserOutlined />} style={{ marginRight: 12 }} />
                          <div>
                            <div style={{ fontWeight: 'bold' }}>{agent.name}</div>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {agent.resolved}/{agent.assigned} résolus
                            </Text>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          {agent.avgRating > 0 && (
                            <div>
                              <StarOutlined style={{ color: '#faad14', marginRight: 4 }} />
                              {agent.avgRating.toFixed(1)}
                            </div>
                          )}
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {Math.round((agent.resolved / agent.assigned) * 100)}% résolution
                          </Text>
                        </div>
                      </div>
                    ))}
                  </Space>
                ) : (
                  <div style={{ textAlign: 'center', color: '#999' }}>
                    <TeamOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                    <div>Aucun agent assigné</div>
                  </div>
                )}
              </div>
            </Cards>
          </Col>

          {/* Tickets urgents */}
          <Col xs={24}>
            <Cards
              title={
                <Space>
                  <AlertOutlined style={{ color: '#ff4d4f' }} />
                  Tickets Urgents à Traiter
                </Space>
              }
            >
              {urgentTickets.length > 0 ? (
                <Table
                  columns={urgentColumns}
                  dataSource={urgentTickets}
                  pagination={false}
                  size="small"
                  rowKey="_id"
                />
              ) : (
                <div style={{ textAlign: 'center', padding: 32, color: '#999' }}>
                  <CheckCircleOutlined style={{ fontSize: 48, marginBottom: 16, color: '#52c41a' }} />
                  <div>Aucun ticket urgent en cours</div>
                </div>
              )}
            </Cards>
          </Col>
        </Row>

        {/* Alerte SLA */}
        {metrics.overdueTickets > 0 && (
          <Alert
            style={{ marginTop: 16 }}
            message="Attention: Tickets en retard"
            description={`Il y a ${metrics.overdueTickets} ticket(s) en retard. Veuillez vérifier les tickets en retard.`}
            type="warning"
            showIcon
            closable
          />
        )}
      </Main>
    </>
  );
}

export default TicketDashboard;
