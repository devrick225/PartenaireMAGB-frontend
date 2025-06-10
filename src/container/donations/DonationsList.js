/* eslint no-underscore-dangle: 0 */
import React, { useState } from 'react';
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
} from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import {
  SearchOutlined,
  FilterOutlined,
  MoreOutlined,
  EyeOutlined,
  DeleteOutlined,
  DownloadOutlined,
  FileTextOutlined,
  DollarOutlined,
  CalendarOutlined,
  UserOutlined,
} from '@ant-design/icons';
import moment from 'moment';
import {
  donationsReadData,
  donationDeleteData,
  downloadReceipt,
  generateReceipt,
  updateFilters,
  updateSearch,
} from '../../redux/donations/actionCreator';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Text } = Typography;
const { confirm } = Modal;

function DonationsList({ onViewDonation, onCreateNew }) {
  const dispatch = useDispatch();
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const { donations, donationsLoading, pagination, filters, searchTerm } = useSelector((state) => ({
    donations: state.donations.donations,
    donationsLoading: state.donations.donationsLoading,
    pagination: state.donations.pagination,
    filters: state.donations.filters,
    searchTerm: state.donations.searchTerm,
  }));

  // Catégories de donation selon le modèle
  const categories = [
    { value: 'tithe', label: 'Dîme', color: 'gold' },
    { value: 'offering', label: 'Offrande', color: 'blue' },
    { value: 'building', label: 'Construction', color: 'orange' },
    { value: 'missions', label: 'Missions', color: 'green' },
    { value: 'charity', label: 'Charité', color: 'purple' },
    { value: 'education', label: 'Éducation', color: 'cyan' },
    { value: 'youth', label: 'Jeunesse', color: 'lime' },
    { value: 'women', label: 'Femmes', color: 'pink' },
    { value: 'men', label: 'Hommes', color: 'geekblue' },
    { value: 'special', label: 'Événement spécial', color: 'volcano' },
    { value: 'emergency', label: 'Urgence', color: 'red' },
  ];

  // Statuts de donation
  const statuses = [
    { value: 'pending', label: 'En attente', color: 'processing' },
    { value: 'processing', label: 'En traitement', color: 'processing' },
    { value: 'completed', label: 'Complété', color: 'success' },
    { value: 'failed', label: 'Échoué', color: 'error' },
    { value: 'cancelled', label: 'Annulé', color: 'default' },
    { value: 'refunded', label: 'Remboursé', color: 'warning' },
    { value: 'scheduled', label: 'Programmé', color: 'processing' },
  ];

  const getCategoryLabel = (value) => {
    const category = categories.find((cat) => cat.value === value);
    return category ? category.label : value;
  };

  const getCategoryColor = (value) => {
    const category = categories.find((cat) => cat.value === value);
    return category ? category.color : 'default';
  };

  const getStatusConfig = (value) => {
    const status = statuses.find((s) => s.value === value);
    return status || { label: value, color: 'default' };
  };

  const handleSearch = (value) => {
    dispatch(updateSearch(value));
    dispatch(
      donationsReadData({
        ...filters,
        search: value,
        page: 1,
      }),
    );
  };

  const handleFilterChange = (newFilters) => {
    const updatedFilters = { ...filters, ...newFilters };
    dispatch(updateFilters(updatedFilters));
    dispatch(
      donationsReadData({
        ...updatedFilters,
        search: searchTerm,
        page: 1,
      }),
    );
  };

  // eslint-disable-next-line no-shadow
  const handleTableChange = (pagination) => {
    dispatch(
      donationsReadData({
        ...filters,
        search: searchTerm,
        page: pagination.current,
        limit: pagination.pageSize,
      }),
    );
  };

  const handleDelete = (id) => {
    confirm({
      title: 'Supprimer cette donation',
      content: 'Cette action est irréversible. Êtes-vous sûr de vouloir supprimer cette donation ?',
      okText: 'Supprimer',
      okType: 'danger',
      cancelText: 'Annuler',
      onOk: async () => {
        try {
          await dispatch(donationDeleteData(id));
          message.success('Donation supprimée avec succès');
        } catch (error) {
          message.error('Erreur lors de la suppression');
        }
      },
    });
  };

  const handleGenerateReceipt = async (donationId) => {
    try {
      await dispatch(generateReceipt(donationId));
      message.success('Reçu généré avec succès');
    } catch (error) {
      message.error('Erreur lors de la génération du reçu');
    }
  };

  const handleDownloadReceipt = async (donationId) => {
    try {
      await dispatch(downloadReceipt(donationId));
    } catch (error) {
      message.error('Erreur lors du téléchargement du reçu');
    }
  };

  const getActionMenu = (record) => ({
    items: [
      {
        key: 'view',
        label: 'Voir les détails',
        icon: <EyeOutlined />,
        onClick: () => onViewDonation(record._id),
      },
      {
        key: 'receipt',
        label: record.receipt?.issued ? 'Télécharger le reçu' : 'Générer le reçu',
        icon: record.receipt?.issued ? <DownloadOutlined /> : <FileTextOutlined />,
        onClick: () => {
          if (record.receipt?.issued) {
            handleDownloadReceipt(record._id);
          } else {
            handleGenerateReceipt(record._id);
          }
        },
      },
      {
        type: 'divider',
      },
      {
        key: 'delete',
        label: 'Supprimer',
        icon: <DeleteOutlined />,
        danger: true,
        onClick: () => handleDelete(record._id),
      },
    ],
  });

  const columns = [
    {
      title: 'Numéro de reçu',
      dataIndex: ['receipt', 'number'],
      key: 'receiptNumber',
      width: 140,
      render: (text, record) => (
        <Text strong style={{ color: '#1890ff' }}>
          {text || `DON-${record._id?.slice(-6)}`}
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
      title: 'Catégorie',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (category) => <Tag color={getCategoryColor(category)}>{getCategoryLabel(category)}</Tag>,
      filters: categories.map((cat) => ({ text: cat.label, value: cat.value })),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type) => (
        <Tag color={type === 'recurring' ? 'purple' : 'blue'}>{type === 'recurring' ? 'Récurrent' : 'Unique'}</Tag>
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
      width: 120,
      render: (status) => {
        const config = getStatusConfig(status);
        return <Tag color={config.color}>{config.label}</Tag>;
      },
      filters: statuses.map((status) => ({ text: status.label, value: status.value })),
    },
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
      title: 'Reçu',
      dataIndex: ['receipt', 'issued'],
      key: 'receiptIssued',
      width: 80,
      render: (issued) => <Tag color={issued ? 'success' : 'default'}>{issued ? '✓ Émis' : '✗ Non émis'}</Tag>,
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

  // Calculer les statistiques rapides
  const totalAmount = donations.reduce((sum, donation) => sum + (donation.amount || 0), 0);
  const completedCount = donations.filter((d) => d.status === 'completed').length;
  const pendingCount = donations.filter((d) => ['pending', 'processing'].includes(d.status)).length;

  return (
    <div>
      {/* Statistiques rapides */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card size="small">
            <Statistic
              title="Total des donations"
              value={totalAmount}
              formatter={(value) =>
                new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: 'XOF',
                  minimumFractionDigits: 0,
                }).format(value)
              }
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small">
            <Statistic
              title="Donations complétées"
              value={completedCount}
              suffix={`/ ${donations.length}`}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small">
            <Statistic title="En attente" value={pendingCount} valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
      </Row>

      {/* Barre de recherche et filtres */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col xs={24} sm={8}>
            <Input.Search
              placeholder="Rechercher par donateur, email, numéro..."
              allowClear
              onSearch={handleSearch}
              style={{ width: '100%' }}
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col xs={24} sm={4}>
            <Select
              placeholder="Catégorie"
              allowClear
              style={{ width: '100%' }}
              value={filters.category}
              onChange={(value) => handleFilterChange({ category: value })}
            >
              {categories.map((cat) => (
                <Option key={cat.value} value={cat.value}>
                  {cat.label}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={4}>
            <Select
              placeholder="Statut"
              allowClear
              style={{ width: '100%' }}
              value={filters.status}
              onChange={(value) => handleFilterChange({ status: value })}
            >
              {statuses.map((status) => (
                <Option key={status.value} value={status.value}>
                  {status.label}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={6}>
            <RangePicker
              style={{ width: '100%' }}
              onChange={(dates) => {
                handleFilterChange({
                  dateFrom: dates ? dates[0].format('YYYY-MM-DD') : null,
                  dateTo: dates ? dates[1].format('YYYY-MM-DD') : null,
                });
              }}
            />
          </Col>
          <Col xs={24} sm={2}>
            <Button
              type="primary"
              icon={<FilterOutlined />}
              onClick={() => {
                dispatch(updateFilters({}));
                dispatch(updateSearch(''));
                dispatch(donationsReadData());
              }}
            >
              Reset
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Actions en lot */}
      {selectedRowKeys.length > 0 && (
        <Card size="small" style={{ marginBottom: 16 }}>
          <Space>
            <Text strong>{selectedRowKeys.length} donation(s) sélectionnée(s)</Text>
            <Button size="small">Générer les reçus</Button>
            <Button size="small">Exporter</Button>
            <Button size="small" danger>
              Supprimer
            </Button>
          </Space>
        </Card>
      )}

      {/* Tableau des donations */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Text strong style={{ fontSize: 16 }}>
            Liste des donations ({pagination.total})
          </Text>
          <Button type="primary" icon={<DollarOutlined />} onClick={onCreateNew}>
            Nouvelle donation
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={donations}
          rowKey="_id"
          loading={donationsLoading}
          rowSelection={rowSelection}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} sur ${total} donations`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
          size="small"
        />
      </Card>
    </div>
  );
}

export default DonationsList;
