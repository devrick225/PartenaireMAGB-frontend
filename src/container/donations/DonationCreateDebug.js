import React, { useState } from 'react';
import { Card, Form, Input, Select, Button, Typography, Space, Alert } from 'antd';

const { Option } = Select;
const { Text } = Typography;

// Composant de test simple pour valider la récupération des données
function DonationCreateDebug() {
  const [form] = Form.useForm();
  const [formData, setFormData] = useState({});
  const [submittedData, setSubmittedData] = useState(null);

  // eslint-disable-next-line no-unused-vars
  const handleFormChange = (changedFields, allFields) => {
    const values = form.getFieldsValue();
    console.log('🔍 Données du formulaire changées:', values);
    setFormData(values);
  };

  const handleSubmit = (values) => {
    console.log('📊 === DONNÉES SOUMISES ===');
    console.log('Values from onFinish:', values);
    console.log('Values from getFieldsValue:', form.getFieldsValue());
    console.log('FormData state:', formData);
    console.log('=== FIN DONNÉES ===');

    setSubmittedData({
      fromOnFinish: values,
      fromGetFieldsValue: form.getFieldsValue(),
      fromState: formData,
    });
  };

  return (
    <Card title="🧪 Test de Récupération des Données du Formulaire" style={{ margin: 20 }}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        onFieldsChange={handleFormChange}
        initialValues={{
          currency: 'XOF',
          paymentMethod: 'moneyfusion',
        }}
      >
        <Form.Item name="amount" label="Montant" rules={[{ required: true, message: 'Le montant est requis' }]}>
          <Input type="number" placeholder="Montant de la donation" />
        </Form.Item>

        <Form.Item name="currency" label="Devise">
          <Select>
            <Option value="XOF">Franc CFA (XOF)</Option>
            <Option value="EUR">Euro (EUR)</Option>
            <Option value="USD">Dollar US (USD)</Option>
          </Select>
        </Form.Item>

        <Form.Item name="category" label="Catégorie" rules={[{ required: true, message: 'La catégorie est requise' }]}>
          <Select placeholder="Sélectionnez une catégorie">
            <Option value="tithe">Dîme</Option>
            <Option value="offering">Offrande</Option>
            <Option value="building">Construction</Option>
            <Option value="missions">Missions</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="paymentMethod"
          label="Méthode de paiement"
          rules={[{ required: true, message: 'La méthode de paiement est requise' }]}
        >
          <Select>
            <Option value="moneyfusion">💳 MoneyFusion - Mobile Money et Cartes bancaires</Option>
          </Select>
        </Form.Item>

        <Form.Item name="message" label="Message (optionnel)">
          <Input.TextArea rows={3} placeholder="Message ou intention de donation..." maxLength={500} />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Tester la Soumission
          </Button>
        </Form.Item>
      </Form>

      {/* Affichage en temps réel des données */}
      <Card title="📊 Données en Temps Réel" size="small" style={{ marginTop: 16 }}>
        <Text strong>État du formulaire :</Text>
        <pre style={{ background: '#f5f5f5', padding: 10, marginTop: 8, fontSize: 12 }}>
          {JSON.stringify(formData, null, 2)}
        </pre>
      </Card>

      {/* Affichage des données soumises */}
      {submittedData && (
        <Card title="✅ Données Soumises" size="small" style={{ marginTop: 16 }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text strong>Depuis onFinish :</Text>
              <pre style={{ background: '#f0f8e8', padding: 10, marginTop: 4, fontSize: 12 }}>
                {JSON.stringify(submittedData.fromOnFinish, null, 2)}
              </pre>
            </div>

            <div>
              <Text strong>Depuis getFieldsValue :</Text>
              <pre style={{ background: '#e8f4f8', padding: 10, marginTop: 4, fontSize: 12 }}>
                {JSON.stringify(submittedData.fromGetFieldsValue, null, 2)}
              </pre>
            </div>

            <div>
              <Text strong>Depuis l&#39;état local :</Text>
              <pre style={{ background: '#f8f0e8', padding: 10, marginTop: 4, fontSize: 12 }}>
                {JSON.stringify(submittedData.fromState, null, 2)}
              </pre>
            </div>
          </Space>
        </Card>
      )}

      {/* Instructions */}
      <Alert
        message="🔧 Instructions de Test"
        description={
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li>Remplissez les champs du formulaire</li>
            <li>Observez les données en temps réel</li>
            <li>Cliquez sur &#34;Tester la Soumission&#34;</li>
            <li>Vérifiez que toutes les données sont bien récupérées</li>
            <li>Consultez la console pour les logs détaillés</li>
          </ul>
        }
        type="info"
        style={{ marginTop: 16 }}
      />
    </Card>
  );
}

export default DonationCreateDebug;
