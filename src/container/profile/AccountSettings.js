import React, { useState } from 'react';
import {
  Card,
  Switch,
  Button,
  message,
  Typography,
  Row,
  Col,
  Modal,
  Form,
  Input,
  Alert,
  Divider,
  Progress,
  Statistic,
} from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import {
  SettingOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  UserOutlined,
  HeartOutlined,
  TrophyOutlined,
  ExclamationCircleOutlined,
  DeleteOutlined,
  LockOutlined,
  EyeTwoTone,
  CheckCircleOutlined,
} from '@ant-design/icons';
import moment from 'moment';
import { updateSecuritySettings, deleteAccount } from '../../redux/profile/actionCreator';

const { Title, Text } = Typography;
const { confirm } = Modal;

function AccountSettings({ profile }) {
  const [deleteAccountModal, setDeleteAccountModal] = useState(false);
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const { updatingSecurity } = useSelector((state) => ({
    updatingSecurity: state.profile.updatingSecurity,
  }));

  const handleAccountVisibility = async (visible) => {
    try {
      await dispatch(updateSecuritySettings({ profileVisibility: visible ? 'public' : 'private' }));
      message.success(`Profil ${visible ? 'public' : 'privé'} avec succès`);
    } catch (error) {
      message.error('Erreur lors de la mise à jour');
    }
  };

  const handleAccountStatus = async (active) => {
    if (!active) {
      confirm({
        title: 'Désactiver le compte',
        content: 'Êtes-vous sûr de vouloir désactiver votre compte ? Vous ne pourrez plus vous connecter.',
        okText: 'Désactiver',
        okType: 'danger',
        cancelText: 'Annuler',
        onOk() {
          // Logique de désactivation
          message.success('Compte désactivé');
        },
      });
    } else {
      // Réactiver le compte
      message.success('Compte réactivé');
    }
  };

  const handleDeleteAccount = async (values) => {
    try {
      await dispatch(deleteAccount(values.password));
      setDeleteAccountModal(false);
      message.success('Demande de suppression envoyée. Votre compte sera supprimé dans 30 jours.');
    } catch (error) {
      message.error('Mot de passe incorrect');
    }
  };

  const showDeleteConfirm = () => {
    confirm({
      title: 'Supprimer définitivement le compte',
      content: (
        <div>
          <Alert
            message="Action irréversible"
            description="Cette action supprimera définitivement votre compte et toutes vos données. Cette action ne peut pas être annulée."
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <p>Conséquences de la suppression :</p>
          <ul>
            <li>Toutes vos données personnelles seront supprimées</li>
            <li>Votre historique de donations sera anonymisé</li>
            <li>Vous ne pourrez plus accéder à ce compte</li>
            <li>Les campagnes que vous avez créées seront transférées</li>
          </ul>
        </div>
      ),
      okText: 'Je comprends, supprimer',
      okType: 'danger',
      cancelText: 'Annuler',
      width: 500,
      onOk() {
        setDeleteAccountModal(true);
      },
    });
  };

  // Calcul du niveau utilisateur
  const getLevel = (points) => {
    if (points < 100) return 1;
    if (points < 500) return 2;
    if (points < 1000) return 3;
    if (points < 2500) return 4;
    return 5;
  };

  const getNextLevelPoints = (currentLevel) => {
    const thresholds = [100, 500, 1000, 2500, 5000];
    return thresholds[currentLevel - 1] || 5000;
  };

  const currentLevel = getLevel(profile?.points || 0);
  const nextLevelPoints = getNextLevelPoints(currentLevel);
  const progressPercent = ((profile?.points || 0) / nextLevelPoints) * 100;

  const badges = [
    { name: 'Premier don', description: 'Votre première donation', earned: true, icon: '🎉' },
    { name: 'Généreux', description: '10 donations effectuées', earned: profile?.donationCount >= 10, icon: '💝' },
    { name: 'Ambassadeur', description: 'Partagé 5 campagnes', earned: false, icon: '📢' },
    {
      name: 'Fidèle',
      description: '1 an de membre',
      earned: moment().diff(moment(profile?.createdAt), 'months') >= 12,
      icon: '⭐',
    },
  ];

  function SettingCard({ title, icon, children }) {
    return (
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {icon}
            <span style={{ marginLeft: 8 }}>{title}</span>
          </div>
        }
        style={{ marginBottom: 16 }}
      >
        {children}
      </Card>
    );
  }

  function SettingItem({ title, description, action, status }) {
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
            <Text strong>{title}</Text>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 2 }}>
              {description}
            </Text>
          </div>
        </Col>
        <Col span={8} style={{ textAlign: 'right' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            {status && (
              <Text type={status.type} style={{ fontSize: 12, marginBottom: 8 }}>
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
          <SettingOutlined style={{ marginRight: 8 }} />
          Paramètres du compte
        </Title>
        <Text type="secondary">Gérez les paramètres généraux de votre compte et vos préférences.</Text>
      </div>

      {/* Niveau et progression */}
      <SettingCard title="Niveau et récompenses" icon={<TrophyOutlined style={{ color: '#faad14' }} />}>
        <Row gutter={24} align="middle">
          <Col xs={24} sm={8}>
            <Statistic
              title="Niveau actuel"
              value={currentLevel}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Col>
          <Col xs={24} sm={8}>
            <Statistic
              title="Points"
              value={profile?.points || 0}
              suffix={`/ ${nextLevelPoints}`}
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>
          <Col xs={24} sm={8}>
            <div>
              <Text strong>Progression vers niveau {currentLevel + 1}</Text>
              <Progress percent={Math.min(progressPercent, 100)} strokeColor="#1890ff" style={{ marginTop: 8 }} />
            </div>
          </Col>
        </Row>

        <Divider />

        <div>
          <Title level={5} style={{ marginBottom: 16 }}>
            Vos badges
          </Title>
          <Row gutter={16}>
            {badges.map((badge, index) => (
              <Col xs={12} sm={6} key={index}>
                <Card
                  size="small"
                  style={{
                    textAlign: 'center',
                    backgroundColor: badge.earned ? '#f6ffed' : '#f5f5f5',
                    border: badge.earned ? '1px solid #52c41a' : '1px solid #d9d9d9',
                  }}
                >
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{badge.earned ? badge.icon : '🔒'}</div>
                  <Text strong style={{ fontSize: 12 }}>
                    {badge.name}
                  </Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 10 }}>
                    {badge.description}
                  </Text>
                  {badge.earned && (
                    <div style={{ marginTop: 4 }}>
                      <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    </div>
                  )}
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </SettingCard>

      {/* Visibilité du profil */}
      <SettingCard title="Visibilité et confidentialité" icon={<EyeOutlined style={{ color: '#722ed1' }} />}>
        <SettingItem
          title="Profil public"
          description="Permettre aux autres utilisateurs de voir votre profil et vos contributions."
          status={{
            type: profile?.profileVisibility === 'public' ? 'success' : 'secondary',
            text: profile?.profileVisibility === 'public' ? 'Public' : 'Privé',
          }}
          action={
            <Switch
              checked={profile?.profileVisibility === 'public'}
              onChange={handleAccountVisibility}
              loading={updatingSecurity}
            />
          }
        />

        <SettingItem
          title="Afficher les donations"
          description="Montrer vos donations sur votre profil public (montants cachés)."
          action={<Switch defaultChecked />}
        />

        <SettingItem
          title="Recevoir des messages"
          description="Permettre aux autres utilisateurs de vous envoyer des messages privés."
          action={<Switch defaultChecked />}
        />
      </SettingCard>

      {/* Préférences de contenu */}
      <SettingCard title="Préférences de contenu" icon={<HeartOutlined style={{ color: '#ff4d4f' }} />}>
        <SettingItem
          title="Suggestions personnalisées"
          description="Recevoir des recommandations de campagnes basées sur vos intérêts."
          action={<Switch defaultChecked />}
        />

        <SettingItem
          title="Contenu sensible"
          description="Afficher les campagnes traitant de sujets sensibles ou traumatisants."
          action={<Switch />}
        />

        <SettingItem
          title="Campagnes urgentes"
          description="Prioriser l'affichage des campagnes en situation d'urgence."
          action={<Switch defaultChecked />}
        />
      </SettingCard>

      {/* Gestion du compte */}
      <SettingCard title="Gestion du compte" icon={<UserOutlined style={{ color: '#1890ff' }} />}>
        <SettingItem
          title="Statut du compte"
          description="Désactiver temporairement votre compte. Vous pourrez le réactiver à tout moment."
          status={{
            type: profile?.isActive ? 'success' : 'warning',
            text: profile?.isActive ? 'Actif' : 'Désactivé',
          }}
          action={<Switch checked={profile?.isActive} onChange={handleAccountStatus} />}
        />

        <SettingItem
          title="Mode développeur"
          description="Accéder aux fonctionnalités avancées et aux API de test."
          action={<Switch />}
        />
      </SettingCard>

      {/* Zone de danger */}
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <ExclamationCircleOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
            <span style={{ color: '#ff4d4f' }}>Zone de danger</span>
          </div>
        }
        style={{ marginBottom: 16, borderColor: '#ff4d4f' }}
      >
        <Alert
          message="Actions irréversibles"
          description="Les actions ci-dessous sont définitives et ne peuvent pas être annulées."
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <SettingItem
          title="Supprimer le compte"
          description="Supprimer définitivement votre compte et toutes vos données. Cette action est irréversible."
          action={
            <Button danger onClick={showDeleteConfirm} icon={<DeleteOutlined />}>
              Supprimer le compte
            </Button>
          }
        />
      </Card>

      {/* Informations sur les données */}
      <Card title="Informations sur vos données" style={{ backgroundColor: '#f9f9f9' }}>
        <Row gutter={16}>
          <Col xs={24} sm={8}>
            <Statistic title="Données stockées" value="2.4" suffix="MB" valueStyle={{ color: '#1890ff' }} />
          </Col>
          <Col xs={24} sm={8}>
            <Statistic
              title="Dernière sauvegarde"
              value={moment().subtract(2, 'days').format('DD/MM/YYYY')}
              valueStyle={{ color: '#52c41a' }}
            />
          </Col>
          <Col xs={24} sm={8}>
            <Statistic
              title="Compte créé"
              value={moment(profile?.createdAt).fromNow()}
              valueStyle={{ color: '#722ed1' }}
            />
          </Col>
        </Row>
      </Card>

      {/* Modal de suppression de compte */}
      <Modal
        title="Confirmer la suppression du compte"
        open={deleteAccountModal}
        onCancel={() => setDeleteAccountModal(false)}
        footer={null}
        width={400}
      >
        <Alert
          message="Dernière étape"
          description="Pour confirmer la suppression, veuillez saisir votre mot de passe."
          type="error"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Form form={form} onFinish={handleDeleteAccount} layout="vertical">
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
            <Button style={{ marginRight: 8 }} onClick={() => setDeleteAccountModal(false)}>
              Annuler
            </Button>
            <Button type="primary" danger htmlType="submit" icon={<DeleteOutlined />}>
              Supprimer définitivement
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default AccountSettings;
