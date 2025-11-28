// src/features/dashboard/AgencyAnalyticsPage.tsx
import {
  Box,
  Stack,
  Typography,
  FormControl,
  MenuItem,
  Select,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useState } from "react";

import { useGetAgencyOverviewQuery } from "@services/dashboardApi";

import StatCard from "@components/StatCard";
import DevicePieChart from "@components/charts/DevicePieChart";
import TopSourcesBarChart from "@components/charts/TopSourcesBarChart";
import TrafficLineChart from "@components/charts/TrafficLineChart";
import AgencyClientTable from "@components/AgencyClientTable";

import ShowChartIcon from "@mui/icons-material/ShowChart";
import PageviewIcon from "@mui/icons-material/Pageview";
import TouchAppIcon from "@mui/icons-material/TouchApp";
import PersonIcon from "@mui/icons-material/Person";

// ---------- TYPES ----------
interface ClientItem {
  client_id: string | number;
  client_name: string;
  pageviews?: number;
  clicks?: number;
  initiated?: number;
  last_event?: string;
}

interface DailyItem {
  day: string;
  count: number;
}

interface DeviceItem {
  name: string;
  count: number;
}

interface SourceItem {
  src: string;
  count: number;
}

interface AgencyOverviewResponse {
  summary: {
    total_clients: number;
    active_clients: number;
    pageviews: number;
    clicks: number;
  };
  clients: ClientItem[];
  daily: DailyItem[];
  clients_daily: Record<string, DailyItem[]>;
  device_breakdown: DeviceItem[];
  clients_device_breakdown: Record<string, DeviceItem[]>;
  traffic_sources: SourceItem[];
  clients_traffic_sources: Record<string, SourceItem[]>;
}

// ---------- COMPONENT ----------
export default function AgencyAnalyticsPage() {
  const [range, setRange] = useState("last30");

  const [selectedClientTrend, setSelectedClientTrend] = useState("all");
  const [selectedClientDevice, setSelectedClientDevice] = useState("all");
  const [selectedClientSources, setSelectedClientSources] = useState("all");

  const { data, isLoading } =
    useGetAgencyOverviewQuery<AgencyOverviewResponse>({ range });

  const summary = data?.summary || {};

  return (
    <Stack spacing={3}>
      {/* TITLE */}
      <Typography variant="h4" fontWeight={600}>
        Agency Analytics
      </Typography>

      {/* RANGE DROPDOWN */}
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

      {/* KPI CARDS */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 3 }}>
          <StatCard
            title="Total Clients"
            icon={PersonIcon}
            color="#2065D1"
            value={summary?.total_clients || 0}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <StatCard
            title="Active Clients (24h)"
            icon={ShowChartIcon}
            color="#1ABC9C"
            value={summary?.active_clients || 0}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <StatCard
            title="PageViews"
            icon={PageviewIcon}
            color="#FF6B6B"
            value={summary?.pageviews || 0}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <StatCard
            title="Clicks"
            icon={TouchAppIcon}
            color="#7E57C2"
            value={summary?.clicks || 0}
          />
        </Grid>
      </Grid>

      {/* ==================== CHARTS ==================== */}
      <Grid container spacing={2}>
        {/* DAILY TRAFFIC TREND */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Box sx={{ p: 2, bgcolor: "background.paper", borderRadius: 2 }}>
            <Stack
              direction="row"
              alignItems="center"
              spacing={2}
              sx={{ mb: 2 }}
            >
              <Typography variant="h6">Daily Traffic Trend</Typography>

              <FormControl size="small" sx={{ minWidth: 160 }}>
                <Select
                  value={selectedClientTrend}
                  onChange={(e) => setSelectedClientTrend(e.target.value)}
                >
                  <MenuItem value="all">All Clients</MenuItem>
                  {data?.clients?.map((c) => (
                    <MenuItem key={c.client_id} value={c.client_id}>
                      {c.client_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            <TrafficLineChart
              data={
                selectedClientTrend === "all"
                  ? data?.daily || []
                  : data?.clients_daily?.[selectedClientTrend] || []
              }
            />
          </Box>
        </Grid>

        {/* DEVICE BREAKDOWN */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Box
            sx={{
              p: 2,
              bgcolor: "background.paper",
              borderRadius: 2,
              position: "relative",
            }}
          >
            <Typography variant="h6" sx={{ mb: 2 }}>
              Device Breakdown
            </Typography>

            <FormControl
              size="small"
              sx={{
                position: "absolute",
                top: 8,
                right: 16,
                zIndex: 10,
                background: "white",
                minWidth: 160,
              }}
            >
              <Select
                value={selectedClientDevice}
                onChange={(e) => setSelectedClientDevice(e.target.value)}
              >
                <MenuItem value="all">All Clients</MenuItem>
                {data?.clients?.map((c) => (
                  <MenuItem key={c.client_id} value={c.client_id}>
                    {c.client_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <DevicePieChart
              data={
                (selectedClientDevice === "all"
                  ? data?.device_breakdown
                  : data?.clients_device_breakdown?.[selectedClientDevice]
                )?.map((d) => ({
                  name: d.name,
                  count: d.count,
                })) || []
              }
            />
          </Box>
        </Grid>
      </Grid>

      {/* ==================== SOURCES + CLIENT TABLE ==================== */}
      <Grid container spacing={2}>
        {/* TOP SOURCES */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box
            sx={{
              p: 2,
              bgcolor: "background.paper",
              borderRadius: 2,
              position: "relative",
            }}
          >
            <Typography variant="h6" sx={{ mb: 2 }}>
              Top Traffic Sources
            </Typography>

            <FormControl
              size="small"
              sx={{
                position: "absolute",
                top: 8,
                right: 16,
                zIndex: 10,
                background: "white",
                minWidth: 160,
              }}
            >
              <Select
                value={selectedClientSources}
                onChange={(e) => setSelectedClientSources(e.target.value)}
              >
                <MenuItem value="all">All Clients</MenuItem>
                {data?.clients?.map((c) => (
                  <MenuItem key={c.client_id} value={c.client_id}>
                    {c.client_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TopSourcesBarChart
              data={
                (selectedClientSources === "all"
                  ? data?.traffic_sources
                  : data?.clients_traffic_sources?.[selectedClientSources]
                )?.map((d) => ({
                  src: d.src,
                  count: d.count,
                })) || []
              }
            />
          </Box>
        </Grid>

        {/* CLIENT TABLE */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ p: 2, bgcolor: "background.paper", borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Client Traffic Distribution
            </Typography>
            <AgencyClientTable rows={data?.clients || []} />
          </Box>
        </Grid>
      </Grid>
    </Stack>
  );
}
