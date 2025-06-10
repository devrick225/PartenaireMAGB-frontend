/* eslint no-underscore-dangle: 0 */
import React, { useEffect } from 'react';
import {
  Table,
  Button,
  Tag,
  Space,
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Modal,
  message,
  Tooltip,
  Progress,
} from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import {
  SyncOutlined,
  PauseCircleOutlined,
  EyeOutlined,
  CalendarOutlined,
  DollarOutlined,
  UserOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import moment from 'moment';
import { recurringDonationsReadData, stopRecurringDonation } from '../../redux/donations/actionCreator';

const { Text } = Typography;
const { confirm } = Modal;

function RecurringDonations({ onViewDonation }) {
  const dispatch = useDispatch();

  const { recurringDonations, recurringLoading, stoppingRecurring } = useSelector((state) => ({
    recurringDonations: Array.isArray(state.donations.recurringDonations) ? state.donations.recurringDonations : [],
    recurringLoading: state.donations.recurringLoading,
    stoppingRecurring: state.donations.stoppingRecurring,
  }));

  // Debug pour comprendre le problème
  console.log('=== DEBUG RECURRING DONATIONS ===');
  console.log('recurringDonations from state:', recurringDonations);
  console.log('Is array?', Array.isArray(recurringDonations));
  console.log('Length:', recurringDonations?.length);
  console.log('================================');

  useEffect(() => {
    if (dispatch) {
      dispatch(recurringDonationsReadData());
    }
  }, [dispatch]);

  const frequencyLabels = {
    daily: 'Quotidien',
    weekly: 'Hebdomadaire',
    monthly: 'Mensuel',
    quarterly: 'Trimestriel',
    yearly: 'Annuel',
  };

  const getFrequencyColor = (frequency) => {
    const colors = {
      daily: 'red',
      weekly: 'orange',
      monthly: 'blue',
      quarterly: 'purple',
      yearly: 'green',
    };
    return colors[frequency] || 'default';
  };

  const handleStopRecurring = (donationId, donorName) => {
    confirm({
      title: 'Arrêter la donation récurrente',
      content: `Êtes-vous sûr de vouloir arrêter la donation récurrente de ${donorName} ? Cette action est irréversible.`,
      okText: 'Arrêter',
      okType: 'danger',
      cancelText: 'Annuler',
      onOk: async () => {
        try {
          await dispatch(stopRecurringDonation(donationId, "Arrêté par l'administrateur"));
          message.success('Donation récurrente arrêtée avec succès');
        } catch (error) {
          message.error("Erreur lors de l'arrêt de la donation");
        }
      },
    });
  };

  const getExecutionProgress = (donation) => {
    const { totalExecutions = 0, maxOccurrences } = donation.recurring || {};

    if (!maxOccurrences) {
      return { percent: 0, text: `${totalExecutions} exécutions` };
    }

    const percent = (totalExecutions / maxOccurrences) * 100;
    return {
      percent: Math.min(percent, 100),
      text: `${totalExecutions} / ${maxOccurrences}`,
    };
  };

  const getDaysUntilNext = (nextPaymentDate) => {
    if (!nextPaymentDate) return null;
    const days = moment(nextPaymentDate).diff(moment(), 'days');
    return days;
  };

  const columns = [
    {
      title: 'Donateur',
      dataIndex: ['user'],
      key: 'user',
      width: 200,
      render: (user) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <UserOutlined style={{ marginRight: 8, color: '#666' }} />
          <div>
            <Text strong>
              {user?.firstName} {user?.lastName}
            </Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {user?.email}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Montant',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      render: (amount, record) => (
        <div style={{ textAlign: 'right' }}>
          <Text strong style={{ fontSize: 16, color: '#52c41a' }}>
            {new Intl.NumberFormat('fr-FR', {
              style: 'currency',
              currency: record.currency || 'XOF',
              minimumFractionDigits: 0,
            }).format(amount)}
          </Text>
        </div>
      ),
    },
    {
      title: 'Fréquence',
      dataIndex: ['recurring', 'frequency'],
      key: 'frequency',
      width: 120,
      render: (frequency, record) => {
        const interval = record.recurring?.interval || 1;
        const label = frequencyLabels[frequency];
        const displayText = interval > 1 ? `${interval}x ${label}` : label;

        return <Tag color={getFrequencyColor(frequency)}>{displayText}</Tag>;
      },
    },
    {
      title: 'Prochaine exécution',
      dataIndex: ['recurring', 'nextPaymentDate'],
      key: 'nextPaymentDate',
      width: 150,
      render: (date) => {
        if (!date) return <Text type="secondary">-</Text>;

        const daysUntil = getDaysUntilNext(date);
        const isToday = daysUntil === 0;
        const isPast = daysUntil < 0;

        return (
          <div>
            <CalendarOutlined style={{ marginRight: 4, color: '#666' }} />
            <Text strong={isToday} style={{ color: isToday ? '#52c41a' : isPast ? '#ff4d4f' : undefined }}>
              {moment(date).format('DD/MM/YYYY')}
            </Text>
            <br />
            <Text type="secondary" style={{ fontSize: 11 }}>
              {isToday ? "Aujourd'hui" : isPast ? 'En retard' : `Dans ${daysUntil} jour${daysUntil > 1 ? 's' : ''}`}
            </Text>
          </div>
        );
      },
      sorter: (a, b) => moment(a.recurring?.nextPaymentDate).unix() - moment(b.recurring?.nextPaymentDate).unix(),
    },
    {
      title: 'Progression',
      key: 'progress',
      width: 140,
      render: (_, record) => {
        const progress = getExecutionProgress(record);
        const isUnlimited = !record.recurring?.maxOccurrences;

        return (
          <div>
            {!isUnlimited && (
              <Progress percent={progress.percent} size="small" strokeColor="#1890ff" showInfo={false} />
            )}
            <Text style={{ fontSize: 11, color: '#666' }}>
              {progress.text}
              {isUnlimited && ' (Illimité)'}
            </Text>
          </div>
        );
      },
    },
    {
      title: 'Statut',
      dataIndex: ['recurring', 'isActive'],
      key: 'isActive',
      width: 100,
      render: (isActive) => <Tag color={isActive ? 'success' : 'default'}>{isActive ? 'Actif' : 'Arrêté'}</Tag>,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Voir les détails">
            <Button type="text" icon={<EyeOutlined />} onClick={() => onViewDonation(record._id)} />
          </Tooltip>
          {record.recurring?.isActive && (
            <Tooltip title="Arrêter la récurrence">
              <Button
                type="text"
                danger
                icon={<PauseCircleOutlined />}
                loading={stoppingRecurring}
                onClick={() => handleStopRecurring(record._id, `${record.user?.firstName} ${record.user?.lastName}`)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  // Calculer les statistiques
  const activeCount = recurringDonations.filter((d) => d.recurring?.isActive).length;
  const totalMonthlyAmount = recurringDonations
    .filter((d) => d.recurring?.isActive && d.recurring?.frequency === 'monthly')
    .reduce((sum, d) => sum + d.amount, 0);

  const dueTodayCount = recurringDonations.filter((d) => {
    const nextDate = d.recurring?.nextPaymentDate;
    return nextDate && moment(nextDate).isSame(moment(), 'day');
  }).length;

  return (
    <div>
      {/* Statistiques rapides */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card size="small">
            <Statistic
              title="Donations actives"
              value={activeCount}
              suffix={`/ ${recurringDonations.length}`}
              prefix={<SyncOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small">
            <Statistic
              title="Revenus mensuels récurrents"
              value={totalMonthlyAmount}
              formatter={(value) =>
                new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: 'XOF',
                  minimumFractionDigits: 0,
                }).format(value)
              }
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small">
            <Statistic
              title="Dues aujourd'hui"
              value={dueTodayCount}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: dueTodayCount > 0 ? '#faad14' : '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Tableau des donations récurrentes */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Text strong style={{ fontSize: 16 }}>
            Donations récurrentes ({recurringDonations.length})
          </Text>
          <Space>
            <Button icon={<SyncOutlined />} onClick={() => dispatch(recurringDonationsReadData())}>
              Actualiser
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={recurringDonations}
          rowKey="_id"
          loading={recurringLoading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} sur ${total} donations récurrentes`,
          }}
          scroll={{ x: 1000 }}
          size="small"
        />
      </Card>

      {/* Informations sur les donations récurrentes */}
      <Card title="À propos des donations récurrentes" style={{ marginTop: 16 }}>
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <div>
              <Text strong>Comment ça fonctionne :</Text>
              <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                <li>Les donations récurrentes sont traitées automatiquement</li>
                <li>Les donateurs sont notifiés avant chaque prélèvement</li>
                <li>Les reçus sont générés automatiquement</li>
                <li>Les donations peuvent être arrêtées à tout moment</li>
              </ul>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div>
              <Text strong>Fréquences disponibles :</Text>
              <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                <li>
                  <Tag color="orange">Hebdomadaire</Tag> - Chaque semaine
                </li>
                <li>
                  <Tag color="blue">Mensuel</Tag> - Chaque mois
                </li>
                <li>
                  <Tag color="purple">Trimestriel</Tag> - Tous les 3 mois
                </li>
                <li>
                  <Tag color="green">Annuel</Tag> - Une fois par an
                </li>
              </ul>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
}

export default RecurringDonations;
