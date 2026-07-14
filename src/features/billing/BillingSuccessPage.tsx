import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import PendingOutlinedIcon from "@mui/icons-material/PendingOutlined";
import ReplayOutlinedIcon from "@mui/icons-material/ReplayOutlined";
import {
  Alert,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useGetSubscriptionQuery } from "@services/billingApi";
import { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAppSelector } from "@store/hooks";
import { subscriptionPlanCode } from "./billingUtils";

export default function BillingSuccessPage() {
  const navigate = useNavigate();
  const role = useAppSelector((state) => state.auth.user?.role);
  const [hasRefetched, setHasRefetched] = useState(false);
  const expectedPlanCode = sessionStorage.getItem("pendingCheckoutPlan")
    ?.toLowerCase()
    .trim()
    .replace(/\s+/g, "_");
  const { data: subscription, refetch, isFetching, isError } =
    useGetSubscriptionQuery();

  useEffect(() => {
    let mounted = true;
    void refetch().finally(() => {
      if (mounted) setHasRefetched(true);
    });
    return () => {
      mounted = false;
    };
  }, [refetch]);

  const isConfirmedPaid = Boolean(
    hasRefetched &&
      subscription &&
      subscription.status === "active" &&
      (!expectedPlanCode || subscriptionPlanCode(subscription) === expectedPlanCode),
  );
  const activePlanName =
    subscription?.plan?.name || subscription?.plan_name || "selected";

  useEffect(() => {
    if (!isConfirmedPaid) return;
    sessionStorage.removeItem("pendingCheckoutPlan");
    const overviewPath = role === "agency" ? "/agency/overview" : "/client/overview";
    const timer = window.setTimeout(
      () => navigate(overviewPath, { replace: true }),
      1800,
    );
    return () => window.clearTimeout(timer);
  }, [isConfirmedPaid, navigate, role]);

  return (
    <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 3 }}>
      <Stack spacing={2.5} alignItems="flex-start">
        {isConfirmedPaid ? (
          <CheckCircleOutlineIcon color="success" sx={{ fontSize: 44 }} />
        ) : (
          <PendingOutlinedIcon color="warning" sx={{ fontSize: 44 }} />
        )}
        <Typography variant="h4" fontWeight={800}>
          {isConfirmedPaid ? "Payment Successful" : "Payment Processing"}
        </Typography>
        <Alert severity={isConfirmedPaid ? "success" : "info"}>
          {isConfirmedPaid
            ? `Payment successful. Your ${activePlanName} plan is now active.`
            : "PayHere returned to the app. The PayHere webhook is the source of truth, so activation can take a moment."}
        </Alert>
        {isError ? (
          <Alert severity="warning">
            Subscription status could not be refreshed. Retry in a moment from
            this page or check Billing Overview.
          </Alert>
        ) : null}
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
          <Button
            variant="outlined"
            onClick={() => refetch()}
            disabled={isFetching}
            startIcon={
              isFetching ? <CircularProgress size={18} /> : <ReplayOutlinedIcon />
            }
          >
            Refresh Status
          </Button>
          {isFetching ? <CircularProgress size={24} sx={{ alignSelf: "center" }} /> : null}
        </Stack>
        <Button component={RouterLink} to="/billing" variant="contained">
          Back to Billing
        </Button>
      </Stack>
    </Paper>
  );
}
