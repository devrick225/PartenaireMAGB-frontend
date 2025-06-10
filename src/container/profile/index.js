import React, { useEffect, useState } from 'react';
import { Row, Col, Tabs, Spin, message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { UserOutlined, LockOutlined, BellOutlined, SettingOutlined, FileTextOutlined } from '@ant-design/icons';
import ProfileComplete from './ProfileComplete';
import ChangePassword from './ChangePassword';
import NotificationSettings from './NotificationSettings';
import SecuritySettings from './SecuritySettings';
import AccountSettings from './AccountSettings';
import DataPrivacy from './DataPrivacy';
import { profileReadData } from '../../redux/profile/actionCreator';
import { Cards } from '../../components/cards/frame/cards-frame';
import { Main } from '../styled';
import { PageHeader } from '../../components/page-headers/page-headers';

function Profile() {
  const [activeTab, setActiveTab] = useState('info');
  const dispatch = useDispatch();

  const { profile, loading, error } = useSelector((state) => ({
    profile: state.profile.profile,
    loading: state.profile.loading,
    error: state.profile.error,
  }));

  const PageRoutes = [
    {
      path: 'index',
      breadcrumbName: 'Tableau de bord',
    },
    {
      path: '',
      breadcrumbName: 'Mon Profil',
    },
  ];

  useEffect(() => {
    if (dispatch) {
      dispatch(profileReadData());
    }
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      message.error('Erreur lors du chargement du profil');
    }
  }, [error]);

  const tabItems = [
    {
      key: 'info',
      label: (
        <span>
          <UserOutlined />
          Informations personnelles
        </span>
      ),
      children: <ProfileComplete profile={profile} />,
    },
    {
      key: 'password',
      label: (
        <span>
          <LockOutlined />
          Mot de passe
        </span>
      ),
      children: <ChangePassword />,
    },
    {
      key: 'notifications',
      label: (
        <span>
          <BellOutlined />
          Notifications
        </span>
      ),
      children: <NotificationSettings profile={profile} />,
    },
    {
      key: 'security',
      label: (
        <span>
          <SettingOutlined />
          Sécurité
        </span>
      ),
      children: <SecuritySettings profile={profile} />,
    },
    {
      key: 'account',
      label: (
        <span>
          <SettingOutlined />
          Paramètres du compte
        </span>
      ),
      children: <AccountSettings profile={profile} />,
    },
    {
      key: 'privacy',
      label: (
        <span>
          <FileTextOutlined />
          Données et confidentialité
        </span>
      ),
      children: <DataPrivacy profile={profile} />,
    },
  ];

  if (loading) {
    return (
      <>
        <PageHeader className="ninjadash-page-header-main" title="Mon Profil" routes={PageRoutes} />
        <Main>
          <div style={{ textAlign: 'center', marginTop: 50 }}>
            <Spin size="large" tip="Chargement du profil..." />
          </div>
        </Main>
      </>
    );
  }

  return (
    <>
      <PageHeader className="ninjadash-page-header-main" title="Mon Profil" routes={PageRoutes} />
      <Main>
        <Row gutter={25}>
          <Col span={24}>
            <Cards headless>
              <div style={{ padding: '20px' }}>
                {/* Header du profil */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: 30,
                    padding: '20px 0',
                    borderBottom: '1px solid #f0f0f0',
                  }}
                >
                  <div
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      backgroundColor: '#f0f0f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 20,
                      overflow: 'hidden',
                    }}
                  >
                    {profile?.user?.avatar || profile?.avatar ? (
                      <img
                        src={profile?.user?.avatar || profile?.avatar}
                        alt="Avatar"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <UserOutlined style={{ fontSize: 32, color: '#999' }} />
                    )}
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>
                      {profile?.user?.firstName || profile?.firstName} {profile?.user?.lastName || profile?.lastName}
                    </h2>
                    <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: 16 }}>
                      {profile?.user?.email || profile?.email}
                    </p>
                    <p style={{ margin: '4px 0 0 0', color: '#999', fontSize: 14 }}>
                      Membre depuis{' '}
                      {profile?.user?.createdAt || profile?.createdAt
                        ? new Date(profile?.user?.createdAt || profile?.createdAt).toLocaleDateString('fr-FR')
                        : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Onglets */}
                <Tabs
                  activeKey={activeTab}
                  onChange={setActiveTab}
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

export default Profile;
