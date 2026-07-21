import {
  Box,
  FormControl,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useAppSelector } from "@store/hooks";
import { useState } from "react";

import {
  useGetDashboardFunnelQuery,
  useGetDashboardOverviewQuery,
} from "@services/dashboardApi";

import StatCard from "@components/StatCard";

import EventIcon from "@mui/icons-material/Event";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import PageviewIcon from "@mui/icons-material/Pageview";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import PercentIcon from "@mui/icons-material/Percent";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

import DevicePieChart from "@components/charts/DevicePieChart";
import FunnelChart from "@components/charts/FunnelChart";
import TopSourcesBarChart from "@components/charts/TopSourcesBarChart";
import TrafficLineChart from "@components/charts/TrafficLineChart";
import { dashboardTitleSx } from "@theme/index";

const panelSx = {
  p: 2.5,
  bgcolor: "background.paper",
  borderRadius: 3,
  border: "1px solid",
  borderColor: "divider",
};

export default function DashboardPage() {
  const user = useAppSelector((s) => s.auth.user);
  const [range, setRange] = useState("last7");

  const { data: overview, isFetching: loadingOverview } =
    useGetDashboardOverviewQuery({ range });
  const { data: funnel } = useGetDashboardFunnelQuery({ range });

  return (
    <Stack spacing={3}>
      <Typography variant="h4" sx={dashboardTitleSx}>
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

      {loadingOverview ? (
        <Typography color="text.secondary">Loading...</Typography>
      ) : null}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Events"
            icon={EventIcon}
            color="#1E88E5"
            value={overview?.total_events ?? 0}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="PageViews"
            icon={PageviewIcon}
            color="#F44336"
            value={overview?.pageviews ?? 0}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Unique Visitors"
            icon={PeopleAltIcon}
            color="#00C853"
            value={overview?.unique_visitors ?? 0}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Initiated"
            icon={ShoppingCartIcon}
            color="#1E88E5"
            value={overview?.initiated ?? 0}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Purchases"
            icon={ShoppingBagIcon}
            color="#5E35B1"
            value={overview?.purchases ?? 0}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Revenue"
            icon={MonetizationOnIcon}
            color="#FF6F00"
            value={overview?.revenue ?? 0}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Conversion Rate"
            icon={PercentIcon}
            color="#00C853"
            value={`${overview?.conversion_rate ?? 0}%`}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Box sx={panelSx}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Daily Traffic
            </Typography>
            <TrafficLineChart data={overview?.daily} />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={panelSx}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Funnel
            </Typography>
            <FunnelChart data={funnel} />
          </Box>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={panelSx}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Top Sources
            </Typography>
            <TopSourcesBarChart data={overview?.top_sources} />
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={panelSx}>
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
