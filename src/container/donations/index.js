import React, { useEffect, useState } from 'react';
import { Row, Col, Tabs, Button, Card, Spin, message, Alert } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import {
  DollarOutlined,
  BarChartOutlined,
  FileTextOutlined,
  PlusOutlined,
  CreditCardOutlined,
  ReloadOutlined,
  ReconciliationOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  FilterOutlined,
} from '@ant-design/icons';

import DonationsList from './DonationsList';
import DonationCreate from './DonationCreate';
import RecurringDonations from './RecurringDonations';
import DonationStats from './DonationStats';
import DonationDetails from './DonationDetails';
import PaymentsList from './PaymentsList';
import { usePermissions } from '../../components/utilities/protectedRoute';
import { getPaymentsList, getPaymentStats } from '../../redux/payments/actionCreator';
import {
  donationsReadData,
  recurringDonationsReadData,
  donationStatsReadData,
  verifyPaymentsManually,
} from '../../redux/donations/actionCreator';
import { Cards } from '../../components/cards/frame/cards-frame';
import { Main } from '../styled';
import { PageHeader } from '../../components/page-headers/page-headers';

function Donations() {
  const [activeTab, setActiveTab] = useState('list');
  const [selectedDonationId, setSelectedDonationId] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAllDonations, setShowAllDonations] = useState(false);
  const [verifyingPayments, setVerifyingPayments] = useState(false);
  const dispatch = useDispatch();
  // eslint-disable-next-line no-unused-vars
  const { hasRole, hasPermission, isAdmin, isTreasurer } = usePermissions();

  const { donationsLoading, donationsError, recurringLoading, statsLoading, paymentsLoading, donations } = useSelector(
    (state) => ({
      donationsLoading: state.donations.loading,
      donationsError: state.donations.donationsError,
      recurringLoading: state.donations.recurringLoading,
      statsLoading: state.donations.statsLoading,
      paymentsLoading: state.payments.loading,
      donations: state.donations.donations,
    }),
  );

  console.log(recurringLoading);
  console.log(statsLoading);

  const PageRoutes = [
    {
      path: 'index',
      breadcrumbName: 'Tableau de bord',
    },
    {
      path: '',
      breadcrumbName: 'Gestion des Donations',
    },
  ];

  useEffect(() => {
    if (dispatch) {
      // Charger les données initiales
      dispatch(donationsReadData({ includeAll: showAllDonations }));
      dispatch(recurringDonationsReadData());
      dispatch(donationStatsReadData());
      dispatch(getPaymentsList());
      dispatch(getPaymentStats());
    }
  }, [dispatch, showAllDonations]);

  useEffect(() => {
    if (donationsError) {
      message.error('Erreur lors du chargement des donations');
    }
  }, [donationsError]);

  const handleTabChange = (key) => {
    setActiveTab(key);
    setSelectedDonationId(null);
  };

  const handleViewDonation = (donationId) => {
    setSelectedDonationId(donationId);
    setActiveTab('details');
  };

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
    setActiveTab('list');
    message.success('Donation créée avec succès !');
  };

  const handleRefresh = () => {
    dispatch(donationsReadData({ includeAll: showAllDonations }));
    dispatch(donationStatsReadData());
    dispatch(getPaymentsList());
    dispatch(getPaymentStats());
    message.success('Données actualisées');
  };

  const handleVerifyPayments = async () => {
    if (!isAdmin && !isTreasurer) {
      message.warning('Permission insuffisante pour cette action');
      return;
    }

    try {
      setVerifyingPayments(true);
      const result = await dispatch(verifyPaymentsManually());

      if (result.success) {
        message.success(`Vérification terminée: ${result.data.checked} paiements vérifiés`);
        // Actualiser les données après vérification
        handleRefresh();
      } else {
        message.error('Erreur lors de la vérification des paiements');
      }
    } catch (error) {
      console.error('Erreur vérification paiements:', error);
      message.error('Erreur lors de la vérification des paiements');
    } finally {
      setVerifyingPayments(false);
    }
  };

  const handleToggleShowAll = () => {
    setShowAllDonations(!showAllDonations);
  };

  const tabItems = [
    {
      key: 'list',
      label: (
        <span>
          <ReconciliationOutlined />
          Liste des Donations
        </span>
      ),
      children: <DonationsList onViewDonation={handleViewDonation} onCreateNew={() => setShowCreateForm(true)} />,
    },
    {
      key: 'payments',
      label: (
        <span>
          <CreditCardOutlined />
          Gestion des Paiements
        </span>
      ),
      children: <PaymentsList />,
    },
    {
      key: 'recurring',
      label: (
        <span>
          <ReloadOutlined />
          Donations Récurrentes
        </span>
      ),
      children: <RecurringDonations onViewDonation={handleViewDonation} />,
    },
    {
      key: 'stats',
      label: (
        <span>
          <BarChartOutlined />
          Statistiques
        </span>
      ),
      children: <DonationStats />,
    },
  ];

  // Ajouter l'onglet détails si une donation est sélectionnée
  if (selectedDonationId) {
    tabItems.push({
      key: 'details',
      label: (
        <span>
          <FileTextOutlined />
          Détails de la Donation
        </span>
      ),
      children: (
        <DonationDetails
          donationId={selectedDonationId}
          onBack={() => {
            setSelectedDonationId(null);
            setActiveTab('list');
          }}
        />
      ),
    });
  }

  if (showCreateForm) {
    return (
      <>
        <PageHeader className="ninjadash-page-header-main" title="Nouvelle Donation" routes={PageRoutes} />
        <Main>
          <Row gutter={25}>
            <Col span={24}>
              <Cards headless>
                <DonationCreate onSuccess={handleCreateSuccess} onCancel={() => setShowCreateForm(false)} />
              </Cards>
            </Col>
          </Row>
        </Main>
      </>
    );
  }

  if (donationsLoading && activeTab === 'list') {
    return (
      <>
        <PageHeader className="ninjadash-page-header-main" title="Gestion des Donations" routes={PageRoutes} />
        <Main>
          <div style={{ textAlign: 'center', marginTop: 50 }}>
            <Spin size="large" tip="Chargement des donations..." />
          </div>
        </Main>
      </>
    );
  }

  return (
    <>
      <PageHeader
        className="ninjadash-page-header-main"
        title="Gestion des Donations et Paiements"
        routes={PageRoutes}
      />
      <Main>
        <Row gutter={25}>
          <Col span={24}>
            <Cards headless>
              <div style={{ padding: '20px' }}>
                {/* Header avec actions rapides */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 30,
                    padding: '20px 0',
                    borderBottom: '1px solid #f0f0f0',
                  }}
                >
                  <div>
                    <h2 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>
                      <DollarOutlined style={{ marginRight: 12, color: '#52c41a' }} />
                      {activeTab === 'list' && 'Liste des Donations'}
                      {activeTab === 'payments' && 'Gestion des Paiements'}
                      {activeTab === 'recurring' && 'Donations Récurrentes'}
                      {activeTab === 'stats' && 'Statistiques et Analytics'}
                    </h2>
                    <p style={{ margin: '8px 0 0 0', color: '#666', fontSize: 16 }}>
                      {activeTab === 'list' && 'Gérez toutes les donations et leur traitement'}
                      {activeTab === 'payments' && 'Surveillez les paiements et transactions'}
                      {activeTab === 'recurring' && 'Administrez les donations automatiques'}
                      {activeTab === 'stats' && 'Analysez les performances de vos campagnes'}
                    </p>
                  </div>

                  {/* Actions rapides */}
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <Button
                      type="default"
                      icon={<ReloadOutlined />}
                      onClick={handleRefresh}
                      loading={donationsLoading || paymentsLoading}
                    >
                      Actualiser
                    </Button>

                    <Button
                      type={showAllDonations ? 'primary' : 'default'}
                      icon={<FilterOutlined />}
                      onClick={handleToggleShowAll}
                      ghost={showAllDonations}
                    >
                      {showAllDonations ? 'Toutes les donations' : 'Donations complétées'}
                    </Button>

                    {(isAdmin || isTreasurer) && (
                      <Button
                        type="default"
                        icon={<SyncOutlined />}
                        onClick={handleVerifyPayments}
                        loading={verifyingPayments}
                        style={{ color: '#722ed1', borderColor: '#722ed1' }}
                      >
                        Vérifier Paiements
                      </Button>
                    )}

                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setShowCreateForm(true)}>
                      Nouvelle Donation
                    </Button>
                  </div>
                </div>

                {/* Indicateurs de charge */}
                {(donationsLoading || paymentsLoading) && (
                  <Card size="small" style={{ marginBottom: 16, textAlign: 'center' }}>
                    <Spin />
                    <span style={{ marginLeft: 8 }}>Chargement des données...</span>
                  </Card>
                )}

                {/* Indicateur du type d'affichage */}
                {!showAllDonations && (
                  <Alert
                    message="Affichage filtré"
                    description="Seules les donations complétées sont affichées pour éviter les erreurs de calculs financiers. Utilisez le bouton 'Toutes les donations' pour voir l'historique complet."
                    type="info"
                    showIcon
                    closable
                    style={{ marginBottom: 16 }}
                    icon={<CheckCircleOutlined />}
                  />
                )}

                {/* Statistiques rapides */}
                <Row gutter={16} style={{ marginBottom: 24 }}>
                  <Col xs={24} sm={6}>
                    <Card size="small">
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 24, fontWeight: 600, color: '#52c41a' }}>{donations?.length || 0}</div>
                        <div style={{ color: '#666', fontSize: 12 }}>
                          {showAllDonations ? 'Total Donations' : 'Donations Complétées'}
                        </div>
                      </div>
                    </Card>
                  </Col>
                  <Col xs={24} sm={6}>
                    <Card size="small">
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 24, fontWeight: 600, color: '#1890ff' }}>
                          {donations?.filter((d) => d.status === 'completed')?.length || 0}
                        </div>
                        <div style={{ color: '#666', fontSize: 12 }}>Complétées</div>
                      </div>
                    </Card>
                  </Col>
                  <Col xs={24} sm={6}>
                    <Card size="small">
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 24, fontWeight: 600, color: '#faad14' }}>
                          {donations?.filter((d) => d.status === 'pending')?.length || 0}
                        </div>
                        <div style={{ color: '#666', fontSize: 12 }}>En attente</div>
                      </div>
                    </Card>
                  </Col>
                  <Col xs={24} sm={6}>
                    <Card size="small">
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 24, fontWeight: 600, color: '#722ed1' }}>
                          {donations?.filter((d) => d.type === 'recurring')?.length || 0}
                        </div>
                        <div style={{ color: '#666', fontSize: 12 }}>Récurrentes</div>
                      </div>
                    </Card>
                  </Col>
                </Row>

                {/* Navigation par onglets */}
                <Tabs
                  activeKey={activeTab}
                  onChange={handleTabChange}
                  type="line"
                  tabPosition="top"
                  items={tabItems}
                  style={{
                    '& .ant-tabs-nav': {
                      marginBottom: 24,
                    },
                    '& .ant-tabs-tab': {
                      padding: '12px 16px',
                      fontSize: 14,
                    },
                    '& .ant-tabs-content-holder': {
                      padding: '0 4px',
                    },
                  }}
                />
              </div>
            </Cards>
          </Col>
        </Row>
      </Main>
    </>
  );
}

export default Donations;
