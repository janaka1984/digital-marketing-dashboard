import { useState } from "react";
import {
  Box,
  Stack,
  Typography,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";
import Grid from "@mui/material/Grid2";

import GroupIcon from "@mui/icons-material/Group";
import EventIcon from "@mui/icons-material/Event";
import PageviewIcon from "@mui/icons-material/Pageview";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";

import { useGetAgencyOverviewQuery } from "@services/dashboardApi";
import StatCard from "@components/StatCard";

import AgencyClientTable from "@components/AgencyClientTable";
import DevicePieChart from "@components/charts/DevicePieChart";
import TopSourcesBarChart from "@components/charts/TopSourcesBarChart";
import TrafficLineChart from "@components/charts/TrafficLineChart";
import { AgencyOverviewResponse } from "@types";

export default function AgencyOverviewPage() {
  const [range, setRange] = useState("last30");

  const { data, isFetching } = useGetAgencyOverviewQuery({ range });

  const summary: AgencyOverviewResponse["summary"] =
    data?.summary ?? {
      total_clients: 0,
      active_clients: 0,
      pageviews: 0,
      clicks: 0,
      // add missing fields required by your shared version
      initiated: 0,
      inactive_clients: 0,
      total_events: 0,
    };

  return (
    <Stack spacing={3}>
      <Typography variant="h4" fontWeight={600}>
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

      {isFetching && (
        <span style={{ fontSize: "14px", color: "#777" }}>Loading…</span>
      )}

      {/* KPI CARDS */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Clients"
            icon={GroupIcon}
            color="#2065D1"
            value={summary.total_clients ?? 0}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Active Clients"
            icon={EventIcon}
            color="#2E7D32"
            value={summary.active_clients ?? 0}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Inactive Clients"
            icon={EventIcon}
            color="#C62828"
            value={summary.inactive_clients ?? 0}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Events"
            icon={EventIcon}
            color="#7E57C2"
            value={summary.total_events ?? 0}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="PageViews"
            icon={PageviewIcon}
            color="#FF6B6B"
            value={summary.pageviews ?? 0}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Clicks"
            icon={ShoppingCartIcon}
            color="#FBC02D"
            value={summary.clicks ?? 0}
          />
        </Grid>
      </Grid>

      {/* CLIENT TABLE */}
      <Box sx={{ p: 2, bgcolor: "background.paper", borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Client Performance
        </Typography>
        <AgencyClientTable rows={data?.clients || []} loading={isFetching} />
      </Box>

    {/* DAILY AGENCY TRAFFIC (FULL CHART) */}
    <Box sx={{ p: 2, bgcolor: "background.paper", borderRadius: 2 }}>
    <Typography variant="h6" sx={{ mb: 2 }}>
        Agency Daily Traffic (All Clients)
    </Typography>
    <TrafficLineChart data={data?.daily || []} />
    </Box>
    </Stack>
  );
}
