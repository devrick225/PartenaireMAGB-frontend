import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  Switch,
  Button,
  Upload,
  Avatar,
  Row,
  Col,
  message,
  Divider,
  Typography,
  Modal,
  Space,
  Alert,
  Progress,
} from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import {
  UserOutlined,
  CameraOutlined,
  SaveOutlined,
  SettingOutlined,
  LockOutlined,
  BellOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import {
  getUserProfile,
  updateUserProfile,
  updateUserPreferences,
  uploadAvatar,
  deleteUserAccount,
  validateProfileData,
  calculateProfileCompletion,
} from '../../redux/users/actionCreator';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;
const { confirm } = Modal;

function UserPreferences() {
  const [profileForm] = Form.useForm();
  const [preferencesForm] = Form.useForm();
  const [deleteForm] = Form.useForm();
  // const [activeTab, setActiveTab] = useState('profile');
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);

  const dispatch = useDispatch();

  const { currentProfile, profileLoading, profileUpdating, preferencesUpdating, avatarUploading, accountDeleting } =
    useSelector((state) => ({
      currentProfile: state.users.currentProfile,
      profileLoading: state.users.profileLoading,
      profileUpdating: state.users.profileUpdating,
      preferencesUpdating: state.users.preferencesUpdating,
      avatarUploading: state.users.avatarUploading,
      accountDeleting: state.users.accountDeleting,
    }));

  useEffect(() => {
    dispatch(getUserProfile());
  }, [dispatch]);

  useEffect(() => {
    if (currentProfile) {
      // Pré-remplir le formulaire de profil
      profileForm.setFieldsValue({
        dateOfBirth: currentProfile.dateOfBirth,
        gender: currentProfile.gender,
        maritalStatus: currentProfile.maritalStatus,
        occupation: currentProfile.occupation,
        employer: currentProfile.employer,
        monthlyIncome: currentProfile.monthlyIncome,
        address: currentProfile.address,
        emergencyContact: currentProfile.emergencyContact,
        churchMembership: currentProfile.churchMembership,
        donationPreferences: currentProfile.donationPreferences,
        communicationPreferences: currentProfile.communicationPreferences,
        volunteer: currentProfile.volunteer,
        familyInfo: currentProfile.familyInfo,
      });

      // Pré-remplir le formulaire de préférences
      if (currentProfile.user) {
        preferencesForm.setFieldsValue({
          language: currentProfile.user.language,
          currency: currentProfile.user.currency,
          emailNotifications: currentProfile.user.emailNotifications,
          smsNotifications: currentProfile.user.smsNotifications,
        });
      }
    }
  }, [currentProfile, profileForm, preferencesForm]);

  const handleProfileSubmit = async (values) => {
    try {
      // Validation côté client
      const errors = validateProfileData(values);
      if (errors.length > 0) {
        setValidationErrors(errors);
        return;
      }

      setValidationErrors([]);
      await dispatch(updateUserProfile(values));
      message.success('Profil mis à jour avec succès');
    } catch (error) {
      message.error('Erreur lors de la mise à jour du profil');
    }
  };

  const handlePreferencesSubmit = async (values) => {
    try {
      await dispatch(updateUserPreferences(values));
      message.success('Préférences mises à jour avec succès');
    } catch (error) {
      message.error('Erreur lors de la mise à jour des préférences');
    }
  };

  const handleAvatarUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      await dispatch(uploadAvatar(formData));
      message.success('Avatar mis à jour avec succès');
      return false; // Empêcher l'upload automatique
    } catch (error) {
      message.error("Erreur lors de l'upload de l'avatar");
      return false;
    }
  };

  const handleDeleteAccount = async (values) => {
    try {
      await dispatch(deleteUserAccount(values.password, values.confirmation));
      message.success('Compte supprimé avec succès');
      setDeleteModalVisible(false);
      // Rediriger vers la page de connexion
      window.location.href = '/login';
    } catch (error) {
      message.error('Erreur lors de la suppression du compte');
    }
  };

  const showDeleteConfirm = () => {
    confirm({
      title: 'Êtes-vous sûr de vouloir supprimer votre compte ?',
      content: 'Cette action est irréversible. Toutes vos données seront supprimées.',
      okText: 'Oui, supprimer',
      okType: 'danger',
      cancelText: 'Annuler',
      onOk() {
        setDeleteModalVisible(true);
      },
    });
  };

  const completionPercentage = currentProfile ? calculateProfileCompletion(currentProfile) : 0;

  return (
    <div>
      <Row gutter={24}>
        {/* Colonne de gauche - Informations de base */}
        <Col xs={24} lg={8}>
          <Card title="Photo de profil" loading={profileLoading}>
            <div style={{ textAlign: 'center' }}>
              <Upload
                name="avatar"
                listType="picture-circle"
                showUploadList={false}
                beforeUpload={handleAvatarUpload}
                accept="image/*"
              >
                <Avatar
                  size={100}
                  src={currentProfile?.user?.avatar}
                  icon={<UserOutlined />}
                  style={{ cursor: 'pointer' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    backgroundColor: '#1890ff',
                    borderRadius: '50%',
                    padding: 8,
                    cursor: 'pointer',
                  }}
                >
                  <CameraOutlined style={{ color: 'white', fontSize: 14 }} />
                </div>
              </Upload>

              <div style={{ marginTop: 16 }}>
                <Title level={4} style={{ margin: 0 }}>
                  {currentProfile?.user?.firstName} {currentProfile?.user?.lastName}
                </Title>
                <Text type="secondary">{currentProfile?.user?.email}</Text>
              </div>
            </div>

            {avatarUploading && (
              <div style={{ marginTop: 16 }}>
                <Progress percent={50} status="active" />
                <Text type="secondary">Upload en cours...</Text>
              </div>
            )}
          </Card>

          <Card title="Complétude du profil" style={{ marginTop: 16 }}>
            <Progress
              percent={completionPercentage}
              strokeColor={{
                '0%': '#ff4d4f',
                '50%': '#faad14',
                '100%': '#52c41a',
              }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Un profil complet améliore votre expérience et vous permet de débloquer plus de fonctionnalités.
            </Text>
          </Card>
        </Col>

        {/* Colonne de droite - Formulaires */}
        <Col xs={24} lg={16}>
          {/* Formulaire de profil */}
          <Card
            title={
              <Space>
                <UserOutlined />
                <span>Informations personnelles</span>
              </Space>
            }
            style={{ marginBottom: 24 }}
          >
            <Form form={profileForm} layout="vertical" onFinish={handleProfileSubmit}>
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item name="dateOfBirth" label="Date de naissance">
                    <Input type="date" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="gender" label="Genre">
                    <Select placeholder="Sélectionnez votre genre">
                      <Option value="male">Homme</Option>
                      <Option value="female">Femme</Option>
                      <Option value="other">Autre</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item name="maritalStatus" label="Statut matrimonial">
                    <Select placeholder="Statut matrimonial">
                      <Option value="single">Célibataire</Option>
                      <Option value="married">Marié(e)</Option>
                      <Option value="divorced">Divorcé(e)</Option>
                      <Option value="widowed">Veuf/Veuve</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="occupation" label="Profession">
                    <Input placeholder="Votre profession" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item name="employer" label="Employeur">
                    <Input placeholder="Nom de votre employeur" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="monthlyIncome" label="Revenu mensuel (optionnel)">
                    <Input type="number" placeholder="Revenu en XOF" />
                  </Form.Item>
                </Col>
              </Row>

              <Divider />
              <Title level={5}>Adresse</Title>

              <Form.Item name={['address', 'street']} label="Adresse">
                <TextArea rows={2} placeholder="Numéro et nom de rue" />
              </Form.Item>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item name={['address', 'city']} label="Ville">
                    <Input placeholder="Ville" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name={['address', 'country']} label="Pays">
                    <Select placeholder="Sélectionnez votre pays">
                      <Option value="CI">Côte d&#39;Ivoire</Option>
                      <Option value="BF">Burkina Faso</Option>
                      <Option value="ML">Mali</Option>
                      <Option value="SN">Sénégal</Option>
                      <Option value="GH">Ghana</Option>
                      <Option value="FR">France</Option>
                      <Option value="CA">Canada</Option>
                      <Option value="US">États-Unis</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Divider />
              <Title level={5}>Contact d&#39;urgence</Title>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item name={['emergencyContact', 'name']} label="Nom du contact">
                    <Input placeholder="Nom complet" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name={['emergencyContact', 'relationship']} label="Relation">
                    <Select placeholder="Relation avec vous">
                      <Option value="parent">Parent</Option>
                      <Option value="spouse">Conjoint(e)</Option>
                      <Option value="sibling">Frère/Sœur</Option>
                      <Option value="child">Enfant</Option>
                      <Option value="friend">Ami(e)</Option>
                      <Option value="other">Autre</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name={['emergencyContact', 'phone']} label="Téléphone d'urgence">
                <Input placeholder="+225 01 02 03 04 05" />
              </Form.Item>

              {validationErrors.length > 0 && (
                <Alert
                  message="Erreurs de validation"
                  description={
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                      {validationErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  }
                  type="error"
                  style={{ marginTop: 16 }}
                />
              )}

              <div style={{ textAlign: 'right', marginTop: 24 }}>
                <Button type="primary" htmlType="submit" loading={profileUpdating} icon={<SaveOutlined />}>
                  Sauvegarder le profil
                </Button>
              </div>
            </Form>
          </Card>

          {/* Formulaire de préférences */}
          <Card
            title={
              <Space>
                <SettingOutlined />
                <span>Préférences</span>
              </Space>
            }
            style={{ marginBottom: 24 }}
          >
            <Form form={preferencesForm} layout="vertical" onFinish={handlePreferencesSubmit}>
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item name="language" label="Langue">
                    <Select>
                      <Option value="fr">Français</Option>
                      <Option value="en">English</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="currency" label="Devise préférée">
                    <Select>
                      <Option value="XOF">Franc CFA (XOF)</Option>
                      <Option value="EUR">Euro (EUR)</Option>
                      <Option value="USD">Dollar US (USD)</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Divider />
              <Title level={5}>
                <BellOutlined /> Notifications
              </Title>

              <Form.Item name={['emailNotifications', 'donations']} valuePropName="checked">
                <Switch /> <span style={{ marginLeft: 8 }}>Notifications email pour les donations</span>
              </Form.Item>

              <Form.Item name={['emailNotifications', 'receipts']} valuePropName="checked">
                <Switch /> <span style={{ marginLeft: 8 }}>Reçus de donations par email</span>
              </Form.Item>

              <Form.Item name={['emailNotifications', 'reminders']} valuePropName="checked">
                <Switch /> <span style={{ marginLeft: 8 }}>Rappels de donations récurrentes</span>
              </Form.Item>

              <Form.Item name={['smsNotifications', 'important']} valuePropName="checked">
                <Switch /> <span style={{ marginLeft: 8 }}>SMS pour les notifications importantes</span>
              </Form.Item>

              <div style={{ textAlign: 'right' }}>
                <Button type="primary" htmlType="submit" loading={preferencesUpdating} icon={<SaveOutlined />}>
                  Sauvegarder les préférences
                </Button>
              </div>
            </Form>
          </Card>

          {/* Zone dangereuse */}
          <Card
            title={
              <Space>
                <LockOutlined />
                <span>Zone dangereuse</span>
              </Space>
            }
            style={{ borderColor: '#ff4d4f' }}
          >
            <Alert
              message="Suppression de compte"
              description="Une fois supprimé, votre compte ne pourra pas être récupéré. Cette action est irréversible."
              type="warning"
              style={{ marginBottom: 16 }}
            />

            <Button danger icon={<DeleteOutlined />} onClick={showDeleteConfirm}>
              Supprimer mon compte
            </Button>
          </Card>
        </Col>
      </Row>

      {/* Modal de suppression de compte */}
      <Modal
        title="Supprimer votre compte"
        visible={deleteModalVisible}
        onCancel={() => setDeleteModalVisible(false)}
        footer={null}
        width={500}
      >
        <Alert
          message="Attention !"
          description="Cette action supprimera définitivement votre compte et toutes vos données. Cette action ne peut pas être annulée."
          type="error"
          style={{ marginBottom: 16 }}
        />

        <Form form={deleteForm} layout="vertical" onFinish={handleDeleteAccount}>
          <Form.Item
            name="password"
            label="Mot de passe actuel"
            rules={[{ required: true, message: 'Le mot de passe est requis' }]}
          >
            <Input.Password placeholder="Entrez votre mot de passe" />
          </Form.Item>

          <Form.Item
            name="confirmation"
            label="Tapez 'DELETE' pour confirmer"
            rules={[
              { required: true, message: 'La confirmation est requise' },
              {
                validator: (_, value) => {
                  if (value !== 'DELETE') {
                    return Promise.reject(new Error('Vous devez taper "DELETE" exactement'));
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input placeholder="DELETE" />
          </Form.Item>

          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setDeleteModalVisible(false)}>Annuler</Button>
              <Button type="primary" danger htmlType="submit" loading={accountDeleting}>
                Supprimer définitivement
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
}

export default UserPreferences;
