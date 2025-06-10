import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Select,
  Button,
  Upload,
  message,
  Row,
  Col,
  Avatar,
  Divider,
  Card,
  DatePicker,
  InputNumber,
  Switch,
  Progress,
  Tabs,
  Space,
  Typography,
} from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import {
  UserOutlined,
  CameraOutlined,
  SaveOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
  HeartOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  ContactsOutlined,
  DollarOutlined,
  BellOutlined,
  ToolOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import moment from 'moment';
import { profileUpdateData, uploadAvatar } from '../../redux/profile/actionCreator';

const { Option } = Select;
const { Title } = Typography;

function ProfileComplete({ profile }) {
  const [form] = Form.useForm();
  const [avatarUrl, setAvatarUrl] = useState(profile?.user?.avatar || profile?.avatar);
  const [activeSection, setActiveSection] = useState('personal');
  const dispatch = useDispatch();

  const { updating, uploadingAvatar } = useSelector((state) => ({
    updating: state.profile.updating,
    uploadingAvatar: state.profile.uploadingAvatar,
  }));

  useEffect(() => {
    if (profile) {
      console.log('ProfileComplete - Données reçues:', profile);
      console.log(
        '💡 Pour tester le profil en console, utilisez: import("../utility/profileTestSimple").then(m => m.runQuickProfileTest())',
      );
      const userData = profile.user || {};
      const profileData = profile;

      form.setFieldsValue({
        // Informations de base
        firstName: userData.firstName || profile.firstName,
        lastName: userData.lastName || profile.lastName,
        email: userData.email || profile.email,
        phone: userData.phone || profile.phone,

        // Informations personnelles détaillées
        dateOfBirth: profileData.dateOfBirth ? moment(profileData.dateOfBirth) : null,
        gender: profileData.gender,
        maritalStatus: profileData.maritalStatus,

        // Adresse
        'address.street': profileData.address?.street,
        'address.neighborhood': profileData.address?.neighborhood,
        'address.postalCode': profileData.address?.postalCode,
        'address.state': profileData.address?.state,
        'address.country': profileData.address?.country,

        // Informations professionnelles
        occupation: profileData.occupation,
        employer: profileData.employer,
        monthlyIncome: profileData.monthlyIncome,

        // Contact d'urgence
        'emergencyContact.name': profileData.emergencyContact?.name,
        'emergencyContact.relationship': profileData.emergencyContact?.relationship,
        'emergencyContact.phone': profileData.emergencyContact?.phone,
        'emergencyContact.email': profileData.emergencyContact?.email,

        // Informations ecclésiastiques
        'churchMembership.isChurchMember': profileData.churchMembership?.isChurchMember,
        'churchMembership.churchName': profileData.churchMembership?.churchName,
        'churchMembership.membershipDate': profileData.churchMembership?.membershipDate
          ? moment(profileData.churchMembership.membershipDate)
          : null,
        'churchMembership.baptismDate': profileData.churchMembership?.baptismDate
          ? moment(profileData.churchMembership.baptismDate)
          : null,
        'churchMembership.ministry': profileData.churchMembership?.ministry,
        'churchMembership.churchRole': profileData.churchMembership?.churchRole,

        // Préférences de donation
        'donationPreferences.preferredAmount': profileData.donationPreferences?.preferredAmount,
        'donationPreferences.preferredFrequency': profileData.donationPreferences?.preferredFrequency,
        'donationPreferences.preferredDay': profileData.donationPreferences?.preferredDay,
        'donationPreferences.preferredPaymentMethod': profileData.donationPreferences?.preferredPaymentMethod,
        'donationPreferences.donationCategories': profileData.donationPreferences?.donationCategories,

        // Préférences de communication
        'communicationPreferences.language': profileData.communicationPreferences?.language || userData.language,
        'communicationPreferences.preferredContactMethod': profileData.communicationPreferences?.preferredContactMethod,
        'communicationPreferences.receiveNewsletters': profileData.communicationPreferences?.receiveNewsletters,
        'communicationPreferences.receiveEventNotifications':
          profileData.communicationPreferences?.receiveEventNotifications,
        'communicationPreferences.receiveDonationReminders':
          profileData.communicationPreferences?.receiveDonationReminders,

        // Bénévolat
        'volunteer.isAvailable': profileData.volunteer?.isAvailable,
        'volunteer.skills': profileData.volunteer?.skills,
        'volunteer.interests': profileData.volunteer?.interests,

        // Famille
        'familyInfo.numberOfChildren': profileData.familyInfo?.numberOfChildren,
        'familyInfo.spouse.name': profileData.familyInfo?.spouse?.name,
        'familyInfo.spouse.dateOfBirth': profileData.familyInfo?.spouse?.dateOfBirth
          ? moment(profileData.familyInfo.spouse.dateOfBirth)
          : null,
        'familyInfo.spouse.isChurchMember': profileData.familyInfo?.spouse?.isChurchMember,
      });

      setAvatarUrl(userData.avatar || profile.avatar);
    }
  }, [profile, form]);

  const handleSubmit = async (values) => {
    try {
      // Transformer les dates moment en dates ISO
      const transformedValues = { ...values };
      if (transformedValues.dateOfBirth) {
        transformedValues.dateOfBirth = transformedValues.dateOfBirth.toISOString();
      }
      if (transformedValues['churchMembership.membershipDate']) {
        transformedValues['churchMembership.membershipDate'] =
          transformedValues['churchMembership.membershipDate'].toISOString();
      }
      if (transformedValues['churchMembership.baptismDate']) {
        transformedValues['churchMembership.baptismDate'] =
          transformedValues['churchMembership.baptismDate'].toISOString();
      }
      if (transformedValues['familyInfo.spouse.dateOfBirth']) {
        transformedValues['familyInfo.spouse.dateOfBirth'] =
          transformedValues['familyInfo.spouse.dateOfBirth'].toISOString();
      }

      await dispatch(profileUpdateData(transformedValues));
      message.success('Profil mis à jour avec succès !');
    } catch (error) {
      message.error('Erreur lors de la mise à jour du profil');
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

  // Options pour les sélecteurs
  const genderOptions = [
    { value: 'male', label: 'Homme' },
    { value: 'female', label: 'Femme' },
    { value: 'other', label: 'Autre' },
  ];

  const maritalStatusOptions = [
    { value: 'single', label: 'Célibataire' },
    { value: 'married', label: 'Marié(e)' },
    { value: 'divorced', label: 'Divorcé(e)' },
    { value: 'widowed', label: 'Veuf/Veuve' },
  ];

  const churchRoleOptions = [
    { value: 'member', label: 'Membre' },
    { value: 'deacon', label: 'Diacre' },
    { value: 'elder', label: 'Ancien' },
    { value: 'pastor', label: 'Pasteur' },
    { value: 'evangelist', label: 'Évangéliste' },
    { value: 'other', label: 'Autre' },
  ];

  const frequencyOptions = [
    { value: 'weekly', label: 'Hebdomadaire' },
    { value: 'monthly', label: 'Mensuel' },
    { value: 'quarterly', label: 'Trimestriel' },
    { value: 'yearly', label: 'Annuel' },
  ];

  const paymentMethodOptions = [
    { value: 'card', label: 'Carte bancaire' },
    { value: 'mobile_money', label: 'Mobile Money' },
    { value: 'bank_transfer', label: 'Virement bancaire' },
    { value: 'cash', label: 'Espèces' },
  ];

  const donationCategoryOptions = [
    { value: 'tithe', label: 'Dîme' },
    { value: 'offering', label: 'Offrande' },
    { value: 'building', label: 'Construction' },
    { value: 'missions', label: 'Missions' },
    { value: 'charity', label: 'Charité' },
    { value: 'education', label: 'Éducation' },
    { value: 'youth', label: 'Jeunesse' },
    { value: 'women', label: 'Femmes' },
    { value: 'men', label: 'Hommes' },
  ];

  const contactMethodOptions = [
    { value: 'email', label: 'Email' },
    { value: 'sms', label: 'SMS' },
    { value: 'phone', label: 'Téléphone' },
    { value: 'whatsapp', label: 'WhatsApp' },
  ];

  const languageOptions = [
    { value: 'fr', label: 'Français' },
    { value: 'en', label: 'English' },
  ];

  const skillsOptions = [
    'Informatique',
    'Musique',
    'Enseignement',
    'Comptabilité',
    'Cuisine',
    'Décoration',
    'Photographie',
    'Vidéo',
    'Conduite',
    'Traduction',
    'Organisation',
    'Communication',
    'Santé',
    'Juridique',
    'Construction',
  ];

  const interestsOptions = [
    { value: 'teaching', label: 'Enseignement' },
    { value: 'music', label: 'Musique' },
    { value: 'technical', label: 'Technique' },
    { value: 'administration', label: 'Administration' },
    { value: 'counseling', label: 'Conseil' },
    { value: 'children', label: 'Enfants' },
    { value: 'youth', label: 'Jeunesse' },
    { value: 'elderly', label: 'Anciens' },
  ];

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

  const relationshipOptions = [
    'Époux/Épouse',
    'Père',
    'Mère',
    'Frère',
    'Sœur',
    'Fils',
    'Fille',
    'Ami(e)',
    'Collègue',
    'Voisin(e)',
    'Autre',
  ];

  // Calculer le pourcentage de completion
  const completionPercentage = profile?.completionPercentage || 0;

  function renderPersonalSection() {
    return (
      <div>
        <Title level={4}>
          <UserOutlined /> Informations personnelles
        </Title>
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
              <Input prefix={<MailOutlined />} placeholder="votre@email.com" disabled />
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
          <Col xs={24} md={8}>
            <Form.Item
              name="dateOfBirth"
              label="Date de naissance"
              rules={[{ required: true, message: 'Veuillez sélectionner votre date de naissance' }]}
            >
              <DatePicker
                style={{ width: '100%' }}
                placeholder="Sélectionnez votre date"
                format="DD/MM/YYYY"
                disabledDate={(current) => current && current > moment().endOf('day')}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              name="gender"
              label="Genre"
              rules={[{ required: true, message: 'Veuillez sélectionner votre genre' }]}
            >
              <Select placeholder="Sélectionnez votre genre">
                {genderOptions.map((option) => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="maritalStatus" label="Statut matrimonial">
              <Select placeholder="Sélectionnez votre statut">
                {maritalStatusOptions.map((option) => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </div>
    );
  }

  function renderAddressSection() {
    return (
      <div>
        <Title level={4}>
          <HomeOutlined /> Adresse
        </Title>
        <Row gutter={24}>
          <Col xs={24}>
            <Form.Item
              name="address.street"
              label="Adresse complète"
              rules={[{ required: true, message: 'Veuillez saisir votre adresse' }]}
            >
              <Input prefix={<EnvironmentOutlined />} placeholder="Rue, avenue, boulevard..." />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Form.Item name="address.neighborhood" label="Quartier">
              <Input placeholder="Nom du quartier" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="address.postalCode" label="Code postal">
              <Input placeholder="Code postal" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Form.Item name="address.state" label="Région/État">
              <Input placeholder="Région ou état" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="address.country"
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
        </Row>
      </div>
    );
  }

  function renderProfessionalSection() {
    return (
      <div>
        <Title level={4}>
          <ToolOutlined /> Informations professionnelles
        </Title>
        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Form.Item
              name="occupation"
              label="Profession"
              rules={[{ required: true, message: 'Veuillez saisir votre profession' }]}
            >
              <Input placeholder="Votre profession" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="employer" label="Employeur">
              <Input placeholder="Nom de votre employeur" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Form.Item
              name="monthlyIncome"
              label="Revenu mensuel (optionnel)"
              extra="Cette information est confidentielle et utilisée pour les statistiques anonymes"
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                placeholder="0"
                addonAfter="XOF"
              />
            </Form.Item>
          </Col>
        </Row>
      </div>
    );
  }

  function renderChurchSection() {
    return (
      <div>
        <Title level={4}>
          <HeartOutlined /> Informations ecclésiastiques
        </Title>

        <Form.Item
          name="churchMembership.isChurchMember"
          label="Êtes-vous membre d'une église ?"
          valuePropName="checked"
        >
          <Switch checkedChildren="Oui" unCheckedChildren="Non" />
        </Form.Item>

        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) =>
            prevValues['churchMembership.isChurchMember'] !== currentValues['churchMembership.isChurchMember']
          }
        >
          {({ getFieldValue }) =>
            getFieldValue('churchMembership.isChurchMember') ? (
              <>
                <Row gutter={24}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="churchMembership.churchName"
                      label="Nom de l'église"
                      rules={[{ required: true, message: 'Veuillez saisir le nom de votre église' }]}
                    >
                      <Input placeholder="Nom de votre église" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name="churchMembership.churchRole" label="Rôle dans l'église">
                      <Select placeholder="Sélectionnez votre rôle">
                        {churchRoleOptions.map((option) => (
                          <Option key={option.value} value={option.value}>
                            {option.label}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={24}>
                  <Col xs={24} md={8}>
                    <Form.Item name="churchMembership.membershipDate" label="Date d'adhésion">
                      <DatePicker style={{ width: '100%' }} placeholder="Date d'adhésion" format="DD/MM/YYYY" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item name="churchMembership.baptismDate" label="Date de baptême">
                      <DatePicker style={{ width: '100%' }} placeholder="Date de baptême" format="DD/MM/YYYY" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item name="churchMembership.ministry" label="Ministère">
                      <Input placeholder="Nom du ministère" />
                    </Form.Item>
                  </Col>
                </Row>
              </>
            ) : null
          }
        </Form.Item>
      </div>
    );
  }

  function renderEmergencySection() {
    return (
      <div>
        <Title level={4}>
          <SafetyCertificateOutlined /> Contact d&#39;urgence
        </Title>
        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Form.Item
              name="emergencyContact.name"
              label="Nom complet"
              rules={[{ required: true, message: "Veuillez saisir le nom du contact d'urgence" }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Nom complet du contact" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="emergencyContact.relationship"
              label="Relation"
              rules={[{ required: true, message: 'Veuillez préciser la relation' }]}
            >
              <Select placeholder="Sélectionnez la relation">
                {relationshipOptions.map((relation) => (
                  <Option key={relation} value={relation}>
                    {relation}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Form.Item
              name="emergencyContact.phone"
              label="Téléphone"
              rules={[
                { required: true, message: 'Veuillez saisir le numéro de téléphone' },
                { pattern: /^\+?[1-9]\d{8,14}$/, message: 'Format de téléphone invalide' },
              ]}
            >
              <Input prefix={<PhoneOutlined />} placeholder="+225 XX XX XX XX XX" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="emergencyContact.email"
              label="Email (optionnel)"
              rules={[{ type: 'email', message: "Format d'email invalide" }]}
            >
              <Input prefix={<MailOutlined />} placeholder="email@example.com" />
            </Form.Item>
          </Col>
        </Row>
      </div>
    );
  }

  function renderDonationsSection() {
    return (
      <div>
        <Title level={4}>
          <DollarOutlined /> Préférences de donation
        </Title>
        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Form.Item
              name="donationPreferences.preferredAmount"
              label="Montant préféré"
              extra="Montant que vous souhaitez donner habituellement"
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                placeholder="0"
                addonAfter="XOF"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="donationPreferences.preferredFrequency" label="Fréquence préférée">
              <Select placeholder="Sélectionnez la fréquence">
                {frequencyOptions.map((option) => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Form.Item
              name="donationPreferences.preferredDay"
              label="Jour préféré du mois"
              extra="Pour les donations récurrentes"
            >
              <InputNumber style={{ width: '100%' }} min={1} max={31} placeholder="Jour du mois (1-31)" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="donationPreferences.preferredPaymentMethod" label="Méthode de paiement préférée">
              <Select placeholder="Sélectionnez la méthode">
                {paymentMethodOptions.map((option) => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="donationPreferences.donationCategories"
          label="Catégories de donation préférées"
          extra="Sélectionnez les causes qui vous tiennent à cœur"
        >
          <Select mode="multiple" placeholder="Sélectionnez vos catégories préférées" style={{ width: '100%' }}>
            {donationCategoryOptions.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </div>
    );
  }

  function renderCommunicationSection() {
    return (
      <div>
        <Title level={4}>
          <BellOutlined /> Préférences de communication
        </Title>
        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Form.Item name="communicationPreferences.language" label="Langue préférée">
              <Select placeholder="Sélectionnez votre langue">
                {languageOptions.map((option) => (
                  <Option key={option.value} value={option.value}>
                    <GlobalOutlined style={{ marginRight: 8 }} />
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="communicationPreferences.preferredContactMethod" label="Méthode de contact préférée">
              <Select placeholder="Sélectionnez la méthode">
                {contactMethodOptions.map((option) => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Divider>Notifications</Divider>

        <Row gutter={24}>
          <Col xs={24} md={8}>
            <Form.Item name="communicationPreferences.receiveNewsletters" label="Newsletters" valuePropName="checked">
              <Switch checkedChildren="Oui" unCheckedChildren="Non" />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              name="communicationPreferences.receiveEventNotifications"
              label="Événements"
              valuePropName="checked"
            >
              <Switch checkedChildren="Oui" unCheckedChildren="Non" />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              name="communicationPreferences.receiveDonationReminders"
              label="Rappels de donation"
              valuePropName="checked"
            >
              <Switch checkedChildren="Oui" unCheckedChildren="Non" />
            </Form.Item>
          </Col>
        </Row>
      </div>
    );
  }

  function renderVolunteerSection() {
    return (
      <div>
        <Title level={4}>
          <TeamOutlined /> Bénévolat
        </Title>

        <Form.Item name="volunteer.isAvailable" label="Disponible pour le bénévolat" valuePropName="checked">
          <Switch checkedChildren="Oui" unCheckedChildren="Non" />
        </Form.Item>

        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) =>
            prevValues['volunteer.isAvailable'] !== currentValues['volunteer.isAvailable']
          }
        >
          {({ getFieldValue }) =>
            getFieldValue('volunteer.isAvailable') ? (
              <>
                <Form.Item
                  name="volunteer.skills"
                  label="Compétences"
                  extra="Sélectionnez vos compétences que vous pouvez partager"
                >
                  <Select mode="tags" placeholder="Ajoutez vos compétences" style={{ width: '100%' }}>
                    {skillsOptions.map((skill) => (
                      <Option key={skill} value={skill}>
                        {skill}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="volunteer.interests"
                  label="Domaines d'intérêt"
                  extra="Dans quels domaines souhaitez-vous vous investir ?"
                >
                  <Select mode="multiple" placeholder="Sélectionnez vos domaines d'intérêt" style={{ width: '100%' }}>
                    {interestsOptions.map((option) => (
                      <Option key={option.value} value={option.value}>
                        {option.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </>
            ) : null
          }
        </Form.Item>
      </div>
    );
  }

  function renderFamilySection() {
    return (
      <div>
        <Title level={4}>
          <ContactsOutlined /> Informations familiales
        </Title>

        <Form.Item name="familyInfo.numberOfChildren" label="Nombre d'enfants">
          <InputNumber style={{ width: '100%' }} min={0} max={20} placeholder="0" />
        </Form.Item>

        <Divider>Conjoint(e)</Divider>

        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Form.Item name="familyInfo.spouse.name" label="Nom du conjoint">
              <Input prefix={<UserOutlined />} placeholder="Nom complet du conjoint" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="familyInfo.spouse.dateOfBirth" label="Date de naissance du conjoint">
              <DatePicker
                style={{ width: '100%' }}
                placeholder="Date de naissance"
                format="DD/MM/YYYY"
                disabledDate={(current) => current && current > moment().endOf('day')}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="familyInfo.spouse.isChurchMember"
          label="Le conjoint est-il membre de l'église ?"
          valuePropName="checked"
        >
          <Switch checkedChildren="Oui" unCheckedChildren="Non" />
        </Form.Item>
      </div>
    );
  }

  const tabItems = [
    {
      key: 'personal',
      label: (
        <span>
          <UserOutlined />
          Personnel
        </span>
      ),
      children: renderPersonalSection(),
    },
    {
      key: 'address',
      label: (
        <span>
          <HomeOutlined />
          Adresse
        </span>
      ),
      children: renderAddressSection(),
    },
    {
      key: 'professional',
      label: (
        <span>
          <ToolOutlined />
          Professionnel
        </span>
      ),
      children: renderProfessionalSection(),
    },
    {
      key: 'church',
      label: (
        <span>
          <HeartOutlined />
          Église
        </span>
      ),
      children: renderChurchSection(),
    },
    {
      key: 'emergency',
      label: (
        <span>
          <SafetyCertificateOutlined />
          Urgence
        </span>
      ),
      children: renderEmergencySection(),
    },
    {
      key: 'donations',
      label: (
        <span>
          <DollarOutlined />
          Donations
        </span>
      ),
      children: renderDonationsSection(),
    },
    {
      key: 'communication',
      label: (
        <span>
          <BellOutlined />
          Communication
        </span>
      ),
      children: renderCommunicationSection(),
    },
    {
      key: 'volunteer',
      label: (
        <span>
          <TeamOutlined />
          Bénévolat
        </span>
      ),
      children: renderVolunteerSection(),
    },
    {
      key: 'family',
      label: (
        <span>
          <ContactsOutlined />
          Famille
        </span>
      ),
      children: renderFamilySection(),
    },
  ];

  return (
    <div>
      {/* Header avec avatar et completion */}
      <Card style={{ marginBottom: 24 }}>
        <Row align="middle" gutter={24}>
          <Col>
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
          </Col>
          <Col flex={1}>
            <Title level={3} style={{ margin: 0 }}>
              {profile?.user?.firstName || profile?.firstName || 'Prénom'}{' '}
              {profile?.user?.lastName || profile?.lastName || 'Nom'}
            </Title>
            <p style={{ fontSize: 16, color: '#666', margin: '4px 0' }}>
              {profile?.user?.email || profile?.email || 'email@example.com'}
            </p>
            <div style={{ marginTop: 16 }}>
              <span style={{ fontWeight: 'bold' }}>Completion du profil: </span>
              <Progress
                percent={completionPercentage}
                size="small"
                style={{ width: 200, display: 'inline-block', marginLeft: 8 }}
                status={completionPercentage < 50 ? 'exception' : completionPercentage < 80 ? 'active' : 'success'}
              />
              <span style={{ marginLeft: 8 }}>{completionPercentage}%</span>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Formulaire avec onglets */}
      <Card>
        <Form form={form} layout="vertical" onFinish={handleSubmit} size="large">
          <Tabs activeKey={activeSection} onChange={setActiveSection} type="card" items={tabItems} />

          <Divider />

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => form.resetFields()}>Annuler</Button>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={updating} size="large">
                {updating ? 'Mise à jour...' : 'Sauvegarder'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default ProfileComplete;
