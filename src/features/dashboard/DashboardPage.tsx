// src/features/dashboard/DashboardPage.tsx
import { Box, Stack, Typography, Paper } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useAppSelector } from "@store/hooks";
import { useGetEventStatsQuery, useGetCampaignPerformanceQuery } from "@services/eventApi";
import StatCard from "@components/StatCard";
import CampaignTable from "@components/CampaignTable";
import EventTable from "@components/EventTable";

import EventIcon from "@mui/icons-material/Event";
import PageviewIcon from "@mui/icons-material/Pageview";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

export default function DashboardPage() {
  const user = useAppSelector((s) => s.auth.user);
  console.log("User role: >>>>>>>>>>>>>>", user);
  const { data: stats, isLoading } = useGetEventStatsQuery();
  const { data: campaigns, isLoading: loadingCampaigns } = useGetCampaignPerformanceQuery();

  return (
    <Stack spacing={3}>
      <Typography variant="h4" fontWeight={600}>
        {user?.role === "agency" ? "Agency Overview" : "Client Overview"}
      </Typography>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Total Events" value={isLoading ? "..." : stats?.total ?? 0} icon={EventIcon} color="#2065D1" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="PageViews" value={isLoading ? "..." : stats?.pageviews ?? 0} icon={PageviewIcon} color="#FF6B6B" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Unique Visitors" value={isLoading ? "..." : stats?.unique_visitors ?? 0} icon={PeopleAltIcon} color="#1ABC9C" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Last 24h" value={isLoading ? "..." : stats?.last_24h ?? 0} icon={AccessTimeIcon} color="#F39C12" />
        </Grid>
      </Grid>

      {/* If agency, show aggregated campaigns per client */}
      {/* {user?.role === "agency" && (
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" fontWeight={600} mb={2}>
            Client Campaign Performance
          </Typography>
          <CampaignTable rows={campaigns || []} loading={loadingCampaigns} />
        </Paper>
      )} */}

      {/* For both agency and clients */}
      {/* <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight={600} mb={2}>
          Recent Events
        </Typography>
        <EventTable />
      </Paper> */}
    </Stack>
  );
}
