// src/features/dashboard/DashboardPage.tsx
import { Box, Stack, Typography, Paper } from '@mui/material';
import Grid from '@mui/material/Grid2';  

import { useGetEventStatsQuery, useGetCampaignPerformanceQuery } from '@services/eventApi';
import StatCard from '@components/StatCard';
import EventTable from '@components/EventTable';
import CampaignTable from '@components/CampaignTable';

import EventIcon from '@mui/icons-material/Event';
import PageviewIcon from '@mui/icons-material/Pageview';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

export default function DashboardPage() {
  const { data: stats, isLoading } = useGetEventStatsQuery();
  const { data: campaigns, isLoading: loadingCampaigns } = useGetCampaignPerformanceQuery();

  return (
    <Stack spacing={3}>
     
      {/* Stat Cards */}
      <Grid container spacing={2}>
         <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Events"
            value={isLoading ? '...' : stats?.total ?? 0}
            icon={EventIcon}
            color="#2065D1" // blue
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="PageViews"
            value={isLoading ? '...' : stats?.pageviews ?? 0}
            icon={PageviewIcon}
            color="#FF6B6B" // red
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Unique Visitors"
            value={isLoading ? '...' : stats?.unique_visitors ?? 0}
            icon={PeopleAltIcon}
            color="#1ABC9C" // green
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Last 24h"
            value={isLoading ? '...' : stats?.last_24h ?? 0}
            icon={AccessTimeIcon}
            color="#F39C12" // orange
          />
        </Grid>
      </Grid>

      {/* Campaign Performance */}
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight={600} mb={2}>
          Campaign Performance
        </Typography>
        <CampaignTable rows={campaigns || []} loading={loadingCampaigns} />
      </Paper>

      {/* Recent Events */}
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight={600} mb={2}>
          Recent Events
        </Typography>
        <EventTable />
      </Paper>
    </Stack>
  );
}
