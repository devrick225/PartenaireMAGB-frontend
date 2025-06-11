import React from 'react';
import { Modal, Tag, Typography, Divider, Row, Col, Card } from 'antd';
import {
  UserOutlined,
  DollarCircleOutlined,
  CrownOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  MailOutlined,
} from '@ant-design/icons';
import { ROLES, ROLE_PERMISSIONS } from './protectedRoute';

const { Title, Text, Paragraph } = Typography;

function RolePermissionsHelp({ visible, onClose }) {
  const roleConfig = {
    [ROLES.USER]: {
      title: 'Utilisateur',
      color: '#52c41a',
      icon: <UserOutlined />,
      description: 'Rôle de base pour tous les membres de la communauté',
      features: [
        'Consulter et modifier son profil personnel',
        'Faire des donations',
        'Créer des tickets de support',
        'Voir ses propres statistiques',
      ],
    },
    [ROLES.SUPPORT_AGENT]: {
      title: 'Agent Support',
      color: '#fa8c16',
      icon: <MailOutlined />,
      description: 'Responsable du support et assistance utilisateurs',
      features: [
        'Toutes les fonctionnalités utilisateur',
        'Voir la liste des utilisateurs',
        'Gérer les tickets de support',
        'Modérer le contenu',
        'Consulter les donations (lecture seule)',
      ],
    },
    [ROLES.MODERATOR]: {
      title: 'Modérateur',
      color: '#722ed1',
      icon: <MailOutlined />,
      description: 'Responsable de la modération et du support',
      features: [
        'Toutes les fonctionnalités utilisateur',
        'Voir la liste des utilisateurs',
        'Gérer les tickets de support',
        'Modérer le contenu',
        'Consulter les donations (lecture seule)',
      ],
    },
    [ROLES.TREASURER]: {
      title: 'Trésorier',
      color: '#13c2c2',
      icon: <DollarCircleOutlined />,
      description: 'Responsable de la gestion financière',
      features: [
        'Toutes les fonctionnalités utilisateur',
        'Voir toutes les donations',
        'Gérer les paiements',
        'Générer des rapports financiers',
        'Gérer les remboursements',
      ],
    },
    [ROLES.ADMIN]: {
      title: 'Administrateur',
      color: '#ff4d4f',
      icon: <CrownOutlined />,
      description: 'Accès complet à toutes les fonctionnalités',
      features: [
        'Toutes les permissions',
        'Gérer les utilisateurs et leurs rôles',
        'Accès à tous les modules',
        'Configuration du système',
        'Supervision complète',
      ],
    },
  };

  const permissionDescriptions = {
    read_own_profile: 'Consulter son profil',
    update_own_profile: 'Modifier son profil',
    create_donation: 'Faire des donations',
    create_ticket: 'Créer des tickets de support',
    read_users: 'Voir la liste des utilisateurs',
    update_tickets: 'Gérer les tickets de support',
    read_donations: 'Consulter les donations',
    moderate_content: 'Modérer le contenu',
    read_all_donations: 'Voir toutes les donations',
    read_payments: 'Consulter les paiements',
    generate_reports: 'Générer des rapports',
    manage_refunds: 'Gérer les remboursements',
    '*': 'Toutes les permissions',
  };

  const getAccessMatrix = () => {
    const features = [
      {
        key: 'profile',
        label: 'Profil personnel',
        roles: [ROLES.USER, ROLES.SUPPORT_AGENT, ROLES.MODERATOR, ROLES.TREASURER, ROLES.ADMIN],
      },
      {
        key: 'donations_personal',
        label: 'Mes donations',
        roles: [ROLES.USER, ROLES.SUPPORT_AGENT, ROLES.MODERATOR, ROLES.TREASURER, ROLES.ADMIN],
      },
      {
        key: 'support_create',
        label: 'Créer des tickets',
        roles: [ROLES.USER, ROLES.SUPPORT_AGENT, ROLES.MODERATOR, ROLES.TREASURER, ROLES.ADMIN],
      },
      {
        key: 'users_list',
        label: 'Liste des utilisateurs',
        roles: [ROLES.SUPPORT_AGENT, ROLES.MODERATOR, ROLES.ADMIN],
      },
      { key: 'support_manage', label: 'Gérer le support', roles: [ROLES.SUPPORT_AGENT, ROLES.MODERATOR, ROLES.ADMIN] },
      { key: 'donations_all', label: 'Toutes les donations', roles: [ROLES.TREASURER, ROLES.ADMIN] },
      { key: 'reports', label: 'Rapports financiers', roles: [ROLES.TREASURER, ROLES.ADMIN] },
      { key: 'user_management', label: 'Gestion des utilisateurs', roles: [ROLES.ADMIN] },
      { key: 'system_config', label: 'Configuration système', roles: [ROLES.ADMIN] },
    ];

    return features;
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <MailOutlined style={{ color: '#1890ff' }} />
          <span>Rôles et Permissions</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      width={900}
      footer={null}
      style={{ top: 20 }}
    >
      <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        <Paragraph>
          Cette application utilise un système de rôles pour contrôler l&#39;accès aux différentes fonctionnalités.
          Voici un aperçu complet des rôles disponibles et de leurs permissions.
        </Paragraph>

        <Divider>Rôles Disponibles</Divider>

        <Row gutter={[16, 16]}>
          {Object.entries(roleConfig).map(([role, config]) => (
            <Col xs={24} md={12} key={role}>
              <Card
                size="small"
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: config.color }}>{config.icon}</span>
                    <span>{config.title}</span>
                    <Tag color={config.color}>{role}</Tag>
                  </div>
                }
              >
                <Paragraph style={{ fontSize: 13, marginBottom: 12 }}>{config.description}</Paragraph>
                <div>
                  <Text strong style={{ fontSize: 12 }}>
                    Fonctionnalités :
                  </Text>
                  <ul style={{ fontSize: 12, marginTop: 4, paddingLeft: 16 }}>
                    {config.features.map((feature, index) => (
                      <li key={index} style={{ marginBottom: 2 }}>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        <Divider>Matrice d&#39;Accès</Divider>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ backgroundColor: '#fafafa' }}>
                <th style={{ padding: 8, border: '1px solid #f0f0f0', textAlign: 'left' }}>Fonctionnalité</th>
                {Object.values(ROLES).map((role) => (
                  <th
                    key={role}
                    style={{
                      padding: 8,
                      border: '1px solid #f0f0f0',
                      textAlign: 'center',
                      backgroundColor: `${roleConfig[role].color}20`,
                    }}
                  >
                    {roleConfig[role].title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {getAccessMatrix().map((feature) => (
                <tr key={feature.key}>
                  <td style={{ padding: 8, border: '1px solid #f0f0f0', fontWeight: 500 }}>{feature.label}</td>
                  {Object.values(ROLES).map((role) => (
                    <td
                      key={role}
                      style={{
                        padding: 8,
                        border: '1px solid #f0f0f0',
                        textAlign: 'center',
                      }}
                    >
                      {feature.roles.includes(role) ? (
                        <CheckCircleOutlined style={{ color: '#52c41a' }} />
                      ) : (
                        <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Divider>Permissions Techniques</Divider>

        <Row gutter={[16, 16]}>
          {Object.entries(ROLE_PERMISSIONS).map(([role, permissions]) => (
            <Col xs={24} md={12} key={role}>
              <Card
                size="small"
                title={
                  <Tag color={roleConfig[role].color} icon={roleConfig[role].icon}>
                    {roleConfig[role].title}
                  </Tag>
                }
              >
                <div style={{ maxHeight: 120, overflowY: 'auto' }}>
                  {permissions.map((permission, index) => (
                    <div key={index} style={{ marginBottom: 4, fontSize: 12 }}>
                      <Tag size="small" color="blue">
                        {permission}
                      </Tag>
                      <Text style={{ fontSize: 11, color: '#666', marginLeft: 4 }}>
                        {permissionDescriptions[permission] || permission}
                      </Text>
                    </div>
                  ))}
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        <Divider />

        <div style={{ backgroundColor: '#f6ffed', padding: 16, borderRadius: 6 }}>
          <Title level={5} style={{ color: '#52c41a', marginBottom: 8 }}>
            <CheckCircleOutlined /> Note Importante
          </Title>
          <Paragraph style={{ marginBottom: 0, fontSize: 13 }}>
            • Les rôles sont hiérarchiques : un administrateur a toutes les permissions.
            <br />
            • Les permissions sont vérifiées côté serveur pour garantir la sécurité.
            <br />• Contactez un administrateur pour changer votre rôle si nécessaire.
          </Paragraph>
        </div>
      </div>
    </Modal>
  );
}

export default RolePermissionsHelp;
