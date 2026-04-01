import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AnimatePresence } from "framer-motion";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import PageTransition from "@/components/PageTransition";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Welcome from "./pages/Welcome";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Donations from "./pages/Donations";
import Payments from "./pages/Payments";
import PaymentCallback from "./pages/PaymentCallback";
import Documents from "./pages/Documents";
import Tickets from "./pages/Tickets";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminDonations from "./pages/admin/AdminDonations";
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminLinks from "./pages/admin/AdminLinks";
import AdminTickets from "./pages/admin/AdminTickets";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PublicRoute><PageTransition><Index /></PageTransition></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><PageTransition><Login /></PageTransition></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><PageTransition><Signup /></PageTransition></PublicRoute>} />
        <Route path="/reset-password" element={<PublicRoute><PageTransition><ResetPassword /></PageTransition></PublicRoute>} />
        <Route path="/welcome" element={<ProtectedRoute><PageTransition><Welcome /></PageTransition></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><PageTransition><Dashboard /></PageTransition></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><PageTransition><Profile /></PageTransition></ProtectedRoute>} />
        <Route path="/donations" element={<ProtectedRoute><PageTransition><Donations /></PageTransition></ProtectedRoute>} />
        <Route path="/paiements" element={<ProtectedRoute><PageTransition><Payments /></PageTransition></ProtectedRoute>} />
        <Route path="/paiements/callback" element={<ProtectedRoute><PageTransition><PaymentCallback /></PageTransition></ProtectedRoute>} />
        <Route path="/callback" element={<ProtectedRoute><PageTransition><PaymentCallback /></PageTransition></ProtectedRoute>} />
        <Route path="/documents" element={<ProtectedRoute><PageTransition><Documents /></PageTransition></ProtectedRoute>} />
        <Route path="/support" element={<ProtectedRoute><PageTransition><Tickets /></PageTransition></ProtectedRoute>} />
        <Route path="/admin/utilisateurs" element={<ProtectedRoute><PageTransition><AdminUsers /></PageTransition></ProtectedRoute>} />
        <Route path="/admin/dons" element={<ProtectedRoute><PageTransition><AdminDonations /></PageTransition></ProtectedRoute>} />
        <Route path="/admin/notifications" element={<ProtectedRoute><PageTransition><AdminNotifications /></PageTransition></ProtectedRoute>} />
        <Route path="/admin/liens" element={<ProtectedRoute><PageTransition><AdminLinks /></PageTransition></ProtectedRoute>} />
        <Route path="/admin/tickets" element={<ProtectedRoute><PageTransition><AdminTickets /></PageTransition></ProtectedRoute>} />
        <Route path="/admin" element={<Navigate to="/admin/utilisateurs" replace />} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AnimatedRoutes />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
