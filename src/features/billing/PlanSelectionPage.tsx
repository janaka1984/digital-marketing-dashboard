import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Typography,
  Chip,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import {
  BillingPlan,
  CouponValidationResponse,
  useCreateCheckoutMutation,
  useGetSubscriptionQuery,
  useListBillingPlansQuery,
} from "@services/billingApi";
import { dashboardTitleSx } from "@theme/index";
import { STRIPE_CHECKOUT_ENABLED } from "@utils/env";
import { useMemo, useRef, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { submitHostedCheckout } from "./checkout";
import CouponInput from "./CouponInput";
import PlanCard from "./PlanCard";
import {
  formatDate,
  isCurrentSubscriptionPlan,
  isPurchasablePlan,
  remainingTrialDays,
  subscriptionStatusLabel,
} from "./billingUtils";

function formatCheckoutAmount(amount: string | number, currency = "USD") {
  const numeric = Number(amount);
  if (!Number.isFinite(numeric)) return String(amount);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numeric);
}

function createIdempotencyKey() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function PlanSelectionPage() {
  const navigate = useNavigate();
  const { data: plans = [], isLoading, isError } = useListBillingPlansQuery();
  const { data: subscription, refetch: refetchSubscription } =
    useGetSubscriptionQuery();
  const [createCheckout, { isLoading: isCheckingOut }] =
    useCreateCheckoutMutation();
  const [selectedPlanCode, setSelectedPlanCode] = useState<string>("");
  const [gateway, setGateway] = useState<"payhere" | "stripe">("payhere");
  const [couponCode, setCouponCode] = useState("");
  const [validatedCoupon, setValidatedCoupon] =
    useState<CouponValidationResponse | null>(null);
  const [checkoutLocked, setCheckoutLocked] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);
  const checkoutStartedRef = useRef(false);
  const idempotencyKeysRef = useRef(new Map<string, string>());

  const selectedPlan = useMemo(
    () => plans.find((plan) => plan.code === selectedPlanCode) || null,
    [plans, selectedPlanCode],
  );

  const handleSelectPlan = (plan: BillingPlan) => {
    setSelectedPlanCode(plan.code);
    setValidatedCoupon(null);
    setFeedback(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleContactSales = (plan: BillingPlan) => {
    setFeedback({
      type: "info",
      message: `${plan.name} is a custom plan. Contact sales to configure account limits and billing.`,
    });
  };

  const handleCheckout = async () => {
    if (checkoutStartedRef.current || isCheckingOut) return;
    if (!selectedPlan) {
      setFeedback({ type: "info", message: "Please select Go or Plus first." });
      return;
    }

    if (!isPurchasablePlan(selectedPlan)) {
      handleContactSales(selectedPlan);
      return;
    }

    if (couponCode.trim() && !validatedCoupon) {
      setFeedback({
        type: "info",
        message: "Validate the coupon for the selected plan before checkout.",
      });
      return;
    }

    try {
      checkoutStartedRef.current = true;
      setCheckoutLocked(true);
      sessionStorage.setItem("pendingCheckoutPlan", selectedPlan.code);
      const isFreeActivation =
        validatedCoupon && String(validatedCoupon.final_amount) === "0.00";
      setFeedback({
        type: "info",
        message: isFreeActivation
          ? "Activating your plan…"
          : "Opening PayHere checkout. Please wait…",
      });
      const checkoutGateway = STRIPE_CHECKOUT_ENABLED ? gateway : "payhere";
      const validatedCode = validatedCoupon?.coupon_code || validatedCoupon?.code || "";
      const requestSignature = [
        selectedPlan.code,
        validatedCode,
        checkoutGateway,
      ].join(":");
      let idempotencyKey = idempotencyKeysRef.current.get(requestSignature);
      if (!idempotencyKey) {
        idempotencyKey = createIdempotencyKey();
        idempotencyKeysRef.current.set(requestSignature, idempotencyKey);
      }
      const response = await createCheckout({
        plan_code: selectedPlan.code,
        gateway: checkoutGateway,
        coupon_code: validatedCode,
        idempotency_key: idempotencyKey,
        return_url: `${window.location.origin}/billing/success`,
        cancel_url: `${window.location.origin}/billing/cancel`,
      }).unwrap();

      if (response.mode === "activated") {
        const successMessage =
          response.message || `${selectedPlan.name} was activated successfully.`;
        setFeedback({ type: "success", message: successMessage });
        await refetchSubscription();
        setSelectedPlanCode("");
        setCouponCode("");
        setValidatedCoupon(null);
        sessionStorage.removeItem("pendingCheckoutPlan");
        sessionStorage.setItem("billingNotice", successMessage);
        navigate("/billing", { replace: true });
        return;
      }

      submitHostedCheckout(response);
    } catch (error: any) {
      checkoutStartedRef.current = false;
      setCheckoutLocked(false);
      sessionStorage.removeItem("pendingCheckoutPlan");
      setFeedback({
        type: "error",
        message:
          error?.data?.message ||
          error?.data?.detail ||
          "Checkout could not be started.",
      });
    }
  };

  const selectedPlanAmount = selectedPlan
    ? selectedPlan.price ?? (selectedPlan.code.toLowerCase() === "go" ? 49 : 99)
    : null;
  const selectedCurrency = selectedPlan?.currency || "USD";
  const couponDisplayCode =
    validatedCoupon?.coupon_code || validatedCoupon?.code || couponCode.trim();
  const isZeroTotal =
    validatedCoupon !== null &&
    String(validatedCoupon.final_amount) === "0.00";
  const checkoutAmount = validatedCoupon
    ? formatCheckoutAmount(validatedCoupon.final_amount, validatedCoupon.currency)
    : selectedPlanAmount !== null
      ? formatCheckoutAmount(selectedPlanAmount, selectedCurrency)
      : null;
  const hasUnvalidatedCoupon = Boolean(couponCode.trim() && !validatedCoupon);

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
            Plans
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Select a subscription for agency or direct-client billing.
          </Typography>
        </Box>
        <Button
          component={RouterLink}
          to="/billing"
          variant="outlined"
          startIcon={<ArrowBackIcon />}
        >
          Billing Overview
        </Button>
      </Stack>

      {feedback && (
        <Alert severity={feedback.type} onClose={() => setFeedback(null)}>
          {feedback.message}
        </Alert>
      )}

      {subscription?.status === "trialing" ? (
        <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <Typography variant="h6" fontWeight={800}>Free Trial</Typography>
              <Chip
                size="small"
                color="success"
                label={subscriptionStatusLabel(subscription)}
              />
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Trial expires {formatDate(subscription.trial_end)} · {remainingTrialDays(subscription) ?? 0} days remaining · No credit card required
            </Typography>
          </Stack>
        </Paper>
      ) : null}

      <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
        <Stack spacing={2.5}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", md: "flex-start" }}
          >
            <Box sx={{ flex: 1 }}>
              <CouponInput
                planCode={selectedPlanCode || undefined}
                couponCode={couponCode}
                onCouponChange={(value) => {
                  setCouponCode(value);
                  setValidatedCoupon(null);
                }}
                onValidated={setValidatedCoupon}
              />
            </Box>
            {STRIPE_CHECKOUT_ENABLED ? (
              <TextField
                select
                label="Checkout gateway"
                value={gateway}
                onChange={(event) =>
                  setGateway(event.target.value as "payhere" | "stripe")
                }
                size="small"
                sx={{ minWidth: { xs: "100%", md: 220 } }}
              >
                <MenuItem value="payhere">PayHere</MenuItem>
                <MenuItem value="stripe">Stripe</MenuItem>
              </TextField>
            ) : null}
          </Stack>

          {validatedCoupon ? (
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Stack spacing={0.75} aria-label="Validated coupon pricing summary">
                <Typography fontWeight={800}>
                  Selected plan: {selectedPlan?.name}
                </Typography>
                <Typography variant="body2">
                  Original price: {formatCheckoutAmount(
                    validatedCoupon.original_amount,
                    validatedCoupon.currency,
                  )}
                </Typography>
                <Typography variant="body2">Coupon: {couponDisplayCode}</Typography>
                <Typography variant="body2">
                  Discount: −{formatCheckoutAmount(
                    validatedCoupon.discount_amount || 0,
                    validatedCoupon.currency,
                  )}
                </Typography>
                <Typography fontWeight={800}>
                  Total today: {formatCheckoutAmount(
                    validatedCoupon.final_amount,
                    validatedCoupon.currency,
                  )}
                </Typography>
                {validatedCoupon.message ? (
                  <Typography variant="caption" color="text.secondary">
                    {validatedCoupon.message}
                  </Typography>
                ) : null}
              </Stack>
            </Paper>
          ) : null}

          {!isZeroTotal ? (
            <Alert severity="info" icon={<CreditCardOutlinedIcon />}>
              PayHere checkout opens on the hosted gateway page. Card numbers,
              CVC, and raw payment details are never collected in this frontend.
            </Alert>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No payment details required.
            </Typography>
          )}
        </Stack>
      </Paper>

      {isError ? (
        <Alert severity="error">Plans could not be loaded.</Alert>
      ) : isLoading ? (
        <Grid container spacing={2}>
          {[1, 2, 3].map((item) => (
            <Grid key={item} size={{ xs: 12, md: 4 }}>
              <Skeleton variant="rounded" height={420} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container spacing={2}>
          {plans.map((plan) => (
            <Grid key={plan.id || plan.code} size={{ xs: 12, md: 4 }}>
              <PlanCard
                plan={plan}
                isCurrent={
                  isCurrentSubscriptionPlan(plan, subscription)
                }
                isSelected={selectedPlanCode === plan.code}
                isBusy={checkoutLocked || isCheckingOut}
                onSelect={handleSelectPlan}
                onContactSales={handleContactSales}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", md: "center" }}
          spacing={2}
        >
          <Box>
            <Typography variant="h6" fontWeight={800}>
              {selectedPlan
                ? `Selected: ${selectedPlan.name}`
                : "Select a paid plan to continue."}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedPlan ? (
                <>
                  {validatedCoupon ? `Coupon: ${couponDisplayCode} · ` : ""}
                  {validatedCoupon ? "Total today" : "Total"}: {checkoutAmount}
                  {!validatedCoupon ? "/month" : ""}
                </>
              ) : (
                "Your subscription changes only after checkout is completed."
              )}
            </Typography>
          </Box>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <Button
              variant="contained"
              onClick={handleCheckout}
              disabled={
                !selectedPlan ||
                hasUnvalidatedCoupon ||
                checkoutLocked ||
                isCheckingOut ||
                checkoutStartedRef.current
              }
              startIcon={
                isCheckingOut ? (
                  <CircularProgress size={18} color="inherit" />
                ) : undefined
              }
            >
              {checkoutLocked || isCheckingOut
                ? isZeroTotal
                  ? "Activating…"
                  : "Opening PayHere…"
                : isZeroTotal
                  ? `Activate ${selectedPlan?.name} for Free`
                  : STRIPE_CHECKOUT_ENABLED && gateway === "stripe"
                    ? `Continue to Checkout — ${checkoutAmount}`
                    : `Continue to PayHere — ${checkoutAmount}`}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  );
}
