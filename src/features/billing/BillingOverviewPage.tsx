import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  LinearProgress,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useListDataSourcesQuery } from "@services/integrationApi";
import {
  useCancelSubscriptionMutation,
  useGetSubscriptionQuery,
} from "@services/billingApi";
import { dashboardTitleSx } from "@theme/index";
import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  formatDate,
  hasActiveAccess,
  readableOwnerType,
  remainingTrialDays,
  statusTone,
  subscriptionPlanName,
  subscriptionStatusLabel,
} from "./billingUtils";
import PaymentHistory from "./PaymentHistory";

function statusCopy(status?: string) {
  switch (status) {
    case "trialing":
      return "Trial access is active.";
    case "active":
      return "Subscription is active.";
    case "past_due":
      return "Payment attention is required.";
    case "canceled":
      return "Subscription has been canceled.";
    case "expired":
      return "Subscription has expired.";
    case "incomplete":
      return "Checkout is incomplete.";
    default:
      return "No subscription is active.";
  }
}

function entitlementNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export default function BillingOverviewPage() {
  const {
    data: subscription,
    isLoading,
    isFetching,
    refetch,
    error,
  } = useGetSubscriptionQuery();
  const hasAccess = hasActiveAccess(subscription);
  const { data: dataSources = [] } = useListDataSourcesQuery(undefined, {
    skip: !hasAccess,
  });
  const [cancelSubscription, { isLoading: isCanceling }] =
    useCancelSubscriptionMutation();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  useEffect(() => {
    const notice = sessionStorage.getItem("billingNotice");
    if (!notice) return;
    sessionStorage.removeItem("billingNotice");
    setFeedback({ type: "info", message: notice });
  }, []);

  const hasSubscription = Boolean(subscription?.id);
  const planName = subscriptionPlanName(subscription);
  const trialDaysRemaining = remainingTrialDays(subscription);
  const maxIntegrations = entitlementNumber(
    subscription?.entitlements?.max_integrations,
  );
  const integrationsUsed = dataSources.length;
  const integrationProgress =
    maxIntegrations && maxIntegrations > 0
      ? Math.min((integrationsUsed / maxIntegrations) * 100, 100)
      : 0;

  const statusIcon = useMemo(() => {
    if (!subscription) return <ErrorOutlineIcon color="disabled" />;
    if (subscription.status === "active" || subscription.status === "trialing") {
      return <CheckCircleOutlineIcon color="success" />;
    }
    return <ErrorOutlineIcon color="warning" />;
  }, [subscription]);

  const handleCancel = async () => {
    try {
      await cancelSubscription().unwrap();
      setCancelOpen(false);
      setFeedback({
        type: "success",
        message: "Subscription cancellation requested.",
      });
      await refetch();
    } catch (err: any) {
      setFeedback({
        type: "error",
        message:
          err?.data?.message ||
          err?.data?.detail ||
          "Unable to cancel the subscription.",
      });
    }
  };

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "center" }}
        spacing={2}
      >
        <Box>
          <Typography variant="h4" sx={dashboardTitleSx}>
            Billing
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Manage workspace subscription, trial access, and payments.
          </Typography>
        </Box>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
          <Button
            component={RouterLink}
            to="/billing/plans"
            variant="contained"
            startIcon={<TrendingUpOutlinedIcon />}
          >
            Upgrade Plan
          </Button>
        </Stack>
      </Stack>

      {feedback && (
        <Alert severity={feedback.type} onClose={() => setFeedback(null)}>
          {feedback.message}
        </Alert>
      )}

      {error ? (
        <Alert severity="warning">
          Subscription details could not be loaded. You can still view plans or
          retry from this page.
        </Alert>
      ) : null}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, height: "100%" }}>
            {isLoading ? (
              <Stack spacing={2}>
                <Skeleton width="45%" height={34} />
                <Skeleton height={70} />
                <Skeleton height={120} />
              </Stack>
            ) : (
              <Stack spacing={3}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  spacing={2}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    {statusIcon}
                    <Box>
                      <Typography variant="h5" fontWeight={800}>
                        {planName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {statusCopy(subscription?.status)}
                      </Typography>
                    </Box>
                  </Stack>
                  <Chip
                    color={statusTone(subscription?.status) as any}
                    label={
                      subscription
                        ? subscriptionStatusLabel(subscription)
                        : "no subscription"
                    }
                    sx={{ alignSelf: { xs: "flex-start", sm: "center" } }}
                  />
                </Stack>

                <Divider />

                {!hasSubscription ? (
                  <Stack spacing={2}>
                    <Alert severity="warning">
                      Your trial or subscription is not active. Choose a plan to
                      continue.
                    </Alert>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                      <Button
                        component={RouterLink}
                        to="/billing/plans"
                        variant="contained"
                      >
                        View Plans
                      </Button>
                    </Stack>
                  </Stack>
                ) : (
                  <Grid container spacing={2}>
                    {[
                      {
                        label: "Current Package",
                        value: planName,
                      },
                      {
                        label: "Owner Type",
                        value: readableOwnerType(subscription),
                      },
                      {
                        label: "Owner",
                        value: subscription?.owner?.name || "Current workspace",
                      },
                      {
                        label: "Trial Ends",
                        value: formatDate(subscription?.trial_end),
                      },
                      ...(subscription?.status === "trialing"
                        ? [
                            {
                              label: "Remaining Days",
                              value:
                                trialDaysRemaining === null
                                  ? "Not returned"
                                  : `${trialDaysRemaining} day${
                                      trialDaysRemaining === 1 ? "" : "s"
                                    }`,
                            },
                            {
                              label: "Payment Method",
                              value: "No credit card required",
                            },
                          ]
                        : []),
                      {
                        label: "Renews / Period Ends",
                        value: formatDate(subscription?.current_period_end),
                      },
                    ].map((item) => (
                      <Grid key={item.label} size={{ xs: 12, sm: 6 }}>
                        <Paper
                          variant="outlined"
                          sx={{ p: 2, borderRadius: 2, height: "100%" }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            {item.label}
                          </Typography>
                          <Typography fontWeight={700} sx={{ mt: 0.5 }}>
                            {item.value}
                          </Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                )}

                {subscription?.status === "expired" ? (
                  <Alert severity="warning">
                    Your free trial has expired. Select a plan and complete
                    payment to continue.
                  </Alert>
                ) : null}

                {subscription?.cancel_at_period_end ? (
                  <Alert severity="warning">
                    This subscription is set to cancel at the end of the current
                    billing period.
                  </Alert>
                ) : null}

                {hasSubscription ? (
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1.5}
                    alignItems="flex-start"
                  >
                    <Button
                      component={RouterLink}
                      to="/billing/plans"
                      variant="contained"
                    >
                      {hasAccess ? "Change Plan" : "Choose Plan"}
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<CancelOutlinedIcon />}
                      onClick={() => setCancelOpen(true)}
                      disabled={
                        isCanceling ||
                        subscription?.status === "canceled" ||
                        subscription?.cancel_at_period_end
                      }
                    >
                      Manage / Cancel
                    </Button>
                  </Stack>
                ) : null}
              </Stack>
            )}
            {isFetching && !isLoading ? <LinearProgress sx={{ mt: 2 }} /> : null}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, height: "100%" }}>
            <Stack spacing={2.5}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <AccountBalanceWalletOutlinedIcon color="primary" />
                <Box>
                  <Typography variant="h6" fontWeight={800}>
                    Usage
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Current frontend-visible usage.
                  </Typography>
                </Box>
              </Stack>

              <Box>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography fontWeight={700}>Integrations</Typography>
                  <Typography color="text.secondary">
                    {integrationsUsed}
                    {maxIntegrations ? ` / ${maxIntegrations}` : ""}
                  </Typography>
                </Stack>
                {maxIntegrations ? (
                  <LinearProgress
                    variant="determinate"
                    value={integrationProgress}
                    sx={{ height: 8, borderRadius: 999 }}
                  />
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Integration limit was not returned by the subscription API.
                  </Typography>
                )}
              </Box>

              {maxIntegrations && integrationsUsed >= maxIntegrations ? (
                <Alert
                  severity="warning"
                  action={
                    <Button
                      component={RouterLink}
                      to="/billing/plans"
                      size="small"
                      color="inherit"
                    >
                      Upgrade
                    </Button>
                  }
                >
                  Integration limit reached.
                </Alert>
              ) : null}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <PaymentHistory />

      <Dialog open={cancelOpen} onClose={() => setCancelOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Cancel Subscription</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            Cancellation may remove paid access at the end of the current period
            or immediately, depending on backend policy. Campaign data remains
            governed by the backend subscription state.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelOpen(false)} disabled={isCanceling}>
            Keep Subscription
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleCancel}
            disabled={isCanceling}
            startIcon={isCanceling ? <CircularProgress size={18} /> : undefined}
          >
            Confirm Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
