import { useState } from 'react';
import { Box, Stack, Typography, FormControl, MenuItem, Select } from '@mui/material';
import Grid from '@mui/material/Grid2';

import { useAppSelector } from '@store/hooks';
import { useGetDashboardOverviewQuery, useGetEventsGeoSummaryQuery } from '@services/dashboardApi';

import TopSourcesBarChart from '@components/charts/TopSourcesBarChart';
import EventGeoMap from '@components/EventGeoMap';

const panelSx = {
  p: 2.5,
  bgcolor: 'background.paper',
  borderRadius: 3,
  border: '1px solid',
  borderColor: 'divider'
};

export default function SourcesPage() {
  const user = useAppSelector((s) => s.auth.user);
  const role = user?.role || 'client';

  const [range, setRange] = useState('last7');
  const { data: geoData } = useGetEventsGeoSummaryQuery({ range });

  const { data: overview, isFetching } = useGetDashboardOverviewQuery({ range });

  const sources = overview?.top_sources || [];
  const mediums = overview?.top_mediums || [];
  const referrers = overview?.referrers || [];
  const markers = geoData?.locations ?? [];

  return (
    <Stack spacing={3}>
      <Typography variant="h4" fontWeight={700}>
        {role === 'agency' ? 'Traffic Sources (Agency View)' : 'Traffic Sources & Referrers'}
      </Typography>

      <FormControl size="small" sx={{ width: 220 }}>
        <Select value={range} onChange={(e) => setRange(e.target.value)}>
          <MenuItem value="today">Today</MenuItem>
          <MenuItem value="yesterday">Yesterday</MenuItem>
          <MenuItem value="last7">Last 7 Days</MenuItem>
          <MenuItem value="last30">Last 30 Days</MenuItem>
          <MenuItem value="last90">Last 90 Days</MenuItem>
          <MenuItem value="thisyear">This Year</MenuItem>
        </Select>
      </FormControl>

      {isFetching ? <Typography color="text.secondary">Loading...</Typography> : null}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={panelSx}>
            <Typography variant="h6" sx={{ mb: 1.5 }}>
              Top Sources
            </Typography>
            <TopSourcesBarChart data={sources} />
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={panelSx}>
            <Typography variant="h6" sx={{ mb: 1.5 }}>
              Top Mediums
            </Typography>
            <TopSourcesBarChart data={mediums} />
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={panelSx}>
            <Typography variant="h6" sx={{ mb: 1.5 }}>
              Top Referrers
            </Typography>
            <TopSourcesBarChart data={referrers} />
          </Box>
        </Grid>
      </Grid>

      <Box sx={panelSx}>
        <Typography variant="h6" sx={{ mb: 1.5 }}>
          Visitor Locations (Map)
        </Typography>

        <EventGeoMap markers={markers} />
      </Box>
    </Stack>
  );
}
