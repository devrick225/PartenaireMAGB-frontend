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
import UserDonationView from './UserDonationView';
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
  const [dataLoaded, setDataLoaded] = useState(false);
  const dispatch = useDispatch();

  // Permissions pour adapter l'interface selon le rôle
  const { isAdmin, isTreasurer, isModerator, isSupportAgent } = usePermissions();
  const isAdminUser = isAdmin || isTreasurer || isModerator || isSupportAgent;

  const { donationsLoading, donationsError, paymentsLoading, donations } = useSelector((state) => ({
    donationsLoading: state.donations.loading,
    donationsError: state.donations.donationsError,
    paymentsLoading: state.payments.loading,
    donations: state.donations.donations,
  }));

  const PageRoutes = [
    {
      path: 'index',
      breadcrumbName: 'Tableau de bord',
    },
    {
      path: '',
      breadcrumbName: isAdminUser ? 'Administration des Donations' : 'Mes Donations',
    },
  ];
  const loadInitialData = async () => {
    try {
      await Promise.all([
        dispatch(donationsReadData({ includeAll: showAllDonations })),
        dispatch(recurringDonationsReadData()),
        dispatch(donationStatsReadData()),
      ]);

      if (isAdminUser) {
        await Promise.all([dispatch(getPaymentsList()), dispatch(getPaymentStats())]);
      }

      setDataLoaded(true);
    } catch (error) {
      console.error('Erreur chargement données:', error);
      message.error('Erreur lors du chargement des données');
    }
  };

  useEffect(() => {
    if (!dataLoaded && dispatch) {
      loadInitialData();
    }
  }, [dispatch, dataLoaded]);

  useEffect(() => {
    if (dataLoaded && isAdminUser) {
      dispatch(donationsReadData({ includeAll: showAllDonations }));
    }
  }, [showAllDonations]);

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
  const handleRefresh = async () => {
    try {
      await Promise.all([
        dispatch(donationsReadData({ includeAll: showAllDonations })),
        dispatch(donationStatsReadData()),
      ]);

      if (isAdminUser) {
        await Promise.all([dispatch(getPaymentsList()), dispatch(getPaymentStats())]);
      }
      message.success('Données actualisées');
    } catch (error) {
      console.error('Erreur refresh:', error);
      message.error("Erreur lors de l'actualisation");
    }
  };

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
    setActiveTab('list');
    message.success('Donation créée avec succès !');
    handleRefresh();
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

  const getTabItems = () => {
    // Pour les utilisateurs normaux, utiliser UserDonationView
    if (!isAdminUser) {
      return [
        {
          key: 'list',
          label: (
            <span>
              <ReconciliationOutlined />
              Mes Donations
            </span>
          ),
          children: (
            <UserDonationView onViewDonation={handleViewDonation} onCreateNew={() => setShowCreateForm(true)} />
          ),
        },
        {
          key: 'recurring',
          label: (
            <span>
              <ReloadOutlined />
              Mes Donations Récurrentes
            </span>
          ),
          children: <RecurringDonations onViewDonation={handleViewDonation} />,
        },
        {
          key: 'stats',
          label: (
            <span>
              <BarChartOutlined />
              Mes Statistiques
            </span>
          ),
          children: <DonationStats />,
        },
      ];
    }

    // Pour les admins/trésoriers/modérateurs, interface complète
    const baseItems = [
      {
        key: 'list',
        label: (
          <span>
            <ReconciliationOutlined />
            Toutes les Donations
          </span>
        ),
        children: <DonationsList onViewDonation={handleViewDonation} onCreateNew={() => setShowCreateForm(true)} />,
      },
      {
        key: 'recurring',
        label: (
          <span>
            <ReloadOutlined />
            Donations Récurrentes Globales
          </span>
        ),
        children: <RecurringDonations onViewDonation={handleViewDonation} />,
      },
      {
        key: 'stats',
        label: (
          <span>
            <BarChartOutlined />
            Statistiques Globales
          </span>
        ),
        children: <DonationStats />,
      },
    ];

    // Ajouter l'onglet paiements seulement pour les admins/trésoriers
    if (isAdminUser) {
      try {
        baseItems.splice(1, 0, {
          key: 'payments',
          label: (
            <span>
              <CreditCardOutlined />
              Gestion des Paiements
            </span>
          ),
          children: <PaymentsList />,
        });
      } catch (error) {
        console.warn('Erreur chargement PaymentsList:', error);
      }
    }

    return baseItems;
  };

  const tabItems = getTabItems();

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
        <PageHeader
          className="ninjadash-page-header-main"
          title={isAdminUser ? 'Administration des Donations' : 'Mes Donations'}
          routes={PageRoutes}
        />
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
        title={isAdminUser ? 'Administration des Donations et Paiements' : 'Mes Donations'}
        routes={PageRoutes}
      />
      <Main>
        <Row gutter={25}>
          <Col span={24}>
            <Cards headless>
              <div style={{ padding: '20px' }}>
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
                      {activeTab === 'list' && (isAdminUser ? 'Administration des Donations' : 'Mes Donations')}
                      {activeTab === 'payments' && 'Gestion des Paiements'}
                      {activeTab === 'recurring' &&
                        (isAdminUser ? 'Donations Récurrentes Globales' : 'Mes Donations Récurrentes')}
                      {activeTab === 'stats' && (isAdminUser ? 'Statistiques Globales' : 'Mes Statistiques')}
                    </h2>
                    <p style={{ margin: '8px 0 0 0', color: '#666', fontSize: 16 }}>
                      {activeTab === 'list' &&
                        (isAdminUser
                          ? 'Gérez toutes les donations et leur traitement'
                          : 'Consultez et gérez vos donations personnelles')}
                      {activeTab === 'payments' && 'Surveillez les paiements et transactions'}
                      {activeTab === 'recurring' &&
                        (isAdminUser
                          ? 'Administrez toutes les donations automatiques'
                          : 'Gérez vos donations automatiques')}
                      {activeTab === 'stats' &&
                        (isAdminUser
                          ? 'Analysez les performances globales'
                          : 'Consultez vos statistiques personnelles')}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <Button
                      type="default"
                      icon={<ReloadOutlined />}
                      onClick={handleRefresh}
                      loading={donationsLoading || (isAdminUser && paymentsLoading)}
                    >
                      Actualiser
                    </Button>

                    {isAdminUser && (
                      <Button
                        type={showAllDonations ? 'primary' : 'default'}
                        icon={<FilterOutlined />}
                        onClick={handleToggleShowAll}
                        ghost={showAllDonations}
                      >
                        {showAllDonations ? 'Toutes les donations' : 'Donations complétées'}
                      </Button>
                    )}

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

                {(donationsLoading || (isAdminUser && paymentsLoading)) && (
                  <Card size="small" style={{ marginBottom: 16, textAlign: 'center' }}>
                    <Spin />
                    <span style={{ marginLeft: 8 }}>Chargement des données...</span>
                  </Card>
                )}

                {isAdminUser && !showAllDonations && (
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

                {!isAdminUser && (
                  <Alert
                    message="Espace personnel des donations"
                    description="Ici vous pouvez consulter vos donations, créer de nouveaux dons et suivre vos contributions récurrentes."
                    type="success"
                    showIcon
                    closable
                    style={{ marginBottom: 16 }}
                    icon={<DollarOutlined />}
                  />
                )}

                <Row gutter={16} style={{ marginBottom: 24 }}>
                  <Col xs={24} sm={6}>
                    <Card size="small">
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 24, fontWeight: 600, color: '#52c41a' }}>{donations?.length || 0}</div>
                        <div style={{ color: '#666', fontSize: 12 }}>
                          {isAdminUser
                            ? showAllDonations
                              ? 'Total Donations'
                              : 'Donations Complétées'
                            : 'Mes Donations'}
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
