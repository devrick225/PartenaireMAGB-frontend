/* eslint no-underscore-dangle: 0 */
import React, { useState, useEffect } from 'react';
import {
  Modal,
  Steps,
  Card,
  Button,
  Input,
  Radio,
  Typography,
  Alert,
  Space,
  Divider,
  Row,
  Col,
  Spin,
  Result,
  Form,
  message,
} from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { MobileOutlined, LoadingOutlined } from '@ant-design/icons';
import {
  initializePayment,
  verifyPayment,
  calculatePaymentFees,
  validatePaymentData,
  pollPaymentStatus,
  setupPaymentWebhookListener,
  clearErrors,
} from '../../redux/payments/actionCreator';

const { Step } = Steps;
const { Text, Title } = Typography;

function PaymentProcessor({ visible, onClose, donation, onSuccess, onCancel }) {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [customerPhone, setCustomerPhone] = useState('');
  const [fees, setFees] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [paymentInProgress, setPaymentInProgress] = useState(false);
  const [webhookListener, setWebhookListener] = useState(null);

  console.log('=== PAYMENT PROCESSOR PROPS ===');
  console.log('visible:', visible);
  console.log('donation:', donation);
  console.log('onSuccess:', !!onSuccess);
  console.log('onCancel:', !!onCancel);
  console.log('paymentInProgress:', paymentInProgress);
  console.log('currentStep:', currentStep);
  console.log('selectedProvider:', selectedProvider);
  console.log('paymentMethod:', paymentMethod);
  console.log('=== FIN PROPS ===');

  const dispatch = useDispatch();

  const {
    providers,
    initializing,
    initializeError,
    paymentUrl,
    currentPayment,
    verifying,
    verifyError,
    verificationResult,
  } = useSelector((state) => {
    console.log('=== ÉTAT REDUX PAYMENTS ===');
    console.log('state.payments:', state.payments);
    console.log('providers:', state.payments.providers);
    console.log('initializing:', state.payments.initializing);
    console.log('currentPayment:', state.payments.currentPayment);
    console.log('=== FIN ÉTAT REDUX ===');

    return {
      providers: state.payments.providers,
      initializing: state.payments.initializing,
      initializeError: state.payments.initializeError,
      paymentUrl: state.payments.paymentUrl,
      clientSecret: state.payments.clientSecret,
      transactionId: state.payments.transactionId,
      currentPayment: state.payments.currentPayment,
      verifying: state.payments.verifying,
      verifyError: state.payments.verifyError,
      verificationResult: state.payments.verificationResult,
    };
  });

  const handleProviderChange = (providerKey) => {
    setSelectedProvider(providerKey);
    const activeProviders = providers?.filter((p) => p.active !== false) || [];
    const provider = activeProviders.find((p) => p.key === providerKey);

    console.log('🎯 Provider sélectionné:', provider);

    // Définir la méthode de paiement par défaut
    if (provider && provider.methods.length > 0) {
      setPaymentMethod(provider.methods[0]);
      form.setFieldsValue({ paymentMethod: provider.methods[0] });
      console.log('📱 Méthode par défaut sélectionnée:', provider.methods[0]);
    }
  };

  // Réinitialiser quand le modal s'ouvre
  useEffect(() => {
    console.log('=== MODAL VISIBILITY CHANGED ===');
    console.log('visible:', visible);
    console.log('donation:', donation);
    console.log('providers:', providers);

    if (visible && providers) {
      console.log('Réinitialisation du modal de paiement');
      setCurrentStep(0);
      setCustomerPhone('');
      setFees(null);
      setValidationErrors([]);
      setPaymentInProgress(false);
      dispatch(clearErrors());
      form.resetFields();

      // Auto-sélectionner MoneyFusion s'il est disponible
      const activeProviders = providers.filter((p) => p.active !== false);
      console.log('Providers actifs:', activeProviders);

      if (activeProviders.length > 0) {
        const moneyfusionProvider = activeProviders.find((p) => p.key === 'moneyfusion');
        if (moneyfusionProvider) {
          console.log('✅ Auto-sélection de MoneyFusion');
          handleProviderChange('moneyfusion');
        } else {
          // Sélectionner le premier provider disponible
          console.log('✅ Auto-sélection du premier provider:', activeProviders[0].key);
          handleProviderChange(activeProviders[0].key);
        }
      }
    } else if (!visible) {
      // Nettoyer les listeners quand le modal se ferme
      console.log('Fermeture du listener webhook');
      if (webhookListener) {
        webhookListener.close();
      }
      setWebhookListener(null);
      // Réinitialiser complètement
      setSelectedProvider(null);
      setPaymentMethod(null);
    }
  }, [visible, donation, providers, dispatch, form]);

  // Calculer les frais quand les paramètres changent
  useEffect(() => {
    // eslint-disable-next-line no-restricted-globals
    if (donation && selectedProvider && donation.amount && !isNaN(donation.amount)) {
      console.log('💰 === CALCUL FRAIS ===');
      console.log('donation.amount pour calcul:', donation.amount, 'type:', typeof donation.amount);
      console.log('selectedProvider:', selectedProvider);
      console.log('donation.currency:', donation.currency);

      const calculatedFees = calculatePaymentFees(donation.amount, selectedProvider, donation.currency);
      console.log('calculatedFees result:', calculatedFees);
      console.log('=== FIN CALCUL FRAIS ===');

      setFees(calculatedFees);
    } else {
      console.warn('❌ Calcul frais impossible:', {
        donation: !!donation,
        selectedProvider: !!selectedProvider,
        donationAmount: donation?.amount,
        // eslint-disable-next-line no-restricted-globals
        isNaN: donation?.amount ? isNaN(donation.amount) : 'undefined',
      });
      setFees(null);
    }
  }, [donation, selectedProvider]);

  const setupWebhookConnection = (paymentId) => {
    try {
      const listener = setupPaymentWebhookListener(paymentId, (payment) => {
        console.log('Webhook reçu:', payment);

        // Mettre à jour l'état en temps réel
        if (payment.status === 'completed') {
          message.success('Paiement confirmé en temps réel !');
          setCurrentStep(2); // Étape de résultat
          setPaymentInProgress(false);
        } else if (payment.status === 'failed') {
          message.error('Paiement échoué');
          setCurrentStep(2); // Étape de résultat
          setPaymentInProgress(false);
        }
      });

      setWebhookListener(listener);
    } catch (error) {
      console.error('Erreur setup webhook:', error);
      // Fallback sur le polling si les webhooks ne fonctionnent pas
    }
  };

  const handleCheckPaymentStatus = async (paymentId) => {
    try {
      console.log('Vérification du statut pour paiement:', paymentId);
      // Polling du statut du paiement (utilisé comme fallback)
      const result = await dispatch(pollPaymentStatus(paymentId || currentPayment?.paymentId));
      console.log('Résultat vérification:', result);
      setCurrentStep(2); // Aller à l'étape de résultat
    } catch (error) {
      console.error('Erreur vérification paiement:', error);
      message.error('Erreur lors de la vérification du paiement');
      setCurrentStep(2);
    } finally {
      setPaymentInProgress(false);
    }
  };

  const handleInitializePayment = async () => {
    try {
      const values = form.getFieldsValue();
      console.log('values', values);

      // Déterminer l'ID de la donation (backend retourne 'id' pas '_id')
      const donationId = donation.id || donation._id;

      console.log('🆔 === DEBUG ID DONATION ===');
      console.log('donation object:', donation);
      console.log('donation._id:', donation._id);
      console.log('donation.id:', donation.id);
      console.log('donationId final:', donationId);
      console.log('=== FIN DEBUG ID ===');

      if (!donationId) {
        message.error('ID de donation manquant. Veuillez recréer la donation.');
        return;
      }

      const paymentData = {
        donationId,
        provider: selectedProvider,
        paymentMethod,
        amount: donation.amount,
        currency: donation.currency,
        customerPhone: customerPhone || '+2250779038069',
      };

      console.log('💳 === DONNÉES PAIEMENT FINALES ===');
      console.log('paymentData:', paymentData);
      console.log('=== FIN DEBUG PAIEMENT ===');

      // Validation côté client
      const errors = validatePaymentData(paymentData);
      if (errors.length > 0) {
        setValidationErrors(errors);
        message.error('Veuillez corriger les erreurs du formulaire');
        return;
      }

      setValidationErrors([]);
      setPaymentInProgress(true);
      setCurrentStep(1); // Passer à l'étape de traitement

      const result = await dispatch(initializePayment(paymentData));
      console.log('Résultat initialisation:', result);

      // Configurer l'écoute webhook en temps réel
      if (result.paymentId) {
        setupWebhookConnection(result.paymentId);
      }

      if (result.paymentUrl) {
        // Ouvrir l'URL de paiement dans une nouvelle fenêtre
        const paymentWindow = window.open(result.paymentUrl, 'payment', 'width=800,height=600,scrollbars=yes');

        if (!paymentWindow) {
          message.error('Veuillez autoriser les pop-ups pour effectuer le paiement');
          setPaymentInProgress(false);
          setCurrentStep(0);
          return;
        }

        // Surveiller la fermeture de la fenêtre
        const checkWindowClosed = setInterval(() => {
          if (paymentWindow.closed) {
            clearInterval(checkWindowClosed);
            console.log('Fenêtre de paiement fermée, vérification du statut...');
            // Vérifier le statut seulement si pas de webhook
            if (!webhookListener) {
              handleCheckPaymentStatus(result.paymentId);
            }
          }
        }, 1000);
      } else if (result.clientSecret) {
        // Pour Stripe, utiliser les éléments Stripe (à implémenter)
        message.info('Intégration Stripe en cours...');
        // Ici vous pourriez intégrer Stripe Elements
      } else {
        // Aucune URL ni clientSecret, aller directement à la vérification
        message.info('Paiement initié, vérification en cours...');
        setTimeout(() => {
          handleCheckPaymentStatus(result.paymentId);
        }, 2000);
      }
    } catch (error) {
      console.error('Erreur initialisation paiement:', error);
      setPaymentInProgress(false);
      setCurrentStep(0);
      message.error(error.message || "Erreur lors de l'initialisation du paiement");
    }
  };

  const handleManualVerification = async () => {
    try {
      if (currentPayment?.paymentId) {
        console.log('Vérification manuelle pour:', currentPayment.paymentId);
        await dispatch(verifyPayment(currentPayment.paymentId));
        setCurrentStep(2);
      } else {
        message.warning('Aucun ID de paiement disponible pour la vérification');
      }
    } catch (error) {
      console.error('Erreur vérification manuelle:', error);
      message.error('Erreur lors de la vérification manuelle');
    }
  };

  const renderProviderSelection = () => {
    console.log('=== PAYMENT PROCESSOR DEBUG COMPLET ===');
    console.log('Providers depuis Redux:', providers);
    console.log('Provider sélectionné:', selectedProvider);
    console.log('Méthode de paiement:', paymentMethod);
    console.log('Donation reçue:', donation);
    console.log('donation type:', typeof donation);
    console.log('donation.amount:', donation?.amount, 'type:', typeof donation?.amount);
    console.log('donation.currency:', donation?.currency);
    console.log('donation keys:', donation ? Object.keys(donation) : 'donation is null/undefined');
    console.log('=== FIN DEBUG COMPLET ===');

    // Filtrer pour ne garder que les providers actifs
    const activeProviders = providers?.filter((p) => p.active !== false) || [];

    if (!activeProviders || activeProviders.length === 0) {
      return (
        <Card title="Méthodes de paiement">
          <Alert
            message="Aucune méthode de paiement disponible"
            description="MoneyFusion sera bientôt disponible. Veuillez contacter l'administrateur pour plus d'informations."
            type="warning"
            showIcon
          />
        </Card>
      );
    }

    return (
      <Card title="Choisissez votre méthode de paiement">
        <Row gutter={[16, 16]}>
          {activeProviders.map((provider) => (
            <Col xs={24} sm={12} md={8} key={provider.key}>
              <Card
                hoverable
                className={selectedProvider === provider.key ? 'selected-provider' : ''}
                onClick={() => handleProviderChange(provider.key)}
                style={{
                  border: selectedProvider === provider.key ? '2px solid #1890ff' : '1px solid #d9d9d9',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 8 }}>{provider.icon}</div>
                <Text strong>{provider.name}</Text>
                <br />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {provider.methods.includes('card') && '💳 '}
                  {provider.methods.includes('mobile_money') && '📱 '}
                  {provider.methods.includes('paypal') && '💸 '}
                </Text>
              </Card>
            </Col>
          ))}
        </Row>

        {selectedProvider && (
          <div style={{ marginTop: 24 }}>
            <Divider />
            <Form form={form} layout="vertical">
              {/* Méthode de paiement */}
              <Form.Item
                name="paymentMethod"
                label="Méthode de paiement"
                rules={[{ required: true, message: 'Sélectionnez une méthode' }]}
              >
                <Radio.Group value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                  {activeProviders
                    .find((p) => p.key === selectedProvider)
                    ?.methods.map((method) => (
                      <Radio key={method} value={method}>
                        {method === 'card' && '💳 Carte bancaire'}
                        {method === 'mobile_money' && '📱 Mobile Money'}
                        {method === 'paypal' && '💸 PayPal'}
                        {method === 'bank_transfer' && '🏦 Virement bancaire'}
                        {method === 'crypto' && '₿ Cryptomonnaie'}
                      </Radio>
                    ))}
                </Radio.Group>
              </Form.Item>

              {/* Numéro de téléphone pour mobile money */}
              {['orange_money', 'mtn_mobile_money', 'moov_money', 'fusionpay', 'moneyfusion'].includes(
                selectedProvider,
              ) && (
                <Form.Item
                  name="customerPhone"
                  label="Numéro de téléphone"
                  rules={[
                    { required: true, message: 'Le numéro est requis' },
                    { pattern: /^(\+225|225)?[0-9]{8,10}$/, message: 'Format invalide (ex: +225 01 02 03 04 05)' },
                  ]}
                >
                  <Input
                    placeholder="+225 01 02 03 04 05"
                    prefix={<MobileOutlined />}
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                  />
                </Form.Item>
              )}
            </Form>

            {/* Résumé des frais */}
            {fees && (
              <Alert
                message="Frais de transaction"
                description={
                  <div>
                    <Row justify="space-between">
                      <Text>Montant de la donation:</Text>
                      <Text strong>
                        {/* eslint-disable-next-line no-restricted-globals */}
                        {donation.amount && !isNaN(donation.amount)
                          ? new Intl.NumberFormat('fr-FR', {
                              style: 'currency',
                              currency: donation.currency || 'XOF',
                              minimumFractionDigits: 0,
                            }).format(Number(donation.amount))
                          : 'Montant non disponible'}
                      </Text>
                    </Row>
                    <Row justify="space-between">
                      <Text>Frais ({fees.feePercentage}%):</Text>
                      <Text>
                        {/* eslint-disable-next-line no-restricted-globals */}
                        {fees.totalFee && !isNaN(fees.totalFee)
                          ? new Intl.NumberFormat('fr-FR', {
                              style: 'currency',
                              currency: donation.currency || 'XOF',
                              minimumFractionDigits: 0,
                            }).format(Number(fees.totalFee))
                          : '0 XOF'}
                      </Text>
                    </Row>
                    <Divider style={{ margin: '8px 0' }} />
                    <Row justify="space-between">
                      <Text strong>Total à payer:</Text>
                      <Text strong style={{ color: '#52c41a', fontSize: 16 }}>
                        {/* eslint-disable-next-line no-restricted-globals */}
                        {fees.amountWithFees && !isNaN(fees.amountWithFees)
                          ? new Intl.NumberFormat('fr-FR', {
                              style: 'currency',
                              currency: donation.currency || 'XOF',
                              minimumFractionDigits: 0,
                            }).format(Number(fees.amountWithFees))
                          : 'Montant non disponible'}
                      </Text>
                    </Row>
                  </div>
                }
                type="info"
                style={{ marginTop: 16 }}
              />
            )}

            {validationErrors.length > 0 && (
              <Alert
                message="Erreurs de validation"
                description={
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    {validationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                }
                type="error"
                style={{ marginTop: 16 }}
              />
            )}
          </div>
        )}
      </Card>
    );
  };

  const renderPaymentProcessing = () => (
    <Card style={{ textAlign: 'center', padding: '40px 20px' }}>
      <Spin size="large" indicator={<LoadingOutlined style={{ fontSize: 48 }} />} />
      <Title level={4} style={{ marginTop: 24 }}>
        Traitement du paiement en cours...
      </Title>
      <Text type="secondary">
        {webhookListener
          ? 'Nous surveillons votre paiement en temps réel...'
          : 'Veuillez patienter pendant que nous traitons votre paiement.'}
        {paymentUrl && <br />}
        {paymentUrl && "Une nouvelle fenêtre s'est ouverte pour effectuer le paiement."}
      </Text>

      {webhookListener && (
        <Alert
          message="✨ Connexion temps réel active"
          description="Vous serez notifié automatiquement dès que votre paiement sera confirmé"
          type="success"
          style={{ marginTop: 16 }}
        />
      )}

      {currentPayment && (
        <div style={{ marginTop: 24 }}>
          <Text>
            Transaction ID: <Text code>{currentPayment.transactionId}</Text>
          </Text>
          <br />
          <Button type="link" onClick={handleManualVerification} loading={verifying} style={{ marginTop: 8 }}>
            Vérifier manuellement le statut
          </Button>
        </div>
      )}
    </Card>
  );

  const renderPaymentResult = () => {
    const isSuccess = verificationResult?.status === 'completed' || currentPayment?.status === 'completed';
    const isFailure = verificationResult?.status === 'failed' || currentPayment?.status === 'failed' || verifyError;

    return (
      <Result
        status={isSuccess ? 'success' : isFailure ? 'error' : 'info'}
        title={isSuccess ? 'Paiement réussi !' : isFailure ? 'Paiement échoué' : 'Vérification en cours...'}
        subTitle={
          isSuccess
            ? 'Votre donation a été traitée avec succès.'
            : isFailure
            ? 'Une erreur est survenue lors du traitement.'
            : 'Nous vérifions le statut de votre paiement...'
        }
        extra={[
          isSuccess && (
            <Button
              type="primary"
              key="success"
              onClick={() => {
                // eslint-disable-next-line no-unused-expressions
                onSuccess && onSuccess();
                onClose();
              }}
            >
              Terminer
            </Button>
          ),
          isFailure && (
            <Button key="retry" onClick={() => setCurrentStep(0)}>
              Réessayer
            </Button>
          ),
          <Button key="close" onClick={onClose}>
            Fermer
          </Button>,
        ].filter(Boolean)}
      />
    );
  };

  const steps = [
    {
      title: 'Méthode de paiement',
      content: renderProviderSelection(),
    },
    {
      title: 'Traitement',
      content: renderPaymentProcessing(),
    },
    {
      title: 'Résultat',
      content: renderPaymentResult(),
    },
  ];

  return (
    <Modal title="Processus de paiement" visible={visible} onCancel={onClose} footer={null} width={800} destroyOnClose>
      <div style={{ marginBottom: 24 }}>
        <Steps current={currentStep} size="small">
          {steps.map((step) => (
            <Step key={step.title} title={step.title} />
          ))}
        </Steps>
      </div>

      {/* Résumé de la donation */}
      <Card size="small" style={{ marginBottom: 16, backgroundColor: '#f8f9fa' }}>
        <Row justify="space-between" align="middle">
          <div>
            <Text strong>Donation: </Text>
            <Text>
              {donation?.category} - {donation?.message || 'Aucun message'}
            </Text>
          </div>
          <div>
            <Text strong style={{ fontSize: 18, color: '#52c41a' }}>
              {/* eslint-disable-next-line no-restricted-globals */}
              {donation && donation.amount && !isNaN(donation.amount)
                ? new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: donation.currency || 'XOF',
                    minimumFractionDigits: 0,
                  }).format(Number(donation.amount))
                : 'Montant non disponible'}
            </Text>
          </div>
        </Row>
      </Card>

      {/* Contenu de l'étape actuelle */}
      <div>{steps[currentStep]?.content}</div>

      {/* Actions du modal */}
      {currentStep === 0 && (
        <div style={{ textAlign: 'right', marginTop: 16 }}>
          <Space>
            <Button onClick={onClose}>Annuler</Button>
            <Button
              type="primary"
              disabled={!selectedProvider || !paymentMethod}
              loading={initializing}
              onClick={handleInitializePayment}
            >
              Continuer le paiement
            </Button>
          </Space>
        </div>
      )}

      {/* Erreurs d'initialisation */}
      {initializeError && (
        <Alert
          message="Erreur d'initialisation"
          description={initializeError}
          type="error"
          style={{ marginTop: 16 }}
          closable
          onClose={() => dispatch(clearErrors())}
        />
      )}
    </Modal>
  );
}

export default PaymentProcessor;
