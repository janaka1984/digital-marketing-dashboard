// src/AppRoutes.tsx
import { Route, Routes, Navigate } from "react-router-dom";
import DashboardLayout from "@layouts/DashboardLayout";
import LoginPage from "@features/auth/LoginPage";
import SignUpPage from "@features/auth/SignUpPage";
import DashboardPage from "@features/dashboard/DashboardPage";
import CampaignsPage from "@features/campaigns/CampaignsPage";
import TrafficFunnelPage from "@features/dashboard/TrafficFunnelPage";
import SourcesPage from "@features/dashboard/SourcesPage";
import EventsPage from "@features/events/EventsPage";
import IntegrationsPage from "@features/integrations/IntegrationsPage";
// import SettingsPage from "@features/settings/SettingsPage";
import InviteClientForm from "@features/agency/InviteClientForm";
import AgencyOverviewPage from "@features/dashboard/AgencyOverviewPage";
import AgencyAnalyticsPage from "@features/dashboard/AgencyAnalyticsPage";
import { useAppSelector } from "@store/hooks";

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
        element={isAuthed ? <DashboardLayout /> : <Navigate to="/login" replace />}
      >
        {/* Main dashboard overview */}
        <Route index element={<DashboardPage />} />

        {/* Separate feature pages */}
        <Route path="campaigns" element={<CampaignsPage />} />
        <Route path="traffic-funnel" element={<TrafficFunnelPage />} />
        <Route path="sources" element={<SourcesPage />} />
        <Route path="events" element={<EventsPage />} />
        <Route path="integrations" element={<IntegrationsPage />} />
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
