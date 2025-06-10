import React from 'react';
import { Menu, Button, Dropdown } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  UnorderedListOutlined,
  PlusOutlined,
  SettingOutlined,
  BugOutlined,
  MoreOutlined,
} from '@ant-design/icons';

function SupportNavigation() {
  const location = useLocation();
  const currentPath = location.pathname;

  const menuItems = [
    {
      key: '/admin/support',
      icon: <DashboardOutlined />,
      label: <Link to="/admin/support">Tableau de bord avancé</Link>,
    },
    {
      key: '/admin/support/tickets',
      icon: <UnorderedListOutlined />,
      label: <Link to="/admin/support/tickets">Liste des tickets</Link>,
    },
    {
      key: '/admin/support/new',
      icon: <PlusOutlined />,
      label: <Link to="/admin/support/new">Nouveau ticket</Link>,
    },
  ];

  const additionalMenuItems = [
    {
      key: 'legacy',
      icon: <BugOutlined />,
      label: <Link to="/admin/support/legacy">Vue classique</Link>,
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Paramètres support',
      disabled: true,
    },
  ];

  const dropdownMenu = (
    <Menu>
      {additionalMenuItems.map((item) => (
        <Menu.Item key={item.key} icon={item.icon} disabled={item.disabled}>
          {item.label}
        </Menu.Item>
      ))}
    </Menu>
  );

  // Déterminer l'élément actuel sélectionné
  const selectedKey =
    menuItems.find(
      (item) =>
        currentPath === item.key ||
        (item.key === '/admin/support' && currentPath.startsWith('/admin/support/dashboard')),
    )?.key || currentPath;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 0',
        borderBottom: '1px solid #f0f0f0',
        marginBottom: '16px',
      }}
    >
      <Menu mode="horizontal" selectedKeys={[selectedKey]} style={{ border: 'none', flex: 1 }} items={menuItems} />

      <Dropdown overlay={dropdownMenu} placement="bottomRight">
        <Button type="text" icon={<MoreOutlined />}>
          Plus
        </Button>
      </Dropdown>
    </div>
  );
}

export default SupportNavigation;
