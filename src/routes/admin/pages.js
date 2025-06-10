import React, { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

// Import du système de protection des routes
import ProtectedRoute, { ROLES } from '../../components/utilities/protectedRoute';

const BlankPage = lazy(() => import('../../container/pages/BlankPage'));
const Users = lazy(() => import('../../container/users'));

// Système de support complet avec routes dédiées
const SupportsRoute = lazy(() => import('./supports'));

// Composants supports individuels pour compatibilité
// const Supports = lazy(() => import('../../container/supports'));

// Nouveau système de profil complet
const Profile = lazy(() => import('../../container/profile'));

// Ancien système de profil (si besoin de compatibilité)
const ProfileSettings = lazy(() => import('../../container/profile/settings/Settings'));

// Système de donations
const Donations = lazy(() => import('../../container/donations'));

// Composant de test pour debug (développement) const DonationCreateDebug = lazy(() => import('../../container/donations/DonationCreateDebug'));

// Pages de retour de paiement
const PaymentSuccess = lazy(() => import('../../container/donations/PaymentSuccess'));
const PaymentFailure = lazy(() => import('../../container/donations/PaymentFailure'));
const PaymentCancel = lazy(() => import('../../container/donations/PaymentCancel'));

function PagesRoute() {
  return (
    <Routes>
      {/* Page d'accueil par défaut - accessible à tous */}
      <Route
        index
        element={
          <ProtectedRoute allowedRoles={[ROLES.USER, ROLES.MODERATOR, ROLES.TREASURER, ROLES.ADMIN]}>
            <Users />
          </ProtectedRoute>
        }
      />

      {/* Dashboard - accessible à tous les utilisateurs connectés */}
      <Route
        path="dashboard"
        element={
          <ProtectedRoute allowedRoles={[ROLES.USER, ROLES.MODERATOR, ROLES.TREASURER, ROLES.ADMIN]}>
            <Users />
          </ProtectedRoute>
        }
      />

      {/* Page de test - seulement admin en développement */}
      <Route
        path="starter"
        element={
          <ProtectedRoute requiredRole={ROLES.ADMIN}>
            <BlankPage />
          </ProtectedRoute>
        }
      />

      {/* Gestion des utilisateurs - modérateur et admin seulement */}
      <Route
        path="users"
        element={
          <ProtectedRoute allowedRoles={[ROLES.MODERATOR, ROLES.ADMIN]}>
            <Users />
          </ProtectedRoute>
        }
      />

      {/* Système de support complet avec sous-routes */}
      <Route
        path="support/*"
        element={
          <ProtectedRoute allowedRoles={[ROLES.USER, ROLES.MODERATOR, ROLES.TREASURER, ROLES.ADMIN]}>
            <SupportsRoute />
          </ProtectedRoute>
        }
      />

      {/* Nouveau système de profil principal - accessible à tous */}
      <Route
        path="profile"
        element={
          <ProtectedRoute allowedRoles={[ROLES.USER, ROLES.MODERATOR, ROLES.TREASURER, ROLES.ADMIN]}>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* Ancien système de profil pour compatibilité */}
      <Route
        path="profile-settings/*"
        element={
          <ProtectedRoute allowedRoles={[ROLES.USER, ROLES.MODERATOR, ROLES.TREASURER, ROLES.ADMIN]}>
            <ProfileSettings />
          </ProtectedRoute>
        }
      />

      {/* Système de donations - accessible à tous mais avec fonctionnalités différentes selon le rôle */}
      <Route
        path="donations"
        element={
          <ProtectedRoute allowedRoles={[ROLES.USER, ROLES.MODERATOR, ROLES.TREASURER, ROLES.ADMIN]}>
            <Donations />
          </ProtectedRoute>
        }
      />

      {/* Page de test pour debug du formulaire de donation (développement)
      <Route
        path="donations/debug"
        element={
          <ProtectedRoute requiredRole={ROLES.ADMIN}>
            <DonationCreateDebug />
          </ProtectedRoute>
        }
      />
      */}

      {/* Pages de retour de paiement */}
      <Route
        path="donations/payment/success/:donationId?/:paymentId?"
        element={
          <ProtectedRoute allowedRoles={[ROLES.USER, ROLES.MODERATOR, ROLES.TREASURER, ROLES.ADMIN]}>
            <PaymentSuccess />
          </ProtectedRoute>
        }
      />

      <Route
        path="donations/payment/failure/:donationId?/:paymentId?"
        element={
          <ProtectedRoute allowedRoles={[ROLES.USER, ROLES.MODERATOR, ROLES.TREASURER, ROLES.ADMIN]}>
            <PaymentFailure />
          </ProtectedRoute>
        }
      />

      <Route
        path="donations/payment/cancel/:donationId?"
        element={
          <ProtectedRoute allowedRoles={[ROLES.USER, ROLES.MODERATOR, ROLES.TREASURER, ROLES.ADMIN]}>
            <PaymentCancel />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default PagesRoute;
