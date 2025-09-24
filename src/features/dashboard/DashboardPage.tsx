import { Box } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { Stack, Typography, Paper } from '@mui/material';
import StatCard from '@components/StatCard';
import { useGetEventStatsQuery, useGetCampaignPerformanceQuery } from '@services/eventApi';
import EventTable from './EventTable';
import CampaignTable from './CampaignTable';

export default function DashboardPage() {
  const { data: stats, isLoading } = useGetEventStatsQuery();
  const { data: campaigns, isLoading: loadingCampaigns } = useGetCampaignPerformanceQuery();

  return (
    <Stack spacing={2}>
      <Typography variant="h5">Overview</Typography>

      {/* KPI Cards */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Total Events" value={isLoading ? '...' : stats?.total ?? 0} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="PageViews" value={isLoading ? '...' : stats?.pageviews ?? 0} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Unique Visitors" value={isLoading ? '...' : stats?.unique_visitors ?? 0} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Last 24h" value={isLoading ? '...' : stats?.last_24h ?? 0} />
        </Grid>
      </Grid>

      {/* Campaign Performance */}
      <Paper sx={{ p: 2 }}>
        <Box>
          <Typography variant="h6" mb={2}>
            Campaign Performance
          </Typography>
          <CampaignTable rows={campaigns || []} loading={loadingCampaigns} />
        </Box>
      </Paper>

      {/* Recent Events */}
      <Paper sx={{ p: 2 }}>
        <Box>
          <Typography variant="h6" mb={2}>
            Recent Events
          </Typography>
          <EventTable />
        </Box>
      </Paper>
    </Stack>
  );
}
