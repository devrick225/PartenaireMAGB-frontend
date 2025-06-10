/* eslint no-underscore-dangle: 0 */
import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Input,
  Select,
  DatePicker,
  Tag,
  Space,
  Dropdown,
  message,
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Modal,
  Form,
  InputNumber,
} from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import {
  SearchOutlined,
  FilterOutlined,
  MoreOutlined,
  EyeOutlined,
  UndoOutlined,
  DownloadOutlined,
  CreditCardOutlined,
  DollarOutlined,
  CalendarOutlined,
  UserOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import moment from 'moment';
import { getPaymentsList, getPaymentStats, refundPayment, verifyPayment } from '../../redux/payments/actionCreator';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Text } = Typography;

function PaymentsList() {
  const dispatch = useDispatch();
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [filters, setFilters] = useState({});
  const [refundModalVisible, setRefundModalVisible] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [refundForm] = Form.useForm();

  const { payments, paymentsLoading, pagination, stats, statsLoading, refunding, providers } = useSelector((state) => ({
    payments: state.payments.payments,
    paymentsLoading: state.payments.paymentsLoading,
    pagination: state.payments.pagination,
    stats: state.payments.stats,
    statsLoading: state.payments.statsLoading,
    refunding: state.payments.refunding,
    providers: state.payments.providers,
  }));

  const loadPayments = (newFilters = {}) => {
    dispatch(getPaymentsList({ ...filters, ...newFilters }));
  };

  const loadStats = () => {
    dispatch(getPaymentStats({ period: 'month' }));
  };

  useEffect(() => {
    loadPayments();
    loadStats();
  }, []);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    loadPayments(newFilters);
  };

  // eslint-disable-next-line no-shadow
  const handleTableChange = (pagination) => {
    loadPayments({
      page: pagination.current,
      limit: pagination.pageSize,
    });
  };

  const handleRefund = (payment) => {
    setSelectedPayment(payment);
    setRefundModalVisible(true);
    refundForm.setFieldsValue({
      amount: payment.amount,
      reason: '',
    });
  };

  const handleRefundSubmit = async (values) => {
    try {
      await dispatch(refundPayment(selectedPayment._id, values));
      message.success('Remboursement initié avec succès');
      setRefundModalVisible(false);
      loadPayments();
    } catch (error) {
      message.error('Erreur lors du remboursement');
    }
  };

  const handleVerifyPayment = async (paymentId) => {
    try {
      await dispatch(verifyPayment(paymentId));
      message.success('Paiement vérifié avec succès');
      loadPayments();
    } catch (error) {
      message.error('Erreur lors de la vérification');
    }
  };

  // Statuts de paiement
  const paymentStatuses = [
    { value: 'pending', label: 'En attente', color: 'processing' },
    { value: 'processing', label: 'En traitement', color: 'processing' },
    { value: 'completed', label: 'Complété', color: 'success' },
    { value: 'failed', label: 'Échoué', color: 'error' },
    { value: 'cancelled', label: 'Annulé', color: 'default' },
    { value: 'refunded', label: 'Remboursé', color: 'warning' },
    { value: 'refund_pending', label: 'Remboursement en cours', color: 'processing' },
  ];

  const getStatusConfig = (status) => {
    const config = paymentStatuses.find((s) => s.value === status);
    return config || { label: status, color: 'default' };
  };

  const getProviderName = (providerKey) => {
    const provider = providers.find((p) => p.key === providerKey);
    return provider ? provider.name : providerKey;
  };

  const getActionMenu = (record) => ({
    items: [
      {
        key: 'view',
        label: 'Voir les détails',
        icon: <EyeOutlined />,
        onClick: () => console.log('View payment', record._id),
      },
      {
        key: 'verify',
        label: 'Vérifier le paiement',
        icon: <CheckCircleOutlined />,
        disabled: !['pending', 'processing'].includes(record.status),
        onClick: () => handleVerifyPayment(record._id),
      },
      {
        type: 'divider',
      },
      {
        key: 'refund',
        label: 'Rembourser',
        icon: <UndoOutlined />,
        disabled: record.status !== 'completed',
        onClick: () => handleRefund(record),
      },
    ],
  });

  const columns = [
    {
      title: 'ID Transaction',
      dataIndex: ['transaction', 'externalId'],
      key: 'transactionId',
      width: 140,
      render: (text, record) => (
        <Text code style={{ fontSize: 11 }}>
          {text || record._id?.slice(-8)}
        </Text>
      ),
    },
    {
      title: 'Donateur',
      dataIndex: ['user'],
      key: 'user',
      width: 180,
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
      sorter: true,
    },
    {
      title: 'Fournisseur',
      dataIndex: 'provider',
      key: 'provider',
      width: 120,
      render: (provider) => {
        const providerInfo = providers.find((p) => p.key === provider);
        return (
          <Space>
            <span>{providerInfo?.icon || '💳'}</span>
            <Text>{getProviderName(provider)}</Text>
          </Space>
        );
      },
      filters: providers.map((provider) => ({
        text: provider.name,
        value: provider.key,
      })),
    },
    {
      title: 'Méthode',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      width: 100,
      render: (method) => {
        const methodLabels = {
          card: '💳 Carte',
          mobile_money: '📱 Mobile Money',
          paypal: '💸 PayPal',
          bank_transfer: '🏦 Virement',
          cash: '💵 Espèces',
        };
        return methodLabels[method] || method;
      },
    },
    {
      title: 'Statut',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => {
        const config = getStatusConfig(status);
        return <Tag color={config.color}>{config.label}</Tag>;
      },
      filters: paymentStatuses.map((status) => ({
        text: status.label,
        value: status.value,
      })),
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 140,
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
      title: 'Frais',
      dataIndex: ['fees', 'processingFee'],
      key: 'fees',
      width: 100,
      render: (fee, record) =>
        fee ? (
          <Text style={{ fontSize: 12 }}>
            {new Intl.NumberFormat('fr-FR', {
              style: 'currency',
              currency: record.currency || 'XOF',
              minimumFractionDigits: 0,
            }).format(fee)}
          </Text>
        ) : (
          <Text type="secondary">-</Text>
        ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 60,
      render: (_, record) => (
        <Dropdown menu={getActionMenu(record)} trigger={['click']}>
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
  };

  return (
    <div>
      {/* Statistiques rapides */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card size="small">
            <Statistic
              title="Volume total"
              value={stats?.totalVolume || 0}
              formatter={(value) =>
                new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: 'XOF',
                  minimumFractionDigits: 0,
                }).format(value)
              }
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#52c41a', fontSize: '18px' }}
              loading={statsLoading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card size="small">
            <Statistic
              title="Transactions"
              value={stats?.totalTransactions || 0}
              valueStyle={{ color: '#1890ff', fontSize: '18px' }}
              loading={statsLoading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card size="small">
            <Statistic
              title="Taux de succès"
              value={stats?.successRate || 0}
              suffix="%"
              valueStyle={{
                color: (stats?.successRate || 0) > 80 ? '#52c41a' : '#faad14',
                fontSize: '18px',
              }}
              loading={statsLoading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card size="small">
            <Statistic
              title="Frais totaux"
              value={stats?.totalFees || 0}
              formatter={(value) =>
                new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: 'XOF',
                  minimumFractionDigits: 0,
                }).format(value)
              }
              valueStyle={{ color: '#722ed1', fontSize: '18px' }}
              loading={statsLoading}
            />
          </Card>
        </Col>
      </Row>

      {/* Filtres */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col xs={24} sm={6}>
            <Input.Search
              placeholder="Rechercher..."
              allowClear
              onSearch={(value) => handleFilterChange('search', value)}
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col xs={24} sm={4}>
            <Select
              placeholder="Statut"
              allowClear
              style={{ width: '100%' }}
              onChange={(value) => handleFilterChange('status', value)}
            >
              {paymentStatuses.map((status) => (
                <Option key={status.value} value={status.value}>
                  {status.label}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={4}>
            <Select
              placeholder="Fournisseur"
              allowClear
              style={{ width: '100%' }}
              onChange={(value) => handleFilterChange('provider', value)}
            >
              {providers.map((provider) => (
                <Option key={provider.key} value={provider.key}>
                  {provider.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={6}>
            <RangePicker
              style={{ width: '100%' }}
              onChange={(dates) => {
                handleFilterChange('dateFrom', dates ? dates[0].format('YYYY-MM-DD') : null);
                handleFilterChange('dateTo', dates ? dates[1].format('YYYY-MM-DD') : null);
              }}
            />
          </Col>
          <Col xs={24} sm={4}>
            <Space>
              <Button
                icon={<FilterOutlined />}
                onClick={() => {
                  setFilters({});
                  loadPayments({});
                }}
              >
                Reset
              </Button>
              <Button icon={<DownloadOutlined />} onClick={() => message.info('Export en cours de développement')}>
                Export
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Actions en lot */}
      {selectedRowKeys.length > 0 && (
        <Card size="small" style={{ marginBottom: 16 }}>
          <Space>
            <Text strong>{selectedRowKeys.length} paiement(s) sélectionné(s)</Text>
            <Button size="small">Vérifier en lot</Button>
            <Button size="small">Exporter sélection</Button>
          </Space>
        </Card>
      )}

      {/* Tableau des paiements */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Text strong style={{ fontSize: 16 }}>
            Liste des paiements ({pagination.totalDocs})
          </Text>
          <Button icon={<CreditCardOutlined />} onClick={loadStats} loading={statsLoading}>
            Actualiser les stats
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={payments}
          rowKey="_id"
          loading={paymentsLoading}
          rowSelection={rowSelection}
          pagination={{
            current: pagination.current,
            pageSize: pagination.limit,
            total: pagination.totalDocs,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} sur ${total} paiements`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 1400 }}
          size="small"
        />
      </Card>

      {/* Modal de remboursement */}
      <Modal
        title="Rembourser le paiement"
        visible={refundModalVisible}
        onCancel={() => setRefundModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form form={refundForm} layout="vertical" onFinish={handleRefundSubmit}>
          <div style={{ marginBottom: 16, padding: 16, backgroundColor: '#f8f9fa', borderRadius: 6 }}>
            <Text strong>Paiement à rembourser:</Text>
            <br />
            <Text>ID: {selectedPayment?._id}</Text>
            <br />
            <Text>
              Montant original:{' '}
              {selectedPayment &&
                new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: selectedPayment.currency,
                  minimumFractionDigits: 0,
                }).format(selectedPayment.amount)}
            </Text>
          </div>

          <Form.Item
            name="amount"
            label="Montant à rembourser"
            rules={[
              { required: true, message: 'Le montant est requis' },
              { type: 'number', min: 0, message: 'Le montant doit être positif' },
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
              placeholder="Montant"
            />
          </Form.Item>

          <Form.Item
            name="reason"
            label="Motif du remboursement"
            rules={[{ required: true, message: 'Le motif est requis' }]}
          >
            <Input.TextArea rows={3} placeholder="Expliquez la raison du remboursement..." maxLength={500} showCount />
          </Form.Item>

          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setRefundModalVisible(false)}>Annuler</Button>
              <Button type="primary" htmlType="submit" loading={refunding} danger>
                Rembourser
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
}

export default PaymentsList;
