import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Result, Card, Button, Typography, Row, Col, Alert, Space, Descriptions, Tag, Divider, Spin } from 'antd';
import { StopOutlined, ReloadOutlined, HomeOutlined, HeartOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { getDonationById } from '../../redux/donations/actionCreator';
import { PageHeader } from '../../components/page-headers/page-headers';
import { Main } from '../styled';

const { Title, Text, Paragraph } = Typography;

function PaymentCancel() {
  const { donationId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);

  // Paramètres de l'annulation
  const cancelReason = searchParams.get('reason') || 'user_cancelled';
  const transactionId = searchParams.get('transaction_id') || searchParams.get('cpm_trans_id');
  // eslint-disable-next-line no-unused-vars
  const paymentProvider = searchParams.get('provider') || 'unknown';

  // eslint-disable-next-line no-unused-vars
  const { user } = useSelector((state) => ({
    user: state.auth.user,
  }));

  const loadDonationDetails = async () => {
    try {
      setLoading(true);

      if (donationId) {
        const donationData = await dispatch(getDonationById(donationId));
        setDonation(donationData.donation || donationData);
      }
    } catch (error) {
      console.error('Erreur chargement détails donation:', error);
    } finally {
      setLoading(false);
    }
  };

  const PageRoutes = [
    { path: 'index', breadcrumbName: 'Tableau de bord' },
    { path: 'donations', breadcrumbName: 'Donations' },
    { path: '', breadcrumbName: 'Paiement Annulé' },
  ];

  useEffect(() => {
    loadDonationDetails();
  }, [donationId, dispatch]);

  const handleRetryPayment = () => {
    // eslint-disable-next-line no-underscore-dangle
    if (donation?._id) {
      // eslint-disable-next-line no-underscore-dangle
      navigate(`/admin/donations/${donation._id}/payment`);
    } else {
      navigate('/admin/donations/create');
    }
  };

  const handleCreateNewDonation = () => {
    navigate('/admin/donations/create', {
      state: {
        prefillData: donation
          ? {
              amount: donation.amount,
              currency: donation.currency,
              category: donation.category,
              type: donation.type,
              message: donation.message,
            }
          : null,
      },
    });
  };

  const getCancelReasonText = () => {
    const reasons = {
      user_cancelled: 'Vous avez annulé le paiement',
      timeout: 'Le temps de paiement a expiré',
      window_closed: 'La fenêtre de paiement a été fermée',
      back_button: 'Retour depuis la page de paiement',
      provider_error: 'Erreur du prestataire de paiement',
    };

    return reasons[cancelReason] || 'Le paiement a été annulé';
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
        <PageHeader className="ninjadash-page-header-main" title="Chargement..." routes={PageRoutes} />
        <Main>
          <div style={{ textAlign: 'center', marginTop: 100 }}>
            <Spin size="large" tip="Chargement des détails..." />
          </div>
        </Main>
      </>
    );
  }

  return (
    <>
      <PageHeader className="ninjadash-page-header-main" title="Paiement Annulé" routes={PageRoutes} />
      <Main>
        <Row gutter={[24, 24]} justify="center">
          <Col xs={24} lg={16}>
            {/* Résultat principal */}
            <Card>
              <Result
                status="warning"
                icon={<StopOutlined style={{ color: '#faad14' }} />}
                title={
                  <Space direction="vertical" size="small">
                    <Title level={2} style={{ color: '#faad14', margin: 0 }}>
                      Paiement Annulé ⏸️
                    </Title>
                    <Text type="secondary" style={{ fontSize: 16 }}>
                      Votre processus de paiement a été interrompu
                    </Text>
                  </Space>
                }
                subTitle={
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <Alert
                      message="Transaction annulée"
                      description={getCancelReasonText()}
                      type="warning"
                      showIcon
                      style={{ textAlign: 'left' }}
                    />

                    {transactionId && (
                      <Text code style={{ fontSize: 14 }}>
                        ID Transaction: {transactionId}
                      </Text>
                    )}

                    <Alert
                      message="Aucun montant n'a été prélevé"
                      description="Votre paiement n'a pas été traité. Aucun débit n'a eu lieu sur votre compte."
                      type="info"
                      showIcon
                      style={{ textAlign: 'left' }}
                    />
                  </Space>
                }
                extra={
                  <Space wrap size="middle">
                    <Button type="primary" icon={<ReloadOutlined />} onClick={handleRetryPayment}>
                      Reprendre le Paiement
                    </Button>
                    <Button icon={<HeartOutlined />} onClick={handleCreateNewDonation}>
                      Nouvelle Donation
                    </Button>
                    <Button icon={<HomeOutlined />} onClick={() => navigate('/admin')}>
                      Retour au Dashboard
                    </Button>
                  </Space>
                }
              />
            </Card>

            {/* Informations utiles */}
            <Card title="ℹ️ Que s'est-il passé ?" style={{ marginTop: 24 }}>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div>
                  <Text strong>Pourquoi mon paiement a-t-il été annulé ?</Text>
                  <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                    <li>Vous avez fermé la fenêtre de paiement</li>
                    <li>Vous avez utilisé le bouton &#34;Retour&#34; ou &#34;Annuler&#34;</li>
                    <li>La session de paiement a expiré (généralement après 15 minutes)</li>
                    <li>Une erreur technique temporaire est survenue</li>
                  </ul>
                </div>

                <div>
                  <Text strong>Que faire maintenant ?</Text>
                  <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                    <li>Vous pouvez reprendre exactement où vous vous êtes arrêté</li>
                    <li>Vos informations de donation sont toujours sauvegardées</li>
                    <li>Aucun frais ne vous a été facturé</li>
                    <li>Vous pouvez modifier votre donation si nécessaire</li>
                  </ul>
                </div>
              </Space>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            {/* Détails de la donation en attente */}
            {donation && (
              <Card title="📋 Votre Donation en Attente" size="small">
                <Alert
                  message="Donation sauvegardée"
                  description="Vos informations sont conservées et vous pouvez reprendre à tout moment"
                  type="success"
                  showIcon
                  style={{ marginBottom: 16 }}
                />

                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Montant">
                    <Text strong style={{ fontSize: 16, color: '#1890ff' }}>
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
                    <Tag color="processing">⏳ En attente de paiement</Tag>
                  </Descriptions.Item>

                  <Descriptions.Item label="Créée le">
                    {new Date(donation.createdAt).toLocaleDateString('fr-FR', {
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

            {/* Actions recommandées */}
            <Card title="🎯 Actions Recommandées" size="small" style={{ marginTop: 16 }}>
              <Space direction="vertical" style={{ width: '100%' }} size="small">
                <Button block type="primary" icon={<ReloadOutlined />} onClick={handleRetryPayment} size="large">
                  Reprendre le paiement maintenant
                </Button>

                <Divider style={{ margin: '12px 0' }}>Ou</Divider>

                <Button block icon={<HeartOutlined />} onClick={handleCreateNewDonation}>
                  Créer une nouvelle donation
                </Button>

                <Button block onClick={() => navigate('/admin/donations')}>
                  Voir toutes mes donations
                </Button>

                <Button block onClick={() => navigate('/admin/support/create')}>
                  Contacter le support
                </Button>
              </Space>
            </Card>

            {/* Conseils pour éviter les annulations */}
            <Card title="💡 Conseils pour votre prochain paiement" size="small" style={{ marginTop: 16 }}>
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <Alert message="Astuces pour un paiement réussi" type="info" showIcon />

                <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14 }}>
                  <li>Gardez la fenêtre de paiement ouverte jusqu&#39;à confirmation</li>
                  <li>Préparez vos informations de paiement à l&#39;avance</li>
                  <li>Assurez-vous d&#39;avoir une connexion internet stable</li>
                  <li>Vérifiez le solde de votre compte avant de commencer</li>
                  <li>Ne fermez pas l&#39;onglet pendant le traitement</li>
                </ul>
              </Space>
            </Card>

            {/* Message d'encouragement */}
            <Card
              style={{ marginTop: 16, background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', border: 'none' }}
            >
              <div style={{ color: '#333', textAlign: 'center' }}>
                <Title level={4} style={{ color: '#333', margin: 0 }}>
                  🤗 Pas de souci !
                </Title>
                <Paragraph style={{ color: '#666', margin: '8px 0 0 0' }}>
                  Il arrive parfois d&#39;interrompre un paiement. Votre générosité compte et nous sommes là pour vous
                  accompagner à chaque étape.
                </Paragraph>
              </div>
            </Card>
          </Col>
        </Row>
      </Main>
    </>
  );
}

export default PaymentCancel;
