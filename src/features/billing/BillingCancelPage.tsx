import HighlightOffOutlinedIcon from "@mui/icons-material/HighlightOffOutlined";
import { Button, Paper, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useEffect } from "react";

export default function BillingCancelPage() {
  useEffect(() => {
    sessionStorage.removeItem("pendingCheckoutPlan");
  }, []);

  return (
    <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 3 }}>
      <Stack spacing={2.5} alignItems="flex-start">
        <HighlightOffOutlinedIcon color="warning" sx={{ fontSize: 44 }} />
        <Typography variant="h4" fontWeight={800}>
          Checkout Canceled
        </Typography>
        <Typography color="text.secondary">
          No payment was completed. You can return to plan selection when ready.
        </Typography>
        <Button component={RouterLink} to="/billing/plans" variant="contained">
          Choose a Plan
        </Button>
      </Stack>
    </Paper>
  );
}
