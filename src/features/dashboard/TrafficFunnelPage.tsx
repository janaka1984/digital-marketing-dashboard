import { useState } from "react";
import {
  Box,
  Stack,
  Typography,
  FormControl,
  MenuItem,
  Select,
} from "@mui/material";
import Grid from "@mui/material/Grid2";

import { useAppSelector } from "@store/hooks";
import {
  useGetDashboardOverviewQuery,
  useGetDashboardFunnelQuery,
} from "@services/dashboardApi";

import TrafficLineChart from "@components/charts/TrafficLineChart";
import FunnelChart from "@components/charts/FunnelChart";

export default function TrafficFunnelPage() {
  const user = useAppSelector((s) => s.auth.user);
  const role = user?.role || "client";

  const [range, setRange] = useState("last30");

  const { data: overview, isFetching: loadingOverview } =
    useGetDashboardOverviewQuery({ range });
  const { data: funnel, isFetching: loadingFunnel } =
    useGetDashboardFunnelQuery({ range });

  const totalPageviews = overview?.pageviews ?? 0;
  const totalClicks = funnel?.clicks ?? 0;
  const totalInitiated = funnel?.initiated ?? 0;
  const totalPurchases = funnel?.purchases ?? 0;

  const ctr = totalPageviews
    ? ((totalClicks / totalPageviews) * 100).toFixed(2)
    : "0.00";
  const initRate = totalClicks
    ? ((totalInitiated / totalClicks) * 100).toFixed(2)
    : "0.00";
  const purchaseRate = totalInitiated
    ? ((totalPurchases / totalInitiated) * 100).toFixed(2)
    : "0.00";

  const loading = loadingOverview || loadingFunnel;

  return (
    <Stack spacing={3}>
      {/* Title */}
      <Typography variant="h4" fontWeight={600}>
        {role === "agency"
          ? "Traffic & Funnel Deep Dive (Agency)"
          : "Traffic & Funnel Deep Dive"}
      </Typography>

      {/* Range Selector + Loading */}
      <FormControl
        size="small"
        sx={{
          width: 220,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Select value={range} onChange={(e) => setRange(e.target.value)}>
          <MenuItem value="today">Today</MenuItem>
          <MenuItem value="yesterday">Yesterday</MenuItem>
          <MenuItem value="last7">Last 7 Days</MenuItem>
          <MenuItem value="last30">Last 30 Days</MenuItem>
          <MenuItem value="last90">Last 90 Days</MenuItem>
          <MenuItem value="thisyear">This Year</MenuItem>
        </Select>

        {loading && (
          <span style={{ fontSize: 14, color: "#666" }}>Loading…</span>
        )}
      </FormControl>

      {/* TRAFFIC + FUNNEL BIG BLOCKS */}
      <Grid container spacing={2}>
        {/* Daily Traffic */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Box sx={{ p: 2, bgcolor: "background.paper", borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 1.5 }}>
              Daily Traffic
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
              Total Events by Day for the selected range.
            </Typography>
            <TrafficLineChart data={overview?.daily} />
          </Box>
        </Grid>

        {/* Funnel Deep Dive */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ p: 2, bgcolor: "background.paper", borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 1.5 }}>
              Funnel Overview
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
              PageViews → Clicks → Initiated → Purchases
            </Typography>

            <FunnelChart data={funnel} />

            {/* Quick funnel stats */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Funnel Metrics
              </Typography>
              <StatRow label="PageViews" value={totalPageviews} />
              <StatRow label="Clicks" value={totalClicks} />
              <StatRow label="Initiated" value={totalInitiated} />
              <StatRow label="Purchases" value={totalPurchases} />
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* RATES / QUALITY METRICS */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ p: 2, bgcolor: "background.paper", borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 1.5 }}>
              Click-Through Rate
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
              Clicks / PageViews
            </Typography>
            <BigNumber value={`${ctr}%`} />
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ p: 2, bgcolor: "background.paper", borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 1.5 }}>
              Initiation Rate
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
              Initiated / Clicks
            </Typography>
            <BigNumber value={`${initRate}%`} />
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ p: 2, bgcolor: "background.paper", borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 1.5 }}>
              Purchase Rate
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
              Purchases / Initiated
            </Typography>
            <BigNumber value={`${purchaseRate}%`} />
          </Box>
        </Grid>
      </Grid>
    </Stack>
  );
}

// Small helper components - simple and reusable

type StatRowProps = {
  label: string;
  value: number | string;
};

function StatRow({ label, value }: StatRowProps) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        fontSize: 14,
        py: 0.5,
      }}
    >
      <span>{label}</span>
      <span>{value}</span>
    </Box>
  );
}

type BigNumberProps = {
  value: string;
};

function BigNumber({ value }: BigNumberProps) {
  return (
    <Typography variant="h4" fontWeight={600}>
      {value}
    </Typography>
  );
}
