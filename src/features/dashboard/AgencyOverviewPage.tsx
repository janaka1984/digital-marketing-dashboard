import {
  Box,
  FormControl,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useState } from "react";

import EventIcon from "@mui/icons-material/Event";
import GroupIcon from "@mui/icons-material/Group";
import PageviewIcon from "@mui/icons-material/Pageview";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

import StatCard from "@components/StatCard";
import { useGetAgencyOverviewQuery } from "@services/dashboardApi";

import AgencyClientTable from "@components/AgencyClientTable";
import TrafficLineChart from "@components/charts/TrafficLineChart";
import { dashboardTitleSx } from "@theme/index";
import { AgencyOverviewResponse } from "@types";

const panelSx = {
  p: 2.5,
  bgcolor: "background.paper",
  borderRadius: 3,
  border: "1px solid",
  borderColor: "divider",
};

export default function AgencyOverviewPage() {
  const [range, setRange] = useState("last7");
  const { data, isFetching } = useGetAgencyOverviewQuery({ range });

  const summary: AgencyOverviewResponse["summary"] = data?.summary ?? {
    total_clients: 0,
    active_clients: 0,
    pageviews: 0,
    clicks: 0,
    initiated: 0,
    inactive_clients: 0,
    total_events: 0,
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h4" sx={dashboardTitleSx}>
        Agency Overview
      </Typography>

      <FormControl size="small" sx={{ width: 200 }}>
        <Select value={range} onChange={(e) => setRange(e.target.value)}>
          <MenuItem value="today">Today</MenuItem>
          <MenuItem value="yesterday">Yesterday</MenuItem>
          <MenuItem value="last7">Last 7 Days</MenuItem>
          <MenuItem value="last30">Last 30 Days</MenuItem>
          <MenuItem value="last90">Last 90 Days</MenuItem>
          <MenuItem value="thisyear">This Year</MenuItem>
        </Select>
      </FormControl>

      {isFetching ? (
        <Typography color="text.secondary">Loading...</Typography>
      ) : null}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Clients"
            icon={GroupIcon}
            color="#1E88E5"
            value={summary.total_clients ?? 0}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Active Clients"
            icon={EventIcon}
            color="#00C853"
            value={summary.active_clients ?? 0}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Inactive Clients"
            icon={EventIcon}
            color="#F44336"
            value={summary.inactive_clients ?? 0}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Events"
            icon={EventIcon}
            color="#5E35B1"
            value={summary.total_events ?? 0}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="PageViews"
            icon={PageviewIcon}
            color="#1E88E5"
            value={summary.pageviews ?? 0}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Clicks"
            icon={ShoppingCartIcon}
            color="#FF6F00"
            value={summary.clicks ?? 0}
          />
        </Grid>
      </Grid>

      <Box sx={panelSx}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Client Performance
        </Typography>
        <AgencyClientTable rows={data?.clients || []} loading={isFetching} />
      </Box>

      <Box sx={panelSx}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Agency Daily Traffic (All Clients)
        </Typography>
        <TrafficLineChart data={data?.daily || []} />
      </Box>
    </Stack>
  );
}
