import { Paper, Stack, Typography } from "@mui/material";
import EventTable from "@components/EventTable";
import { useAppSelector } from "@store/hooks";
import { dashboardTitleSx } from "@theme/index";

export default function EventsPage() {
  const user = useAppSelector((s) => s.auth.user);
  const role = user?.role || "client";

  return (
    <Stack spacing={3}>
      <Typography variant="h4" sx={dashboardTitleSx}>
        {role === "agency" ? "Client Event Activity" : "My Event Activity"}
      </Typography>

      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <EventTable />
      </Paper>
    </Stack>
  );
}
