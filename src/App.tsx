import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import LegalPage from "./pages/LegalPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AccountPage from "./pages/AccountPage";
import PaymentPage from "./pages/PaymentPage";
import VehiclesPage from "./pages/VehiclesPage";
import VehicleDetailPage from "./pages/VehicleDetailPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuthStore } from "./store/authStore";

// Partner pages
import PartnerLayout from "./pages/partner/PartnerLayout";
import PartnerDashboard from "./pages/partner/PartnerDashboard";
import PartnerVehiclesPage from "./pages/partner/PartnerVehiclesPage";
import PartnerReservationsPage from "./pages/partner/PartnerReservationsPage";
import PartnerVerificationPage from "./pages/partner/PartnerVerificationPage";
import PartnerFinancesPage from "./pages/partner/PartnerFinancesPage";
import PartnerReviewsPage from "./pages/partner/PartnerReviewsPage";
import PartnerSettingsPage from "./pages/partner/PartnerSettingsPage";
import PartnerRegisterPage from "./pages/partner/PartnerRegisterPage";

// Admin pages
import { LoginPage as AdminLoginPage } from "./components/admin/LoginPage";
import { AdminLayout } from "./components/admin/AdminLayout";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { ReservationsPage } from "./components/admin/ReservationsPage";
import { FleetPage } from "./components/admin/FleetPage";
import { ClientsPage } from "./components/admin/ClientsPage";
import { ContractsPage } from "./components/admin/ContractsPage";
import { PaymentsPage } from "./components/admin/PaymentsPage";
import { SettingsPage } from "./components/admin/SettingsPage";
import { VerificationPage } from "./components/admin/VerificationPage";
import { PartnersPage } from "./components/admin/PartnersPage";
import { PayoutsPage } from "./components/admin/PayoutsPage";
import { ReviewsPage as AdminReviewsPage } from "./components/admin/ReviewsPage";

const queryClient = new QueryClient();

function AppRoutes() {
  const loadUser = useAuthStore((s) => s.loadUser);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/legal" element={<LegalPage />} />

      {/* Catalog */}
      <Route path="/vehicules" element={<VehiclesPage />} />
      <Route path="/vehicules/:id" element={<VehicleDetailPage />} />

      {/* Client auth */}
      <Route path="/connexion" element={<LoginPage />} />
      <Route path="/inscription" element={<RegisterPage />} />
      <Route
        path="/mon-compte"
        element={
          <ProtectedRoute>
            <AccountPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/paiement"
        element={
          <ProtectedRoute>
            <PaymentPage />
          </ProtectedRoute>
        }
      />

      {/* Partner registration (any authenticated user) */}
      <Route
        path="/partner/register"
        element={
          <ProtectedRoute>
            <PartnerRegisterPage />
          </ProtectedRoute>
        }
      />

      {/* Partner portal */}
      <Route
        path="/partner"
        element={
          <ProtectedRoute allowedRoles={['PARTNER']}>
            <PartnerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<PartnerDashboard />} />
        <Route path="dashboard" element={<PartnerDashboard />} />
        <Route path="vehicles" element={<PartnerVehiclesPage />} />
        <Route path="reservations" element={<PartnerReservationsPage />} />
        <Route path="verification" element={<PartnerVerificationPage />} />
        <Route path="finances" element={<PartnerFinancesPage />} />
        <Route path="reviews" element={<PartnerReviewsPage />} />
        <Route path="settings" element={<PartnerSettingsPage />} />
      </Route>

      {/* Admin */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="reservations" element={<ReservationsPage />} />
        <Route path="fleet" element={<FleetPage />} />
        <Route path="clients" element={<ClientsPage />} />
        <Route path="contracts" element={<ContractsPage />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="verification" element={<VerificationPage />} />
        <Route path="partners" element={<PartnersPage />} />
        <Route path="payouts" element={<PayoutsPage />} />
        <Route path="reviews" element={<AdminReviewsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;