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
import { dashboardTitleSx } from "@theme/index";

const panelSx = {
  p: 2.5,
  bgcolor: "background.paper",
  borderRadius: 3,
  border: "1px solid",
  borderColor: "divider",
};

export default function TrafficFunnelPage() {
  const user = useAppSelector((s) => s.auth.user);
  const role = user?.role || "client";
  const [range, setRange] = useState("last7");

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
      <Typography variant="h4" sx={dashboardTitleSx}>
        {role === "agency"
          ? "Traffic & Funnel Deep Dive (Agency)"
          : "Traffic & Funnel Deep Dive"}
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

      {loading ? (
        <Typography color="text.secondary">Loading...</Typography>
      ) : null}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Box sx={panelSx}>
            <Typography variant="h6" sx={{ mb: 1.5 }}>
              Daily Traffic
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
              Total events by day for the selected range.
            </Typography>
            <TrafficLineChart data={overview?.daily} />
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={panelSx}>
            <Typography variant="h6" sx={{ mb: 1.5 }}>
              Funnel Overview
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
              PageViews to Clicks to Initiated to Purchases
            </Typography>

            <FunnelChart data={funnel} />

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

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={panelSx}>
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
          <Box sx={panelSx}>
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
          <Box sx={panelSx}>
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
        py: 0.5,
        fontSize: 14,
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
    <Typography variant="h4" fontWeight={700}>
      {value}
    </Typography>
  );
}
