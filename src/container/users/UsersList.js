import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Input,
  Select,
  Tag,
  Space,
  Dropdown,
  message,
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Tooltip,
  Modal,
  Form,
  Avatar,
  Badge,
} from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import {
  SearchOutlined,
  FilterOutlined,
  MoreOutlined,
  EyeOutlined,
  UserOutlined,
  CalendarOutlined,
  MailOutlined,
  PhoneOutlined,
  CrownOutlined,
  CheckCircleOutlined,
  StopOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import moment from 'moment';
import { getUsersList, updateUserRole, updateUserStatus, formatCurrency } from '../../redux/users/actionCreator';

const { Option } = Select;
const { Text } = Typography;

function UsersList({ onViewUser }) {
  const dispatch = useDispatch();
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [filters, setFilters] = useState({});
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [roleForm] = Form.useForm();
  const [statusForm] = Form.useForm();

  const { users, usersLoading, pagination, roleUpdating, statusUpdating, roles } = useSelector((state) => ({
    users: state.users.users,
    usersLoading: state.users.usersLoading,
    pagination: state.users.pagination,
    roleUpdating: state.users.roleUpdating,
    statusUpdating: state.users.statusUpdating,
    roles: state.users.roles,
  }));

  useEffect(() => {
    // eslint-disable-next-line no-use-before-define
    loadUsers();
  }, []);

  const loadUsers = (newFilters = {}) => {
    dispatch(getUsersList({ ...filters, ...newFilters }));
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    loadUsers(newFilters);
  };

  // eslint-disable-next-line no-shadow
  const handleTableChange = (pagination) => {
    loadUsers({
      page: pagination.current,
      limit: pagination.pageSize,
    });
  };

  const handleRoleUpdate = (user) => {
    setSelectedUser(user);
    setRoleModalVisible(true);
    roleForm.setFieldsValue({
      role: user.role,
    });
  };

  const handleStatusUpdate = (user) => {
    setSelectedUser(user);
    setStatusModalVisible(true);
    statusForm.setFieldsValue({
      isActive: user.isActive,
      reason: '',
    });
  };

  const handleRoleSubmit = async (values) => {
    try {
      await dispatch(updateUserRole(selectedUser.id, values.role));
      message.success('Rôle modifié avec succès');
      setRoleModalVisible(false);
      loadUsers();
    } catch (error) {
      message.error('Erreur lors de la modification du rôle');
    }
  };

  const handleStatusSubmit = async (values) => {
    try {
      await dispatch(updateUserStatus(selectedUser.id, values.isActive, values.reason));
      message.success(`Utilisateur ${values.isActive ? 'activé' : 'désactivé'} avec succès`);
      setStatusModalVisible(false);
      loadUsers();
    } catch (error) {
      message.error('Erreur lors de la modification du statut');
    }
  };

  const handleViewUser = (userId) => {
    // eslint-disable-next-line no-unused-expressions
    onViewUser && onViewUser(userId);
  };

  const getActionMenu = (record) => ({
    items: [
      {
        key: 'view',
        label: 'Voir le profil',
        icon: <EyeOutlined />,
        onClick: () => handleViewUser(record.id),
      },
      {
        key: 'role',
        label: 'Modifier le rôle',
        icon: <CrownOutlined />,
        onClick: () => handleRoleUpdate(record),
      },
      {
        key: 'status',
        label: record.isActive ? 'Désactiver' : 'Activer',
        icon: record.isActive ? <StopOutlined /> : <CheckCircleOutlined />,
        onClick: () => handleStatusUpdate(record),
      },
      {
        type: 'divider',
      },
      {
        key: 'delete',
        label: 'Supprimer',
        icon: <DeleteOutlined />,
        danger: true,
        disabled: true, // Désactivé pour la sécurité
        onClick: () => console.log('Delete user', record.id),
      },
    ],
  });

  const columns = [
    {
      title: 'Utilisateur',
      dataIndex: 'firstName',
      key: 'user',
      width: 200,
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar src={record.avatar} icon={<UserOutlined />} size={40} style={{ marginRight: 12 }} />
          <div>
            <Text strong>
              {record.firstName} {record.lastName}
            </Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              <MailOutlined style={{ marginRight: 4 }} />
              {record.email}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Rôle',
      dataIndex: 'role',
      key: 'role',
      width: 120,
      render: (role) => {
        const roleConfig = roles.find((r) => r.value === role);
        return <Tag color={roleConfig?.color}>{roleConfig?.label || role}</Tag>;
      },
      filters: roles.map((role) => ({ text: role.label, value: role.value })),
    },
    {
      title: 'Statut',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive) => <Badge status={isActive ? 'success' : 'error'} text={isActive ? 'Actif' : 'Inactif'} />,
      filters: [
        { text: 'Actif', value: true },
        { text: 'Inactif', value: false },
      ],
    },
    {
      title: 'Téléphone',
      dataIndex: 'phone',
      key: 'phone',
      width: 140,
      render: (phone) =>
        phone ? (
          <Space>
            <PhoneOutlined style={{ color: '#666' }} />
            <Text>{phone}</Text>
          </Space>
        ) : (
          <Text type="secondary">-</Text>
        ),
    },
    {
      title: 'Pays/Ville',
      key: 'location',
      width: 120,
      render: (_, record) => (
        <div>
          <Text>{record.country}</Text>
          {record.city && (
            <>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                {record.city}
              </Text>
            </>
          )}
        </div>
      ),
    },
    {
      title: 'Niveau',
      dataIndex: 'level',
      key: 'level',
      width: 80,
      render: (level, record) => (
        <Tooltip title={`${record.points || 0} points`}>
          <Tag color="purple">Niveau {level || 1}</Tag>
        </Tooltip>
      ),
    },
    {
      title: 'Donations',
      key: 'donations',
      width: 140,
      render: (_, record) => (
        <div style={{ textAlign: 'right' }}>
          <Text strong style={{ color: '#52c41a' }}>
            {formatCurrency(record.totalDonations || 0, record.currency)}
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: 11 }}>
            {record.donationCount || 0} donation{(record.donationCount || 0) > 1 ? 's' : ''}
          </Text>
        </div>
      ),
      sorter: true,
    },
    {
      title: 'Inscription',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date) => (
        <div>
          <CalendarOutlined style={{ marginRight: 4, color: '#666' }} />
          <Text>{moment(date).format('DD/MM/YYYY')}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 11 }}>
            {moment(date).fromNow()}
          </Text>
        </div>
      ),
      sorter: true,
    },
    {
      title: 'Vérifications',
      key: 'verifications',
      width: 120,
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Badge
            status={record.isEmailVerified ? 'success' : 'error'}
            text={record.isEmailVerified ? 'Email ✓' : 'Email ✗'}
          />
          <Badge
            status={record.isPhoneVerified ? 'success' : 'error'}
            text={record.isPhoneVerified ? 'Tél ✓' : 'Tél ✗'}
          />
        </Space>
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

  // Calculer les statistiques rapides
  const totalUsers = pagination.totalDocs || 0;
  const activeUsers = users.filter((user) => user.isActive).length;
  const adminsCount = users.filter((user) => ['admin', 'moderator'].includes(user.role)).length;
  const newUsersThisMonth = users.filter((user) => moment(user.createdAt).isAfter(moment().startOf('month'))).length;

  return (
    <div>
      {/* Statistiques rapides */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card size="small">
            <Statistic
              title="Total utilisateurs"
              value={totalUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card size="small">
            <Statistic
              title="Utilisateurs actifs"
              value={activeUsers}
              suffix={`/ ${users.length}`}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card size="small">
            <Statistic
              title="Administrateurs"
              value={adminsCount}
              prefix={<CrownOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card size="small">
            <Statistic title="Nouveaux ce mois" value={newUsersThisMonth} valueStyle={{ color: '#722ed1' }} />
          </Card>
        </Col>
      </Row>

      {/* Filtres */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col xs={24} sm={6}>
            <Input.Search
              placeholder="Rechercher par nom, email..."
              allowClear
              onSearch={(value) => handleFilterChange('search', value)}
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col xs={24} sm={4}>
            <Select
              placeholder="Rôle"
              allowClear
              style={{ width: '100%' }}
              onChange={(value) => handleFilterChange('role', value)}
            >
              {roles.map((role) => (
                <Option key={role.value} value={role.value}>
                  {role.label}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={4}>
            <Select
              placeholder="Statut"
              allowClear
              style={{ width: '100%' }}
              onChange={(value) => handleFilterChange('isActive', value)}
            >
              <Option value>Actif</Option>
              <Option value={false}>Inactif</Option>
            </Select>
          </Col>
          <Col xs={24} sm={6}>
            <Button
              icon={<FilterOutlined />}
              onClick={() => {
                setFilters({});
                loadUsers({});
              }}
            >
              Reset filtres
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Actions en lot */}
      {selectedRowKeys.length > 0 && (
        <Card size="small" style={{ marginBottom: 16 }}>
          <Space>
            <Text strong>{selectedRowKeys.length} utilisateur(s) sélectionné(s)</Text>
            <Button size="small">Exporter</Button>
            <Button size="small">Envoyer email</Button>
          </Space>
        </Card>
      )}

      {/* Tableau des utilisateurs */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Text strong style={{ fontSize: 16 }}>
            Liste des utilisateurs ({totalUsers})
          </Text>
          <Button icon={<UserOutlined />} onClick={() => loadUsers()} loading={usersLoading}>
            Actualiser
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={usersLoading}
          rowSelection={rowSelection}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.totalDocs,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} sur ${total} utilisateurs`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 1400 }}
          size="small"
        />
      </Card>

      {/* Modal de modification du rôle */}
      <Modal
        title="Modifier le rôle"
        visible={roleModalVisible}
        onCancel={() => setRoleModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form form={roleForm} layout="vertical" onFinish={handleRoleSubmit}>
          <div style={{ marginBottom: 16, padding: 16, backgroundColor: '#f8f9fa', borderRadius: 6 }}>
            <Text strong>Utilisateur: </Text>
            <Text>
              {selectedUser?.firstName} {selectedUser?.lastName}
            </Text>
            <br />
            <Text type="secondary">{selectedUser?.email}</Text>
          </div>

          <Form.Item name="role" label="Nouveau rôle" rules={[{ required: true, message: 'Sélectionnez un rôle' }]}>
            <Select placeholder="Choisissez le nouveau rôle">
              {roles.map((role) => (
                <Option key={role.value} value={role.value}>
                  <Space>
                    <Tag color={role.color}>{role.label}</Tag>
                    <Text type="secondary">{role.description}</Text>
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setRoleModalVisible(false)}>Annuler</Button>
              <Button type="primary" htmlType="submit" loading={roleUpdating}>
                Modifier
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* Modal de modification du statut */}
      <Modal
        title="Modifier le statut"
        visible={statusModalVisible}
        onCancel={() => setStatusModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form form={statusForm} layout="vertical" onFinish={handleStatusSubmit}>
          <div style={{ marginBottom: 16, padding: 16, backgroundColor: '#f8f9fa', borderRadius: 6 }}>
            <Text strong>Utilisateur: </Text>
            <Text>
              {selectedUser?.firstName} {selectedUser?.lastName}
            </Text>
            <br />
            <Text type="secondary">{selectedUser?.email}</Text>
          </div>

          <Form.Item name="isActive" label="Statut" rules={[{ required: true, message: 'Sélectionnez un statut' }]}>
            <Select placeholder="Choisissez le statut">
              <Option value>
                <Space>
                  <CheckCircleOutlined style={{ color: '#52c41a' }} />
                  <Text>Actif</Text>
                </Space>
              </Option>
              <Option value={false}>
                <Space>
                  <StopOutlined style={{ color: '#ff4d4f' }} />
                  <Text>Inactif</Text>
                </Space>
              </Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="reason"
            label="Raison de la modification"
            rules={[{ required: true, message: 'La raison est requise' }]}
          >
            <Input.TextArea
              rows={3}
              placeholder="Expliquez la raison de cette modification..."
              maxLength={500}
              showCount
            />
          </Form.Item>

          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setStatusModalVisible(false)}>Annuler</Button>
              <Button type="primary" htmlType="submit" loading={statusUpdating}>
                Modifier
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
}

export default UsersList;
