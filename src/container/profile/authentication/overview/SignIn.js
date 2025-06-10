import { Button, Col, Form, Input, Row, Alert } from 'antd';
import React, { useCallback, useState, useEffect } from 'react';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

import { useDispatch, useSelector } from 'react-redux';
import { Link, NavLink, useNavigate } from 'react-router-dom';
// eslint-disable-next-line import/no-extraneous-dependencies
import { AuthFormWrap } from './style';
import { login, clearAuthError } from '../../../../redux/authentication/actionCreator';
import { Checkbox } from '../../../../components/checkbox/checkbox';

function SignIn() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => ({
    isLoading: state.auth.loading,
    error: state.auth.error,
  }));
  const [form] = Form.useForm();
  const [state, setState] = useState({
    checked: false,
  });

  // Nettoyer les erreurs au montage du composant
  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  const handleSubmit = useCallback(
    (values) => {
      dispatch(clearAuthError());
      dispatch(login(values, () => navigate('/admin')));
    },
    [navigate, dispatch],
  );

  const onChange = (checked) => {
    setState({ ...state, checked });
  };

  return (
    <Row justify="center">
      <Col xxl={6} xl={8} md={12} sm={18} xs={24}>
        <AuthFormWrap>
          <div className="ninjadash-authentication-top">
            <h2 className="ninjadash-authentication-top__title">Connexion - PartenaireMAGB</h2>
            <p style={{ textAlign: 'center', color: '#666', marginTop: 8 }}>
              Connectez-vous à votre compte pour continuer
            </p>
          </div>

          <div className="ninjadash-authentication-content">
            {error && (
              <Alert
                message="Erreur de connexion"
                description={error}
                type="error"
                closable
                style={{ marginBottom: 24 }}
                onClose={() => dispatch(clearAuthError())}
              />
            )}

            <Form name="login" form={form} onFinish={handleSubmit} layout="vertical">
              <Form.Item
                name="email"
                label="Adresse email"
                rules={[
                  { required: true, message: 'Veuillez saisir votre email' },
                  { type: 'email', message: "Format d'email invalide" },
                ]}
              >
                <Input prefix={<UserOutlined />} placeholder="votre-email@exemple.com" size="large" />
              </Form.Item>

              <Form.Item
                name="password"
                label="Mot de passe"
                rules={[{ required: true, message: 'Veuillez saisir votre mot de passe' }]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="Votre mot de passe" size="large" />
              </Form.Item>

              <div className="ninjadash-auth-extra-links">
                <Checkbox onChange={onChange} checked={state.checked}>
                  Se souvenir de moi
                </Checkbox>
                <NavLink className="forgot-pass-link" to="/forgotPassword">
                  Mot de passe oublié ?
                </NavLink>
              </div>

              <Form.Item style={{ marginBottom: 0 }}>
                <Button className="btn-signin" htmlType="submit" type="primary" size="large" loading={isLoading} block>
                  {isLoading ? 'Connexion en cours...' : 'Se connecter'}
                </Button>
              </Form.Item>
            </Form>
          </div>

          <div className="ninjadash-authentication-bottom">
            <p style={{ textAlign: 'center' }}>
              Pas encore de compte ? <Link to="/register">Créer un compte</Link>
            </p>
          </div>
        </AuthFormWrap>
      </Col>
    </Row>
  );
}

export default SignIn;
