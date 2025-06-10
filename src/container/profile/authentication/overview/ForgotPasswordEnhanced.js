import { Button, Col, Form, Input, Row, Alert, Result } from 'antd';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MailOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { AuthFormWrap } from './style';
import { forgotPassword, clearAuthError } from '../../../../redux/authentication/actionCreator';

function ForgotPasswordEnhanced() {
  const dispatch = useDispatch();
  const { loading, error, message } = useSelector((state) => ({
    loading: state.auth.forgettingPassword,
    error: state.auth.error,
    message: state.auth.message,
  }));

  const [form] = Form.useForm();
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  const handleSubmit = async (values) => {
    try {
      await dispatch(forgotPassword(values.email));
      setEmailSent(true);
    } catch (err) {
      console.error('Erreur forgot password:', err);
    }
  };

  if (emailSent && message) {
    return (
      <Row justify="center">
        <Col xxl={8} xl={10} md={14} sm={20} xs={24}>
          <AuthFormWrap>
            <Result
              status="success"
              title="Email envoyé !"
              subTitle={message}
              extra={[
                <Link to="/" key="signin">
                  <Button type="primary" icon={<ArrowLeftOutlined />}>
                    Retour à la connexion
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
            <h2 className="ninjadash-authentication-top__title">Mot de passe oublié ?</h2>
            <p style={{ textAlign: 'center', color: '#666', marginTop: 8 }}>
              Saisissez votre adresse email pour recevoir les instructions de réinitialisation
            </p>
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

            <Form name="forgotPass" form={form} onFinish={handleSubmit} layout="vertical">
              <Form.Item
                name="email"
                label="Adresse email"
                rules={[
                  { required: true, message: 'Veuillez saisir votre email' },
                  { type: 'email', message: "Format d'email invalide" },
                ]}
              >
                <Input prefix={<MailOutlined />} placeholder="votre-email@exemple.com" size="large" />
              </Form.Item>

              <Form.Item style={{ marginBottom: 16 }}>
                <Button className="btn-reset" htmlType="submit" type="primary" size="large" loading={loading} block>
                  {loading ? 'Envoi en cours...' : 'Envoyer les instructions'}
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

export default ForgotPasswordEnhanced;
