import { Box, Stack, Typography, MenuItem, FormControl, Select } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useAppSelector } from "@store/hooks";
import { useState, useEffect } from "react";

import {
  useGetDashboardOverviewQuery,
  useGetDashboardFunnelQuery,
} from "@services/dashboardApi";

import StatCard from "@components/StatCard";

import EventIcon from "@mui/icons-material/Event";
import PageviewIcon from "@mui/icons-material/Pageview";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import PercentIcon from "@mui/icons-material/Percent";

import TrafficLineChart from "@components/charts/TrafficLineChart";
import FunnelChart from "@components/charts/FunnelChart";
import TopSourcesBarChart from "@components/charts/TopSourcesBarChart";
import DevicePieChart from "@components/charts/DevicePieChart";

export default function DashboardPage() {
  const user = useAppSelector((s) => s.auth.user);

  const [range, setRange] = useState("last30");

  const { data: overview, isFetching: loadingOverview } = useGetDashboardOverviewQuery({ range });
  const { data: funnel } = useGetDashboardFunnelQuery({ range });

  return (
    <Stack spacing={3}>
      {/* Title */}
      <Typography variant="h4" fontWeight={600}>
        {user?.role === "agency" ? "Agency Overview" : "Client Overview"}
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

      {loadingOverview  && (
        <span style={{ fontSize: "14px", color: "#666" }}>
          Loading…
        </span>
      )}

      {/* KPI CARDS */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Events"
            icon={EventIcon}
            color="#2065D1"
            value={overview?.total_events ?? 0}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="PageViews"
            icon={PageviewIcon}
            color="#FF6B6B"
            value={overview?.pageviews ?? 0}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Unique Visitors"
            icon={PeopleAltIcon}
            color="#1ABC9C"
            value={overview?.unique_visitors ?? 0}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Initiated"
            icon={ShoppingCartIcon}
            color="#7E57C2"
            value={overview?.initiated ?? 0}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Purchases"
            icon={ShoppingBagIcon}
            color="#F39C12"
            value={overview?.purchases ?? 0}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Revenue (LKR)"
            icon={MonetizationOnIcon}
            color="#2ECC71"
            value={overview?.revenue ?? 0}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Conversion Rate"
            icon={PercentIcon}
            color="#0097A7"
            value={`${overview?.conversion_rate ?? 0}%`}
          />
        </Grid>
      </Grid>

      {/* TRAFFIC + FUNNEL */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Box sx={{ p: 2, bgcolor: "background.paper", borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Daily Traffic
            </Typography>
            <TrafficLineChart data={overview?.daily} />
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ p: 2, bgcolor: "background.paper", borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Funnel
            </Typography>
            <FunnelChart data={funnel} />
          </Box>
        </Grid>
      </Grid>

      {/* SOURCE + DEVICE */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ p: 2, bgcolor: "background.paper", borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Top Sources
            </Typography>
            <TopSourcesBarChart data={overview?.top_sources} />
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ p: 2, bgcolor: "background.paper", borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Device Breakdown
            </Typography>
            <DevicePieChart data={overview?.devices} />
          </Box>
        </Grid>
      </Grid>
    </Stack>
  );
}
