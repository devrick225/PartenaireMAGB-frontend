import { Button, Col, Form, Input, Row, Alert, Result } from 'antd';
import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { LockOutlined, ArrowLeftOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { AuthFormWrap } from './style';
import { resetPassword, clearAuthError } from '../../../../redux/authentication/actionCreator';

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { loading, error, message } = useSelector((state) => ({
    loading: state.auth.resettingPassword,
    error: state.auth.error,
    message: state.auth.message,
  }));

  const [form] = Form.useForm();
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }
    dispatch(clearAuthError());
  }, [dispatch, token, navigate]);

  const handleSubmit = async (values) => {
    try {
      await dispatch(
        resetPassword(token, values.password, () => {
          setResetSuccess(true);
          setTimeout(() => {
            navigate('/');
          }, 3000);
        }),
      );
    } catch (err) {
      console.error('Erreur reset password:', err);
    }
  };

  const validatePassword = (_, value) => {
    if (!value) {
      return Promise.reject(new Error('Veuillez saisir un mot de passe'));
    }
    if (value.length < 8) {
      return Promise.reject(new Error('Le mot de passe doit contenir au moins 8 caractères'));
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
      return Promise.reject(
        new Error('Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'),
      );
    }
    return Promise.resolve();
  };

  const validateConfirmPassword = (_, value) => {
    const password = form.getFieldValue('password');
    if (!value) {
      return Promise.reject(new Error('Veuillez confirmer votre mot de passe'));
    }
    if (value !== password) {
      return Promise.reject(new Error('Les mots de passe ne correspondent pas'));
    }
    return Promise.resolve();
  };

  if (resetSuccess && message) {
    return (
      <Row justify="center">
        <Col xxl={8} xl={10} md={14} sm={20} xs={24}>
          <AuthFormWrap>
            <Result
              status="success"
              title="Mot de passe réinitialisé !"
              subTitle={`${message} Redirection automatique vers la page de connexion...`}
              icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              extra={[
                <Link to="/" key="signin">
                  <Button type="primary" icon={<ArrowLeftOutlined />}>
                    Connexion immédiate
                  </Button>
                </Link>,
              ]}
            />
          </AuthFormWrap>
        </Col>
      </Row>
    );
  }

  return (
    <Row justify="center">
      <Col xxl={6} xl={8} md={12} sm={18} xs={24}>
        <AuthFormWrap>
          <div className="ninjadash-authentication-top">
            <h2 className="ninjadash-authentication-top__title">Nouveau mot de passe</h2>
            <p style={{ textAlign: 'center', color: '#666', marginTop: 8 }}>Saisissez votre nouveau mot de passe</p>
          </div>

          <div className="ninjadash-authentication-content">
            {error && (
              <Alert
                message="Erreur"
                description={error}
                type="error"
                closable
                style={{ marginBottom: 24 }}
                onClose={() => dispatch(clearAuthError())}
              />
            )}

            <Form name="resetPassword" form={form} onFinish={handleSubmit} layout="vertical">
              <Form.Item
                name="password"
                label="Nouveau mot de passe"
                rules={[{ validator: validatePassword }]}
                hasFeedback
              >
                <Input.Password prefix={<LockOutlined />} placeholder="Nouveau mot de passe" size="large" />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="Confirmer le mot de passe"
                rules={[{ validator: validateConfirmPassword }]}
                hasFeedback
              >
                <Input.Password prefix={<LockOutlined />} placeholder="Confirmer le mot de passe" size="large" />
              </Form.Item>

              <div style={{ marginBottom: 16, padding: 12, background: '#f6f8fa', borderRadius: 6 }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: 14 }}>Exigences du mot de passe :</h4>
                <ul style={{ margin: 0, paddingLeft: 20, fontSize: 12, color: '#666' }}>
                  <li>Au moins 8 caractères</li>
                  <li>Au moins une lettre minuscule</li>
                  <li>Au moins une lettre majuscule</li>
                  <li>Au moins un chiffre</li>
                </ul>
              </div>

              <Form.Item style={{ marginBottom: 16 }}>
                <Button htmlType="submit" type="primary" size="large" loading={loading} block>
                  {loading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
                </Button>
              </Form.Item>
            </Form>
          </div>

          <div className="ninjadash-authentication-bottom">
            <p style={{ textAlign: 'center' }}>
              <Link to="/" style={{ display: 'inline-flex', alignItems: 'center' }}>
                <ArrowLeftOutlined style={{ marginRight: 8 }} />
                Retour à la connexion
              </Link>
            </p>
          </div>
        </AuthFormWrap>
      </Col>
    </Row>
  );
}

export default ResetPassword;
