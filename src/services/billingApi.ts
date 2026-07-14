import { apiBase } from "./apiBase";

export type BillingFeature = {
  code: string;
  name: string;
  value: string;
  value_type?: string;
};

export type BillingPlan = {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  price?: string | number | null;
  currency?: string | null;
  billing_interval?: string | null;
  trial_days?: number | null;
  is_custom?: boolean;
  is_purchasable?: boolean;
  purchasable?: boolean;
  features?: BillingFeature[];
};

export type BillingOwner = {
  type?: "agency" | "direct_client" | "client" | string;
  id?: number;
  name?: string;
};

export type Subscription = {
  id: number;
  owner_type?: "agency" | "direct_client" | "client" | string;
  owner?: BillingOwner | null;
  plan?: BillingPlan | null;
  plan_name?: string | null;
  gateway?: string | null;
  status:
    | "trialing"
    | "active"
    | "past_due"
    | "unpaid"
    | "canceled"
    | "expired"
    | "incomplete"
    | string;
  is_active?: boolean;
  trial_start?: string | null;
  trial_end?: string | null;
  current_period_start?: string | null;
  current_period_end?: string | null;
  cancel_at_period_end?: boolean;
  canceled_at?: string | null;
  entitlements?: Record<string, string | number | boolean | null>;
};

export type Payment = {
  id: number;
  gateway: string;
  gateway_payment_id?: string | null;
  gateway_order_id?: string | null;
  amount: string | number;
  currency: string;
  status: string;
  paid_at?: string | null;
  created_at?: string | null;
};

export type CouponValidationResponse = {
  valid?: boolean;
  code?: string;
  coupon_code?: string;
  message?: string;
  original_amount: string | number;
  discount_amount?: string | number | null;
  final_amount: string | number;
  currency: string;
  discount_percent?: string | number | null;
  [key: string]: unknown;
};

export type CheckoutRequest = {
  plan_code: string;
  gateway: "payhere" | "stripe" | string;
  coupon_code?: string;
  idempotency_key: string;
  return_url?: string;
  cancel_url?: string;
};

export type HostedCheckoutResponse =
  | {
      mode: "activated";
      plan_code: string;
      subscription_status: "active" | string;
      message?: string;
    }
  | {
      gateway: "stripe" | string;
      mode: "redirect";
      checkout_url: string;
    }
  | {
      gateway: "payhere" | string;
      mode: "form_post";
      action_url: string;
      fields: Record<string, string | number | boolean | null | undefined>;
    };

export const billingApi = apiBase.injectEndpoints({
  endpoints: (build) => ({
    listBillingPlans: build.query<BillingPlan[], void>({
      query: () => "billing/plans/",
      providesTags: [{ type: "BillingPlan", id: "LIST" }],
    }),
    getSubscription: build.query<Subscription | null, void>({
      query: () => "billing/subscription/",
      providesTags: [{ type: "Subscription", id: "CURRENT" }],
    }),
    createCheckout: build.mutation<HostedCheckoutResponse, CheckoutRequest>({
      query: (body) => ({
        url: "billing/checkout/",
        method: "POST",
        body,
      }),
    }),
    validateCoupon: build.mutation<
      CouponValidationResponse,
      { coupon_code: string; plan_code: string }
    >({
      query: (body) => ({
        url: "billing/coupon/validate/",
        method: "POST",
        body,
      }),
    }),
    listPayments: build.query<Payment[], void>({
      query: () => "billing/payments/",
      providesTags: [{ type: "Payment", id: "LIST" }],
    }),
    cancelSubscription: build.mutation<Subscription, void>({
      query: () => ({
        url: "billing/subscription/cancel/",
        method: "POST",
      }),
      invalidatesTags: [
        { type: "Subscription", id: "CURRENT" },
        { type: "Payment", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useListBillingPlansQuery,
  useGetSubscriptionQuery,
  useCreateCheckoutMutation,
  useValidateCouponMutation,
  useListPaymentsQuery,
  useCancelSubscriptionMutation,
} = billingApi;
