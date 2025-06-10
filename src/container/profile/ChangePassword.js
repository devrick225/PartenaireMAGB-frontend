import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Alert, message, Card, Divider, Typography, Space } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import {
  LockOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  SafetyOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { changePassword, requestPasswordReset } from '../../redux/profile/actionCreator';

const { Text, Title } = Typography;

function ChangePassword() {
  const [form] = Form.useForm();
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordRequirements, setPasswordRequirements] = useState({
    minLength: false,
    hasUpper: false,
    hasLower: false,
    hasNumber: false,
    hasSpecial: false,
  });
  const dispatch = useDispatch();

  const { changingPassword, passwordChangeSuccess, passwordChangeError } = useSelector((state) => ({
    changingPassword: state.profile.changingPassword,
    passwordChangeSuccess: state.profile.passwordChangeSuccess,
    passwordChangeError: state.profile.passwordChangeError,
  }));

  useEffect(() => {
    if (passwordChangeSuccess) {
      form.resetFields();
      message.success('Mot de passe modifié avec succès !');
    }
  }, [passwordChangeSuccess, form]);

  useEffect(() => {
    if (passwordChangeError) {
      message.error('Erreur lors du changement de mot de passe');
    }
  }, [passwordChangeError]);

  const checkPasswordStrength = (password) => {
    if (!password) {
      setPasswordStrength(0);
      setPasswordRequirements({
        minLength: false,
        hasUpper: false,
        hasLower: false,
        hasNumber: false,
        hasSpecial: false,
      });
      return;
    }

    const requirements = {
      minLength: password.length >= 8,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecial: /[!@#$%^&*()_+\-=\\[\]{};':"\\|,.<>/?]/.test(password),
    };

    setPasswordRequirements(requirements);

    const score = Object.values(requirements).filter(Boolean).length;
    setPasswordStrength(score);
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return '#ff4d4f';
    if (passwordStrength <= 3) return '#faad14';
    if (passwordStrength <= 4) return '#1890ff';
    return '#52c41a';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return 'Faible';
    if (passwordStrength <= 3) return 'Moyen';
    if (passwordStrength <= 4) return 'Bon';
    return 'Très fort';
  };

  const handleSubmit = async (values) => {
    try {
      await dispatch(
        changePassword({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        }),
      );
    } catch (error) {
      // L'erreur est gérée par le useEffect
    }
  };

  const handleForgotPassword = async () => {
    try {
      // On suppose qu'on a l'email dans le profil ou dans un contexte auth
      await dispatch(requestPasswordReset('user@email.com')); // Remplacer par l'email réel
      message.success('Email de réinitialisation envoyé !');
    } catch (error) {
      message.error("Erreur lors de l'envoi de l'email");
    }
  };

  function RequirementItem({ met, text }) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
        {met ? (
          <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
        ) : (
          <CloseCircleOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
        )}
        <Text style={{ color: met ? '#52c41a' : '#ff4d4f' }}>{text}</Text>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={4}>
          <LockOutlined style={{ marginRight: 8 }} />
          Changer votre mot de passe
        </Title>
        <Text type="secondary">Pour votre sécurité, choisissez un mot de passe fort et unique.</Text>
      </div>

      {passwordChangeError && (
        <Alert
          message="Erreur"
          description={passwordChangeError.message || "Une erreur s'est produite"}
          type="error"
          closable
          style={{ marginBottom: 24 }}
        />
      )}

      <Form form={form} layout="vertical" onFinish={handleSubmit} size="large">
        <Form.Item
          name="currentPassword"
          label="Mot de passe actuel"
          rules={[{ required: true, message: 'Veuillez saisir votre mot de passe actuel' }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Votre mot de passe actuel"
            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
          />
        </Form.Item>

        <Form.Item
          name="newPassword"
          label="Nouveau mot de passe"
          rules={[
            { required: true, message: 'Veuillez saisir un nouveau mot de passe' },
            { min: 8, message: 'Le mot de passe doit contenir au moins 8 caractères' },
            {
              validator: (_, value) => {
                if (!value) return Promise.resolve();
                const hasUpper = /[A-Z]/.test(value);
                const hasLower = /[a-z]/.test(value);
                const hasNumber = /\d/.test(value);
                const hasSpecial = /[!@#$%^&*()_+\-=\\[\]{};':"\\|,.<>\\/?]/.test(value);

                if (hasUpper && hasLower && hasNumber && hasSpecial) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error(
                    'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial',
                  ),
                );
              },
            },
          ]}
        >
          <Input.Password
            prefix={<SafetyOutlined />}
            placeholder="Votre nouveau mot de passe"
            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            onChange={(e) => checkPasswordStrength(e.target.value)}
          />
        </Form.Item>

        {/* Indicateur de force du mot de passe */}
        <Form.Item>
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text strong>Force du mot de passe :</Text>
              <Text style={{ color: getPasswordStrengthColor() }}>{getPasswordStrengthText()}</Text>
            </div>
            <div
              style={{
                height: 6,
                backgroundColor: '#f0f0f0',
                borderRadius: 3,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${(passwordStrength / 5) * 100}%`,
                  backgroundColor: getPasswordStrengthColor(),
                  transition: 'all 0.3s ease',
                }}
              />
            </div>
          </div>
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="Confirmer le nouveau mot de passe"
          dependencies={['newPassword']}
          rules={[
            { required: true, message: 'Veuillez confirmer votre nouveau mot de passe' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Les mots de passe ne correspondent pas'));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Confirmez votre nouveau mot de passe"
            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0 }}>
          <Space>
            <Button type="primary" htmlType="submit" loading={changingPassword} size="large">
              {changingPassword ? 'Modification...' : 'Changer le mot de passe'}
            </Button>
            <Button type="link" onClick={handleForgotPassword}>
              Mot de passe oublié ?
            </Button>
          </Space>
        </Form.Item>
      </Form>

      <Divider />

      {/* Exigences du mot de passe */}
      <Card title="Exigences du mot de passe" size="small" style={{ marginTop: 24 }}>
        <RequirementItem met={passwordRequirements.minLength} text="Au moins 8 caractères" />
        <RequirementItem met={passwordRequirements.hasUpper} text="Au moins une lettre majuscule (A-Z)" />
        <RequirementItem met={passwordRequirements.hasLower} text="Au moins une lettre minuscule (a-z)" />
        <RequirementItem met={passwordRequirements.hasNumber} text="Au moins un chiffre (0-9)" />
        <RequirementItem met={passwordRequirements.hasSpecial} text="Au moins un caractère spécial (!@#$%^&*)" />
      </Card>

      {/* Conseils de sécurité */}
      <Card title="Conseils de sécurité" size="small" style={{ marginTop: 16 }}>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>N&#39;utilisez jamais le même mot de passe sur plusieurs sites</li>
          <li>Évitez d&#39;utiliser des informations personnelles dans votre mot de passe</li>
          <li>Changez votre mot de passe régulièrement</li>
          <li>Utilisez un gestionnaire de mots de passe pour plus de sécurité</li>
          <li>Activez l&#39;authentification à deux facteurs quand c&#39;est possible</li>
        </ul>
      </Card>
    </div>
  );
}

export default ChangePassword;
