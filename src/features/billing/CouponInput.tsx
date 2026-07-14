import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  TextField,
} from "@mui/material";
import {
  CouponValidationResponse,
  useValidateCouponMutation,
} from "@services/billingApi";
import { useEffect, useState } from "react";

type CouponInputProps = {
  planCode?: string;
  couponCode: string;
  onCouponChange: (value: string) => void;
  onValidated: (coupon: CouponValidationResponse | null) => void;
};

function couponMessage(coupon: CouponValidationResponse) {
  if (coupon.message) return coupon.message;
  if (coupon.discount_percent) return `${coupon.discount_percent}% discount applied.`;
  if (coupon.discount_amount) return `${coupon.discount_amount} discount applied.`;
  return "Coupon applied.";
}

export default function CouponInput({
  planCode,
  couponCode,
  onCouponChange,
  onValidated,
}: CouponInputProps) {
  const [validateCoupon, { isLoading }] = useValidateCouponMutation();
  const [status, setStatus] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  const trimmedCode = couponCode.trim();

  useEffect(() => {
    setStatus(null);
  }, [planCode]);

  const handleValidate = async () => {
    if (!planCode) {
      onValidated(null);
      setStatus({ type: "info", message: "Please select Go or Plus first." });
      return;
    }

    if (!trimmedCode) {
      onValidated(null);
      setStatus({ type: "info", message: "Enter a coupon code first." });
      return;
    }

    try {
      const coupon = await validateCoupon({
        coupon_code: trimmedCode,
        plan_code: planCode,
      }).unwrap();

      if (coupon.valid === false) {
        onValidated(null);
        setStatus({
          type: "error",
          message: coupon.message || "This coupon is not valid.",
        });
        return;
      }

      onValidated(coupon);
      setStatus({ type: "success", message: couponMessage(coupon) });
    } catch (error: any) {
      onValidated(null);
      setStatus({
          type: "error",
          message:
          error?.data?.detail ||
          error?.data?.message ||
          "Unable to validate this coupon.",
      });
    }
  };

  return (
    <Box>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
        <TextField
          label="Coupon code"
          value={couponCode}
          onChange={(event) => {
            onCouponChange(event.target.value);
            onValidated(null);
            setStatus(null);
          }}
          fullWidth
          size="small"
          InputProps={{
            startAdornment: (
              <LocalOfferOutlinedIcon
                fontSize="small"
                sx={{ mr: 1, color: "text.secondary" }}
              />
            ),
          }}
        />
        <Button
          variant="outlined"
          onClick={handleValidate}
          disabled={!planCode || isLoading}
          sx={{ minWidth: 120 }}
          startIcon={isLoading ? <CircularProgress size={16} /> : undefined}
        >
          {isLoading ? "Validating…" : "Validate"}
        </Button>
      </Stack>

      {!planCode && !status ? (
        <Box
          component="p"
          sx={{ mt: 1, mb: 0, typography: "caption", color: "text.secondary" }}
        >
          Select a paid plan before applying a coupon.
        </Box>
      ) : null}

      {status && (
        <Alert
          severity={status.type}
          sx={{ mt: 1.5 }}
          role="status"
          aria-live="polite"
        >
          {status.message}
        </Alert>
      )}
    </Box>
  );
}
