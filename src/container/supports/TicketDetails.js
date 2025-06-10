import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Tag, Typography, Button, Form, Input, message, Spin, Divider } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import { ArrowLeftOutlined, SendOutlined } from '@ant-design/icons';
import { PageHeader } from '../../components/page-headers/page-headers';
import { Main } from '../styled';
import { Cards } from '../../components/cards/frame/cards-frame';
import { ticketSinglePageReadData, ticketUpdateData } from '../../redux/supportTickets/actionCreator';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

function TicketDetails() {
  const { id } = useParams();
  const history = useNavigate();
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [addingComment, setAddingComment] = useState(false);

  const { ticket, loading } = useSelector((state) => ({
    ticket: state.tickets.ticket.ticket,
    loading: state.tickets.loading,
    updating: state.tickets.updating,
  }));

  const translationsStatus = {
    open: { text: 'Ouvert', color: 'green' },
    closed: { text: 'Fermé', color: 'default' },
    pending: { text: 'En attente', color: 'orange' },
    waiting_user: { text: "En attente de l'utilisateur", color: 'blue' },
    waiting_admin: { text: "En attente d'un admin", color: 'purple' },
    resolved: { text: 'Résolu', color: 'cyan' },
    cancelled: { text: 'Annulé', color: 'red' },
  };

  const translationsCategory = {
    technical: 'Problème technique',
    payment: 'Problème de paiement',
    account: 'Problème de compte',
    donation: 'Question sur les dons',
    bug_report: 'Rapport de bug',
    feature_request: 'Demande de fonctionnalité',
    general: 'Question générale',
    complaint: 'Réclamation',
    suggestion: 'Suggestion',
  };

  const translationsPriority = {
    low: { text: 'Basse', color: 'default' },
    medium: { text: 'Moyenne', color: 'orange' },
    high: { text: 'Haute', color: 'red' },
    urgent: { text: 'Critique', color: 'magenta' },
  };

  const PageRoutes = [
    {
      path: '/admin/dashboard',
      breadcrumbName: 'Tableau de bord',
    },
    {
      path: '/admin/app/support',
      breadcrumbName: 'Centre de Support',
    },
    {
      path: '',
      breadcrumbName: ticket ? `Ticket #${ticket.ticketNumber}` : 'Détails du ticket',
    },
  ];

  useEffect(() => {
    if (id && dispatch) {
      dispatch(ticketSinglePageReadData(id));
    }
  }, [id, dispatch]);

  const handleStatusChange = async (newStatus) => {
    try {
      await dispatch(ticketUpdateData(id, { status: newStatus }));
      message.success('Statut mis à jour avec succès');
    } catch (error) {
      message.error('Erreur lors de la mise à jour du statut');
    }
  };

  const handleAddComment = async (values) => {
    try {
      setAddingComment(true);
      // Simulated comment addition - you would need to implement this endpoint
      const commentData = {
        ...values,
        author: 'Utilisateur', // Should come from auth
        createdAt: new Date().toISOString(),
      };

      const updatedComments = ticket.comments ? [...ticket.comments, commentData] : [commentData];
      await dispatch(ticketUpdateData(id, { comments: updatedComments }));

      form.resetFields();
      message.success('Commentaire ajouté avec succès');
    } catch (error) {
      message.error("Erreur lors de l'ajout du commentaire");
    } finally {
      setAddingComment(false);
    }
  };

  const getStatusActions = (currentStatus) => {
    const actions = [];

    if (currentStatus === 'open') {
      actions.push(
        <Button key="pending" onClick={() => handleStatusChange('pending')}>
          Marquer en attente
        </Button>,
      );
      actions.push(
        <Button key="resolved" type="primary" onClick={() => handleStatusChange('resolved')}>
          Marquer comme résolu
        </Button>,
      );
    }

    if (currentStatus === 'resolved') {
      actions.push(
        <Button key="close" type="primary" onClick={() => handleStatusChange('closed')}>
          Fermer le ticket
        </Button>,
      );
      actions.push(
        <Button key="reopen" onClick={() => handleStatusChange('open')}>
          Rouvrir
        </Button>,
      );
    }

    if (currentStatus === 'pending') {
      actions.push(
        <Button key="open" onClick={() => handleStatusChange('open')}>
          Rouvrir
        </Button>,
      );
    }

    return actions;
  };

  if (loading) {
    return (
      <Main>
        <div style={{ textAlign: 'center', marginTop: 50 }}>
          <Spin size="large" tip="Chargement des détails du ticket..." />
        </div>
      </Main>
    );
  }

  if (!ticket) {
    return (
      <Main>
        <div style={{ textAlign: 'center', marginTop: 50 }}>
          <Title level={3}>Ticket non trouvé</Title>
          <Button type="primary" onClick={() => history('/admin/app/support')}>
            Retour à la liste des tickets
          </Button>
        </div>
      </Main>
    );
  }

  return (
    <>
      <PageHeader
        className="ninjadash-page-header-main"
        title={`Ticket #${ticket.ticketNumber}`}
        routes={PageRoutes}
        buttons={[
          <Button key="back" icon={<ArrowLeftOutlined />} onClick={() => history.goBack()}>
            Retour
          </Button>,
        ]}
      />
      <Main>
        <Row gutter={25}>
          {/* Informations principales du ticket */}
          <Col lg={16} md={24}>
            <Cards title="Détails du ticket" headless>
              <div style={{ padding: '20px' }}>
                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    <Title level={3}>{ticket.subject}</Title>
                  </Col>

                  <Col xs={24} sm={12} md={8}>
                    <Text strong>Statut:</Text>
                    <br />
                    <Tag color={translationsStatus[ticket.status]?.color || 'default'} style={{ marginTop: 4 }}>
                      {translationsStatus[ticket.status]?.text || ticket.status}
                    </Tag>
                  </Col>

                  <Col xs={24} sm={12} md={8}>
                    <Text strong>Priorité:</Text>
                    <br />
                    <Tag color={translationsPriority[ticket.priority]?.color || 'default'} style={{ marginTop: 4 }}>
                      {translationsPriority[ticket.priority]?.text || ticket.priority}
                    </Tag>
                  </Col>

                  <Col xs={24} sm={12} md={8}>
                    <Text strong>Catégorie:</Text>
                    <br />
                    <Tag style={{ marginTop: 4 }}>{translationsCategory[ticket.category] || ticket.category}</Tag>
                  </Col>

                  <Col xs={24} sm={12} md={8}>
                    <Text strong>Date de création:</Text>
                    <br />
                    <Text>{moment(ticket.createAt).format('DD/MM/YYYY HH:mm')}</Text>
                  </Col>

                  <Col xs={24} sm={12} md={8}>
                    <Text strong>Dernière mise à jour:</Text>
                    <br />
                    <Text>{moment(ticket.updatedAt || ticket.createAt).format('DD/MM/YYYY HH:mm')}</Text>
                  </Col>
                </Row>

                <Divider />

                <div>
                  <Title level={4}>Description</Title>
                  <Paragraph style={{ fontSize: '16px', lineHeight: '1.6' }}>{ticket.description}</Paragraph>
                </div>

                {/* Actions sur le statut */}
                <Divider />
                <div>
                  <Title level={4}>Actions</Title>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{getStatusActions(ticket.status)}</div>
                </div>
              </div>
            </Cards>

            {/* Section commentaires */}
            <Cards title="Commentaires et réponses" style={{ marginTop: 24 }} headless>
              <div style={{ padding: '20px' }}>
                {ticket.comments && ticket.comments.length > 0 ? (
                  <div style={{ marginBottom: 20 }}>
                    {ticket.comments.map((comment, index) => (
                      <Card key={index} size="small" style={{ marginBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ flex: 1 }}>
                            <Text strong>{comment.author || 'Utilisateur'}</Text>
                            <Text type="secondary" style={{ marginLeft: 12 }}>
                              {moment(comment.createdAt).format('DD/MM/YYYY HH:mm')}
                            </Text>
                            <Paragraph style={{ marginTop: 8, marginBottom: 0 }}>{comment.message}</Paragraph>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Text type="secondary">Aucun commentaire pour le moment.</Text>
                )}

                {/* Formulaire d'ajout de commentaire */}
                <Divider />
                <Title level={5}>Ajouter un commentaire</Title>
                <Form form={form} onFinish={handleAddComment} layout="vertical">
                  <Form.Item
                    name="message"
                    rules={[
                      { required: true, message: 'Veuillez saisir votre commentaire' },
                      { min: 10, message: 'Le commentaire doit contenir au moins 10 caractères' },
                    ]}
                  >
                    <TextArea rows={4} placeholder="Tapez votre commentaire ici..." showCount maxLength={1000} />
                  </Form.Item>
                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      icon={<SendOutlined />}
                      loading={addingComment}
                      disabled={addingComment}
                    >
                      {addingComment ? 'Envoi...' : 'Envoyer le commentaire'}
                    </Button>
                  </Form.Item>
                </Form>
              </div>
            </Cards>
          </Col>

          {/* Sidebar avec informations complémentaires */}
          <Col lg={8} md={24}>
            <Cards title="Informations complémentaires" headless>
              <div style={{ padding: '20px' }}>
                <div style={{ marginBottom: 16 }}>
                  <Text strong>ID du ticket:</Text>
                  <br />
                  <Text code>{ticket.ticketNumber}</Text>
                </div>

                {ticket.assignedTo && (
                  <div style={{ marginBottom: 16 }}>
                    <Text strong>Assigné à:</Text>
                    <br />
                    <Text>{ticket.assignedTo}</Text>
                  </div>
                )}

                {ticket.tags && ticket.tags.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <Text strong>Tags:</Text>
                    <br />
                    <div style={{ marginTop: 4 }}>
                      {ticket.tags.map((tag) => (
                        <Tag key={tag} style={{ marginBottom: 4 }}>
                          {tag}
                        </Tag>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ marginBottom: 16 }}>
                  <Text strong>Temps de réponse:</Text>
                  <br />
                  <Text>{ticket.responseTime ? `${ticket.responseTime}h` : 'En attente'}</Text>
                </div>

                <div>
                  <Text strong>SLA:</Text>
                  <br />
                  <Text>
                    {ticket.priority === 'urgent'
                      ? '2h'
                      : ticket.priority === 'high'
                      ? '8h'
                      : ticket.priority === 'medium'
                      ? '24h'
                      : '72h'}
                  </Text>
                </div>
              </div>
            </Cards>

            {/* Historique des changements de statut */}
          </Col>
        </Row>
      </Main>
    </>
  );
}

export default TicketDetails;
