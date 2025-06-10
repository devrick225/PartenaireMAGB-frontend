import React, { useEffect, useState } from 'react';
import {
  Row,
  Col,
  Card,
  Tag,
  Typography,
  Button,
  Form,
  Input,
  message,
  Spin,
  Divider,
  Avatar,
  Timeline,
  Rate,
  Modal,
  Select,
  Upload,
  Badge,
  Tooltip,
  Progress,
  Descriptions,
  Space,
} from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import {
  ArrowLeftOutlined,
  SendOutlined,
  UserOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  TeamOutlined,
  UploadOutlined,
  FileTextOutlined,
  HistoryOutlined,
  AlertOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { PageHeader } from '../../components/page-headers/page-headers';
import { Main } from '../styled';
import { Cards } from '../../components/cards/frame/cards-frame';
import {
  ticketSinglePageReadData,
  ticketChangeStatus,
  ticketAddComment,
  ticketAddRating,
} from '../../redux/supportTickets/actionCreator';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

function TicketDetailsEnhanced() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [commentForm] = Form.useForm();
  const [statusForm] = Form.useForm();
  const [ratingForm] = Form.useForm();

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);

  const { ticket, loading, addingComment, changingStatus, addingRating, user } = useSelector((state) => ({
    ticket: state.tickets.ticket.ticket,
    loading: state.tickets.loading,
    addingComment: state.tickets.addingComment,
    changingStatus: state.tickets.changingStatus,
    addingRating: state.tickets.addingRating,
    user: state.auth?.user, // Assuming auth state exists
  }));

  const statusConfig = {
    open: { text: 'Ouvert', color: 'processing', icon: <ExclamationCircleOutlined /> },
    in_progress: { text: 'En cours', color: 'warning', icon: <ClockCircleOutlined /> },
    waiting_user: { text: 'En attente utilisateur', color: 'default', icon: <UserOutlined /> },
    waiting_admin: { text: 'En attente admin', color: 'purple', icon: <TeamOutlined /> },
    resolved: { text: 'Résolu', color: 'success', icon: <CheckCircleOutlined /> },
    closed: { text: 'Fermé', color: 'default', icon: <FileTextOutlined /> },
    cancelled: { text: 'Annulé', color: 'error', icon: <AlertOutlined /> },
  };

  const priorityConfig = {
    low: { text: 'Basse', color: 'default', level: 1 },
    medium: { text: 'Moyenne', color: 'warning', level: 2 },
    high: { text: 'Haute', color: 'error', level: 3 },
    urgent: { text: 'Critique', color: 'magenta', level: 4 },
  };

  const categoryConfig = {
    technical: { text: 'Technique', color: 'blue' },
    payment: { text: 'Paiement', color: 'green' },
    account: { text: 'Compte', color: 'orange' },
    donation: { text: 'Dons', color: 'purple' },
    bug_report: { text: 'Bug', color: 'red' },
    feature_request: { text: 'Fonctionnalité', color: 'cyan' },
    general: { text: 'Général', color: 'default' },
    complaint: { text: 'Réclamation', color: 'volcano' },
    suggestion: { text: 'Suggestion', color: 'lime' },
  };

  const isAdmin = user?.role && ['admin', 'moderator'].includes(user.role);
  // eslint-disable-next-line no-underscore-dangle
  const isOwner = ticket?.user?._id === user?.id;
  // eslint-disable-next-line no-underscore-dangle
  const canManage = isAdmin || ticket?.assignedTo?._id === user?.id;

  useEffect(() => {
    if (id && dispatch) {
      dispatch(ticketSinglePageReadData(id));
    }
  }, [id, dispatch]);

  const handleStatusChange = async (values) => {
    try {
      await dispatch(ticketChangeStatus(id, values.status, values.reason, values.resolution));
      message.success('Statut mis à jour avec succès');
      setShowStatusModal(false);
      statusForm.resetFields();
    } catch (error) {
      message.error('Erreur lors de la mise à jour du statut');
    }
  };

  const handleAddComment = async (values) => {
    try {
      await dispatch(ticketAddComment(id, values.comment, values.isInternal));
      message.success('Commentaire ajouté avec succès');
      commentForm.resetFields();
    } catch (error) {
      message.error("Erreur lors de l'ajout du commentaire");
    }
  };

  const handleAddRating = async (values) => {
    try {
      await dispatch(ticketAddRating(id, values.score, values.comment));
      message.success('Évaluation ajoutée avec succès');
      setShowRatingModal(false);
      ratingForm.resetFields();
    } catch (error) {
      message.error("Erreur lors de l'ajout de l'évaluation");
    }
  };

  const calculateSLAStatus = () => {
    if (!ticket) return null;

    const now = moment();
    const created = moment(ticket.createdAt);
    const ageInHours = now.diff(created, 'hours');

    const slaThresholds = {
      urgent: 2,
      high: 8,
      medium: 24,
      low: 72,
    };

    const threshold = slaThresholds[ticket.priority] || 24;
    const percentage = Math.min((ageInHours / threshold) * 100, 100);

    return {
      percentage,
      status: percentage > 100 ? 'exception' : percentage > 80 ? 'active' : 'normal',
      isOverdue: percentage > 100,
    };
  };

  const renderProfileInfo = (userInfo) => {
    if (!userInfo) return null;

    return (
      <Card size="small" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            size={48}
            src={userInfo.avatar}
            icon={!userInfo.avatar && <UserOutlined />}
            style={{ marginRight: 12 }}
          />
          <div>
            <div style={{ fontWeight: 'bold' }}>
              {userInfo.firstName} {userInfo.lastName}
            </div>
            <div style={{ color: '#666' }}>{userInfo.email}</div>
            {userInfo.profile && (
              <div style={{ fontSize: '12px', color: '#999' }}>
                {userInfo.profile.occupation && `${userInfo.profile.occupation} • `}
                Niveau {userInfo.level || 1} •{userInfo.donationCount || 0} donations
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  };

  const getTimelineColor = (action) => {
    const colors = {
      created: 'green',
      updated: 'blue',
      status_changed: 'orange',
      assigned: 'purple',
      comment_added: 'cyan',
      resolved: 'green',
      closed: 'gray',
      escalated: 'red',
    };
    return colors[action] || 'blue';
  };

  const getActionText = (action) => {
    const texts = {
      created: 'Ticket créé',
      updated: 'Ticket mis à jour',
      status_changed: 'Statut modifié',
      assigned: 'Ticket assigné',
      comment_added: 'Commentaire ajouté',
      resolved: 'Ticket résolu',
      closed: 'Ticket fermé',
      escalated: 'Ticket escaladé',
    };
    return texts[action] || action;
  };

  const renderTimeline = () => {
    if (!ticket?.history) return null;

    const timelineItems = ticket.history.map((item, index) => ({
      key: index,
      color: getTimelineColor(item.action),
      children: (
        <div>
          <div style={{ fontWeight: 'bold' }}>{getActionText(item.action)}</div>
          <div style={{ color: '#666', fontSize: '12px' }}>
            {item.performedBy?.firstName} {item.performedBy?.lastName} •{' '}
            {moment(item.performedAt).format('DD/MM/YYYY HH:mm')}
          </div>
          {item.description && <div style={{ marginTop: 4 }}>{item.description}</div>}
        </div>
      ),
    }));

    return <Timeline items={timelineItems} />;
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
          <Button type="primary" onClick={() => navigate('/admin/app/support')}>
            Retour à la liste des tickets
          </Button>
        </div>
      </Main>
    );
  }

  const slaStatus = calculateSLAStatus();

  return (
    <>
      <PageHeader
        className="ninjadash-page-header-main"
        title={
          <Space>
            <span>Ticket #{ticket.ticketNumber}</span>
            <Tag color={statusConfig[ticket.status]?.color} icon={statusConfig[ticket.status]?.icon}>
              {statusConfig[ticket.status]?.text}
            </Tag>
          </Space>
        }
        routes={[
          { path: '/admin/dashboard', breadcrumbName: 'Tableau de bord' },
          { path: '/admin/app/support', breadcrumbName: 'Support' },
          { path: '', breadcrumbName: `#${ticket.ticketNumber}` },
        ]}
        buttons={[
          <Button key="back" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
            Retour
          </Button>,
          ...(canManage
            ? [
                <Button key="status" type="primary" onClick={() => setShowStatusModal(true)}>
                  Changer le statut
                </Button>,
              ]
            : []),
          ...(isOwner && ['resolved', 'closed'].includes(ticket.status) && !ticket.rating
            ? [
                <Button key="rate" onClick={() => setShowRatingModal(true)}>
                  Évaluer le support
                </Button>,
              ]
            : []),
        ]}
      />

      <Main>
        <Row gutter={[24, 24]}>
          {/* Colonne principale */}
          <Col lg={16} md={24}>
            {/* En-tête du ticket */}
            <Cards>
              <div style={{ padding: 24 }}>
                <div style={{ marginBottom: 16 }}>
                  <Title level={2} style={{ marginBottom: 8 }}>
                    {ticket.subject}
                  </Title>

                  <Space wrap>
                    <Tag color={categoryConfig[ticket.category]?.color}>{categoryConfig[ticket.category]?.text}</Tag>
                    <Tag color={priorityConfig[ticket.priority]?.color}>{priorityConfig[ticket.priority]?.text}</Tag>
                    <Text type="secondary">Créé le {moment(ticket.createdAt).format('DD/MM/YYYY à HH:mm')}</Text>
                  </Space>
                </div>

                {/* SLA Progress */}
                {slaStatus && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text strong>Respect du SLA</Text>
                      <Text type={slaStatus.isOverdue ? 'danger' : 'secondary'}>
                        {slaStatus.isOverdue ? 'En retard' : 'Dans les temps'}
                      </Text>
                    </div>
                    <Progress percent={Math.round(slaStatus.percentage)} status={slaStatus.status} size="small" />
                  </div>
                )}

                <Descriptions column={2} size="small">
                  <Descriptions.Item label="Assigné à">
                    {ticket.assignedTo ? (
                      <Space>
                        <Avatar size="small" src={ticket.assignedTo.avatar} />
                        {ticket.assignedTo.firstName} {ticket.assignedTo.lastName}
                      </Space>
                    ) : (
                      <Text type="secondary">Non assigné</Text>
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Dernière activité">{moment(ticket.updatedAt).fromNow()}</Descriptions.Item>
                  <Descriptions.Item label="Temps de réponse">
                    {ticket.metrics?.firstResponseTime ? (
                      `${ticket.metrics.firstResponseTime} min`
                    ) : (
                      <Text type="secondary">En attente</Text>
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Escaladé">
                    {ticket.escalation?.isEscalated ? (
                      <Badge status="error" text="Oui" />
                    ) : (
                      <Badge status="default" text="Non" />
                    )}
                  </Descriptions.Item>
                </Descriptions>

                <Divider />

                <div>
                  <Title level={4} style={{ marginBottom: 16 }}>
                    Description
                  </Title>
                  <Paragraph style={{ fontSize: 16, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                    {ticket.description}
                  </Paragraph>
                </div>

                {/* Pièces jointes */}
                {ticket.attachments && ticket.attachments.length > 0 && (
                  <>
                    <Divider />
                    <div>
                      <Title level={4}>Pièces jointes</Title>
                      <Space wrap>
                        {ticket.attachments.map((attachment, index) => (
                          <Button key={index} icon={<FileTextOutlined />} href={attachment.url} target="_blank">
                            {attachment.originalName || attachment.filename}
                          </Button>
                        ))}
                      </Space>
                    </div>
                  </>
                )}
              </div>
            </Cards>

            {/* Section commentaires */}
            <Cards title="Discussion" style={{ marginTop: 24 }}>
              <div style={{ padding: 24 }}>
                {/* Liste des commentaires */}
                {ticket.comments && ticket.comments.length > 0 ? (
                  <div style={{ marginBottom: 24 }}>
                    {ticket.comments.map((comment, index) => (
                      <div key={index} style={{ marginBottom: 16 }}>
                        <div style={{ display: 'flex', marginBottom: 8 }}>
                          <Avatar src={comment.author?.avatar} icon={<UserOutlined />} style={{ marginRight: 12 }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                              <Text strong style={{ marginRight: 8 }}>
                                {comment.author?.firstName} {comment.author?.lastName}
                              </Text>
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                {moment(comment.createdAt).format('DD/MM/YYYY à HH:mm')}
                              </Text>
                              {comment.isInternal && (
                                <Tag color="orange" size="small" style={{ marginLeft: 8 }}>
                                  Interne
                                </Tag>
                              )}
                            </div>
                            <div
                              style={{
                                background: '#f5f5f5',
                                padding: 12,
                                borderRadius: 6,
                                border: comment.isInternal ? '1px solid #ff9c6e' : 'none',
                              }}
                            >
                              <Paragraph style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{comment.content}</Paragraph>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: 32, color: '#999' }}>
                    <HistoryOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                    <div>Aucun commentaire pour le moment</div>
                  </div>
                )}

                {/* Formulaire de commentaire */}
                <Divider />
                <Form form={commentForm} onFinish={handleAddComment}>
                  <Form.Item
                    name="comment"
                    rules={[
                      { required: true, message: 'Veuillez saisir votre commentaire' },
                      { min: 5, message: 'Le commentaire doit contenir au moins 5 caractères' },
                    ]}
                  >
                    <TextArea rows={4} placeholder="Tapez votre réponse..." showCount maxLength={1000} />
                  </Form.Item>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Space>
                      {isAdmin && (
                        <Form.Item name="isInternal" valuePropName="checked" style={{ margin: 0 }}>
                          <Tooltip title="Commentaire visible uniquement par l'équipe support">
                            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                            <label>
                              <input type="checkbox" style={{ marginRight: 8 }} />
                              Commentaire interne
                            </label>
                          </Tooltip>
                        </Form.Item>
                      )}

                      <Upload beforeUpload={() => false} showUploadList={false}>
                        <Button icon={<UploadOutlined />} size="small">
                          Joindre un fichier
                        </Button>
                      </Upload>
                    </Space>

                    <Button type="primary" htmlType="submit" icon={<SendOutlined />} loading={addingComment}>
                      Répondre
                    </Button>
                  </div>
                </Form>
              </div>
            </Cards>
          </Col>

          {/* Sidebar */}
          <Col lg={8} md={24}>
            {/* Informations utilisateur */}
            <Cards title="Créateur du ticket">
              <div style={{ padding: 16 }}>{renderProfileInfo(ticket.user)}</div>
            </Cards>

            {/* Assigné à */}
            {ticket.assignedTo && (
              <Cards title="Assigné à" style={{ marginTop: 16 }}>
                <div style={{ padding: 16 }}>{renderProfileInfo(ticket.assignedTo)}</div>
              </Cards>
            )}

            {/* Métriques */}
            <Cards title="Métriques" style={{ marginTop: 16 }}>
              <div style={{ padding: 16 }}>
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Temps total">{moment(ticket.createdAt).fromNow()}</Descriptions.Item>
                  <Descriptions.Item label="Réponses">{ticket.metrics?.responseCount || 0}</Descriptions.Item>
                  <Descriptions.Item label="Escalations">{ticket.metrics?.escalationCount || 0}</Descriptions.Item>
                  {ticket.metrics?.resolutionTime && (
                    <Descriptions.Item label="Temps de résolution">
                      {Math.round(ticket.metrics.resolutionTime / 60)} heures
                    </Descriptions.Item>
                  )}
                </Descriptions>

                {/* Évaluation */}
                {ticket.rating && (
                  <>
                    <Divider />
                    <div>
                      <Text strong>Évaluation du support:</Text>
                      <div style={{ marginTop: 8 }}>
                        <Rate disabled value={ticket.rating.score} />
                        <Text style={{ marginLeft: 8 }}>({ticket.rating.score}/5)</Text>
                      </div>
                      {ticket.rating.comment && (
                        <Paragraph style={{ marginTop: 8, fontStyle: 'italic' }}>
                          &#34;{ticket.rating.comment}&#34;
                        </Paragraph>
                      )}
                    </div>
                  </>
                )}
              </div>
            </Cards>

            {/* Historique */}
            <Cards title="Historique" style={{ marginTop: 16 }}>
              <div style={{ padding: 16 }}>{renderTimeline()}</div>
            </Cards>
          </Col>
        </Row>

        {/* Modal changement de statut */}
        <Modal
          title="Changer le statut du ticket"
          open={showStatusModal}
          onCancel={() => setShowStatusModal(false)}
          footer={null}
        >
          <Form form={statusForm} onFinish={handleStatusChange} layout="vertical">
            <Form.Item
              name="status"
              label="Nouveau statut"
              rules={[{ required: true, message: 'Veuillez sélectionner un statut' }]}
            >
              <Select placeholder="Sélectionnez un statut">
                <Option value="open">Ouvert</Option>
                <Option value="in_progress">En cours</Option>
                <Option value="waiting_user">En attente utilisateur</Option>
                <Option value="waiting_admin">En attente admin</Option>
                <Option value="resolved">Résolu</Option>
                <Option value="closed">Fermé</Option>
              </Select>
            </Form.Item>

            <Form.Item name="reason" label="Raison (optionnel)">
              <TextArea rows={3} placeholder="Expliquez la raison du changement..." />
            </Form.Item>

            <Form.Item name="resolution" label="Résolution (pour statut résolu)">
              <TextArea rows={4} placeholder="Décrivez la solution apportée..." />
            </Form.Item>

            <div style={{ textAlign: 'right' }}>
              <Space>
                <Button onClick={() => setShowStatusModal(false)}>Annuler</Button>
                <Button type="primary" htmlType="submit" loading={changingStatus}>
                  Confirmer
                </Button>
              </Space>
            </div>
          </Form>
        </Modal>

        {/* Modal évaluation */}
        <Modal
          title="Évaluer le support"
          open={showRatingModal}
          onCancel={() => setShowRatingModal(false)}
          footer={null}
        >
          <Form form={ratingForm} onFinish={handleAddRating} layout="vertical">
            <Form.Item name="score" label="Note" rules={[{ required: true, message: 'Veuillez donner une note' }]}>
              <Rate />
            </Form.Item>

            <Form.Item name="comment" label="Commentaire (optionnel)">
              <TextArea
                rows={4}
                placeholder="Partagez votre expérience avec notre support..."
                maxLength={500}
                showCount
              />
            </Form.Item>

            <div style={{ textAlign: 'right' }}>
              <Space>
                <Button onClick={() => setShowRatingModal(false)}>Annuler</Button>
                <Button type="primary" htmlType="submit" loading={addingRating}>
                  Envoyer l&#39;évaluation
                </Button>
              </Space>
            </div>
          </Form>
        </Modal>
      </Main>
    </>
  );
}

export default TicketDetailsEnhanced;
