import React, { useEffect } from 'react';
import { Form, Switch, Button, message, Card, Row, Col, Typography, Divider, Alert } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import {
  BellOutlined,
  MailOutlined,
  PhoneOutlined,
  SaveOutlined,
  HeartOutlined,
  ClockCircleOutlined,
  BookOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import { updateNotifications } from '../../redux/profile/actionCreator';

const { Title, Text, Paragraph } = Typography;

function NotificationSettings({ profile }) {
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const { updatingNotifications, notificationsError } = useSelector((state) => ({
    updatingNotifications: state.profile.updatingNotifications,
    notificationsError: state.profile.notificationsError,
  }));

  useEffect(() => {
    if (profile) {
      form.setFieldsValue({
        // Email notifications
        emailDonations: profile.emailNotifications?.donations || false,
        emailReminders: profile.emailNotifications?.reminders || false,
        emailNewsletters: profile.emailNotifications?.newsletters || false,
        emailUpdates: profile.emailNotifications?.updates || false,
        emailSecurity: profile.emailNotifications?.security || true,
        emailSupport: profile.emailNotifications?.support || true,

        // SMS notifications
        smsDonations: profile.smsNotifications?.donations || false,
        smsReminders: profile.smsNotifications?.reminders || false,
        smsSecurity: profile.smsNotifications?.security || false,
        smsUrgent: profile.smsNotifications?.urgent || false,
      });
    }
  }, [profile, form]);

  const handleSubmit = async (values) => {
    try {
      const notificationSettings = {
        emailNotifications: {
          donations: values.emailDonations,
          reminders: values.emailReminders,
          newsletters: values.emailNewsletters,
          updates: values.emailUpdates,
          security: values.emailSecurity,
          support: values.emailSupport,
        },
        smsNotifications: {
          donations: values.smsDonations,
          reminders: values.smsReminders,
          security: values.smsSecurity,
          urgent: values.smsUrgent,
        },
      };

      await dispatch(updateNotifications(notificationSettings));
      message.success('Préférences de notifications mises à jour !');
    } catch (error) {
      message.error('Erreur lors de la mise à jour des préférences');
    }
  };

  function NotificationCard({ title, icon, children, description }) {
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
        {description && (
          <Paragraph type="secondary" style={{ marginBottom: 16 }}>
            {description}
          </Paragraph>
        )}
        {children}
      </Card>
    );
  }

  function NotificationItem({ name, label, description, recommended = false }) {
    return (
      <Row
        justify="space-between"
        align="middle"
        style={{
          padding: '12px 0',
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        <Col span={18}>
          <div>
            <Text strong style={{ display: 'flex', alignItems: 'center' }}>
              {label}
              {recommended && (
                <span
                  style={{
                    marginLeft: 8,
                    fontSize: 11,
                    color: '#52c41a',
                    backgroundColor: '#f6ffed',
                    padding: '2px 6px',
                    borderRadius: 4,
                    border: '1px solid #52c41a',
                  }}
                >
                  Recommandé
                </span>
              )}
            </Text>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 2 }}>
              {description}
            </Text>
          </div>
        </Col>
        <Col span={6} style={{ textAlign: 'right' }}>
          <Form.Item name={name} valuePropName="checked" style={{ margin: 0 }}>
            <Switch />
          </Form.Item>
        </Col>
      </Row>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={4}>
          <BellOutlined style={{ marginRight: 8 }} />
          Préférences de notifications
        </Title>
        <Text type="secondary">Choisissez comment et quand vous souhaitez recevoir des notifications.</Text>
      </div>

      {notificationsError && (
        <Alert
          message="Erreur"
          description="Une erreur s'est produite lors de la mise à jour"
          type="error"
          closable
          style={{ marginBottom: 24 }}
        />
      )}

      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        {/* Notifications par email */}
        <NotificationCard
          title="Notifications par email"
          icon={<MailOutlined style={{ color: '#1890ff' }} />}
          description="Recevez des mises à jour importantes directement dans votre boîte mail."
        >
          <NotificationItem
            name="emailDonations"
            label="Confirmations de donations"
            description="Recevez une confirmation à chaque donation effectuée"
            recommended
          />

          <NotificationItem
            name="emailReminders"
            label="Rappels de donations"
            description="Rappels périodiques pour vos campagnes favorites"
          />

          <NotificationItem
            name="emailNewsletters"
            label="Newsletter"
            description="Actualités et histoires inspirantes de notre communauté"
          />

          <NotificationItem
            name="emailUpdates"
            label="Mises à jour des campagnes"
            description="Nouvelles des campagnes que vous soutenez"
          />

          <NotificationItem
            name="emailSecurity"
            label="Alertes de sécurité"
            description="Notifications importantes sur la sécurité de votre compte"
            recommended
          />

          <NotificationItem
            name="emailSupport"
            label="Support client"
            description="Réponses à vos demandes de support et mises à jour"
            recommended
          />
        </NotificationCard>

        {/* Notifications SMS */}
        <NotificationCard
          title="Notifications SMS"
          icon={<PhoneOutlined style={{ color: '#52c41a' }} />}
          description="Recevez des notifications urgentes et importantes par SMS."
        >
          <NotificationItem
            name="smsDonations"
            label="Confirmations de donations"
            description="SMS de confirmation pour vos donations importantes"
          />

          <NotificationItem
            name="smsReminders"
            label="Rappels urgents"
            description="Rappels SMS pour les campagnes se terminant bientôt"
          />

          <NotificationItem
            name="smsSecurity"
            label="Alertes de sécurité"
            description="SMS pour les activités suspectes sur votre compte"
            recommended
          />

          <NotificationItem
            name="smsUrgent"
            label="Notifications urgentes"
            description="SMS pour les situations d'urgence uniquement"
            recommended
          />
        </NotificationCard>

        {/* Résumé des préférences */}
        <Card title="Résumé de vos préférences" style={{ backgroundColor: '#f9f9f9', marginBottom: 24 }}>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <div style={{ marginBottom: 12 }}>
                <DollarOutlined style={{ color: '#1890ff', marginRight: 8 }} />
                <Text strong>Donations : </Text>
                <Text>Email + SMS activés</Text>
              </div>
              <div style={{ marginBottom: 12 }}>
                <ClockCircleOutlined style={{ color: '#faad14', marginRight: 8 }} />
                <Text strong>Rappels : </Text>
                <Text>Email uniquement</Text>
              </div>
            </Col>
            <Col xs={24} sm={12}>
              <div style={{ marginBottom: 12 }}>
                <HeartOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
                <Text strong>Urgences : </Text>
                <Text>SMS activé</Text>
              </div>
              <div style={{ marginBottom: 12 }}>
                <BookOutlined style={{ color: '#722ed1', marginRight: 8 }} />
                <Text strong>Newsletter : </Text>
                <Text>Désactivée</Text>
              </div>
            </Col>
          </Row>
        </Card>

        <Divider />

        <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
          <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={updatingNotifications} size="large">
            {updatingNotifications ? 'Mise à jour...' : 'Sauvegarder les préférences'}
          </Button>
        </Form.Item>
      </Form>

      {/* Informations complémentaires */}
      <Card title="À propos des notifications" size="small" style={{ marginTop: 24 }}>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>Vous pouvez modifier ces préférences à tout moment</li>
          <li>Les notifications de sécurité sont fortement recommandées</li>
          <li>Les SMS peuvent entraîner des frais selon votre opérateur</li>
          <li>Nous respectons votre vie privée et ne spammons jamais</li>
          <li>Vous pouvez vous désabonner en un clic depuis tout email</li>
        </ul>
      </Card>
    </div>
  );
}

export default NotificationSettings;
