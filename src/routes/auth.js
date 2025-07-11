import React, { lazy, useEffect } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import AuthLayout from '../container/profile/authentication/Index';

const ForgotPass = lazy(() => import('../container/profile/authentication/overview/ForgotPasswordEnhanced'));
const ResetPassword = lazy(() => import('../container/profile/authentication/overview/ResetPassword'));
const Login = lazy(() => import('../container/profile/authentication/overview/SignIn'));
const SignUp = lazy(() => import('../container/profile/authentication/overview/Signup'));
// const NotFound = lazy(() => import('../container/pages/404'));

const AuthRoot = () => {
  const navigate = useNavigate();

  useEffect(() => navigate('/'));
};

const FrontendRoutes = React.memo(() => {
  return (
    <Routes>
      <Route index element={<Login />} />
      <Route path="forgotPassword" element={<ForgotPass />} />
      <Route path="reset-password/:token" element={<ResetPassword />} />
      <Route path="register" element={<SignUp />} />
      {/* <Route path="*" element={<NotFound />} /> */}
      <Route path="*" element={<AuthRoot />} />
    </Routes>
  );
});

export default AuthLayout(FrontendRoutes);
