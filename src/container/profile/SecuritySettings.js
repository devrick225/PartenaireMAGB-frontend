import React, { useState } from 'react';
import {
  Card,
  Switch,
  Button,
  message,
  Typography,
  Row,
  Col,
  List,
  Avatar,
  Tag,
  Modal,
  Form,
  Input,
  Alert,
  Divider,
} from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import {
  MobileOutlined,
  SafetyOutlined,
  LockOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  KeyOutlined,
} from '@ant-design/icons';
import moment from 'moment';
import { enableTwoFactor, disableTwoFactor } from '../../redux/profile/actionCreator';

const { Title, Text, Paragraph } = Typography;

function SecuritySettings({ profile }) {
  const [twoFactorModal, setTwoFactorModal] = useState(false);
  const [confirmDisableModal, setConfirmDisableModal] = useState(false);
  const [qrCodeData, setQrCodeData] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  console.log(qrCodeData);

  const { updatingSecurity, enablingTwoFactor, disablingTwoFactor, securityError, twoFactorError } = useSelector(
    (state) => ({
      updatingSecurity: state.profile.updatingSecurity,
      enablingTwoFactor: state.profile.enablingTwoFactor,
      disablingTwoFactor: state.profile.disablingTwoFactor,
      securityError: state.profile.securityError,
      twoFactorError: state.profile.twoFactorError,
    }),
  );

  console.log(updatingSecurity);
  console.log(securityError);
  console.log(twoFactorError);

  const handleTwoFactorToggle = async (enabled) => {
    if (enabled) {
      // Générer un QR code pour configurer 2FA
      setQrCodeData(`otpauth://totp/${profile?.email}?secret=JBSWY3DPEHPK3PXP&issuer=YourApp`);
      setTwoFactorModal(true);
    } else {
      setConfirmDisableModal(true);
    }
  };

  const handleEnable2FA = async () => {
    try {
      await dispatch(
        enableTwoFactor({
          code: verificationCode,
          email: profile?.email,
        }),
      );
      setTwoFactorModal(false);
      setVerificationCode('');
      message.success('Authentification à deux facteurs activée !');
    } catch (error) {
      message.error('Code de vérification incorrect');
    }
  };

  const handleDisable2FA = async (values) => {
    try {
      await dispatch(disableTwoFactor(values.password));
      setConfirmDisableModal(false);
      form.resetFields();
      message.success('Authentification à deux facteurs désactivée');
    } catch (error) {
      message.error('Mot de passe incorrect');
    }
  };

  // Données fictives pour les sessions actives
  const activeSessions = [
    {
      id: 1,
      device: 'Chrome sur Windows',
      location: "Abidjan, Côte d'Ivoire",
      ip: '192.168.1.1',
      lastActivity: '2024-01-15T10:30:00Z',
      current: true,
    },
    {
      id: 2,
      device: 'Safari sur iPhone',
      location: "Abidjan, Côte d'Ivoire",
      ip: '192.168.1.2',
      lastActivity: '2024-01-14T15:45:00Z',
      current: false,
    },
  ];

  // Données fictives pour l'historique de connexion
  const loginHistory = [
    {
      id: 1,
      device: 'Chrome sur Windows',
      location: "Abidjan, Côte d'Ivoire",
      ip: '192.168.1.1',
      timestamp: '2024-01-15T10:30:00Z',
      success: true,
    },
    {
      id: 2,
      device: 'Tentative inconnue',
      location: 'Lagos, Nigeria',
      ip: '41.58.123.45',
      timestamp: '2024-01-14T02:15:00Z',
      success: false,
    },
    {
      id: 3,
      device: 'Safari sur iPhone',
      location: "Abidjan, Côte d'Ivoire",
      ip: '192.168.1.2',
      timestamp: '2024-01-14T15:45:00Z',
      success: true,
    },
  ];

  function SecurityCard({ title, icon, children, alert = false }) {
    return (
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {icon}
            <span style={{ marginLeft: 8 }}>{title}</span>
            {alert && <WarningOutlined style={{ color: '#faad14', marginLeft: 8 }} />}
          </div>
        }
        style={{ marginBottom: 16 }}
      >
        {children}
      </Card>
    );
  }

  function SecurityItem({ title, description, action, status, critical = false }) {
    return (
      <Row
        justify="space-between"
        align="middle"
        style={{
          padding: '16px 0',
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        <Col span={16}>
          <div>
            <Text strong style={{ display: 'flex', alignItems: 'center' }}>
              {title}
              {critical && (
                <Tag color="red" style={{ marginLeft: 8 }}>
                  Critique
                </Tag>
              )}
            </Text>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 2 }}>
              {description}
            </Text>
          </div>
        </Col>
        <Col span={8} style={{ textAlign: 'right' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            {status && (
              <Text
                type={status.type}
                style={{
                  fontSize: 12,
                  marginBottom: 8,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {status.type === 'success' && <CheckCircleOutlined style={{ marginRight: 4 }} />}
                {status.type === 'warning' && <WarningOutlined style={{ marginRight: 4 }} />}
                {status.text}
              </Text>
            )}
            {action}
          </div>
        </Col>
      </Row>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={4}>
          <EyeTwoTone style={{ marginRight: 8 }} />
          Paramètres de sécurité
        </Title>
        <Text type="secondary">Protégez votre compte avec des mesures de sécurité avancées.</Text>
      </div>

      {/* Aperçu sécurité */}
      <Card style={{ marginBottom: 24, backgroundColor: profile?.twoFactorEnabled ? '#f6ffed' : '#fff7e6' }}>
        <Row align="middle">
          <Col span={20}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Avatar
                icon={<SafetyOutlined />}
                style={{
                  backgroundColor: profile?.twoFactorEnabled ? '#52c41a' : '#faad14',
                  marginRight: 16,
                }}
              />
              <div>
                <Title level={5} style={{ margin: 0 }}>
                  Score de sécurité : {profile?.twoFactorEnabled ? '95%' : '70%'}
                </Title>
                <Text type="secondary">
                  {profile?.twoFactorEnabled
                    ? 'Excellente sécurité ! Votre compte est bien protégé.'
                    : "Sécurité correcte. Activez l'authentification à deux facteurs pour améliorer la protection."}
                </Text>
              </div>
            </div>
          </Col>
          <Col span={4} style={{ textAlign: 'right' }}>
            <Tag color={profile?.twoFactorEnabled ? 'success' : 'warning'}>
              {profile?.twoFactorEnabled ? 'Sécurisé' : 'À améliorer'}
            </Tag>
          </Col>
        </Row>
      </Card>

      {/* Authentification à deux facteurs */}
      <SecurityCard
        title="Authentification à deux facteurs (2FA)"
        icon={<MobileOutlined style={{ color: '#1890ff' }} />}
      >
        <SecurityItem
          title="Authentification par application"
          description="Utilisez une application comme Google Authenticator ou Authy pour générer des codes de sécurité."
          status={{
            type: profile?.twoFactorEnabled ? 'success' : 'warning',
            text: profile?.twoFactorEnabled ? 'Activé' : 'Désactivé',
          }}
          critical
          action={
            <Switch
              checked={profile?.twoFactorEnabled || false}
              onChange={handleTwoFactorToggle}
              loading={enablingTwoFactor || disablingTwoFactor}
            />
          }
        />

        {profile?.twoFactorEnabled && (
          <Alert
            message="2FA Activé"
            description="Votre compte est protégé par l'authentification à deux facteurs. Un code sera demandé à chaque connexion."
            type="success"
            showIcon
            style={{ marginTop: 16 }}
          />
        )}
      </SecurityCard>

      {/* Sessions actives */}
      <SecurityCard title="Sessions actives" icon={<EnvironmentOutlined style={{ color: '#52c41a' }} />}>
        <List
          dataSource={activeSessions}
          renderItem={(session) => (
            <List.Item
              actions={[
                session.current ? (
                  <Tag color="green">Session actuelle</Tag>
                ) : (
                  <Button type="link" danger size="small">
                    Déconnecter
                  </Button>
                ),
              ]}
            >
              <List.Item.Meta
                avatar={
                  <Avatar
                    icon={<EnvironmentOutlined />}
                    style={{ backgroundColor: session.current ? '#52c41a' : '#1890ff' }}
                  />
                }
                title={session.device}
                description={
                  <div>
                    <Text type="secondary">
                      {session.location} • {session.ip}
                    </Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      Dernière activité : {moment(session.lastActivity).fromNow()}
                    </Text>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </SecurityCard>

      {/* Historique de connexion */}
      <SecurityCard title="Historique de connexion" icon={<ClockCircleOutlined style={{ color: '#722ed1' }} />}>
        <List
          dataSource={loginHistory.slice(0, 5)}
          renderItem={(login) => (
            <List.Item>
              <List.Item.Meta
                avatar={
                  <Avatar
                    icon={login.success ? <CheckCircleOutlined /> : <WarningOutlined />}
                    style={{
                      backgroundColor: login.success ? '#52c41a' : '#ff4d4f',
                    }}
                  />
                }
                title={
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {login.device}
                    <Tag color={login.success ? 'success' : 'error'} style={{ marginLeft: 8 }}>
                      {login.success ? 'Réussi' : 'Échoué'}
                    </Tag>
                  </div>
                }
                description={
                  <div>
                    <Text type="secondary">
                      {login.location} • {login.ip}
                    </Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      {moment(login.timestamp).format('DD/MM/YYYY HH:mm')}
                    </Text>
                  </div>
                }
              />
            </List.Item>
          )}
        />
        <Divider />
        <Button type="link" style={{ padding: 0 }}>
          Voir tout l&#39;historique
        </Button>
      </SecurityCard>

      {/* Paramètres avancés */}
      <SecurityCard title="Paramètres avancés" icon={<KeyOutlined style={{ color: '#ff4d4f' }} />}>
        <SecurityItem
          title="Notifications de connexion"
          description="Recevez un email à chaque nouvelle connexion sur votre compte."
          action={<Switch defaultChecked />}
        />

        <SecurityItem
          title="Connexions suspectes"
          description="Blocage automatique des tentatives de connexion depuis des lieux inhabituels."
          action={<Switch defaultChecked />}
        />

        <SecurityItem
          title="Expiration de session"
          description="Déconnexion automatique après 30 minutes d'inactivité."
          action={<Switch defaultChecked />}
        />
      </SecurityCard>

      {/* Modal pour activer 2FA */}
      <Modal
        title="Activer l'authentification à deux facteurs"
        open={twoFactorModal}
        onCancel={() => setTwoFactorModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setTwoFactorModal(false)}>
            Annuler
          </Button>,
          <Button key="confirm" type="primary" onClick={handleEnable2FA} loading={enablingTwoFactor}>
            Activer 2FA
          </Button>,
        ]}
        width={500}
      >
        <div style={{ textAlign: 'center' }}>
          <Paragraph>
            1. Téléchargez une application d&#39;authentification comme <strong>Google Authenticator</strong> ou{' '}
            <strong>Authy</strong>
          </Paragraph>

          <Paragraph>2. Scannez ce QR code avec votre application</Paragraph>

          <Paragraph>3. Entrez le code à 6 chiffres généré par l&#39;application :</Paragraph>

          <Input
            placeholder="123456"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            style={{ textAlign: 'center', fontSize: 18, letterSpacing: 4 }}
            maxLength={6}
          />
        </div>
      </Modal>

      {/* Modal pour désactiver 2FA */}
      <Modal
        title="Désactiver l'authentification à deux facteurs"
        open={confirmDisableModal}
        onCancel={() => setConfirmDisableModal(false)}
        footer={null}
        width={400}
      >
        <Alert
          message="Attention"
          description="Désactiver l'authentification à deux facteurs réduit la sécurité de votre compte."
          type="warning"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Form form={form} onFinish={handleDisable2FA} layout="vertical">
          <Form.Item
            name="password"
            label="Mot de passe"
            rules={[{ required: true, message: 'Veuillez saisir votre mot de passe' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Confirmez avec votre mot de passe"
              iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            />
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Button style={{ marginRight: 8 }} onClick={() => setConfirmDisableModal(false)}>
              Annuler
            </Button>
            <Button type="primary" danger htmlType="submit" loading={disablingTwoFactor}>
              Désactiver 2FA
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default SecuritySettings;
