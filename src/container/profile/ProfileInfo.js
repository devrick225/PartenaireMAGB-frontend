import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Button, Upload, message, Row, Col, Avatar, Divider } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import {
  UserOutlined,
  CameraOutlined,
  SaveOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import { profileUpdateData, uploadAvatar } from '../../redux/profile/actionCreator';

const { Option } = Select;

function ProfileInfo({ profile }) {
  const [form] = Form.useForm();
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar);
  const dispatch = useDispatch();

  const { updating, uploadingAvatar } = useSelector((state) => ({
    updating: state.profile.updating,
    uploadingAvatar: state.profile.uploadingAvatar,
  }));

  useEffect(() => {
    if (profile) {
      // Gérer la structure retournée par le backend
      const userData = profile.user || profile;
      const profileData = profile;

      console.log('profileData', profileData);

      form.setFieldsValue({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone,
        country: userData.country,
        city: userData.city,
        language: userData.language,
        currency: userData.currency,
        timezone: userData.timezone,
      });
      setAvatarUrl(userData.avatar);
    }
  }, [profile, form]);

  const handleSubmit = async (values) => {
    try {
      await dispatch(profileUpdateData(values));
      message.success('Informations mises à jour avec succès !');
    } catch (error) {
      message.error('Erreur lors de la mise à jour des informations');
    }
  };

  const handleAvatarChange = async (info) => {
    if (info.file.status === 'uploading') {
      return;
    }

    if (info.file.status === 'done' || info.file.originFileObj) {
      try {
        const newAvatarUrl = await dispatch(uploadAvatar(info.file.originFileObj));
        setAvatarUrl(newAvatarUrl);
        message.success('Photo de profil mise à jour !');
      } catch (error) {
        message.error('Erreur lors du téléchargement de la photo');
      }
    }
  };

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('Vous ne pouvez télécharger que des fichiers JPG/PNG !');
      return false;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("L'image doit faire moins de 2MB !");
      return false;
    }
    return true;
  };

  const countries = [
    'France',
    "Côte d'Ivoire",
    'Sénégal',
    'Mali',
    'Burkina Faso',
    'Niger',
    'Guinée',
    'Bénin',
    'Togo',
    'Cameroun',
    'Gabon',
    'Congo',
    'Madagascar',
    'Maurice',
    'Belgique',
    'Suisse',
    'Canada',
    'Autre',
  ];

  const languages = [
    { value: 'fr', label: 'Français' },
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Español' },
    { value: 'ar', label: 'العربية' },
  ];

  const currencies = [
    { value: 'EUR', label: 'Euro (€)' },
    { value: 'XOF', label: 'Franc CFA Ouest (CFA)' },
    { value: 'XAF', label: 'Franc CFA Central (CFA)' },
    { value: 'USD', label: 'Dollar US ($)' },
    { value: 'CAD', label: 'Dollar Canadien (CAD)' },
    { value: 'CHF', label: 'Franc Suisse (CHF)' },
  ];

  return (
    <div>
      {/* Section Avatar */}
      <div style={{ marginBottom: 40, textAlign: 'center' }}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <Avatar
            size={120}
            src={avatarUrl}
            icon={!avatarUrl && <UserOutlined />}
            style={{ border: '4px solid #f0f0f0' }}
          />
          <Upload
            name="avatar"
            showUploadList={false}
            beforeUpload={beforeUpload}
            onChange={handleAvatarChange}
            accept="image/*"
          >
            <Button
              type="primary"
              shape="circle"
              icon={<CameraOutlined />}
              loading={uploadingAvatar}
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                zIndex: 1,
              }}
            />
          </Upload>
        </div>
        <p style={{ marginTop: 12, color: '#666' }}>
          Cliquez sur l&#39;appareil photo pour changer votre photo de profil
        </p>
      </div>

      <Divider />

      {/* Formulaire d'informations */}
      <Form form={form} layout="vertical" onFinish={handleSubmit} size="large">
        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Form.Item
              name="firstName"
              label="Prénom"
              rules={[
                { required: true, message: 'Veuillez saisir votre prénom' },
                { min: 2, message: 'Le prénom doit contenir au moins 2 caractères' },
              ]}
            >
              <Input prefix={<UserOutlined />} placeholder="Votre prénom" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="lastName"
              label="Nom de famille"
              rules={[
                { required: true, message: 'Veuillez saisir votre nom' },
                { min: 2, message: 'Le nom doit contenir au moins 2 caractères' },
              ]}
            >
              <Input prefix={<UserOutlined />} placeholder="Votre nom de famille" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Form.Item
              name="email"
              label="Adresse email"
              rules={[
                { required: true, message: 'Veuillez saisir votre email' },
                { type: 'email', message: "Format d'email invalide" },
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="votre@email.com"
                disabled // L'email ne peut généralement pas être modifié
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="phone"
              label="Numéro de téléphone"
              rules={[
                { required: true, message: 'Veuillez saisir votre numéro' },
                { pattern: /^\+?[1-9]\d{8,14}$/, message: 'Format de téléphone invalide' },
              ]}
            >
              <Input prefix={<PhoneOutlined />} placeholder="+225 XX XX XX XX XX" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Form.Item
              name="country"
              label="Pays"
              rules={[{ required: true, message: 'Veuillez sélectionner votre pays' }]}
            >
              <Select
                placeholder="Sélectionnez votre pays"
                showSearch
                filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
              >
                {countries.map((country) => (
                  <Option key={country} value={country}>
                    {country}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="city" label="Ville" rules={[{ required: true, message: 'Veuillez saisir votre ville' }]}>
              <Input prefix={<EnvironmentOutlined />} placeholder="Votre ville" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col xs={24} md={8}>
            <Form.Item
              name="language"
              label="Langue préférée"
              rules={[{ required: true, message: 'Veuillez sélectionner une langue' }]}
            >
              <Select placeholder="Sélectionnez une langue">
                {languages.map((lang) => (
                  <Option key={lang.value} value={lang.value}>
                    <GlobalOutlined style={{ marginRight: 8 }} />
                    {lang.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              name="currency"
              label="Devise préférée"
              rules={[{ required: true, message: 'Veuillez sélectionner une devise' }]}
            >
              <Select placeholder="Sélectionnez une devise">
                {currencies.map((currency) => (
                  <Option key={currency.value} value={currency.value}>
                    {currency.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="timezone" label="Fuseau horaire">
              <Select placeholder="Fuseau horaire">
                <Option value="Africa/Abidjan">GMT+0 (Abidjan)</Option>
                <Option value="Europe/Paris">GMT+1 (Paris)</Option>
                <Option value="America/New_York">GMT-5 (New York)</Option>
                <Option value="America/Montreal">GMT-5 (Montréal)</Option>
                <Option value="Africa/Cairo">GMT+2 (Le Caire)</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Divider />

        <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
          <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={updating} size="large">
            {updating ? 'Mise à jour...' : 'Sauvegarder les modifications'}
          </Button>
        </Form.Item>
      </Form>

      {/* Informations additionnelles */}
      <Divider />
      <div style={{ backgroundColor: '#f9f9f9', padding: 16, borderRadius: 8 }}>
        <h4 style={{ marginBottom: 12 }}>Informations du compte</h4>
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <p>
              <strong>Statut du compte :</strong> {profile?.user?.isActive ?? profile?.isActive ? 'Actif' : 'Inactif'}
            </p>
            <p>
              <strong>Email vérifié :</strong>{' '}
              {profile?.user?.isEmailVerified ?? profile?.isEmailVerified ? '✅ Oui' : '❌ Non'}
            </p>
          </Col>
          <Col xs={24} sm={12}>
            <p>
              <strong>Téléphone vérifié :</strong>{' '}
              {profile?.user?.isPhoneVerified ?? profile?.isPhoneVerified ? '✅ Oui' : '❌ Non'}
            </p>
            <p>
              <strong>Niveau :</strong> {profile?.user?.level || profile?.level || 1}
            </p>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <p>
              <strong>Total donations :</strong> {profile?.user?.totalDonations || profile?.totalDonations || 0}{' '}
              {profile?.user?.currency || profile?.currency || 'XOF'}
            </p>
          </Col>
          <Col xs={24} sm={12}>
            <p>
              <strong>Nombre de donations :</strong> {profile?.user?.donationCount || profile?.donationCount || 0}
            </p>
          </Col>
        </Row>
        {profile?.completionPercentage !== undefined && (
          <Row gutter={16}>
            <Col xs={24}>
              <p>
                <strong>Profil complété :</strong> {profile.completionPercentage}%
              </p>
            </Col>
          </Row>
        )}
      </div>
    </div>
  );
}

export default ProfileInfo;
