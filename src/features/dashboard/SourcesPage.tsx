import {
  Box,
  Button,
  FormControl,
  MenuItem,
  Select,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useAppSelector } from "@store/hooks";
import { useGetDashboardOverviewQuery } from "@services/dashboardApi";
import { GEO_GROUP_BY_OPTIONS, GEO_METRIC_OPTIONS, GEO_RANGE_OPTIONS } from "@services/geoSummaryApi";
import TopSourcesBarChart from "@components/charts/TopSourcesBarChart";
import EventGeoMap from "@components/EventGeoMap";
import { useGeoFilters } from "./hooks/useGeoFilters";
import { useGeoSummary } from "./hooks/useGeoSummary";

const RANGE_LABELS: Record<string, string> = {
  today: "Today",
  yesterday: "Yesterday",
  last7: "Last 7 Days",
  last30: "Last 30 Days",
  last90: "Last 90 Days",
  thisyear: "This Year",
};

export default function SourcesPage() {
  const user = useAppSelector((s) => s.auth.user);
  const role = user?.role || "client";
  const { filters, setFilter, clearFilters } = useGeoFilters();
  const geoFilters = {
    ...filters,
    client_id: role === "agency" ? filters.client_id : undefined,
  };
  const { locations, filterOptions, isFetching: isGeoFetching } = useGeoSummary(geoFilters);

  const { data: overview, isFetching: isOverviewFetching } = useGetDashboardOverviewQuery({
    range: filters.range,
  });

  const sources = overview?.top_sources || [];
  const mediums = overview?.top_mediums || [];
  const referrers = overview?.referrers || [];
  const campaignOptions = filterOptions?.campaigns || [];
  const isLoading = isOverviewFetching || isGeoFetching;

  return (
    <Stack spacing={3}>
      <Typography variant="h4" fontWeight={600}>
        {role === "agency" ? "Traffic Sources (Agency View)" : "Traffic Sources & Referrers"}
      </Typography>

      <Box
        sx={{
          p: 2,
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
        }}
      >
        <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} useFlexGap flexWrap="wrap">
          <FormControl size="small" sx={{ minWidth: { xs: "100%", md: 170 } }}>
            <Typography variant="caption" sx={{ mb: 0.5 }}>
              Date Range
            </Typography>
            <Select
              value={filters.range}
              onChange={(e) => setFilter("range", e.target.value)}
              inputProps={{ "aria-label": "Date range" }}
            >
              {GEO_RANGE_OPTIONS.map((r) => (
                <MenuItem key={r} value={r}>
                  {RANGE_LABELS[r]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: { xs: "100%", md: 220 } }}>
            <Typography variant="caption" sx={{ mb: 0.5 }}>
              District/Region
            </Typography>
            <Select
              displayEmpty
              value={filters.region}
              onChange={(e) => setFilter("region", e.target.value)}
              inputProps={{ "aria-label": "District or region" }}
            >
              <MenuItem value="">All Districts/Regions</MenuItem>
              {(filterOptions?.districts || []).map((district: string) => (
                <MenuItem key={district} value={district}>
                  {district}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: { xs: "100%", md: 180 } }}>
            <Typography variant="caption" sx={{ mb: 0.5 }}>
              Campaign
            </Typography>
            <Select
              displayEmpty
              value={filters.campaign}
              onChange={(e) => setFilter("campaign", e.target.value)}
              inputProps={{ "aria-label": "Campaign" }}
            >
              <MenuItem value="">All Campaigns</MenuItem>
              {campaignOptions.map((campaign: string) => (
                <MenuItem key={campaign} value={campaign}>
                  {campaign}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ minWidth: { xs: "100%", md: 230 } }}>
            <Typography variant="caption" sx={{ mb: 0.5, display: "block" }}>
              Metric
            </Typography>
            <ToggleButtonGroup
              exclusive
              fullWidth
              size="small"
              value={filters.metric}
              onChange={(_, val) => val && setFilter("metric", val)}
              aria-label="Metric selector"
            >
              {GEO_METRIC_OPTIONS.map((metric) => (
                <ToggleButton key={metric} value={metric} aria-label={metric}>
                  {metric === "unique_visitors" ? "Unique Visitors" : "Events"}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>

          <Box sx={{ minWidth: { xs: "100%", md: 210 } }}>
            <Typography variant="caption" sx={{ mb: 0.5, display: "block" }}>
              Group By
            </Typography>
            <ToggleButtonGroup
              exclusive
              fullWidth
              size="small"
              value={filters.group_by}
              onChange={(_, val) => val && setFilter("group_by", val)}
              aria-label="Group by selector"
            >
              {GEO_GROUP_BY_OPTIONS.map((groupBy) => (
                <ToggleButton key={groupBy} value={groupBy} aria-label={groupBy}>
                  {groupBy === "district" ? "District" : "City"}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>

          <Button
            size="small"
            variant="outlined"
            onClick={clearFilters}
            sx={{ alignSelf: "flex-end", minHeight: 40, px: 2 }}
          >
            Clear Filters
          </Button>
        </Stack>

        {isLoading ? (
          <Typography variant="caption" sx={{ display: "block", mt: 1, color: "text.secondary" }}>
            Loading...
          </Typography>
        ) : null}
      </Box>

      <Box sx={{ p: 2, bgcolor: "background.paper", borderRadius: 2, mt: 3 }}>
        <Typography variant="h6" sx={{ mb: 1.5 }}>
          Visitor Locations (Map)
        </Typography>

        {!isGeoFetching && locations.length === 0 ? (
          <Box
            sx={{
              height: 220,
              borderRadius: 2,
              bgcolor: "action.hover",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography color="text.secondary">No map data for selected filters</Typography>
          </Box>
        ) : (
          <EventGeoMap markers={locations} metric={filters.metric} />
        )}
      </Box>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ p: 2, bgcolor: "background.paper", borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 1.5 }}>
              Top Sources
            </Typography>
            <TopSourcesBarChart data={sources} />
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ p: 2, bgcolor: "background.paper", borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 1.5 }}>
              Top Mediums
            </Typography>
            <TopSourcesBarChart data={mediums} />
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ p: 2, bgcolor: "background.paper", borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 1.5 }}>
              Top Referrers
            </Typography>
            <TopSourcesBarChart data={referrers} />
          </Box>
        </Grid>
      </Grid>
    </Stack>
  );
}
