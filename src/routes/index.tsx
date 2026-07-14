// src/AppRoutes.tsx
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import DashboardLayout from "@layouts/DashboardLayout";
import LoadingOverlay from "@components/LoadingOverlay";
import LoginPage from "@features/auth/LoginPage";
import SignUpPage from "@features/auth/SignUpPage";
import DashboardPage from "@features/dashboard/DashboardPage";
import CampaignsPage from "@features/campaigns/CampaignsPage";
import TrafficFunnelPage from "@features/dashboard/TrafficFunnelPage";
import SourcesPage from "@features/dashboard/SourcesPage";
import EventsPage from "@features/events/EventsPage";
import IntegrationsPage from "@features/integrations/IntegrationsPage";
import BillingOverviewPage from "@features/billing/BillingOverviewPage";
import PlanSelectionPage from "@features/billing/PlanSelectionPage";
import BillingSuccessPage from "@features/billing/BillingSuccessPage";
import BillingCancelPage from "@features/billing/BillingCancelPage";
// import SettingsPage from "@features/settings/SettingsPage";
import InviteClientForm from "@features/agency/InviteClientForm";
import AgencyOverviewPage from "@features/dashboard/AgencyOverviewPage";
import AgencyAnalyticsPage from "@features/dashboard/AgencyAnalyticsPage";
import { useAppSelector } from "@store/hooks";
import { useGetSubscriptionQuery } from "@services/billingApi";
import { hasActiveAccess } from "@features/billing/billingUtils";

function isAllowedWhenRestricted(pathname: string) {
  return (
    pathname === "/" ||
    pathname === "/agency/overview" ||
    pathname === "/client/overview" ||
    pathname.startsWith("/billing")
  );
}

function SubscriptionGate() {
  const { pathname } = useLocation();
  const {
    data: subscription,
    isLoading,
    isFetching,
    isUninitialized,
  } = useGetSubscriptionQuery();

  if (isLoading || isUninitialized || (isFetching && !subscription)) {
    return <LoadingOverlay open />;
  }

  if (!hasActiveAccess(subscription) && !isAllowedWhenRestricted(pathname)) {
    sessionStorage.setItem(
      "billingNotice",
      "Your trial or subscription is not active. Choose a plan to continue.",
    );
    return <Navigate to="/billing" replace />;
  }

  return <DashboardLayout />;
}

export function AppRoutes() {
  const isAuthed = useAppSelector((s) => s.auth.isAuthenticated);

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />

      {/* Protected (authenticated) routes */}
      <Route
        path="/"
        element={isAuthed ? <SubscriptionGate /> : <Navigate to="/login" replace />}
      >
        {/* Main dashboard overview */}
        <Route index element={<DashboardPage />} />
        <Route path="client/overview" element={<DashboardPage />} />

        {/* Separate feature pages */}
        <Route path="campaigns" element={<CampaignsPage />} />
        <Route path="traffic-funnel" element={<TrafficFunnelPage />} />
        <Route path="sources" element={<SourcesPage />} />
        <Route path="events" element={<EventsPage />} />
        <Route path="integrations" element={<IntegrationsPage />} />
        <Route path="billing" element={<BillingOverviewPage />} />
        <Route path="billing/plans" element={<PlanSelectionPage />} />
        <Route path="billing/success" element={<BillingSuccessPage />} />
        <Route path="billing/cancel" element={<BillingCancelPage />} />
        {/* <Route path="settings" element={<SettingsPage />} /> */}

        {/* Agency-only route */}
        <Route path="agency/clients" element={<InviteClientForm />} />
        <Route path="agency/overview" element={<AgencyOverviewPage />} />
        <Route path="agency/analytics" element={<AgencyAnalyticsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to={isAuthed ? "/" : "/login"} replace />} />
    </Routes>
  );
}
