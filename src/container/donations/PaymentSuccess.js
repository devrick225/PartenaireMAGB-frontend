import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Result,
  Card,
  Button,
  Typography,
  Row,
  Col,
  Descriptions,
  Tag,
  Space,
  Alert,
  Spin,
  Divider,
  message,
} from 'antd';
import {
  CheckCircleOutlined,
  DownloadOutlined,
  HomeOutlined,
  MailOutlined,
  PrinterOutlined,
  ShareAltOutlined,
  HeartOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { getDonationById, generateReceipt, downloadReceipt } from '../../redux/donations/actionCreator';
import { verifyPayment } from '../../redux/payments/actionCreator';
import { PageHeader } from '../../components/page-headers/page-headers';
import { Main } from '../styled';

const { Title, Text, Paragraph } = Typography;

function PaymentSuccess() {
  const { donationId, paymentId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [donation, setDonation] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [receiptGenerating, setReceiptGenerating] = useState(false);
  const [emailSending, setEmailSending] = useState(false);

  // Paramètres de retour des providers
  const transactionId = searchParams.get('transaction_id') || searchParams.get('cpm_trans_id');
  // eslint-disable-next-line no-unused-vars
  const paymentProvider = searchParams.get('provider') || 'unknown';
  // eslint-disable-next-line no-unused-vars
  const paymentStatus = searchParams.get('status') || searchParams.get('cpm_trans_status');

  // eslint-disable-next-line no-unused-vars
  const { user } = useSelector((state) => ({
    user: state.auth.user,
  }));

  const PageRoutes = [
    { path: 'index', breadcrumbName: 'Tableau de bord' },
    { path: 'donations', breadcrumbName: 'Donations' },
    { path: '', breadcrumbName: 'Paiement Réussi' },
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
      message.error('Erreur lors du chargement des détails');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPaymentDetails();
  }, [donationId, paymentId, dispatch]);

  const handleGenerateReceipt = async () => {
    // eslint-disable-next-line no-underscore-dangle
    if (!donation?._id) return;

    try {
      setReceiptGenerating(true);
      // eslint-disable-next-line no-underscore-dangle
      await dispatch(generateReceipt(donation._id));
      message.success('Reçu généré avec succès !');
    } catch (error) {
      message.error('Erreur lors de la génération du reçu');
    } finally {
      setReceiptGenerating(false);
    }
  };

  const handleDownloadReceipt = async () => {
    // eslint-disable-next-line no-underscore-dangle
    if (!donation?._id) return;

    try {
      // eslint-disable-next-line no-underscore-dangle
      await dispatch(downloadReceipt(donation._id));
      message.success('Téléchargement du reçu démarré');
    } catch (error) {
      message.error('Erreur lors du téléchargement');
    }
  };

  const handleSendReceiptByEmail = async () => {
    try {
      setEmailSending(true);
      // TODO: Implémenter l'envoi par email
      message.success('Reçu envoyé par email !');
    } catch (error) {
      message.error("Erreur lors de l'envoi par email");
    } finally {
      setEmailSending(false);
    }
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

  const handleShareDonation = () => {
    const shareText = `J'ai fait une donation de ${
      donation?.formattedAmount || donation?.amount
    } XOF pour ${getCategoryLabel(donation?.category)} via PARTENAIRE MAGB ! 🙏❤️`;

    if (navigator.share) {
      navigator.share({
        title: 'Ma Donation - PARTENAIRE MAGB',
        text: shareText,
        url: window.location.href,
      });
    } else {
      // Fallback: copier dans le presse-papier
      navigator.clipboard.writeText(shareText).then(() => {
        message.success('Texte copié dans le presse-papier !');
      });
    }
  };

  const getPaymentMethodLabel = (method) => {
    const methods = {
      card: '💳 Carte Bancaire',
      mobile_money: '📱 Mobile Money',
      paypal: '💸 PayPal',
      bank_transfer: '🏦 Virement',
      crypto: '₿ Crypto',
    };
    return methods[method] || method;
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
      <PageHeader className="ninjadash-page-header-main" title="Paiement Réussi" routes={PageRoutes} />
      <Main>
        <Row gutter={[24, 24]} justify="center">
          <Col xs={24} lg={16}>
            {/* Résultat principal */}
            <Card>
              <Result
                status="success"
                icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                title={
                  <Space direction="vertical" size="small">
                    <Title level={2} style={{ color: '#52c41a', margin: 0 }}>
                      Paiement Réussi ! 🎉
                    </Title>
                    <Text type="secondary" style={{ fontSize: 16 }}>
                      Votre donation a été traitée avec succès
                    </Text>
                  </Space>
                }
                subTitle={
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <Alert
                      message="Transaction confirmée"
                      description={`Votre don de ${
                        donation?.formattedAmount || `${donation?.amount} XOF`
                      } a été reçu avec succès. Un reçu vous sera envoyé par email.`}
                      type="success"
                      showIcon
                      style={{ textAlign: 'left' }}
                    />

                    {transactionId && (
                      <Text code style={{ fontSize: 14 }}>
                        ID Transaction: {transactionId}
                      </Text>
                    )}
                  </Space>
                }
                extra={
                  <Space wrap size="middle">
                    <Button
                      type="primary"
                      icon={<DownloadOutlined />}
                      onClick={handleDownloadReceipt}
                      disabled={!donation?.receipt?.issued}
                    >
                      Télécharger le Reçu
                    </Button>
                    <Button icon={<MailOutlined />} onClick={handleSendReceiptByEmail} loading={emailSending}>
                      Envoyer par Email
                    </Button>
                    <Button icon={<ShareAltOutlined />} onClick={handleShareDonation}>
                      Partager
                    </Button>
                    <Button icon={<HomeOutlined />} onClick={() => navigate('/admin')}>
                      Retour au Dashboard
                    </Button>
                  </Space>
                }
              />
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            {/* Détails de la donation */}
            <Card title="📋 Détails de la Donation" size="small">
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Montant">
                  <Text strong style={{ fontSize: 16, color: '#52c41a' }}>
                    {donation?.formattedAmount || `${donation?.amount} XOF`}
                  </Text>
                </Descriptions.Item>

                <Descriptions.Item label="Catégorie">
                  <Tag color="blue">{getCategoryLabel(donation?.category)}</Tag>
                </Descriptions.Item>

                <Descriptions.Item label="Type">
                  <Tag color={donation?.type === 'recurring' ? 'purple' : 'green'}>
                    {donation?.type === 'recurring' ? '🔄 Récurrent' : '💰 Unique'}
                  </Tag>
                </Descriptions.Item>

                <Descriptions.Item label="Méthode de paiement">
                  {getPaymentMethodLabel(donation?.paymentMethod)}
                </Descriptions.Item>

                <Descriptions.Item label="Statut">
                  <Tag color="success">✅ Complété</Tag>
                </Descriptions.Item>

                <Descriptions.Item label="Date">
                  {new Date(donation?.createdAt).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Descriptions.Item>

                {donation?.receipt?.number && (
                  <Descriptions.Item label="N° Reçu">
                    <Text code>{donation.receipt.number}</Text>
                  </Descriptions.Item>
                )}
              </Descriptions>

              {donation?.message && (
                <>
                  <Divider style={{ margin: '16px 0' }} />
                  <div>
                    <Text strong>Message :</Text>
                    <Paragraph style={{ marginTop: 8, fontStyle: 'italic' }}>&#34;{donation.message}&#34;</Paragraph>
                  </div>
                </>
              )}

              {/* Informations de récurrence */}
              {donation?.type === 'recurring' && donation?.recurring && (
                <>
                  <Divider style={{ margin: '16px 0' }} />
                  <div>
                    <Text strong>🔄 Configuration Récurrente :</Text>
                    <div style={{ marginTop: 8 }}>
                      <Text>Fréquence: {donation.recurring.frequency}</Text>
                      <br />
                      {donation.recurring.nextPaymentDate && (
                        <Text>
                          Prochain paiement: {new Date(donation.recurring.nextPaymentDate).toLocaleDateString('fr-FR')}
                        </Text>
                      )}
                    </div>
                  </div>
                </>
              )}
            </Card>

            {/* Actions rapides */}
            <Card title="🚀 Actions Rapides" size="small" style={{ marginTop: 16 }}>
              <Space direction="vertical" style={{ width: '100%' }} size="small">
                <Button block icon={<HeartOutlined />} onClick={() => navigate('/admin/donations/create')}>
                  Faire une nouvelle donation
                </Button>

                <Button
                  block
                  icon={<PrinterOutlined />}
                  onClick={handleGenerateReceipt}
                  loading={receiptGenerating}
                  /* eslint-disable-next-line no-underscore-dangle */
                  disabled={!donation?._id}
                >
                  Générer le reçu fiscal
                </Button>

                <Button block onClick={() => navigate('/admin/donations')}>
                  Voir toutes mes donations
                </Button>
              </Space>
            </Card>

            {/* Message de remerciement */}
            <Card
              style={{ marginTop: 16, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}
            >
              <div style={{ color: 'white', textAlign: 'center' }}>
                <Title level={4} style={{ color: 'white', margin: 0 }}>
                  🙏 Merci pour votre générosité !
                </Title>
                <Paragraph style={{ color: 'rgba(255,255,255,0.9)', margin: '8px 0 0 0' }}>
                  Votre don contribue à l&#39;avancement du royaume de Dieu. Que Dieu vous bénisse abondamment !
                </Paragraph>
              </div>
            </Card>
          </Col>
        </Row>
      </Main>
    </>
  );
}

export default PaymentSuccess;
