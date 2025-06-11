import React, { useEffect, useState } from 'react';
import {
  Row,
  Col,
  Card,
  Table,
  Button,
  Tag,
  Space,
  Input,
  Select,
  DatePicker,
  Statistic,
  message,
  Empty,
  Spin,
} from 'antd';
import {
  DollarOutlined,
  SearchOutlined,
  EyeOutlined,
  PlusOutlined,
  ReloadOutlined,
  CalendarOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import { donationsReadData, donationStatsReadData } from '../../redux/donations/actionCreator';

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

function UserDonationView({ onViewDonation, onCreateNew }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateRange, setDateRange] = useState(null);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  const { donations, donationsLoading } = useSelector((state) => ({
    donations: state.donations.donations || [],
    donationsLoading: state.donations.donationsLoading,
    stats: state.donations.stats || {},
    statsLoading: state.donations.statsLoading,
  }));

  // Catégories de donations
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

  const statuses = [
    { value: 'pending', label: 'En attente', color: 'processing' },
    { value: 'processing', label: 'En traitement', color: 'processing' },
    { value: 'completed', label: 'Complété', color: 'success' },
    { value: 'failed', label: 'Échoué', color: 'error' },
    { value: 'cancelled', label: 'Annulé', color: 'default' },
    { value: 'refunded', label: 'Remboursé', color: 'warning' },
  ];

  const getCategoryInfo = (value) => {
    const category = categories.find((cat) => cat.value === value);
    return category || { label: value, color: 'default' };
  };

  const getStatusInfo = (value) => {
    const status = statuses.find((s) => s.value === value);
    return status || { label: value, color: 'default' };
  };

  const loadData = async () => {
    try {
      setLoading(true);
      // Charger seulement les données autorisées pour les utilisateurs
      await Promise.all([dispatch(donationsReadData()), dispatch(donationStatsReadData())]);
    } catch (error) {
      console.error('Erreur chargement données:', error);
      message.error('Erreur lors du chargement de vos donations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [dispatch]);

  const handleRefresh = () => {
    loadData();
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    // Pour l'instant recherche côté client, on pourrait améliorer avec une recherche côté serveur
  };

  const handleCategoryFilter = (value) => {
    setFilterCategory(value);
  };

  const handleStatusFilter = (value) => {
    setFilterStatus(value);
  };

  const handleDateFilter = (dates) => {
    setDateRange(dates);
  };

  // Filtrer les donations côté client
  const filteredDonations = donations.filter((donation) => {
    let matches = true;

    // Filtre par terme de recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      matches =
        matches &&
        (donation.receipt?.number?.toLowerCase().includes(term) ||
          donation.category?.toLowerCase().includes(term) ||
          donation.message?.toLowerCase().includes(term));
    }

    // Filtre par catégorie
    if (filterCategory && filterCategory !== 'all') {
      matches = matches && donation.category === filterCategory;
    }

    // Filtre par statut
    if (filterStatus && filterStatus !== 'all') {
      matches = matches && donation.status === filterStatus;
    }

    // Filtre par date
    if (dateRange && dateRange.length === 2) {
      const donationDate = moment(donation.createdAt);
      matches = matches && donationDate.isBetween(dateRange[0], dateRange[1], 'day', '[]');
    }

    return matches;
  });

  const columns = [
    {
      title: 'Référence',
      dataIndex: ['receipt', 'number'],
      key: 'reference',
      render: (text) => <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>{text}</span>,
    },
    {
      title: 'Montant',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount, record) => (
        <span style={{ fontWeight: 'bold', color: '#52c41a' }}>
          {new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: record.currency || 'XOF',
            minimumFractionDigits: 0,
          }).format(amount)}
        </span>
      ),
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: 'Catégorie',
      dataIndex: 'category',
      key: 'category',
      render: (category) => {
        const info = getCategoryInfo(category);
        return <Tag color={info.color}>{info.label}</Tag>;
      },
      filters: categories.map((cat) => ({ text: cat.label, value: cat.value })),
      onFilter: (value, record) => record.category === value,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={type === 'recurring' ? 'purple' : 'blue'}>{type === 'recurring' ? 'Récurrent' : 'Unique'}</Tag>
      ),
    },
    {
      title: 'Statut',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const info = getStatusInfo(status);
        return <Tag color={info.color}>{info.label}</Tag>;
      },
      filters: statuses.map((status) => ({ text: status.label, value: status.value })),
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => moment(date).format('DD/MM/YYYY HH:mm'),
      sorter: (a, b) => moment(a.createdAt).unix() - moment(b.createdAt).unix(),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            /* eslint-disable-next-line no-underscore-dangle */
            onClick={() => onViewDonation(record.id || record._id)}
            size="small"
          >
            Voir
          </Button>
        </Space>
      ),
    },
  ];

  // Calculer les statistiques côté client
  const clientStats = {
    totalAmount: filteredDonations.reduce((sum, d) => sum + (d.amount || 0), 0),
    totalCount: filteredDonations.length,
    completedCount: filteredDonations.filter((d) => d.status === 'completed').length,
    pendingCount: filteredDonations.filter((d) => d.status === 'pending').length,
    recurringCount: filteredDonations.filter((d) => d.type === 'recurring').length,
  };

  if (loading || donationsLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" tip="Chargement de vos donations..." />
      </div>
    );
  }

  return (
    <div>
      {/* En-tête avec statistiques */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Total Donné"
              value={clientStats.totalAmount}
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
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Donations"
              value={clientStats.totalCount}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Complétées"
              value={clientStats.completedCount}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Récurrentes"
              value={clientStats.recurringCount}
              prefix={<ReloadOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filtres et recherche */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={8}>
            <Search
              placeholder="Rechercher (référence, catégorie, message...)"
              allowClear
              onSearch={handleSearch}
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col xs={24} md={4}>
            <Select
              placeholder="Catégorie"
              allowClear
              style={{ width: '100%' }}
              onChange={handleCategoryFilter}
              value={filterCategory === 'all' ? undefined : filterCategory}
            >
              <Option value="all">Toutes les catégories</Option>
              {categories.map((cat) => (
                <Option key={cat.value} value={cat.value}>
                  {cat.label}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} md={4}>
            <Select
              placeholder="Statut"
              allowClear
              style={{ width: '100%' }}
              onChange={handleStatusFilter}
              value={filterStatus === 'all' ? undefined : filterStatus}
            >
              <Option value="all">Tous les statuts</Option>
              {statuses.map((status) => (
                <Option key={status.value} value={status.value}>
                  {status.label}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} md={6}>
            <RangePicker
              style={{ width: '100%' }}
              onChange={handleDateFilter}
              placeholder={['Date début', 'Date fin']}
              format="DD/MM/YYYY"
            />
          </Col>
          <Col xs={24} md={2}>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
                Actualiser
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Actions principales */}
      <Card style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <h3 style={{ margin: 0 }}>Mes Donations ({filteredDonations.length})</h3>
          </Col>
          <Col>
            <Button type="primary" icon={<PlusOutlined />} onClick={onCreateNew} size="large">
              Nouvelle Donation
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Tableau des donations */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredDonations}
          /* eslint-disable-next-line no-underscore-dangle */
          rowKey={(record) => record.id || record._id}
          locale={{
            emptyText: (
              <Empty description="Aucune donation trouvée" image={Empty.PRESENTED_IMAGE_SIMPLE}>
                <Button type="primary" onClick={onCreateNew}>
                  Créer ma première donation
                </Button>
              </Empty>
            ),
          }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} sur ${total} donations`,
          }}
          scroll={{ x: 'max-content' }}
        />
      </Card>
    </div>
  );
}

export default UserDonationView;
