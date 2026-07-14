import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import type { BillingPlan } from "@services/billingApi";
import { isFreeTrialPlan, isPurchasablePlan, planPriceLabel } from "./billingUtils";

type PlanCardProps = {
  plan: BillingPlan;
  isCurrent?: boolean;
  isSelected?: boolean;
  isBusy?: boolean;
  onSelect: (plan: BillingPlan) => void;
  onContactSales: (plan: BillingPlan) => void;
};

function featureValueLabel(value: unknown) {
  if (value === true || value === "true") return "Included";
  if (value === false || value === "false") return "Not included";
  if (value === null || value === undefined || value === "") return "";
  return String(value);
}

export default function PlanCard({
  plan,
  isCurrent,
  isSelected,
  isBusy,
  onSelect,
  onContactSales,
}: PlanCardProps) {
  const purchasable = isPurchasablePlan(plan);
  const highlighted = ["go", "plus"].includes(plan.code);
  const isPlus = plan.code === "plus";
  const isFreeTrial = isFreeTrialPlan(plan);
  const showTrialBadge =
    Boolean(plan.trial_days) && isFreeTrial;

  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        borderRadius: 3,
        borderWidth: isSelected ? 2 : 1,
        borderColor: isSelected ? "primary.main" : "divider",
        backgroundColor: isSelected
          ? (theme) => theme.palette.action.selected
          : "background.paper",
        boxShadow: isSelected
          ? (theme) => `0 0 0 3px ${theme.palette.primary.main}24`
          : "none",
        transition: (theme) =>
          theme.transitions.create(["border-color", "box-shadow", "background-color"]),
      }}
    >
      <CardContent sx={{ height: "100%" }}>
        <Stack spacing={2.25} sx={{ height: "100%" }}>
          <Stack spacing={1}>
            <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
              <Typography variant="h5" fontWeight={800}>
                {plan.name || plan.code}
              </Typography>
              {highlighted && (
                <Chip
                  size="small"
                  color={isPlus ? "primary" : "secondary"}
                  label={isPlus ? "Popular" : "Starter"}
                />
              )}
              {isCurrent && <Chip size="small" color="success" label="Current" />}
              {isSelected && (
                <Chip size="small" color="primary" label="Selected plan" />
              )}
            </Stack>

            <Typography variant="body2" color="text.secondary" minHeight={42}>
              {plan.description || "Flexible campaign optimization workspace."}
            </Typography>
          </Stack>

          <Box>
            <Typography variant="h4" fontWeight={800}>
              {planPriceLabel(plan)}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1 }}>
              {showTrialBadge ? (
                <Chip
                  size="small"
                  label={`${plan.trial_days || 30} days`}
                />
              ) : null}
              {!isFreeTrial && plan.currency ? (
                <Chip size="small" label={plan.currency} />
              ) : null}
            </Stack>
          </Box>

          <Divider />

          <Stack spacing={1.25} sx={{ flexGrow: 1 }}>
            {(plan.features?.length
              ? plan.features
              : [{ code: "workspace", name: "Workspace access", value: "Included" }]
            ).map((feature) => {
              const value = featureValueLabel(feature.value);
              return (
                <Stack
                  key={feature.code}
                  direction="row"
                  spacing={1}
                  alignItems="flex-start"
                >
                  <CheckCircleOutlineIcon
                    fontSize="small"
                    color="success"
                    sx={{ mt: 0.15 }}
                  />
                  <Typography variant="body2" color="text.primary">
                    {value && value !== "Included"
                      ? `${feature.name}: ${value}`
                      : feature.name}
                  </Typography>
                </Stack>
              );
            })}
          </Stack>

          <Button
            fullWidth
            variant={isSelected ? "contained" : "outlined"}
            onClick={() => (purchasable ? onSelect(plan) : onContactSales(plan))}
            disabled={isBusy || isCurrent || isFreeTrial}
            aria-pressed={purchasable ? Boolean(isSelected) : undefined}
            startIcon={
              isBusy && isSelected ? (
                <CircularProgress size={18} color="inherit" />
              ) : undefined
            }
          >
            {isCurrent
              ? "Current Plan"
              : isFreeTrial
                ? "Included Automatically"
              : isSelected
                ? "✓ Selected"
              : purchasable
                ? "Choose Plan"
                : "Contact Sales"}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
