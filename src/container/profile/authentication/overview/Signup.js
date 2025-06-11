import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Form, Input, Button, Select } from 'antd';

import { useDispatch } from 'react-redux';
import { AuthFormWrap } from './style';
import { Checkbox } from '../../../../components/checkbox/checkbox';
import { register } from '../../../../redux/authentication/actionCreator';

function SignUp() {
  const dispatch = useDispatch();

  const [state, setState] = useState({
    values: null,
    checked: null,
  });
  const handleSubmit = (values) => {
    dispatch(register(values));
  };

  const onChange = (checked) => {
    setState({ ...state, checked });
  };

  return (
    <Row justify="center">
      <Col xxl={6} xl={8} md={12} sm={18} xs={24}>
        <AuthFormWrap>
          <div className="ninjadash-authentication-top">
            <h2 className="ninjadash-authentication-top__title">Créer un compte - PartenaireMAGB</h2>
          </div>
          <div className="ninjadash-authentication-content">
            <Form name="register" onFinish={handleSubmit} layout="vertical">
              {/* Noms */}
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Prénom"
                    name="firstName"
                    rules={[{ required: true, message: 'Veuillez saisir votre prénom!' }]}
                  >
                    <Input placeholder="Prénom" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Nom de famille"
                    name="lastName"
                    rules={[{ required: true, message: 'Veuillez saisir votre nom!' }]}
                  >
                    <Input placeholder="Nom de famille" />
                  </Form.Item>
                </Col>
              </Row>

              {/* Email */}
              <Form.Item
                name="email"
                label="Adresse email"
                rules={[
                  { required: true, message: 'Veuillez saisir votre email!' },
                  { type: 'email', message: 'Format email invalide!' },
                ]}
              >
                <Input placeholder="nom@exemple.com" />
              </Form.Item>

              {/* Téléphone */}
              <Form.Item
                name="phone"
                label="Numéro de téléphone"
                rules={[
                  { required: true, message: 'Veuillez saisir votre numéro!' },
                  { pattern: /^\+?[1-9]\d{1,14}$/, message: 'Format de téléphone invalide!' },
                ]}
              >
                <Input placeholder="+225 0779038069" />
              </Form.Item>

              {/* Localisation */}
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="country"
                    label="Pays"
                    rules={[{ required: true, message: 'Veuillez sélectionner votre pays!' }]}
                  >
                    <Select placeholder="Sélectionner le pays">
                      <Select.Option value="CI">Côte d&#39;Ivoire</Select.Option>
                      <Select.Option value="BF">Burkina Faso</Select.Option>
                      <Select.Option value="ML">Mali</Select.Option>
                      <Select.Option value="SN">Sénégal</Select.Option>
                      <Select.Option value="GH">Ghana</Select.Option>
                      <Select.Option value="FR">France</Select.Option>
                      <Select.Option value="CA">Canada</Select.Option>
                      <Select.Option value="US">États-Unis</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="city"
                    label="Ville"
                    rules={[{ required: true, message: 'Veuillez saisir votre ville!' }]}
                  >
                    <Input placeholder="Abidjan" />
                  </Form.Item>
                </Col>
              </Row>

              {/* Préférences */}
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="language" label="Langue préférée" initialValue="fr">
                    <Select>
                      <Select.Option value="fr">Français</Select.Option>
                      <Select.Option value="en">English</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="currency" label="Devise" initialValue="XOF">
                    <Select>
                      <Select.Option value="XOF">XOF (F CFA)</Select.Option>
                      <Select.Option value="EUR">EUR (Euro)</Select.Option>
                      <Select.Option value="USD">USD (Dollar)</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              {/* Mot de passe */}
              <Form.Item
                label="Mot de passe"
                name="password"
                rules={[
                  { required: true, message: 'Veuillez saisir un mot de passe!' },
                  { min: 8, message: 'Le mot de passe doit contenir au moins 8 caractères!' },
                ]}
              >
                <Input.Password placeholder="Mot de passe (min. 8 caractères)" />
              </Form.Item>

              {/* Confirmation mot de passe */}
              <Form.Item
                label="Confirmer le mot de passe"
                name="confirmPassword"
                dependencies={['password']}
                rules={[
                  { required: true, message: 'Veuillez confirmer votre mot de passe!' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Les mots de passe ne correspondent pas!'));
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="Confirmer le mot de passe" />
              </Form.Item>
              <div className="ninjadash-auth-extra-links">
                <Checkbox onChange={onChange} checked={state.checked}>
                  Créer un compte signifie que vous acceptez nos conditions d&#39;utilisation et notre politique de
                  confidentialité.
                </Checkbox>
              </div>
              <Form.Item>
                <Button
                  className="btn-create"
                  htmlType="submit"
                  type="primary"
                  size="large"
                  disabled={!state.checked}
                  block
                >
                  Créer mon compte
                </Button>
              </Form.Item>
            </Form>
          </div>
          <div className="ninjadash-authentication-bottom">
            <p>
              Vous avez déjà un compte ? <Link to="/">Se connecter</Link>
            </p>
          </div>
        </AuthFormWrap>
      </Col>
    </Row>
  );
}

export default SignUp;
