import React, { useEffect, useState } from 'react';
import { Row, Col, Table, Input, Select, Popconfirm, message, Spin } from 'antd';
import UilPlus from '@iconscout/react-unicons/icons/uil-plus';
import { SearchOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { UilEye } from '@iconscout/react-unicons';
import UilEdit from '@iconscout/react-unicons/icons/uil-edit';
import UilTrashAlt from '@iconscout/react-unicons/icons/uil-trash-alt';
import moment from 'moment';
import { TicketBox } from './Style';
import SupportCreate from './SupportCreate';
import SupportUpdate from './SupportUpdate';
import SupportNavigation from './SupportNavigation';
import { PageHeader } from '../../components/page-headers/page-headers';
import { Main, TableWrapper } from '../styled';
import { Cards } from '../../components/cards/frame/cards-frame';
import Heading from '../../components/heading/heading';
import { Button } from '../../components/buttons/buttons';
import { ticketReadData, ticketDeleteData } from '../../redux/supportTickets/actionCreator';

function Supports() {
  const translationsStatus = {
    open: 'Ouvert',
    closed: 'Fermé',
    pending: 'En attente',
    waiting_user: "En attente de l'utilisateur",
    waiting_admin: "En attente d'un admin",
    resolved: 'Résolu',
    cancelled: 'Annulé',
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
    low: 'Basse',
    medium: 'Moyenne',
    high: 'Haute',
    urgent: 'Critique',
  };

  const PageRoutes = [
    {
      path: 'index',
      breadcrumbName: 'Tableau de bord',
    },
    {
      path: '',
      breadcrumbName: 'Centre de Support',
    },
  ];

  const [visible, setVisible] = useState(false);
  const [visibleEdit, setVisibleEdit] = useState(false);
  const [editableData, setEditableData] = useState(null);
  const [filters, setFilters] = useState({
    ticketNumber: '',
    status: '',
    search: '',
  });

  const { dataState, loading, creating, deleting } = useSelector((state) => {
    return {
      dataState: state.tickets.data,
      loading: state.tickets.loading,
      creating: state.tickets.creating,
      deleting: state.tickets.deleting,
    };
  });

  const dispatch = useDispatch();

  useEffect(() => {
    if (dispatch) {
      dispatch(ticketReadData());
    }
  }, [dispatch]);

  // Filtrage des données
  const getFilteredData = () => {
    if (!dataState?.tickets?.length) return [];

    return dataState.tickets.filter((item) => {
      const matchTicketNumber =
        !filters.ticketNumber ||
        item.ticketNumber?.toString().toLowerCase().includes(filters.ticketNumber.toLowerCase());

      const matchStatus = !filters.status || item.status === filters.status;

      const matchSearch =
        !filters.search ||
        item.subject?.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.description?.toLowerCase().includes(filters.search.toLowerCase()) ||
        translationsCategory[item.category]?.toLowerCase().includes(filters.search.toLowerCase());

      return matchTicketNumber && matchStatus && matchSearch;
    });
  };

  const dataSource = [];
  const filteredTickets = getFilteredData();

  const showModalEdit = (values) => {
    setEditableData(values);
    setVisibleEdit(true);
  };

  const handleDelete = async (id) => {
    try {
      await dispatch(ticketDeleteData(id));
      message.success('Ticket supprimé avec succès !');
    } catch (error) {
      message.error('Erreur lors de la suppression du ticket');
    }
  };

  if (filteredTickets.length) {
    filteredTickets.map((item) => {
      const { _id, ticketNumber, category, status, subject, priority, createAt } = item;
      return dataSource.push({
        key: `${_id}`,
        id: `${_id}`,
        ticketNumber: <span className="ninjadash-ticket-number">#{ticketNumber}</span>,
        category: <span className="ninjadash-ticket-category">{translationsCategory[category] || category}</span>,
        status: (
          <span className={`ninjadash-support-status ninjadash-support-status-${status}`}>
            {translationsStatus[status] || status}
          </span>
        ),
        subject: <span className="ninjadash-ticket-subject">{subject}</span>,
        priority: (
          <span className={`ninjadash-ticket-priority ninjadash-priority-${priority}`}>
            {translationsPriority[priority] || priority}
          </span>
        ),
        createAt: moment(createAt).format('DD/MM/YYYY HH:mm'),
        action: (
          <div className="table-actions">
            <Link className="view" to={`/admin/support/ticket/${_id}`} title="Voir les détails (Version améliorée)">
              <UilEye />
            </Link>
            <Link
              className="edit"
              to="#"
              onClick={(e) => {
                e.preventDefault();
                showModalEdit(item);
              }}
              title="Modifier"
            >
              <UilEdit />
            </Link>
            <Popconfirm
              title="Êtes-vous sûr de vouloir supprimer ce ticket ?"
              onConfirm={() => handleDelete(_id)}
              okText="Oui"
              cancelText="Non"
              okType="danger"
            >
              <Link className="delete" to="#" title="Supprimer">
                <UilTrashAlt />
              </Link>
            </Popconfirm>
          </div>
        ),
      });
    });
  }

  const onCancel = () => {
    setVisible(false);
  };

  const showModal = () => {
    setVisible(true);
  };

  const handleUpdate = async (values) => {
    try {
      // Logique de mise à jour à implémenter avec Redux
      console.log('Mise à jour:', values);
      setVisibleEdit(false);
      message.success('Ticket mis à jour avec succès !');
    } catch (error) {
      message.error('Erreur lors de la mise à jour du ticket');
    }
  };

  const onCancelEdit = () => {
    setVisibleEdit(false);
    setEditableData(null);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const resetFilters = () => {
    setFilters({
      ticketNumber: '',
      status: '',
      search: '',
    });
  };

  const columns = [
    {
      title: 'N° Ticket',
      dataIndex: 'ticketNumber',
      key: 'ticketNumber',
      sorter: (a, b) => a.ticketNumber - b.ticketNumber,
    },
    {
      title: 'Catégorie',
      dataIndex: 'category',
      key: 'category',
      filters: Object.entries(translationsCategory).map(([key, value]) => ({
        text: value,
        value: key,
      })),
      onFilter: (value, record) => record.category.props.children === translationsCategory[value],
    },
    {
      title: 'Sujet',
      dataIndex: 'subject',
      key: 'subject',
      ellipsis: true,
    },
    {
      title: 'Priorité',
      dataIndex: 'priority',
      key: 'priority',
      sorter: (a, b) => {
        const priorityOrder = { low: 1, medium: 2, high: 3, urgent: 4 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      },
    },
    {
      title: 'Statut',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Date de création',
      dataIndex: 'createAt',
      key: 'createAt',
      sorter: (a, b) => moment(a.createAt) - moment(b.createAt),
    },
    {
      title: 'Actions',
      dataIndex: 'action',
      key: 'action',
    },
  ];

  const prefix = (
    <SearchOutlined
      style={{
        fontSize: 16,
        color: '#1890ff',
      }}
    />
  );

  return (
    <>
      <PageHeader className="ninjadash-page-header-main" title="Centre de Support" routes={PageRoutes} />
      <Main>
        <SupportNavigation />
        <TicketBox>
          <Row gutter={25}>
            <Col sm={24} xs={24}>
              <Cards headless>
                <div className="ninjadash-support-content-top">
                  <div>
                    <Heading as="h4">Mes Tickets - Consulter et gérer vos demandes de support</Heading>
                    <p style={{ color: '#666', marginTop: 8 }}>
                      {filteredTickets.length} ticket(s) trouvé(s) sur {dataState?.tickets?.length || 0} au total
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <Link to="/admin/support/dashboard">
                      <Button size="default" type="default">
                        📊 Tableau de bord avancé
                      </Button>
                    </Link>
                    <Button onClick={showModal} size="default" type="primary" loading={creating} disabled={creating}>
                      <UilPlus /> {creating ? 'Création...' : 'Nouvelle demande'}
                    </Button>
                  </div>
                </div>
              </Cards>
            </Col>
          </Row>

          <Row gutter={25}>
            <Col sm={24} xs={24}>
              <Cards headless>
                <div className="ninjadash-support-content-filter">
                  <div className="ninjadash-support-content-filter__left">
                    <div className="ninjadash-support-content-filter__input">
                      <span className="label">N° Ticket:</span>
                      <Input
                        placeholder="Recherche par N° Ticket"
                        value={filters.ticketNumber}
                        onChange={(e) => handleFilterChange('ticketNumber', e.target.value)}
                        allowClear
                      />
                    </div>
                    <div className="ninjadash-support-content-filter__input">
                      <span className="label">Statut:</span>
                      <Select
                        style={{ width: 200 }}
                        value={filters.status}
                        onChange={(value) => handleFilterChange('status', value)}
                        allowClear
                        placeholder="Filtrer par statut"
                      >
                        <Select.Option value="">Tout</Select.Option>
                        <Select.Option value="open">Ouvert</Select.Option>
                        <Select.Option value="waiting_user">En attente de l&#39;utilisateur</Select.Option>
                        <Select.Option value="waiting_admin">En attente d&#39;un admin</Select.Option>
                        <Select.Option value="resolved">Résolu</Select.Option>
                        <Select.Option value="closed">Fermé</Select.Option>
                        <Select.Option value="cancelled">Annulé</Select.Option>
                      </Select>
                    </div>
                    <Button onClick={resetFilters} type="link">
                      Réinitialiser les filtres
                    </Button>
                  </div>
                  <div className="ninjadash-support-content-filter__right">
                    <Input
                      name="search"
                      size="default"
                      placeholder="Recherche par mots clés (sujet, description, catégorie)"
                      prefix={prefix}
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      allowClear
                    />
                  </div>
                </div>

                <div className="ninjadash-support-content-table">
                  <Spin spinning={loading || deleting} tip={deleting ? 'Suppression en cours...' : 'Chargement...'}>
                    <TableWrapper className="table-data-view table-responsive">
                      <Table
                        pagination={{
                          pageSize: 10,
                          showSizeChanger: true,
                          showQuickJumper: true,
                          showTotal: (total, range) => `${range[0]}-${range[1]} sur ${total} tickets`,
                        }}
                        dataSource={dataSource}
                        columns={columns}
                        scroll={{ x: 1000 }}
                        locale={{
                          emptyText:
                            filters.ticketNumber || filters.status || filters.search
                              ? 'Aucun ticket ne correspond à vos critères de recherche'
                              : 'Aucun ticket trouvé',
                        }}
                      />
                    </TableWrapper>
                  </Spin>
                </div>
              </Cards>
            </Col>
          </Row>
        </TicketBox>

        <SupportCreate visible={visible} onCancel={onCancel} />
        <SupportUpdate
          visible={visibleEdit}
          onCancel={onCancelEdit}
          handleSubmit={handleUpdate}
          editableData={editableData}
        />
      </Main>
    </>
  );
}

export default Supports;
