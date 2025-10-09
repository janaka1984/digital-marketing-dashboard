import { Paper, Stack, Typography } from "@mui/material";
import { useGetCampaignPerformanceQuery } from "@services/eventApi";
import CampaignTable from "@components/CampaignTable";
import { useAppSelector } from "@store/hooks";

export default function CampaignsPage() {
  const user = useAppSelector((s) => s.auth.user);
  const role = user?.role || "client";

  const { data: campaigns, isLoading } = useGetCampaignPerformanceQuery();

  return (
    <Stack spacing={3}>
      <Typography variant="h4" fontWeight={600}>
        {role === "agency" ? "Client Campaign Overview" : "My Campaign Performance"}
      </Typography>

      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <CampaignTable rows={campaigns || []} loading={isLoading} />
      </Paper>
    </Stack>
  );
}
