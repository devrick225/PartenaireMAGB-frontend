import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Typography, Tag, Button, Space, Descriptions, Timeline, Alert, message, Modal } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import {
  ArrowLeftOutlined,
  UserOutlined,
  CalendarOutlined,
  FileTextOutlined,
  DownloadOutlined,
  HistoryOutlined,
  CreditCardOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import moment from 'moment';
import PaymentProcessor from './PaymentProcessor';
import {
  getDonationById,
  generateReceipt,
  downloadReceipt,
  stopRecurringDonation,
} from '../../redux/donations/actionCreator';

const { Title, Text, Paragraph } = Typography;
const { confirm } = Modal;

function DonationDetails({ donationId, onBack }) {
  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);

  const dispatch = useDispatch();

  const { generatingReceipt, downloadingReceipt, stoppingRecurring } = useSelector((state) => ({
    generatingReceipt: state.donations.generatingReceipt,
    downloadingReceipt: state.donations.downloadingReceipt,
    stoppingRecurring: state.donations.stoppingRecurring,
  }));

  const loadDonationDetails = async () => {
    try {
      setLoading(true);
      console.log('=== DEBUT CHARGEMENT DONATION ===');
      console.log('Chargement des détails pour donation ID:', donationId);

      if (!donationId) {
        console.warn('Aucun donationId fourni');
        setDonation(null);
        return;
      }

      const donationData = await dispatch(getDonationById(donationId));
      console.log('✅ Données récupérées avec succès:', donationData);

      if (donationData) {
        setDonation(donationData.donation);
        console.log("✅ Donation mise à jour dans l'état local");
      } else {
        console.warn('⚠️ Aucune donnée retournée, utilisation des données mock');
        setDonation(null);
      }
    } catch (error) {
      console.error('❌ ERREUR lors du chargement des détails:', error);
      console.error("Message d'erreur:", error.message);
      console.error('Stack trace:', error.stack);

      message.error('Erreur lors du chargement des détails - Utilisation des données de démonstration');
      // En cas d'erreur, utiliser les données mock pour la démonstration
      setDonation(null);
    } finally {
      setLoading(false);
      console.log('=== FIN CHARGEMENT DONATION ===');
    }
  };

  useEffect(() => {
    console.log('=== USEEFFECT DONATION DETAILS ===');
    console.log('donationId reçu:', donationId);
    if (donationId) {
      loadDonationDetails();
    } else {
      console.warn('Aucun donationId, pas de chargement');
    }
  }, [donationId]);

  // Données fictives pour démonstration - utiliser un statut pending pour tester le paiement
  const mockDonation = {
    _id: donationId || 'mock-donation-id',
    amount: 25000,
    currency: 'XOF',
    category: 'offering',
    type: 'one_time',
    status: 'pending', // Statut pending pour tester le bouton de paiement
    paymentMethod: 'mobile_money',
    message: "Offrande dominicale pour les activités de l'église",
    isAnonymous: false,
    user: {
      firstName: 'Marie',
      lastName: 'Traore',
      email: 'marie.traore@email.com',
      phone: '+225 07 08 09 10 11',
    },
    receipt: {
      number: null,
      issued: false,
      issuedAt: null,
      downloadUrl: null,
    },
    recurring: null,
    createdAt: new Date().toISOString(),
    processedAt: null,
    transactionId: null,
    history: [
      {
        action: 'created',
        description: 'Donation créée - En attente de paiement',
        performedAt: new Date().toISOString(),
      },
    ],
  };

  const currentDonation = donation || mockDonation;

  // Logs pour débugger
  console.log('=== ETAT ACTUEL COMPOSANT ===');
  console.log('donation (depuis Redux/API):', donation);
  console.log('mockDonation:', mockDonation);
  console.log('currentDonation (utilisée):', currentDonation);
  console.log('Status de la donation:', currentDonation.status);
  console.log('Type de donation:', currentDonation.type);
  console.log('=== FIN ETAT COMPOSANT ===');

  const categoryLabels = {
    tithe: 'Dîme',
    offering: 'Offrande',
    building: 'Construction',
    missions: 'Missions',
    charity: 'Charité',
    education: 'Éducation',
    youth: 'Jeunesse',
    women: 'Femmes',
    men: 'Hommes',
    special: 'Événement spécial',
    emergency: 'Urgence',
  };

  const statusLabels = {
    pending: { label: 'En attente', color: 'processing' },
    processing: { label: 'En traitement', color: 'processing' },
    completed: { label: 'Complété', color: 'success' },
    failed: { label: 'Échoué', color: 'error' },
    cancelled: { label: 'Annulé', color: 'default' },
    refunded: { label: 'Remboursé', color: 'warning' },
    scheduled: { label: 'Programmé', color: 'processing' },
  };

  const paymentMethodLabels = {
    card: 'Carte bancaire',
    mobile_money: 'Mobile Money',
    bank_transfer: 'Virement bancaire',
    cash: 'Espèces',
    paypal: 'PayPal',
  };

  const frequencyLabels = {
    daily: 'Quotidien',
    weekly: 'Hebdomadaire',
    monthly: 'Mensuel',
    quarterly: 'Trimestriel',
    yearly: 'Annuel',
  };

  const handleGenerateReceipt = async () => {
    try {
      await dispatch(generateReceipt(donationId));
      message.success('Reçu généré avec succès');
      loadDonationDetails(); // Recharger pour mettre à jour les infos du reçu
    } catch (error) {
      message.error('Erreur lors de la génération du reçu');
    }
  };

  const handleDownloadReceipt = async () => {
    try {
      await dispatch(downloadReceipt(donationId));
    } catch (error) {
      message.error('Erreur lors du téléchargement du reçu');
    }
  };

  const handleStopRecurring = () => {
    confirm({
      title: 'Arrêter la donation récurrente',
      content: 'Êtes-vous sûr de vouloir arrêter cette donation récurrente ? Cette action est irréversible.',
      okText: 'Arrêter',
      okType: 'danger',
      cancelText: 'Annuler',
      onOk: async () => {
        try {
          await dispatch(stopRecurringDonation(donationId, "Arrêté par l'administrateur"));
          message.success('Donation récurrente arrêtée avec succès');
          loadDonationDetails();
        } catch (error) {
          message.error("Erreur lors de l'arrêt de la donation");
        }
      },
    });
  };

  const handlePaymentSuccess = () => {
    message.success('Paiement complété avec succès !');
    setPaymentModalVisible(false);
    // Mettre à jour le statut localement pour un feedback immédiat
    if (donation) {
      setDonation({ ...donation, status: 'completed' });
    }
    // Recharger les détails pour voir le nouveau statut depuis le serveur
    setTimeout(() => {
      loadDonationDetails();
    }, 1000);
  };

  const handlePaymentCancel = () => {
    setPaymentModalVisible(false);
    message.info('Paiement annulé.');
  };

  // Détermine si le paiement peut être effectué
  const canProcessPayment = ['pending', 'failed', 'cancelled'].includes(currentDonation.status);

  console.log('canProcessPayment:', canProcessPayment, 'pour status:', currentDonation.status);

  if (loading) {
    return (
      <Card loading style={{ minHeight: 400 }}>
        <div>Chargement des détails...</div>
      </Card>
    );
  }

  return (
    <div>
      {/* Header */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
          <div>
            <Button type="text" icon={<ArrowLeftOutlined />} onClick={onBack} style={{ marginBottom: 16 }}>
              Retour à la liste
            </Button>
            <Title level={4} style={{ margin: 0 }}>
              Détails de la donation
            </Title>
            <Text type="secondary">Reçu #{currentDonation.receipt?.number || 'Non généré'}</Text>
          </div>

          <Space wrap>
            {/* Bouton de paiement pour les donations en attente */}
            {canProcessPayment && (
              <Button
                type="primary"
                icon={<CreditCardOutlined />}
                onClick={() => setPaymentModalVisible(true)}
                size="large"
                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
              >
                Effectuer le paiement
              </Button>
            )}

            {currentDonation.receipt?.issued ? (
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={handleDownloadReceipt}
                loading={downloadingReceipt}
              >
                Télécharger le reçu
              </Button>
            ) : (
              currentDonation.status === 'completed' && (
                <Button
                  type="primary"
                  icon={<FileTextOutlined />}
                  onClick={handleGenerateReceipt}
                  loading={generatingReceipt}
                >
                  Générer le reçu
                </Button>
              )
            )}

            {currentDonation.type === 'recurring' && currentDonation.recurring?.isActive && (
              <Button
                danger
                icon={<ExclamationCircleOutlined />}
                onClick={handleStopRecurring}
                loading={stoppingRecurring}
              >
                Arrêter la récurrence
              </Button>
            )}
          </Space>
        </div>

        {/* Alerte pour les donations en attente */}
        {canProcessPayment && (
          <Alert
            message="Paiement en attente"
            description="Cette donation n'a pas encore été payée. Cliquez sur 'Effectuer le paiement' pour finaliser la transaction."
            type="warning"
            showIcon
            style={{ marginTop: 16 }}
            action={
              <Button size="small" type="primary" onClick={() => setPaymentModalVisible(true)}>
                Payer maintenant
              </Button>
            }
          />
        )}
      </Card>

      <Row gutter={16}>
        {/* Informations principales */}
        <Col xs={24} lg={16}>
          <Card title="Informations de la donation" style={{ marginBottom: 16 }}>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="Montant" span={1}>
                <Text strong style={{ fontSize: 18, color: '#52c41a' }}>
                  {new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: currentDonation.currency || 'XOF',
                    minimumFractionDigits: 0,
                  }).format(currentDonation.amount)}
                </Text>
              </Descriptions.Item>

              <Descriptions.Item label="Statut" span={1}>
                <Tag color={statusLabels[currentDonation.status]?.color}>
                  {statusLabels[currentDonation.status]?.label}
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item label="Catégorie" span={1}>
                <Tag color="blue">{categoryLabels[currentDonation.category]}</Tag>
              </Descriptions.Item>

              <Descriptions.Item label="Type" span={1}>
                <Tag color={currentDonation.type === 'recurring' ? 'purple' : 'green'}>
                  {currentDonation.type === 'recurring' ? 'Récurrent' : 'Unique'}
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item label="Méthode de paiement" span={1}>
                <Space>
                  <CreditCardOutlined />
                  {paymentMethodLabels[currentDonation.paymentMethod]}
                </Space>
              </Descriptions.Item>

              <Descriptions.Item label="Date de création" span={1}>
                <Space>
                  <CalendarOutlined />
                  {moment(currentDonation.createdAt).format('DD/MM/YYYY HH:mm')}
                </Space>
              </Descriptions.Item>

              {currentDonation.transactionId && (
                <Descriptions.Item label="ID Transaction" span={2}>
                  <Text code>{currentDonation.transactionId}</Text>
                </Descriptions.Item>
              )}

              {currentDonation.message && (
                <Descriptions.Item label="Message" span={2}>
                  <Paragraph style={{ margin: 0 }}>{currentDonation.message}</Paragraph>
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>

          {/* Configuration récurrente */}
          {currentDonation.type === 'recurring' && (
            <Card
              title="Configuration récurrente"
              style={{ marginBottom: 16 }}
              extra={
                <Tag color={currentDonation.recurring?.isActive ? 'success' : 'default'}>
                  {currentDonation.recurring?.isActive ? 'Actif' : 'Arrêté'}
                </Tag>
              }
            >
              <Descriptions column={2} bordered>
                <Descriptions.Item label="Fréquence">
                  {frequencyLabels[currentDonation.recurring?.frequency]}
                  {currentDonation.recurring?.interval > 1 && ` (${currentDonation.recurring.interval}x)`}
                </Descriptions.Item>

                <Descriptions.Item label="Exécutions">
                  {currentDonation.recurring?.totalExecutions || 0}
                  {currentDonation.recurring?.maxOccurrences && ` / ${currentDonation.recurring.maxOccurrences}`}
                </Descriptions.Item>

                <Descriptions.Item label="Date de début">
                  {moment(currentDonation.recurring?.startDate).format('DD/MM/YYYY')}
                </Descriptions.Item>

                <Descriptions.Item label="Prochaine exécution">
                  {currentDonation.recurring?.nextPaymentDate
                    ? moment(currentDonation.recurring.nextPaymentDate).format('DD/MM/YYYY')
                    : 'Aucune'}
                </Descriptions.Item>

                {currentDonation.recurring?.endDate && (
                  <Descriptions.Item label="Date de fin" span={2}>
                    {moment(currentDonation.recurring.endDate).format('DD/MM/YYYY')}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>
          )}
        </Col>

        {/* Sidebar */}
        <Col xs={24} lg={8}>
          {/* Informations du donateur */}
          <Card title="Donateur" style={{ marginBottom: 16 }}>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <UserOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 8 }} />
              <br />
              <Text strong style={{ fontSize: 16 }}>
                {currentDonation.user?.firstName} {currentDonation.user?.lastName}
              </Text>
              <br />
              <Text type="secondary">{currentDonation.user?.email}</Text>
            </div>

            <Descriptions column={1} size="small">
              <Descriptions.Item label="Téléphone">{currentDonation.user?.phone}</Descriptions.Item>
              <Descriptions.Item label="Donation anonyme">
                {currentDonation.isAnonymous ? 'Oui' : 'Non'}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Informations du reçu */}
          <Card title="Reçu fiscal" style={{ marginBottom: 16 }}>
            {currentDonation.receipt?.issued ? (
              <div>
                <Alert
                  message="Reçu généré"
                  description={
                    <div>
                      <Text>Numéro: {currentDonation.receipt.number}</Text>
                      <br />
                      <Text type="secondary">
                        Généré le {moment(currentDonation.receipt.issuedAt).format('DD/MM/YYYY HH:mm')}
                      </Text>
                    </div>
                  }
                  type="success"
                  showIcon
                />
                <Button
                  type="link"
                  icon={<DownloadOutlined />}
                  onClick={handleDownloadReceipt}
                  loading={downloadingReceipt}
                  style={{ padding: 0, marginTop: 8 }}
                >
                  Télécharger le PDF
                </Button>
              </div>
            ) : (
              <div>
                <Alert
                  message={currentDonation.status === 'completed' ? 'Reçu non généré' : 'En attente de paiement'}
                  description={
                    currentDonation.status === 'completed'
                      ? "Le reçu fiscal n'a pas encore été généré pour cette donation."
                      : 'Le reçu sera disponible après confirmation du paiement.'
                  }
                  type={currentDonation.status === 'completed' ? 'warning' : 'info'}
                  showIcon
                />
                {currentDonation.status === 'completed' && (
                  <Button
                    type="primary"
                    icon={<FileTextOutlined />}
                    onClick={handleGenerateReceipt}
                    loading={generatingReceipt}
                    style={{ marginTop: 8, width: '100%' }}
                  >
                    Générer le reçu
                  </Button>
                )}
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Historique */}
      <Card title="Historique de la donation">
        <Timeline>
          {currentDonation.history?.map((event, index) => (
            <Timeline.Item
              key={index}
              dot={
                event.action === 'completed' ? (
                  <CheckCircleOutlined style={{ color: '#52c41a' }} />
                ) : (
                  <HistoryOutlined />
                )
              }
            >
              <div>
                <Text strong>{event.description}</Text>
                <br />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {moment(event.performedAt).format('DD/MM/YYYY HH:mm')}
                </Text>
              </div>
            </Timeline.Item>
          ))}
        </Timeline>
      </Card>

      {/* Modal de paiement */}
      <PaymentProcessor
        visible={paymentModalVisible}
        onClose={() => setPaymentModalVisible(false)}
        donation={currentDonation}
        onSuccess={handlePaymentSuccess}
        onCancel={handlePaymentCancel}
      />
    </div>
  );
}

export default DonationDetails;
