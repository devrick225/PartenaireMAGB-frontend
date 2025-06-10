import React from 'react';
import { Form, Input, Select, message } from 'antd';
import propTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { Button } from '../../components/buttons/buttons';
import { Modal } from '../../components/modals/antd-modals';
import { BasicFormWrapper } from '../styled';
import { ticketCreateData } from '../../redux/supportTickets/actionCreator';

const { Option } = Select;

function SupportCreate({ visible, onCancel }) {
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const handleSubmit = async (values) => {
    try {
      await dispatch(ticketCreateData(values));
      form.resetFields();
      onCancel();
      message.success('Ticket créé avec succès !');
    } catch (error) {
      message.error('Erreur lors de la création du ticket');
      console.error('Erreur création ticket:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      getContainer={false}
      type="primary"
      title="Créer un nouveau ticket"
      visible={visible}
      footer={null}
      onCancel={handleCancel}
      width={600}
    >
      <div className="project-modal">
        <BasicFormWrapper>
          <Form form={form} name="supportCreate" onFinish={handleSubmit} layout="vertical">
            <Form.Item
              name="category"
              label="Catégorie"
              initialValue="general"
              rules={[{ required: true, message: 'Veuillez sélectionner une catégorie' }]}
            >
              <Select size="large" placeholder="Sélectionnez une catégorie">
                <Option value="technical">Problème technique</Option>
                <Option value="payment">Problème de paiement</Option>
                <Option value="account">Problème de compte</Option>
                <Option value="donation">Question sur les dons</Option>
                <Option value="bug_report">Rapport de bug</Option>
                <Option value="feature_request">Demande de fonctionnalité</Option>
                <Option value="general">Question générale</Option>
                <Option value="complaint">Réclamation</Option>
                <Option value="suggestion">Suggestion</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="subject"
              label="Sujet"
              rules={[
                { required: true, message: 'Veuillez saisir un sujet' },
                { min: 5, message: 'Le sujet doit contenir au moins 5 caractères' },
                { max: 100, message: 'Le sujet ne peut pas dépasser 100 caractères' },
              ]}
            >
              <Input size="large" placeholder="Résumez votre demande en quelques mots" />
            </Form.Item>

            <Form.Item
              name="priority"
              label="Priorité"
              initialValue="medium"
              rules={[{ required: true, message: 'Veuillez sélectionner une priorité' }]}
            >
              <Select size="large" placeholder="Sélectionnez la priorité">
                <Option value="low">Basse</Option>
                <Option value="medium">Moyenne</Option>
                <Option value="high">Haute</Option>
                <Option value="urgent">Critique</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="description"
              label="Description détaillée"
              rules={[
                { required: true, message: 'Veuillez fournir une description' },
                { min: 20, message: 'La description doit contenir au moins 20 caractères' },
              ]}
            >
              <Input.TextArea
                rows={6}
                placeholder="Décrivez votre problème ou votre demande en détail. Plus vous donnez d'informations, plus nous pourrons vous aider efficacement."
                showCount
                maxLength={1000}
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
              <Button style={{ marginRight: 8 }} onClick={handleCancel}>
                Annuler
              </Button>
              <Button size="default" htmlType="submit" type="primary">
                Créer le ticket
              </Button>
            </Form.Item>
          </Form>
        </BasicFormWrapper>
      </div>
    </Modal>
  );
}

SupportCreate.propTypes = {
  visible: propTypes.bool.isRequired,
  onCancel: propTypes.func.isRequired,
};

export default SupportCreate;
