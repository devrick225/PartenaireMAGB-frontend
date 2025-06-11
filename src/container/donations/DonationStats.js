/* eslint no-underscore-dangle: 0 */
import React, { useEffect, useState, useCallback } from 'react';
import { Card, Row, Col, Statistic, Typography, DatePicker, Select, Space, Button, Alert, Spin } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { DollarOutlined, TeamOutlined, BarChartOutlined, LineChartOutlined, SyncOutlined } from '@ant-design/icons';
import moment from 'moment';
import { donationStatsReadData } from '../../redux/donations/actionCreator';

const { Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

function DonationStats() {
  const [dateRange, setDateRange] = useState([moment().subtract(30, 'days'), moment()]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const dispatch = useDispatch();

  const { stats, statsLoading, statsError } = useSelector((state) => ({
    stats: state.donations.stats,
    statsLoading: state.donations.statsLoading,
    statsError: state.donations.statsError,
  }));

  // Mémoriser loadStats avec useCallback pour éviter les re-renders excessifs
  const loadStats = useCallback(() => {
    const filters = {};

    // Ajouter la période sélectionnée
    if (selectedPeriod && selectedPeriod !== 'custom') {
      filters.period = selectedPeriod;
    }

    // Si période custom, utiliser les dates
    if (selectedPeriod === 'custom' && dateRange && dateRange.length === 2) {
      filters.dateFrom = dateRange[0].format('YYYY-MM-DD');
      filters.dateTo = dateRange[1].format('YYYY-MM-DD');
    }

    if (selectedCategory) {
      filters.category = selectedCategory;
    }

    dispatch(donationStatsReadData(filters));
  }, [dispatch, selectedPeriod, selectedCategory, dateRange]);

  // useEffect principal pour charger les stats
  useEffect(() => {
    loadStats();
  }, [loadStats]);

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

  const categoryColors = {
    tithe: '#52c41a',
    offering: '#1890ff',
    building: '#fa8c16',
    missions: '#722ed1',
    charity: '#eb2f96',
    education: '#13c2c2',
    youth: '#faad14',
    women: '#f759ab',
    men: '#597ef7',
    special: '#ff7a45',
    emergency: '#ff4d4f',
  };

  // Fonction pour adapter les données du backend
  const adaptBackendData = (backendStats) => {
    if (!backendStats) return null;

    return {
      totalAmount: backendStats.totalAmount || 0,
      totalCount: backendStats.totalCount || 0,
      averageAmount: backendStats.averageAmount || 0,
      activeRecurringDonations: backendStats.activeRecurringDonations || 0,
      categoryStats: Array.isArray(backendStats.categoriesBreakdown)
        ? backendStats.categoriesBreakdown.map((item) => ({
            category: item._id,
            amount: item.totalAmount || 0,
            count: item.count || 0,
          }))
        : [],
      monthlyStats: Array.isArray(backendStats.monthlyEvolution) ? backendStats.monthlyEvolution : [],
    };
  };

  const currentStats = adaptBackendData(stats);
  const hasData = currentStats && currentStats.totalCount > 0;

  const topCategory =
    currentStats?.categoryStats?.length > 0
      ? currentStats.categoryStats.reduce((prev, current) => (prev.amount > current.amount ? prev : current))
      : null;

  if (statsError) {
    return (
      <div>
        <Alert
          message="Erreur de chargement"
          description="Impossible de charger les statistiques. Veuillez réessayer."
          type="error"
          showIcon
          action={
            <Button size="small" onClick={loadStats}>
              Réessayer
            </Button>
          }
          style={{ marginBottom: 16 }}
        />
      </div>
    );
  }

  return (
    <div>
      {/* Filtres */}
      <Card size="small" style={{ marginBottom: 24 }}>
        <Row gutter={16} align="middle">
          <Col xs={24} sm={6}>
            <Space>
              <Text strong>Période :</Text>
              <Select value={selectedPeriod} onChange={setSelectedPeriod} style={{ width: 140 }}>
                <Option value="week">Cette semaine</Option>
                <Option value="month">Ce mois</Option>
                <Option value="year">Cette année</Option>
                <Option value="all">Tout</Option>
                <Option value="custom">Personnalisée</Option>
              </Select>
            </Space>
          </Col>

          {selectedPeriod === 'custom' && (
            <Col xs={24} sm={8}>
              <Space>
                <Text strong>Dates :</Text>
                <RangePicker value={dateRange} onChange={setDateRange} format="DD/MM/YYYY" />
              </Space>
            </Col>
          )}

          <Col xs={24} sm={6}>
            <Space>
              <Text strong>Catégorie :</Text>
              <Select
                placeholder="Toutes"
                allowClear
                style={{ width: 150 }}
                value={selectedCategory}
                onChange={setSelectedCategory}
              >
                {Object.entries(categoryLabels).map(([value, label]) => (
                  <Option key={value} value={value}>
                    {label}
                  </Option>
                ))}
              </Select>
            </Space>
          </Col>

          <Col xs={24} sm={4}>
            <Button type="primary" icon={<SyncOutlined />} onClick={loadStats} loading={statsLoading}>
              Actualiser
            </Button>
          </Col>
        </Row>
      </Card>

      {statsLoading ? (
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Spin size="large" />
          <br />
          <Text type="secondary">Chargement des statistiques...</Text>
        </div>
      ) : (
        <>
          {!hasData ? (
            <Alert
              message="Aucune donnée"
              description="Aucune donation trouvée pour la période sélectionnée."
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />
          ) : (
            <>
              {/* Métriques principales */}
              <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={6}>
                  <Card>
                    <Statistic
                      title="Montant total"
                      value={currentStats.totalAmount}
                      formatter={(value) =>
                        new Intl.NumberFormat('fr-FR', {
                          style: 'currency',
                          currency: 'XOF',
                          minimumFractionDigits: 0,
                        }).format(value)
                      }
                      prefix={<DollarOutlined />}
                      valueStyle={{ color: '#52c41a', fontSize: '24px' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={6}>
                  <Card>
                    <Statistic
                      title="Nombre de donations"
                      value={currentStats.totalCount}
                      prefix={<TeamOutlined />}
                      valueStyle={{ color: '#1890ff', fontSize: '24px' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={6}>
                  <Card>
                    <Statistic
                      title="Montant moyen"
                      value={currentStats.averageAmount}
                      formatter={(value) =>
                        new Intl.NumberFormat('fr-FR', {
                          style: 'currency',
                          currency: 'XOF',
                          minimumFractionDigits: 0,
                        }).format(value)
                      }
                      prefix={<BarChartOutlined />}
                      valueStyle={{ color: '#faad14', fontSize: '24px' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={6}>
                  <Card>
                    <Statistic
                      title="Récurrentes actives"
                      value={currentStats.activeRecurringDonations}
                      prefix={<SyncOutlined />}
                      valueStyle={{ color: '#722ed1', fontSize: '24px' }}
                    />
                  </Card>
                </Col>
              </Row>

              <Row gutter={16}>
                {/* Répartition par catégorie */}
                <Col xs={24} lg={12}>
                  <Card title="Répartition par catégorie" style={{ marginBottom: 16 }}>
                    {currentStats.categoryStats &&
                    Array.isArray(currentStats.categoryStats) &&
                    currentStats.categoryStats.length > 0 ? (
                      <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                        {currentStats.categoryStats.map((item, index) => {
                          const total = currentStats.totalAmount || 0;
                          const itemAmount = item.amount || 0;
                          const percentage = total > 0 ? ((itemAmount / total) * 100).toFixed(1) : 0;

                          return (
                            <div key={`${item.category}-${index}`} style={{ marginBottom: 16 }}>
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  marginBottom: 4,
                                }}
                              >
                                <Text strong>{categoryLabels[item.category] || item.category}</Text>
                                <Text>{percentage}%</Text>
                              </div>
                              <div
                                style={{
                                  width: '100%',
                                  height: 8,
                                  backgroundColor: '#f0f0f0',
                                  borderRadius: 4,
                                  overflow: 'hidden',
                                }}
                              >
                                <div
                                  style={{
                                    width: `${percentage}%`,
                                    height: '100%',
                                    backgroundColor: categoryColors[item.category] || '#1890ff',
                                    transition: 'width 0.3s ease',
                                  }}
                                />
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                  {new Intl.NumberFormat('fr-FR', {
                                    style: 'currency',
                                    currency: 'XOF',
                                    minimumFractionDigits: 0,
                                  }).format(itemAmount)}
                                </Text>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                  {item.count || 0} donation{(item.count || 0) > 1 ? 's' : ''}
                                </Text>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', padding: 20 }}>
                        <Text type="secondary">Aucune donnée de catégorie disponible</Text>
                      </div>
                    )}
                  </Card>
                </Col>

                {/* Évolution mensuelle */}
                <Col xs={24} lg={12}>
                  <Card title="Évolution mensuelle" style={{ marginBottom: 16 }}>
                    {currentStats.monthlyStats &&
                    Array.isArray(currentStats.monthlyStats) &&
                    currentStats.monthlyStats.length > 0 ? (
                      <div style={{ marginTop: 16 }}>
                        {currentStats.monthlyStats.map((item, index) => (
                          <div
                            key={`${item?._id?.month}-${item?._id?.year}-${index}`}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              padding: '8px 0',
                              borderBottom: index < currentStats.monthlyStats.length - 1 ? '1px solid #f0f0f0' : 'none',
                            }}
                          >
                            <Text>
                              {item?._id?.month || 'N/A'}/{item?._id?.year || 'N/A'}
                            </Text>
                            <Space>
                              <Text strong>
                                {new Intl.NumberFormat('fr-FR', {
                                  style: 'currency',
                                  currency: 'XOF',
                                  minimumFractionDigits: 0,
                                }).format(item?.totalAmount || 0)}
                              </Text>
                              <Text type="secondary">({item?.count || 0})</Text>
                            </Space>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '40px 0' }}>
                        <LineChartOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />
                        <br />
                        <Text type="secondary">Aucune donnée d&#39;évolution disponible</Text>
                      </div>
                    )}
                  </Card>
                </Col>
              </Row>

              {/* Insights basés sur les vraies données */}
              <Card title="Résumé et insights">
                <Row gutter={16}>
                  {currentStats.totalAmount > 0 && (
                    <Col xs={24} md={8}>
                      <Card size="small" style={{ backgroundColor: '#f6ffed', border: '1px solid #b7eb8f' }}>
                        <Text strong style={{ color: '#52c41a' }}>
                          💰 Total collecté
                        </Text>
                        <br />
                        <Text>
                          {new Intl.NumberFormat('fr-FR', {
                            style: 'currency',
                            currency: 'XOF',
                            minimumFractionDigits: 0,
                          }).format(currentStats.totalAmount)}
                        </Text>
                      </Card>
                    </Col>
                  )}

                  {topCategory && topCategory.category && (
                    <Col xs={24} md={8}>
                      <Card size="small" style={{ backgroundColor: '#fff7e6', border: '1px solid #ffd591' }}>
                        <Text strong style={{ color: '#fa8c16' }}>
                          🏆 Catégorie principale
                        </Text>
                        <br />
                        <Text>{categoryLabels[topCategory.category] || topCategory.category}</Text>
                      </Card>
                    </Col>
                  )}

                  {currentStats.activeRecurringDonations > 0 && (
                    <Col xs={24} md={8}>
                      <Card size="small" style={{ backgroundColor: '#f0f5ff', border: '1px solid #adc6ff' }}>
                        <Text strong style={{ color: '#1890ff' }}>
                          🔄 Donations récurrentes
                        </Text>
                        <br />
                        <Text>{currentStats.activeRecurringDonations} actives</Text>
                      </Card>
                    </Col>
                  )}
                </Row>
              </Card>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default DonationStats;
