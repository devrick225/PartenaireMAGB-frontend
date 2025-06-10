import React, { useEffect } from 'react';
import { Row, Col, Card, Statistic, Progress, Tag, List, Typography } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  FireOutlined,
  UserOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { PageHeader } from '../../components/page-headers/page-headers';
import { Main } from '../styled';
import { Cards } from '../../components/cards/frame/cards-frame';
import { ticketReadData } from '../../redux/supportTickets/actionCreator';

const { Title, Text } = Typography;

function SupportDashboard() {
  const dispatch = useDispatch();

  const { dataState } = useSelector((state) => ({
    dataState: state.tickets.data,
    loading: state.tickets.loading,
  }));

  const PageRoutes = [
    {
      path: 'index',
      breadcrumbName: 'Tableau de bord',
    },
    {
      path: '',
      breadcrumbName: 'Aperçu du Support',
    },
  ];

  useEffect(() => {
    if (dispatch) {
      dispatch(ticketReadData());
    }
  }, [dispatch]);

  // Calculs des statistiques
  const tickets = dataState?.tickets || [];

  const stats = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === 'open').length,
    resolved: tickets.filter((t) => t.status === 'resolved').length,
    pending: tickets.filter((t) => t.status === 'pending').length,
    urgent: tickets.filter((t) => t.priority === 'urgent').length,
    high: tickets.filter((t) => t.priority === 'high').length,
  };

  const statusDistribution = {
    open: (stats.open / stats.total) * 100 || 0,
    resolved: (stats.resolved / stats.total) * 100 || 0,
    pending: (stats.pending / stats.total) * 100 || 0,
    other: ((stats.total - stats.open - stats.resolved - stats.pending) / stats.total) * 100 || 0,
  };

  // Tickets récents
  const recentTickets = tickets.sort((a, b) => new Date(b.createAt) - new Date(a.createAt)).slice(0, 5);

  // Tickets urgents
  const urgentTickets = tickets
    .filter((t) => t.priority === 'urgent' && t.status !== 'resolved' && t.status !== 'closed')
    .slice(0, 3);

  const translationsStatus = {
    open: { text: 'Ouvert', color: 'green' },
    closed: { text: 'Fermé', color: 'default' },
    pending: { text: 'En attente', color: 'orange' },
    waiting_user: { text: 'En attente utilisateur', color: 'blue' },
    waiting_admin: { text: 'En attente admin', color: 'purple' },
    resolved: { text: 'Résolu', color: 'cyan' },
    cancelled: { text: 'Annulé', color: 'red' },
  };

  const translationsPriority = {
    low: { text: 'Basse', color: 'default' },
    medium: { text: 'Moyenne', color: 'orange' },
    high: { text: 'Haute', color: 'red' },
    urgent: { text: 'Critique', color: 'magenta' },
  };

  return (
    <>
      <PageHeader className="ninjadash-page-header-main" title="Tableau de Bord Support" routes={PageRoutes} />
      <Main>
        {/* Statistiques principales */}
        <Row gutter={[25, 25]}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total des Tickets"
                value={stats.total}
                prefix={<CalendarOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Tickets Ouverts"
                value={stats.open}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Tickets Résolus"
                value={stats.resolved}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#13c2c2' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Tickets Urgents"
                value={stats.urgent}
                prefix={<FireOutlined />}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[25, 25]} style={{ marginTop: 25 }}>
          {/* Distribution des statuts */}
          <Col xs={24} lg={12}>
            <Cards title="Distribution des Statuts" headless>
              <div style={{ padding: '20px' }}>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text>Ouverts</Text>
                    <Text strong>
                      {stats.open} ({statusDistribution.open.toFixed(1)}%)
                    </Text>
                  </div>
                  <Progress percent={statusDistribution.open} strokeColor="#52c41a" showInfo={false} />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text>Résolus</Text>
                    <Text strong>
                      {stats.resolved} ({statusDistribution.resolved.toFixed(1)}%)
                    </Text>
                  </div>
                  <Progress percent={statusDistribution.resolved} strokeColor="#13c2c2" showInfo={false} />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text>En attente</Text>
                    <Text strong>
                      {stats.pending} ({statusDistribution.pending.toFixed(1)}%)
                    </Text>
                  </div>
                  <Progress percent={statusDistribution.pending} strokeColor="#faad14" showInfo={false} />
                </div>

                {statusDistribution.other > 0 && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Text>Autres</Text>
                      <Text strong>{statusDistribution.other.toFixed(1)}%</Text>
                    </div>
                    <Progress percent={statusDistribution.other} strokeColor="#d9d9d9" showInfo={false} />
                  </div>
                )}
              </div>
            </Cards>
          </Col>

          {/* Tickets urgents */}
          <Col xs={24} lg={12}>
            <Cards title="Tickets Critiques" headless>
              <div style={{ padding: '20px' }}>
                {urgentTickets.length > 0 ? (
                  <List
                    dataSource={urgentTickets}
                    renderItem={(ticket) => (
                      <List.Item style={{ padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
                        <List.Item.Meta
                          avatar={<FireOutlined style={{ color: '#ff4d4f', fontSize: '16px' }} />}
                          title={
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Text strong style={{ fontSize: '14px' }}>
                                #{ticket.ticketNumber}
                              </Text>
                              <Tag color={translationsStatus[ticket.status]?.color}>
                                {translationsStatus[ticket.status]?.text}
                              </Tag>
                            </div>
                          }
                          description={
                            <div>
                              <Text ellipsis style={{ display: 'block', marginBottom: 4 }}>
                                {ticket.subject}
                              </Text>
                              <Text type="secondary" style={{ fontSize: '12px' }}>
                                {moment(ticket.createAt).fromNow()}
                              </Text>
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <CheckCircleOutlined style={{ fontSize: '48px', color: '#52c41a', marginBottom: 16 }} />
                    <Title level={5} style={{ color: '#52c41a' }}>
                      Aucun ticket critique !
                    </Title>
                    <Text type="secondary">Tous les tickets urgents ont été traités.</Text>
                  </div>
                )}
              </div>
            </Cards>
          </Col>
        </Row>

        {/* Tickets récents */}
        <Row gutter={[25, 25]} style={{ marginTop: 25 }}>
          <Col span={24}>
            <Cards title="Tickets Récents" headless>
              <div style={{ padding: '20px' }}>
                {recentTickets.length > 0 ? (
                  <List
                    dataSource={recentTickets}
                    renderItem={(ticket) => (
                      <List.Item
                        style={{ padding: '16px 0' }}
                        actions={[
                          <Tag key="priority" color={translationsPriority[ticket.priority]?.color}>
                            {translationsPriority[ticket.priority]?.text}
                          </Tag>,
                          <Tag key="status" color={translationsStatus[ticket.status]?.color}>
                            {translationsStatus[ticket.status]?.text}
                          </Tag>,
                        ]}
                      >
                        <List.Item.Meta
                          avatar={<UserOutlined style={{ fontSize: '20px', color: '#1890ff' }} />}
                          title={
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <Text strong>#{ticket.ticketNumber}</Text>
                              <Text style={{ fontSize: '14px' }}>{ticket.subject}</Text>
                            </div>
                          }
                          description={
                            <div>
                              <Text type="secondary" style={{ fontSize: '13px' }}>
                                Créé {moment(ticket.createAt).fromNow()} • Catégorie: {ticket.category} • Priorité:{' '}
                                {translationsPriority[ticket.priority]?.text}
                              </Text>
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <ExclamationCircleOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: 16 }} />
                    <Title level={5} type="secondary">
                      Aucun ticket
                    </Title>
                    <Text type="secondary">Aucun ticket n&#39;a été créé récemment.</Text>
                  </div>
                )}
              </div>
            </Cards>
          </Col>
        </Row>

        {/* Métriques de performance */}
        <Row gutter={[25, 25]} style={{ marginTop: 25 }}>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Taux de Résolution"
                value={stats.total > 0 ? (stats.resolved / stats.total) * 100 : 0}
                precision={1}
                suffix="%"
                valueStyle={{ color: stats.resolved / stats.total > 0.8 ? '#52c41a' : '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Tickets Haute Priorité"
                value={stats.high + stats.urgent}
                valueStyle={{ color: '#ff4d4f' }}
                prefix={<ExclamationCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Temps Moy. Réponse"
                value="2.4"
                suffix="h"
                valueStyle={{ color: '#1890ff' }}
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
        </Row>
      </Main>
    </>
  );
}

export default SupportDashboard;
