import React, { useState } from 'react';
import {
  Card,
  Button,
  message,
  Typography,
  Row,
  Col,
  Modal,
  List,
  Alert,
  Divider,
  Tag,
  Timeline,
  Table,
  Statistic,
} from 'antd';
import { useDispatch } from 'react-redux';
import {
  FileTextOutlined,
  DownloadOutlined,
  EyeOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  GlobalOutlined,
  UserOutlined,
  DatabaseOutlined,
  LockOutlined,
} from '@ant-design/icons';
import moment from 'moment';
import { downloadPersonalData } from '../../redux/profile/actionCreator';

const { Title, Text, Paragraph } = Typography;

function DataPrivacy({ profile }) {
  const [dataModal, setDataModal] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const dispatch = useDispatch();

  console.log(profile);
  const handleDownloadData = async () => {
    try {
      setDownloading(true);
      await dispatch(downloadPersonalData());
      message.success('Téléchargement de vos données démarré !');
    } catch (error) {
      message.error('Erreur lors du téléchargement');
    } finally {
      setDownloading(false);
    }
  };

  // Données sur l'utilisation de vos informations
  const dataUsage = [
    {
      category: 'Informations personnelles',
      purpose: 'Gestion du compte et authentification',
      data: ['Nom', 'Email', 'Téléphone', 'Adresse'],
      retention: '5 ans après fermeture du compte',
      sharing: 'Jamais partagé',
    },
    {
      category: 'Données de donation',
      purpose: 'Traitement des paiements et reçus fiscaux',
      data: ['Montants', 'Dates', 'Méthodes de paiement'],
      retention: '10 ans (obligation légale)',
      sharing: 'Organismes fiscaux uniquement',
    },
    {
      category: 'Données de navigation',
      purpose: "Amélioration de l'expérience utilisateur",
      data: ['Pages visitées', 'Temps de session', 'Préférences'],
      retention: '2 ans',
      sharing: 'Analyses anonymisées',
    },
    {
      category: 'Communications',
      purpose: 'Support client et notifications',
      data: ['Messages', 'Tickets de support', 'Préférences'],
      retention: '3 ans',
      sharing: 'Jamais partagé',
    },
  ];

  // Historique des consentements
  const consentHistory = [
    {
      date: '2024-01-15',
      action: 'Consentement donné',
      type: 'Cookies analytiques',
      status: 'active',
    },
    {
      date: '2024-01-10',
      action: 'Consentement retiré',
      type: 'Marketing direct',
      status: 'withdrawn',
    },
    {
      date: '2023-12-01',
      action: 'Consentement donné',
      type: 'Notifications par email',
      status: 'active',
    },
  ];

  // Vos droits RGPD
  const gdprRights = [
    {
      title: "Droit d'accès",
      description: 'Obtenir une copie de toutes vos données personnelles',
      action: 'Télécharger mes données',
      available: true,
    },
    {
      title: 'Droit de rectification',
      description: 'Corriger ou mettre à jour vos informations personnelles',
      action: 'Modifier le profil',
      available: true,
    },
    {
      title: "Droit à l'effacement",
      description: 'Demander la suppression de vos données personnelles',
      action: 'Supprimer le compte',
      available: true,
    },
    {
      title: 'Droit à la portabilité',
      description: 'Transférer vos données vers un autre service',
      action: 'Exporter les données',
      available: true,
    },
    {
      title: "Droit d'opposition",
      description: "S'opposer au traitement de vos données à des fins marketing",
      action: 'Gérer les préférences',
      available: true,
    },
    {
      title: 'Droit à la limitation',
      description: 'Limiter le traitement de vos données dans certains cas',
      action: 'Contacter le support',
      available: false,
    },
  ];

  const columns = [
    {
      title: 'Catégorie',
      dataIndex: 'category',
      key: 'category',
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Finalité',
      dataIndex: 'purpose',
      key: 'purpose',
    },
    {
      title: 'Données collectées',
      dataIndex: 'data',
      key: 'data',
      render: (data) => (
        <div>
          {data.map((item) => (
            <Tag key={item} color="blue" style={{ marginBottom: 4 }}>
              {item}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      title: 'Durée de conservation',
      dataIndex: 'retention',
      key: 'retention',
    },
    {
      title: 'Partage',
      dataIndex: 'sharing',
      key: 'sharing',
      render: (text) => <Tag color={text === 'Jamais partagé' ? 'green' : 'orange'}>{text}</Tag>,
    },
  ];

  function PrivacyCard({ title, icon, children }) {
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

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={4}>
          <FileTextOutlined style={{ marginRight: 8 }} />
          Données et confidentialité
        </Title>
        <Text type="secondary">
          Gérez vos données personnelles et comprenez comment nous les utilisons selon le RGPD.
        </Text>
      </div>

      {/* Vue d'ensemble de la confidentialité */}
      <Card
        style={{
          marginBottom: 24,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        }}
      >
        <Row align="middle">
          <Col span={20}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <EyeOutlined style={{ fontSize: 32, marginRight: 16 }} />
              <div>
                <Title level={5} style={{ margin: 0, color: 'white' }}>
                  Vos données sont protégées
                </Title>
                <Text style={{ color: 'rgba(255,255,255,0.9)' }}>
                  Nous respectons le RGPD et votre vie privée. Vous avez le contrôle total sur vos données.
                </Text>
              </div>
            </div>
          </Col>
          <Col span={4} style={{ textAlign: 'right' }}>
            <Tag color="success" style={{ fontSize: 14, padding: '4px 12px' }}>
              Conforme RGPD
            </Tag>
          </Col>
        </Row>
      </Card>

      {/* Actions rapides */}
      <PrivacyCard title="Actions sur vos données" icon={<DatabaseOutlined style={{ color: '#1890ff' }} />}>
        <Row gutter={16}>
          <Col xs={24} sm={8}>
            <Card
              size="small"
              hoverable
              style={{ textAlign: 'center', cursor: 'pointer' }}
              onClick={handleDownloadData}
            >
              <DownloadOutlined style={{ fontSize: 24, color: '#1890ff', marginBottom: 8 }} />
              <Text strong style={{ display: 'block' }}>
                Télécharger mes données
              </Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Obtenir une copie de toutes vos informations
              </Text>
              <Button type="primary" size="small" style={{ marginTop: 8 }} loading={downloading}>
                Télécharger
              </Button>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card
              size="small"
              hoverable
              style={{ textAlign: 'center', cursor: 'pointer' }}
              onClick={() => setDataModal(true)}
            >
              <EyeOutlined style={{ fontSize: 24, color: '#52c41a', marginBottom: 8 }} />
              <Text strong style={{ display: 'block' }}>
                Voir l&#39;utilisation
              </Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Comment vos données sont utilisées
              </Text>
              <Button type="default" size="small" style={{ marginTop: 8 }}>
                Consulter
              </Button>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card size="small" hoverable style={{ textAlign: 'center', cursor: 'pointer' }}>
              <ExclamationCircleOutlined style={{ fontSize: 24, color: '#faad14', marginBottom: 8 }} />
              <Text strong style={{ display: 'block' }}>
                Signaler un problème
              </Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Questions sur la confidentialité
              </Text>
              <Button type="default" size="small" style={{ marginTop: 8 }}>
                Contacter
              </Button>
            </Card>
          </Col>
        </Row>
      </PrivacyCard>

      {/* Vos droits RGPD */}
      <PrivacyCard title="Vos droits selon le RGPD" icon={<LockOutlined style={{ color: '#722ed1' }} />}>
        <List
          dataSource={gdprRights}
          renderItem={(right) => (
            <List.Item
              actions={[
                <Button
                  key="action"
                  type={right.available ? 'primary' : 'default'}
                  disabled={!right.available}
                  size="small"
                >
                  {right.action}
                </Button>,
              ]}
            >
              <List.Item.Meta
                avatar={
                  <CheckCircleOutlined
                    style={{
                      color: right.available ? '#52c41a' : '#d9d9d9',
                      fontSize: 16,
                    }}
                  />
                }
                title={right.title}
                description={right.description}
              />
            </List.Item>
          )}
        />
      </PrivacyCard>

      {/* Historique des consentements */}
      <PrivacyCard title="Historique des consentements" icon={<ClockCircleOutlined style={{ color: '#faad14' }} />}>
        <Timeline
          items={consentHistory.map((item) => ({
            dot:
              item.status === 'active' ? (
                <CheckCircleOutlined style={{ color: '#52c41a' }} />
              ) : (
                <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
              ),
            children: (
              <div>
                <Text strong>{item.action}</Text>
                <br />
                <Text>{item.type}</Text>
                <br />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {moment(item.date).format('DD MMMM YYYY')}
                </Text>
              </div>
            ),
          }))}
        />
      </PrivacyCard>

      {/* Cookies et tracking */}
      <PrivacyCard title="Cookies et suivi" icon={<GlobalOutlined style={{ color: '#ff4d4f' }} />}>
        <Alert
          message="Paramètres des cookies"
          description="Vous pouvez gérer vos préférences de cookies à tout moment."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          action={
            <Button size="small" type="primary">
              Gérer les cookies
            </Button>
          }
        />

        <Row gutter={16}>
          <Col xs={24} sm={8}>
            <Card size="small">
              <Statistic
                title="Cookies essentiels"
                value="Activés"
                valueStyle={{ color: '#52c41a' }}
                prefix={<CheckCircleOutlined />}
              />
              <Text type="secondary" style={{ fontSize: 11 }}>
                Nécessaires au fonctionnement
              </Text>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card size="small">
              <Statistic
                title="Cookies analytiques"
                value="Activés"
                valueStyle={{ color: '#52c41a' }}
                prefix={<CheckCircleOutlined />}
              />
              <Text type="secondary" style={{ fontSize: 11 }}>
                Amélioration de l&#39;expérience
              </Text>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card size="small">
              <Statistic
                title="Cookies marketing"
                value="Désactivés"
                valueStyle={{ color: '#ff4d4f' }}
                prefix={<CloseCircleOutlined />}
              />
              <Text type="secondary" style={{ fontSize: 11 }}>
                Publicité personnalisée
              </Text>
            </Card>
          </Col>
        </Row>
      </PrivacyCard>

      {/* Contact DPO */}
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <UserOutlined style={{ color: '#1890ff', marginRight: 8 }} />
            <span>Contact du Délégué à la Protection des Données</span>
          </div>
        }
        style={{ backgroundColor: '#f9f9f9' }}
      >
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Paragraph>
              <Text strong>Délégué à la Protection des Données (DPO)</Text>
              <br />
              Email : <a href="mailto:dpo@yourapp.com">dpo@yourapp.com</a>
              <br />
              Téléphone : +225 XX XX XX XX XX
            </Paragraph>
          </Col>
          <Col xs={24} sm={12}>
            <Paragraph>
              <Text strong>Autorité de contrôle</Text>
              <br />
              CNIL (Commission Nationale de l&#39;Informatique et des Libertés)
              <br />
              <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">
                www.cnil.fr
              </a>
            </Paragraph>
          </Col>
        </Row>
      </Card>

      {/* Modal détaillé sur l'utilisation des données */}
      <Modal
        title="Utilisation de vos données"
        open={dataModal}
        onCancel={() => setDataModal(false)}
        footer={[
          <Button key="close" onClick={() => setDataModal(false)}>
            Fermer
          </Button>,
        ]}
        width={900}
      >
        <Alert
          message="Transparence totale"
          description="Voici exactement comment nous utilisons vos données personnelles."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Table dataSource={dataUsage} columns={columns} pagination={false} size="small" />

        <Divider />

        <Paragraph>
          <Text strong>Bases légales du traitement :</Text>
          <ul>
            <li>
              <strong>Exécution du contrat</strong> : Gestion de votre compte et traitement des donations
            </li>
            <li>
              <strong>Intérêt légitime</strong> : Amélioration de nos services et sécurité
            </li>
            <li>
              <strong>Consentement</strong> : Communications marketing et cookies non-essentiels
            </li>
            <li>
              <strong>Obligation légale</strong> : Conservation des données de donation pour les reçus fiscaux
            </li>
          </ul>
        </Paragraph>
      </Modal>
    </div>
  );
}

export default DataPrivacy;
