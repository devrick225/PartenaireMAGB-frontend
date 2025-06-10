import React, { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

// Composants supports - version améliorée
const TicketDashboard = lazy(() => import('../../container/supports/TicketDashboard'));
const TicketList = lazy(() => import('../../container/supports/index'));
const TicketDetailsEnhanced = lazy(() => import('../../container/supports/TicketDetailsEnhanced'));
const SupportCreate = lazy(() => import('../../container/supports/SupportCreate'));
const SupportUpdate = lazy(() => import('../../container/supports/SupportUpdate'));

// Composants supports - version legacy (pour compatibilité)
const Dashboard = lazy(() => import('../../container/supports/Dashboard'));
const TicketDetails = lazy(() => import('../../container/supports/TicketDetails'));

function SupportsRoute() {
  return (
    <Routes>
      {/* Route principale - tableau de bord avancé */}
      <Route index element={<TicketDashboard />} />

      {/* Dashboard avancé avec métriques */}
      <Route path="dashboard" element={<TicketDashboard />} />

      {/* Liste des tickets */}
      <Route path="tickets" element={<TicketList />} />

      {/* Détails d'un ticket - version améliorée */}
      <Route path="ticket/:id" element={<TicketDetailsEnhanced />} />

      {/* Création d'un nouveau ticket */}
      <Route path="new" element={<SupportCreate />} />

      {/* Modification d'un ticket */}
      <Route path="edit/:id" element={<SupportUpdate />} />

      {/* Routes de compatibilité - anciennes versions */}
      <Route path="legacy" element={<Dashboard />} />
      <Route path="ticketDetails/:id" element={<TicketDetails />} />

      {/* Route fallback vers la liste des tickets */}
      <Route path="*" element={<TicketList />} />
    </Routes>
  );
}

export default SupportsRoute;
