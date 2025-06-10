import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Result,
  Card,
  Button,
  Typography,
  Row,
  Col,
  Alert,
  Space,
  Descriptions,
  Tag,
  Timeline,
  Divider,
  Spin,
} from 'antd';
import {
  CloseCircleOutlined,
  ReloadOutlined,
  HomeOutlined,
  CustomerServiceOutlined,
  PhoneOutlined,
  MailOutlined,
  WhatsAppOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { getDonationById } from '../../redux/donations/actionCreator';
import { verifyPayment } from '../../redux/payments/actionCreator';
import { PageHeader } from '../../components/page-headers/page-headers';
import { Main } from '../styled';

const { Title, Text, Paragraph } = Typography;

function PaymentFailure() {
  const { donationId, paymentId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [donation, setDonation] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  // Paramètres d'erreur des providers
  const errorCode = searchParams.get('error_code') || searchParams.get('cpm_result');
  const errorMessage = searchParams.get('error_message') || searchParams.get('cpm_error_message');
  const transactionId = searchParams.get('transaction_id') || searchParams.get('cpm_trans_id');
  // eslint-disable-next-line no-unused-vars
  const paymentProvider = searchParams.get('provider') || 'unknown';

  // eslint-disable-next-line no-unused-vars
  const { user } = useSelector((state) => ({
    user: state.auth.user,
  }));

  const PageRoutes = [
    { path: 'index', breadcrumbName: 'Tableau de bord' },
    { path: 'donations', breadcrumbName: 'Donations' },
    { path: '', breadcrumbName: 'Paiement Échoué' },
  ];

  const loadPaymentDetails = async () => {
    try {
      setLoading(true);

      // Charger les détails de la donation
      if (donationId) {
        const donationData = await dispatch(getDonationById(donationId));
        setDonation(donationData.donation || donationData);
      }

      // Vérifier le statut du paiement si on a un ID de paiement
      if (paymentId) {
        const paymentData = await dispatch(verifyPayment(paymentId));
        setPayment(paymentData.payment || paymentData);
      }
    } catch (error) {
      console.error('Erreur chargement détails paiement:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPaymentDetails();
  }, [donationId, paymentId, dispatch]);

  const handleRetryPayment = () => {
    // eslint-disable-next-line no-underscore-dangle
    if (donation?._id) {
      // eslint-disable-next-line no-underscore-dangle
      navigate(`/admin/donations/${donation._id}/payment`);
    } else {
      navigate('/admin/donations/create');
    }
  };

  const handleContactSupport = () => {
    navigate('/admin/support/create', {
      state: {
        category: 'payment',
        // eslint-disable-next-line no-underscore-dangle
        title: `Problème de paiement - ${transactionId || donation?._id}`,
        description: `Échec de paiement lors de la donation.\n\nDétails:\n- Montant: ${donation?.amount} ${
          donation?.currency
        }\n- Erreur: ${errorMessage || 'Non spécifiée'}\n- Code: ${errorCode || 'N/A'}\n- Transaction ID: ${
          transactionId || 'N/A'
        }`,
      },
    });
  };

  const getErrorDescription = () => {
    const commonErrors = {
      INSUFFICIENT_FUNDS: 'Fonds insuffisants sur votre compte',
      INVALID_CARD: 'Carte bancaire invalide ou expirée',
      DECLINED: 'Transaction refusée par votre banque',
      NETWORK_ERROR: 'Erreur de connexion réseau',
      TIMEOUT: 'La transaction a expiré',
      CANCELLED: "Paiement annulé par l'utilisateur",
      INVALID_PHONE: 'Numéro de téléphone invalide',
      PROVIDER_ERROR: 'Erreur du prestataire de paiement',
    };

    return commonErrors[errorCode] || errorMessage || "Une erreur inattendue s'est produite";
  };

  const getSuggestedSolutions = () => {
    const solutions = {
      INSUFFICIENT_FUNDS: [
        'Vérifiez le solde de votre compte',
        'Utilisez une autre méthode de paiement',
        'Contactez votre banque pour vérifier les limites',
      ],
      INVALID_CARD: [
        'Vérifiez les informations de votre carte',
        "Assurez-vous que votre carte n'est pas expirée",
        'Essayez une autre carte bancaire',
      ],
      DECLINED: [
        'Contactez votre banque pour débloquer les paiements en ligne',
        'Vérifiez les limites de votre carte',
        'Essayez une autre méthode de paiement',
      ],
      NETWORK_ERROR: [
        'Vérifiez votre connexion internet',
        'Réessayez dans quelques minutes',
        'Utilisez un autre réseau si possible',
      ],
      TIMEOUT: [
        'Réessayez avec une connexion plus stable',
        'Assurez-vous de compléter rapidement le paiement',
        'Contactez le support si le problème persiste',
      ],
      CANCELLED: [
        'Relancez le processus de paiement',
        'Assurez-vous de valider toutes les étapes',
        'Contactez le support en cas de difficultés',
      ],
      INVALID_PHONE: [
        'Vérifiez le format de votre numéro (+225 XX XX XX XX XX)',
        'Assurez-vous que le numéro correspond à votre portefeuille mobile',
        'Contactez votre opérateur mobile',
      ],
    };

    return (
      solutions[errorCode] || [
        'Réessayez le paiement dans quelques minutes',
        'Utilisez une méthode de paiement différente',
        'Contactez notre support client pour assistance',
      ]
    );
  };

  const getCategoryLabel = (category) => {
    const categories = {
      tithe: '🙏 Dîme',
      offering: '💝 Offrande',
      building: '🏗️ Construction',
      missions: '🌍 Missions',
      charity: '❤️ Charité',
      education: '📚 Éducation',
      youth: '👨‍👩‍👧‍👦 Jeunesse',
      women: '👩 Femmes',
      men: '👨 Hommes',
      special: '⭐ Événement Spécial',
      emergency: '🚨 Urgence',
    };
    return categories[category] || category;
  };

  if (loading) {
    return (
      <>
        <PageHeader className="ninjadash-page-header-main" title="Vérification du paiement" routes={PageRoutes} />
        <Main>
          <div style={{ textAlign: 'center', marginTop: 100 }}>
            <Spin size="large" tip="Vérification de votre paiement..." />
          </div>
        </Main>
      </>
    );
  }

  return (
    <>
      <PageHeader className="ninjadash-page-header-main" title="Paiement Échoué" routes={PageRoutes} />
      <Main>
        <Row gutter={[24, 24]} justify="center">
          <Col xs={24} lg={16}>
            {/* Résultat principal */}
            <Card>
              <Result
                status="error"
                icon={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
                title={
                  <Space direction="vertical" size="small">
                    <Title level={2} style={{ color: '#ff4d4f', margin: 0 }}>
                      Paiement Échoué 😔
                    </Title>
                    <Text type="secondary" style={{ fontSize: 16 }}>
                      Une erreur est survenue lors du traitement de votre paiement
                    </Text>
                  </Space>
                }
                subTitle={
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <Alert
                      message="Transaction échouée"
                      description={getErrorDescription()}
                      type="error"
                      showIcon
                      style={{ textAlign: 'left' }}
                    />

                    {transactionId && (
                      <Text code style={{ fontSize: 14 }}>
                        ID Transaction: {transactionId}
                      </Text>
                    )}

                    {errorCode && (
                      <Text code style={{ fontSize: 14 }}>
                        Code d&#39;erreur: {errorCode}
                      </Text>
                    )}
                  </Space>
                }
                extra={
                  <Space wrap size="middle">
                    <Button type="primary" icon={<ReloadOutlined />} onClick={handleRetryPayment}>
                      Réessayer le Paiement
                    </Button>
                    <Button icon={<CustomerServiceOutlined />} onClick={handleContactSupport}>
                      Contacter le Support
                    </Button>
                    <Button icon={<HomeOutlined />} onClick={() => navigate('/admin')}>
                      Retour au Dashboard
                    </Button>
                  </Space>
                }
              />
            </Card>

            {/* Solutions suggérées */}
            <Card title="💡 Solutions Suggérées" style={{ marginTop: 24 }}>
              <Timeline>
                {getSuggestedSolutions().map((solution, index) => (
                  <Timeline.Item key={index} color={index === 0 ? 'blue' : 'gray'}>
                    {solution}
                  </Timeline.Item>
                ))}
              </Timeline>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            {/* Détails de la donation tentée */}
            {donation && (
              <Card title="📋 Détails de la Donation" size="small">
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Montant">
                    <Text strong style={{ fontSize: 16 }}>
                      {donation.formattedAmount || `${donation.amount} XOF`}
                    </Text>
                  </Descriptions.Item>

                  <Descriptions.Item label="Catégorie">
                    <Tag color="blue">{getCategoryLabel(donation.category)}</Tag>
                  </Descriptions.Item>

                  <Descriptions.Item label="Type">
                    <Tag color={donation.type === 'recurring' ? 'purple' : 'green'}>
                      {donation.type === 'recurring' ? '🔄 Récurrent' : '💰 Unique'}
                    </Tag>
                  </Descriptions.Item>

                  <Descriptions.Item label="Statut">
                    <Tag color="error">❌ Échoué</Tag>
                  </Descriptions.Item>

                  <Descriptions.Item label="Date de tentative">
                    {new Date().toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Descriptions.Item>
                </Descriptions>

                {donation.message && (
                  <>
                    <Divider style={{ margin: '16px 0' }} />
                    <div>
                      <Text strong>Message :</Text>
                      <Paragraph style={{ marginTop: 8, fontStyle: 'italic' }}>&#34;{donation.message}&#34;</Paragraph>
                    </div>
                  </>
                )}
              </Card>
            )}

            {/* Actions rapides */}
            <Card title="🚀 Actions Rapides" size="small" style={{ marginTop: 16 }}>
              <Space direction="vertical" style={{ width: '100%' }} size="small">
                <Button block type="primary" icon={<ReloadOutlined />} onClick={handleRetryPayment}>
                  Réessayer avec la même donation
                </Button>

                <Button block onClick={() => navigate('/admin/donations/create')}>
                  Créer une nouvelle donation
                </Button>

                <Button block onClick={() => navigate('/admin/donations')}>
                  Voir mes donations
                </Button>
              </Space>
            </Card>

            {/* Support contact */}
            <Card title="📞 Besoin d'Aide ?" size="small" style={{ marginTop: 16 }}>
              <Space direction="vertical" style={{ width: '100%' }} size="small">
                <Alert
                  message="Notre équipe est là pour vous aider"
                  description="N'hésitez pas à nous contacter si vous rencontrez des difficultés"
                  type="info"
                  showIcon
                />

                <Button block icon={<CustomerServiceOutlined />} onClick={handleContactSupport}>
                  Créer un ticket de support
                </Button>

                <Divider style={{ margin: '12px 0' }}>Ou contactez-nous directement</Divider>

                <Space direction="vertical" style={{ width: '100%' }} size="small">
                  <Button block icon={<PhoneOutlined />} href="tel:+22500000000">
                    +225 00 00 00 00 00
                  </Button>

                  <Button block icon={<MailOutlined />} href="mailto:support@partenaire-magb.org">
                    support@partenaire-magb.org
                  </Button>

                  <Button
                    block
                    icon={<WhatsAppOutlined />}
                    href="https://wa.me/22500000000"
                    target="_blank"
                    style={{ backgroundColor: '#25D366', color: 'white' }}
                  >
                    WhatsApp Support
                  </Button>
                </Space>
              </Space>
            </Card>

            {/* Message d'encouragement */}
            <Card
              style={{ marginTop: 16, background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', border: 'none' }}
            >
              <div style={{ color: '#333', textAlign: 'center' }}>
                <Title level={4} style={{ color: '#333', margin: 0 }}>
                  🙏 Ne vous découragez pas !
                </Title>
                <Paragraph style={{ color: '#666', margin: '8px 0 0 0' }}>
                  Les problèmes techniques arrivent parfois. Votre intention de donner compte énormément. Réessayons
                  ensemble !
                </Paragraph>
              </div>
            </Card>
          </Col>
        </Row>
      </Main>
    </>
  );
}

export default PaymentFailure;
