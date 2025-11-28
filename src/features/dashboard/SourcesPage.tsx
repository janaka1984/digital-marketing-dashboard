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
import { useGetDashboardOverviewQuery, useGetEventsGeoSummaryQuery } from "@services/dashboardApi";

import TopSourcesBarChart from "@components/charts/TopSourcesBarChart";
import EventGeoMap from "@components/EventGeoMap";

export default function SourcesPage() {
  const user = useAppSelector((s) => s.auth.user);
  const role = user?.role || "client";

  const [range, setRange] = useState("last30");
  const { data: geoData } = useGetEventsGeoSummaryQuery({ range });


  const { data: overview, isFetching } =
    useGetDashboardOverviewQuery({ range });

  const sources = overview?.top_sources || [];
  const mediums = overview?.top_mediums || [];
  const referrers = overview?.referrers || [];

  // Extract markers array safely
  const markers = geoData?.locations ?? [];

  return (
    <Stack spacing={3}>
      {/* Title */}
      <Typography variant="h4" fontWeight={600}>
        {role === "agency"
          ? "Traffic Sources (Agency View)"
          : "Traffic Sources & Referrers"}
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

        {isFetching && (
          <span style={{ fontSize: 14, color: "#666" }}>Loading…</span>
        )}
      </FormControl>

      {/* Sources + Mediums + Referrers Charts */}
      <Grid container spacing={2}>
        {/* SOURCES */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ p: 2, bgcolor: "background.paper", borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 1.5 }}>
              Top Sources
            </Typography>
            <TopSourcesBarChart data={sources} />
          </Box>
        </Grid>

        {/* MEDIUMS */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ p: 2, bgcolor: "background.paper", borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 1.5 }}>
              Top Mediums
            </Typography>
            <TopSourcesBarChart data={mediums} />
          </Box>
        </Grid>

        {/* REFERRERS */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ p: 2, bgcolor: "background.paper", borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 1.5 }}>
              Top Referrers
            </Typography>
            <TopSourcesBarChart data={referrers} />
          </Box>
        </Grid>
      </Grid>

      {/* GEO MAP */}
      <Box sx={{ p: 2, bgcolor: "background.paper", borderRadius: 2, mt: 3 }}>
        <Typography variant="h6" sx={{ mb: 1.5 }}>
          Visitor Locations (Map)
        </Typography>

        <EventGeoMap markers={markers} />
      </Box>
    </Stack>
  );
}
