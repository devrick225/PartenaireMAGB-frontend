import React, { useState } from 'react';
import {
  Form,
  Input,
  Select,
  InputNumber,
  Radio,
  DatePicker,
  Button,
  Card,
  Row,
  Col,
  message,
  Switch,
  Typography,
  Divider,
  Space,
  Alert,
  Steps,
} from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { DollarOutlined, CreditCardOutlined, SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import moment from 'moment';
import PaymentProcessor from './PaymentProcessor';
import {
  donationCreateData,
  validateDonationData,
  calculateNextPaymentDate,
} from '../../redux/donations/actionCreator';

const { Option } = Select;
const { TextArea } = Input;
const { Text, Title } = Typography;
const { Step } = Steps;

function DonationCreate({ onSuccess, onCancel }) {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [donationType, setDonationType] = useState('one_time');
  const [isRecurring, setIsRecurring] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [nextPaymentDate, setNextPaymentDate] = useState(null);
  const [createdDonation, setCreatedDonation] = useState(null);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);

  // État pour persister les données entre les étapes
  const [formData, setFormData] = useState({
    type: 'one_time',
    currency: 'XOF',
    paymentMethod: 'moneyfusion', // Sélectionner MoneyFusion par défaut
    isAnonymous: false,
    recurring: {
      interval: 1,
    },
  });

  const dispatch = useDispatch();

  const { creating, createError } = useSelector((state) => ({
    creating: state.donations.creating,
    createError: state.donations.createError,
  }));

  // Catégories de donation
  const categories = [
    { value: 'tithe', label: 'Dîme', description: 'Dîme mensuelle ou hebdomadaire' },
    { value: 'offering', label: 'Offrande', description: 'Offrande de culte' },
    { value: 'building', label: 'Construction', description: 'Fonds de construction' },
    { value: 'missions', label: 'Missions', description: 'Soutien aux missions' },
    { value: 'charity', label: 'Charité', description: 'Œuvres de charité' },
    { value: 'education', label: 'Éducation', description: 'Éducation et formation' },
    { value: 'youth', label: 'Jeunesse', description: 'Activités de la jeunesse' },
    { value: 'women', label: 'Femmes', description: 'Ministère des femmes' },
    { value: 'men', label: 'Hommes', description: 'Ministère des hommes' },
    { value: 'special', label: 'Événement spécial', description: 'Occasions spéciales' },
    { value: 'emergency', label: 'Urgence', description: "Situations d'urgence" },
  ];

  // Méthodes de paiement - pour l'instant seulement MoneyFusion
  const paymentMethods = [
    { value: 'moneyfusion', label: 'MoneyFusion', icon: '💳', description: 'Mobile Money et Cartes bancaires' },
  ];

  // Fréquences pour donations récurrentes
  const frequencies = [
    { value: 'weekly', label: 'Hebdomadaire', description: 'Chaque semaine' },
    { value: 'monthly', label: 'Mensuel', description: 'Chaque mois' },
    { value: 'quarterly', label: 'Trimestriel', description: 'Tous les 3 mois' },
    { value: 'yearly', label: 'Annuel', description: 'Une fois par an' },
  ];

  // Jours de la semaine
  const weekDays = [
    { value: 0, label: 'Dimanche' },
    { value: 1, label: 'Lundi' },
    { value: 2, label: 'Mardi' },
    { value: 3, label: 'Mercredi' },
    { value: 4, label: 'Jeudi' },
    { value: 5, label: 'Vendredi' },
    { value: 6, label: 'Samedi' },
  ];

  // Sauvegarder les données du formulaire
  const saveCurrentStepData = () => {
    try {
      const currentValues = form.getFieldsValue();
      console.log('Sauvegarde des données actuelles:', currentValues);
      setFormData((prevData) => ({
        ...prevData,
        ...currentValues,
      }));
    } catch (error) {
      console.warn('Erreur lors de la sauvegarde des données:', error);
    }
  };

  // Charger les données dans le formulaire
  const loadFormData = () => {
    try {
      console.log('Chargement des données:', formData);
      form.setFieldsValue(formData);
    } catch (error) {
      console.warn('Erreur lors du chargement des données:', error);
    }
  };

  // Mise à jour simple des données du formulaire
  const updateFormData = (field, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const handleTypeChange = (type) => {
    setDonationType(type);
    setIsRecurring(type === 'recurring');
    // Sauvegarder immédiatement le changement de type
    saveCurrentStepData();
    updateFormData('type', type);
  };

  const handleRecurringConfigChange = () => {
    const values = { ...formData, ...form.getFieldsValue() };
    if (values.type === 'recurring' && values.recurring) {
      const nextDate = calculateNextPaymentDate(values.recurring);
      setNextPaymentDate(nextDate);
    }
  };

  const validateCurrentStep = async () => {
    try {
      // Combiner les données sauvegardées avec les valeurs actuelles
      const currentValues = form.getFieldsValue();
      const allValues = { ...formData, ...currentValues };
      console.log('Validation avec toutes les valeurs:', allValues);

      if (currentStep === 0) {
        // Validation étape 1 : Informations de base
        const requiredFields = ['amount', 'category', 'paymentMethod'];
        const missingFields = requiredFields.filter((field) => !allValues[field] || allValues[field] === '');

        if (missingFields.length > 0) {
          message.error(`Champs requis manquants: ${missingFields.join(', ')}`);
          return false;
        }

        if (!allValues.amount || allValues.amount < 100) {
          message.error('Le montant minimum est de 100 XOF');
          return false;
        }
      } else if (currentStep === 1) {
        // Validation étape 2 : Type de donation
        if (allValues.type === 'recurring') {
          if (!allValues.recurring?.frequency) {
            message.error('La fréquence est requise pour les donations récurrentes');
            return false;
          }

          if (!allValues.recurring?.startDate) {
            message.error('La date de début est requise pour les donations récurrentes');
            return false;
          }

          if (allValues.recurring.frequency === 'weekly' && allValues.recurring.dayOfWeek === undefined) {
            message.error('Le jour de la semaine est requis pour les donations hebdomadaires');
            return false;
          }

          if (
            ['monthly', 'quarterly', 'yearly'].includes(allValues.recurring.frequency) &&
            !allValues.recurring.dayOfMonth
          ) {
            message.error('Le jour du mois est requis pour cette fréquence');
            return false;
          }
        }
      }

      return true;
    } catch (errorInfo) {
      console.log('Erreur de validation:', errorInfo);
      return false;
    }
  };

  const handleNext = async () => {
    // Sauvegarder les données avant de passer à l'étape suivante
    saveCurrentStepData();

    const isValid = await validateCurrentStep();
    if (isValid) {
      setCurrentStep(currentStep + 1);
      // Charger les données dans la nouvelle étape
      setTimeout(() => {
        loadFormData();
      }, 0);
    }
  };

  const handlePrevious = () => {
    // Sauvegarder les données avant de revenir
    saveCurrentStepData();
    setCurrentStep(currentStep - 1);
    // Charger les données dans l'étape précédente
    setTimeout(() => {
      loadFormData();
    }, 0);
  };

  const handleSubmit = async () => {
    try {
      // Sauvegarder les données actuelles avant soumission
      saveCurrentStepData();

      // Combiner toutes les données
      const currentValues = form.getFieldsValue();
      const finalValues = { ...formData, ...currentValues };
      
      console.log('📊 === DEBUG DONNÉES FINALES ===');
      console.log('formData:', formData);
      console.log('currentValues:', currentValues);
      console.log('finalValues:', finalValues);
      console.log('finalValues.amount type:', typeof finalValues.amount, 'value:', finalValues.amount);
      console.log('finalValues.currency:', finalValues.currency);
      console.log('=== FIN DEBUG ===');

      // Validation finale
      const errors = validateDonationData(finalValues);
      if (errors.length > 0) {
        setValidationErrors(errors);
        message.error('Veuillez corriger les erreurs du formulaire');
        return;
      }

      setValidationErrors([]);

      // Préparer les données avec validation stricte
      const parsedAmount = parseFloat(finalValues.amount);
      const validAmount = isNaN(parsedAmount) ? 100 : parsedAmount;
      
      console.log('💰 === DEBUG MONTANT ===');
      console.log('finalValues.amount original:', finalValues.amount);
      console.log('parseFloat result:', parsedAmount);
      console.log('isNaN check:', isNaN(parsedAmount));
      console.log('final validAmount:', validAmount);
      console.log('=== FIN DEBUG MONTANT ===');
      
      const donationData = {
        ...finalValues,
        amount: validAmount,
        currency: finalValues.currency || 'XOF',
      };

      // Configuration récurrente si nécessaire
      if (donationType === 'recurring' && finalValues.recurring) {
        donationData.recurring = {
          ...finalValues.recurring,
          startDate: finalValues.recurring.startDate.format
            ? finalValues.recurring.startDate.format('YYYY-MM-DD')
            : finalValues.recurring.startDate,
          endDate:
            finalValues.recurring.endDate && finalValues.recurring.endDate.format
              ? finalValues.recurring.endDate.format('YYYY-MM-DD')
              : finalValues.recurring.endDate,
          isActive: true,
          totalExecutions: 0,
        };
      }

      console.log('🚀 === ENVOI DONNÉES AU BACKEND ===');
      console.log('donationData:', donationData);
      console.log('=== FIN DEBUG ENVOI ===');
      
      const result = await dispatch(donationCreateData(donationData));
      
      console.log('✅ === RETOUR DU BACKEND ===');
      console.log('result:', result);
      console.log('result type:', typeof result);
      console.log('result.amount:', result?.amount);
      console.log('result.currency:', result?.currency);
      console.log('=== FIN DEBUG RETOUR ===');

      // Stocker la donation créée pour le processus de paiement
      setCreatedDonation(result);

      // Passer à l'étape de paiement ET ouvrir automatiquement le modal de paiement
      setCurrentStep(2);
      setPaymentModalVisible(true); // Ouvrir automatiquement le modal

      message.success('Donation créée avec succès ! Procédez au paiement.');
    } catch (error) {
      message.error('Erreur lors de la création de la donation');
    }
  };

  const handlePaymentSuccess = () => {
    message.success('Paiement complété avec succès !');
    form.resetFields();
    setCurrentStep(0);
    setDonationType('one_time');
    setIsRecurring(false);
    setCreatedDonation(null);
    setPaymentModalVisible(false);
    setFormData({
      type: 'one_time',
      currency: 'XOF',
      paymentMethod: 'moneyfusion',
      isAnonymous: false,
      recurring: {
        interval: 1,
      },
    });
    if (onSuccess) onSuccess();
  };

  const handlePaymentCancel = () => {
    setPaymentModalVisible(false);
    // Optionnel: garder la donation créée ou la supprimer
    message.info('Paiement annulé. La donation reste en attente de paiement.');
  };

  // Charger les données initiales au montage du composant
  React.useEffect(() => {
    loadFormData();
  }, [currentStep]);

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Card>
            <Row gutter={24}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="amount"
                  label="Montant"
                  rules={[
                    { required: true, message: 'Le montant est requis' },
                    { type: 'number', min: 100, message: 'Le montant minimum est de 100 XOF' },
                  ]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                    placeholder="Montant de la donation"
                    prefix={<DollarOutlined />}
                    onChange={(value) => updateFormData('amount', value)}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="currency" label="Devise">
                  <Select onChange={(value) => updateFormData('currency', value)}>
                    <Option value="XOF">Franc CFA (XOF)</Option>
                    <Option value="EUR">Euro (EUR)</Option>
                    <Option value="USD">Dollar US (USD)</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="category"
                  label="Catégorie"
                  rules={[{ required: true, message: 'La catégorie est requise' }]}
                >
                  <Select
                    placeholder="Sélectionnez une catégorie"
                    onChange={(value) => updateFormData('category', value)}
                  >
                    {categories.map((cat) => (
                      <Option key={cat.value} value={cat.value}>
                        <div>
                          <Text strong>{cat.label}</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {cat.description}
                          </Text>
                        </div>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="paymentMethod"
                  label="Méthode de paiement"
                  rules={[{ required: true, message: 'La méthode de paiement est requise' }]}
                >
                  <Select
                    placeholder="Choisissez la méthode de paiement"
                    defaultValue="moneyfusion"
                    onChange={(value) => updateFormData('paymentMethod', value)}
                  >
                    {paymentMethods.map((method) => (
                      <Option key={method.value} value={method.value}>
                        <div>
                          <Space>
                            <span>{method.icon}</span>
                            <Text strong>{method.label}</Text>
                          </Space>
                          {method.description && (
                            <>
                              <br />
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                {method.description}
                              </Text>
                            </>
                          )}
                        </div>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            {/* Information sur MoneyFusion */}
            <Alert
              message="💳 MoneyFusion disponible"
              description="MoneyFusion prend en charge les paiements par Mobile Money (Orange, MTN, Moov) et cartes bancaires. D'autres méthodes de paiement seront ajoutées prochainement."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <Form.Item name="message" label="Message (optionnel)">
              <TextArea
                rows={3}
                placeholder="Message ou intention de donation..."
                maxLength={500}
                showCount
                onChange={(e) => updateFormData('message', e.target.value)}
              />
            </Form.Item>

            <Form.Item name="isAnonymous" valuePropName="checked">
              <Switch onChange={(checked) => updateFormData('isAnonymous', checked)} />{' '}
              <span style={{ marginLeft: 8 }}>Donation anonyme</span>
            </Form.Item>
          </Card>
        );

      case 1:
        return (
          <Card>
            <Form.Item name="type" label="Type de donation">
              <Radio.Group onChange={(e) => handleTypeChange(e.target.value)}>
                <Space direction="vertical" size="large">
                  <Radio value="one_time">
                    <div>
                      <Text strong>Donation unique</Text>
                      <br />
                      <Text type="secondary">Paiement ponctuel</Text>
                    </div>
                  </Radio>
                  <Radio value="recurring">
                    <div>
                      <Text strong>Donation récurrente</Text>
                      <br />
                      <Text type="secondary">Paiement automatique répété</Text>
                    </div>
                  </Radio>
                </Space>
              </Radio.Group>
            </Form.Item>

            {isRecurring && (
              <Card title="Configuration récurrente" size="small" style={{ marginTop: 16 }}>
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name={['recurring', 'frequency']}
                      label="Fréquence"
                      rules={[{ required: isRecurring, message: 'La fréquence est requise' }]}
                    >
                      <Select placeholder="Choisissez la fréquence" onChange={handleRecurringConfigChange}>
                        {frequencies.map((freq) => (
                          <Option key={freq.value} value={freq.value}>
                            <div>
                              <Text strong>{freq.label}</Text>
                              <br />
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                {freq.description}
                              </Text>
                            </div>
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name={['recurring', 'interval']} label="Intervalle">
                      <InputNumber min={1} max={12} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  noStyle
                  shouldUpdate={(prevValues, currentValues) =>
                    prevValues.recurring?.frequency !== currentValues.recurring?.frequency
                  }
                >
                  {({ getFieldValue }) => {
                    const frequency = getFieldValue(['recurring', 'frequency']);

                    if (frequency === 'weekly') {
                      return (
                        <Form.Item
                          name={['recurring', 'dayOfWeek']}
                          label="Jour de la semaine"
                          rules={[{ required: true, message: 'Le jour est requis' }]}
                        >
                          <Select placeholder="Choisissez le jour">
                            {weekDays.map((day) => (
                              <Option key={day.value} value={day.value}>
                                {day.label}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                      );
                    }

                    if (['monthly', 'quarterly', 'yearly'].includes(frequency)) {
                      return (
                        <Form.Item
                          name={['recurring', 'dayOfMonth']}
                          label="Jour du mois"
                          rules={[{ required: true, message: 'Le jour est requis' }]}
                        >
                          <InputNumber min={1} max={31} style={{ width: '100%' }} />
                        </Form.Item>
                      );
                    }

                    return null;
                  }}
                </Form.Item>

                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name={['recurring', 'startDate']}
                      label="Date de début"
                      rules={[{ required: isRecurring, message: 'La date de début est requise' }]}
                    >
                      <DatePicker
                        style={{ width: '100%' }}
                        disabledDate={(current) => current && current < moment().startOf('day')}
                        onChange={handleRecurringConfigChange}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name={['recurring', 'endDate']} label="Date de fin (optionnel)">
                      <DatePicker
                        style={{ width: '100%' }}
                        disabledDate={(current) => {
                          const startDate = form.getFieldValue(['recurring', 'startDate']);
                          return current && startDate && current <= startDate;
                        }}
                        onChange={handleRecurringConfigChange}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item name={['recurring', 'maxOccurrences']} label="Nombre maximum d'occurrences (optionnel)">
                  <InputNumber min={1} style={{ width: '100%' }} placeholder="Illimité si vide" />
                </Form.Item>

                {nextPaymentDate && (
                  <Alert
                    message="Prochaine exécution"
                    description={
                      <Text>
                        Le prochain paiement sera effectué le{' '}
                        <Text strong>{moment(nextPaymentDate).format('DD MMMM YYYY')}</Text>
                      </Text>
                    }
                    type="info"
                    showIcon
                  />
                )}
              </Card>
            )}
          </Card>
        );

      case 2:
        return (
          <Card>
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <CreditCardOutlined style={{ fontSize: 64, color: '#52c41a', marginBottom: 16 }} />
              <Title level={4}>Processus de paiement</Title>
              <Text type="secondary">
                Votre donation a été créée avec succès.
                <br />
                Cliquez sur &#34;Procéder au paiement&#34; pour finaliser votre don.
              </Text>

              {createdDonation && (
                <div
                  style={{
                    marginTop: 24,
                    padding: 16,
                    backgroundColor: '#f8f9fa',
                    borderRadius: 6,
                    textAlign: 'left',
                  }}
                >
                  <Text strong>Résumé de votre donation:</Text>
                  <br />
                  <Text>
                    Montant:{' '}
                    {new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: createdDonation.currency || 'XOF',
                      minimumFractionDigits: 0,
                    }).format(createdDonation.amount)}
                  </Text>
                  <br />
                  <Text>Catégorie: {categories.find((c) => c.value === createdDonation.category)?.label}</Text>
                  <br />
                  <Text>Type: {createdDonation.type === 'recurring' ? 'Récurrent' : 'Unique'}</Text>
                </div>
              )}

              <div style={{ marginTop: 24 }}>
                <Button
                  type="primary"
                  size="large"
                  icon={<CreditCardOutlined />}
                  onClick={() => setPaymentModalVisible(true)}
                >
                  Procéder au paiement
                </Button>
              </div>
            </div>
          </Card>
        );

      default:
        return null;
    }
  };

  const stepTitles = ['Informations de base', 'Type de donation', 'Paiement'];

  return (
    <div>
      <Card>
        <div style={{ marginBottom: 24 }}>
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={onCancel}>
            Retour à la liste
          </Button>
          <Title level={4} style={{ margin: '16px 0 8px 0' }}>
            <DollarOutlined style={{ marginRight: 8, color: '#52c41a' }} />
            Créer une nouvelle donation
          </Title>
          <Text type="secondary">Remplissez les informations de la donation</Text>
        </div>

        <Steps current={currentStep} style={{ marginBottom: 32 }}>
          {stepTitles.map((title) => (
            <Step key={title} title={title} />
          ))}
        </Steps>

        <Form form={form} layout="vertical" initialValues={formData}>
          {renderStepContent()}

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

          {createError && (
            <Alert message="Erreur de création" description={createError} type="error" style={{ marginTop: 16 }} />
          )}

          <Divider />

          <div style={{ textAlign: 'right' }}>
            <Space>
              {currentStep > 0 && currentStep < 2 && <Button onClick={handlePrevious}>Précédent</Button>}
              {currentStep === 0 && (
                <Button type="primary" onClick={handleNext}>
                  Suivant
                </Button>
              )}
              {currentStep === 1 && (
                <Button type="primary" loading={creating} icon={<SaveOutlined />} onClick={handleSubmit}>
                  {creating ? 'Création...' : 'Créer la donation'}
                </Button>
              )}
              <Button onClick={onCancel}>Annuler</Button>
            </Space>
          </div>
        </Form>
      </Card>

      {/* Modal de processus de paiement */}
      <PaymentProcessor
        visible={paymentModalVisible}
        onClose={() => setPaymentModalVisible(false)}
        donation={createdDonation}
        onSuccess={handlePaymentSuccess}
        onCancel={handlePaymentCancel}
      />
    </div>
  );
}

export default DonationCreate;
