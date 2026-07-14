import dayjs from "dayjs";
import type { BillingPlan, Subscription } from "@services/billingApi";

export function formatMoney(
  amount?: string | number | null,
  currency = "USD",
) {
  const numeric = Number(amount);
  if (!Number.isFinite(numeric)) return "Custom";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: numeric % 1 === 0 ? 0 : 2,
  }).format(numeric);
}

export function formatDate(value?: string | null) {
  if (!value) return "Not set";
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format("MMM D, YYYY") : "Not set";
}

export function planPriceLabel(plan: BillingPlan) {
  if (isFreeTrialPlan(plan)) return `${plan.trial_days || 30} days`;
  if (plan.is_custom) return "Custom";
  const fallbackPrice =
    plan.code?.toLowerCase() === "go"
      ? 49
      : plan.code?.toLowerCase() === "plus"
        ? 99
        : plan.price;
  const currency = plan.currency || "USD";
  const price = formatMoney(plan.price ?? fallbackPrice, currency);
  const interval = plan.billing_interval || "month";
  return `${price}/${interval}, billed ${interval}ly`;
}

export function isPurchasablePlan(plan: BillingPlan) {
  if (isFreeTrialPlan(plan)) return false;
  if (typeof plan.is_purchasable === "boolean") return plan.is_purchasable;
  if (typeof plan.purchasable === "boolean") return plan.purchasable;
  return !plan.is_custom && plan.code !== "pro";
}

export function hasManagedSubscription(subscription?: Subscription | null) {
  return hasActiveAccess(subscription);
}

export function hasActiveAccess(subscription?: Subscription | null) {
  return Boolean(subscription && ["trialing", "active"].includes(subscription.status));
}

export function isRestrictedSubscription(subscription?: Subscription | null) {
  if (!subscription) return true;
  return !hasActiveAccess(subscription);
}

export function isFreeTrialPlan(plan?: BillingPlan | null) {
  if (!plan) return false;
  const code = plan.code?.toLowerCase();
  const name = plan.name?.toLowerCase();
  return (
    code === "free_trial" ||
    code === "trial" ||
    code === "free" ||
    name === "free trial"
  );
}

export function subscriptionPlanName(subscription?: Subscription | null) {
  if (!subscription) return "No subscription";
  if (
    subscription.status === "trialing" ||
    subscription.plan?.code?.toLowerCase() === "free_trial" ||
    subscription.plan_name?.toLowerCase() === "free trial"
  ) {
    return "Free Trial";
  }
  return (
    subscription.plan?.name ||
    subscription.plan_name ||
    "Subscription"
  );
}

export function subscriptionPackageLabel(subscription?: Subscription | null) {
  if (!subscription) return "";
  if (
    subscription.status === "trialing" ||
    subscription.plan?.code?.toLowerCase() === "free_trial" ||
    subscription.plan_name?.toLowerCase() === "free trial"
  ) {
    return "Free Trial";
  }
  return subscription.plan?.name || subscription.plan_name || "";
}

export function subscriptionStatusLabel(subscription?: Subscription | null) {
  if (!subscription?.status) return "status pending";
  return subscription.status.replace(/_/g, " ");
}

export function subscriptionPlanCode(subscription?: Subscription | null) {
  if (!subscription) return "";
  if (subscription.status === "trialing") return "free_trial";

  const rawCode =
    subscription.plan?.code ||
    subscription.plan_name ||
    subscription.plan?.name ||
    "";

  const normalized = rawCode.toLowerCase().trim().replace(/\s+/g, "_");
  if (normalized === "free" || normalized === "trial") return "free_trial";
  return normalized;
}

export function isCurrentSubscriptionPlan(
  plan: BillingPlan,
  subscription?: Subscription | null,
) {
  const currentCode = subscriptionPlanCode(subscription);
  const planCode = plan.code?.toLowerCase().trim().replace(/\s+/g, "_");
  return (
    currentCode === planCode ||
    (currentCode === "free_trial" && isFreeTrialPlan(plan))
  );
}

export function remainingTrialDays(subscription?: Subscription | null) {
  if (!subscription?.trial_end) return null;
  const end = dayjs(subscription.trial_end);
  if (!end.isValid()) return null;
  return Math.max(end.diff(dayjs(), "day") + 1, 0);
}

export function readableOwnerType(subscription?: Subscription | null) {
  const ownerType = subscription?.owner?.type || subscription?.owner_type;
  if (ownerType === "agency") return "Agency";
  if (ownerType === "direct_client" || ownerType === "client") {
    return "Direct client";
  }
  return ownerType ? ownerType.replace(/_/g, " ") : "Not returned";
}

export function statusTone(status?: string) {
  if (status === "active" || status === "trialing") return "success";
  if (status === "past_due" || status === "incomplete" || status === "unpaid") return "warning";
  if (status === "canceled" || status === "expired") return "error";
  return "default";
}
