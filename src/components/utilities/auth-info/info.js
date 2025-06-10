import UilAngleDown from '@iconscout/react-unicons/icons/uil-angle-down';
import UilSignout from '@iconscout/react-unicons/icons/uil-signout';
import UilUser from '@iconscout/react-unicons/icons/uil-user';
import { Avatar } from 'antd';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

import { InfoWraper, NavAuth, UserDropDwon } from './auth-info-style';
import Message from './Message';
import Notification from './Notification';
import Search from './Search';
import Settings from './settings';
import { logOut } from '../../../redux/authentication/actionCreator';
import { getItem } from '../../../utility/localStorageControl';
import { Dropdown } from '../../dropdown/dropdown';
import Heading from '../../heading/heading';
import { Popover } from '../../popup/popup';

const AuthInfo = React.memo(() => {
  const dispatch = useDispatch();
  const user = getItem('user');

  const [state, setState] = useState({
    flag: 'en',
  });
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const { flag } = state;

  const SignOut = (e) => {
    e.preventDefault();

    dispatch(logOut(() => navigate('/')));
  };

  const userContent = (
    <UserDropDwon>
      <div className="user-dropdwon">
        <figure className="user-dropdwon__info">
          <img src={require('../../../static/img/avatar/chat-auth.png')} alt="" />
          <figcaption>
            <Heading as="h5">
              {user?.lastName} {user?.firstName}
            </Heading>
            <p>{user?.role}</p>
          </figcaption>
        </figure>
        <ul className="user-dropdwon__links">
          <li>
            <Link to="/admin/profile">
              <UilUser /> Mon Profil
            </Link>
          </li>
          <li>
            <Link to="/admin/profile-settings/profile">
              <UilUser /> Paramètres (Ancien)
            </Link>
          </li>
        </ul>
        <Link className="user-dropdwon__bottomAction" onClick={SignOut} to="#">
          <UilSignout /> Se deconnecter
        </Link>
      </div>
    </UserDropDwon>
  );

  const onFlagChangeHandle = (value, e) => {
    e.preventDefault();
    setState({
      ...state,
      flag: value,
    });
    i18n.changeLanguage(value);
  };

  const country = (
    <NavAuth>
      <Link onClick={(e) => onFlagChangeHandle('en', e)} to="#">
        <img src={require('../../../static/img/flag/en.png')} alt="" />
        <span>English</span>
      </Link>
      <Link onClick={(e) => onFlagChangeHandle('esp', e)} to="#">
        <img src={require('../../../static/img/flag/esp.png')} alt="" />
        <span>Spanish</span>
      </Link>
      <Link onClick={(e) => onFlagChangeHandle('ar', e)} to="#">
        <img src={require('../../../static/img/flag/ar.png')} alt="" />
        <span>Arabic</span>
      </Link>
    </NavAuth>
  );

  return (
    <InfoWraper>
      <Search />
      <Message />
      <Notification />
      <Settings />
      <div className="ninjadash-nav-actions__item ninjadash-nav-actions__language">
        <Dropdown placement="bottomRight" content={country} trigger="click">
          <Link to="#" className="ninjadash-nav-action-link">
            <img src={require(`../../../static/img/flag/${flag}.png`)} alt="" />
          </Link>
        </Dropdown>
      </div>
      <div className="ninjadash-nav-actions__item ninjadash-nav-actions__author">
        <Popover placement="bottomRight" content={userContent} action="click">
          <Link to="#" className="ninjadash-nav-action-link">
            <Avatar src="https://cdn0.iconfinder.com/data/icons/user-pictures/100/matureman1-512.png" />
            <span className="ninjadash-nav-actions__author--name">
              {user?.lastName} {user?.firstName}
            </span>
            <UilAngleDown />
          </Link>
        </Popover>
      </div>
    </InfoWraper>
  );
});

export default AuthInfo;
