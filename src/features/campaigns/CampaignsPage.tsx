import { Paper, Stack, Typography, FormControl,MenuItem, Select } from "@mui/material";
import { useGetDashboardCampaignsQuery } from "@services/dashboardApi";
import CampaignTable from "@components/CampaignTable";
import { useAppSelector } from "@store/hooks";
import { useState } from "react";

export default function CampaignsPage() {
  const user = useAppSelector((s) => s.auth.user);
  const role = user?.role || "client";

  const [range, setRange] = useState("last30");

  const { data, isFetching } = useGetDashboardCampaignsQuery({ range });

  return (
    <Stack spacing={3}>
      <Typography variant="h4" fontWeight={600}>
        {role === "agency" ? "Client Campaign Overview" : "My Campaign Performance"}
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

      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <CampaignTable rows={data?.campaigns || []} loading={isFetching} />
      </Paper>
    </Stack>
  );
}
