import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PlanSelectionPage from "./PlanSelectionPage";

const mocks = vi.hoisted(() => ({
  validateCoupon: vi.fn(),
  createCheckout: vi.fn(),
  refetchSubscription: vi.fn(),
  submitHostedCheckout: vi.fn(),
}));

const plans = [
  {
    id: 1,
    code: "free_trial",
    name: "Free Trial",
    price: "0.00",
    currency: "USD",
    trial_days: 30,
  },
  {
    id: 2,
    code: "go",
    name: "Go",
    price: "49.00",
    currency: "USD",
    is_purchasable: true,
  },
  {
    id: 3,
    code: "plus",
    name: "Plus",
    price: "99.00",
    currency: "USD",
    is_purchasable: true,
  },
];

vi.mock("@services/billingApi", () => ({
  useListBillingPlansQuery: () => ({ data: plans, isLoading: false, isError: false }),
  useGetSubscriptionQuery: () => ({
    data: null,
    refetch: mocks.refetchSubscription,
  }),
  useCreateCheckoutMutation: () => [mocks.createCheckout, { isLoading: false }],
  useValidateCouponMutation: () => [mocks.validateCoupon, { isLoading: false }],
}));

vi.mock("@utils/env", () => ({ STRIPE_CHECKOUT_ENABLED: false }));
vi.mock("./checkout", () => ({
  submitHostedCheckout: mocks.submitHostedCheckout,
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <PlanSelectionPage />
    </MemoryRouter>,
  );
}

async function selectPlan(index = 0) {
  await userEvent.click(screen.getAllByRole("button", { name: "Choose Plan" })[index]);
}

async function validateCoupon(code: string, response: Record<string, unknown>) {
  mocks.validateCoupon.mockReturnValueOnce({ unwrap: () => Promise.resolve(response) });
  await userEvent.type(screen.getByLabelText("Coupon code"), code);
  await userEvent.click(screen.getByRole("button", { name: "Validate" }));
  await screen.findByText(`Coupon: ${code}`);
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.refetchSubscription.mockResolvedValue({ data: null });
  vi.stubGlobal("scrollTo", vi.fn());
  sessionStorage.clear();
});

describe("PlanSelectionPage", () => {
  it("disables validation until a paid plan is selected", () => {
    renderPage();

    expect(screen.getByRole("button", { name: "Validate" })).toBeDisabled();
    expect(
      screen.getByText("Select a paid plan before applying a coupon."),
    ).toBeVisible();
  });

  it("shows a visible, accessible selected state on the whole plan card", async () => {
    renderPage();
    await selectPlan();

    const selectedButton = screen.getByRole("button", { name: "✓ Selected" });
    expect(selectedButton).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("Selected plan")).toBeVisible();
    expect(screen.getByText("Selected: Go")).toBeVisible();
    expect(screen.getByText("Total: $49.00/month")).toBeVisible();
  });

  it("displays the backend detail when coupon validation fails", async () => {
    renderPage();
    await selectPlan();
    mocks.validateCoupon.mockReturnValueOnce({
      unwrap: () => Promise.reject({ data: { detail: "Coupon has expired." } }),
    });

    await userEvent.type(screen.getByLabelText("Coupon code"), "OLDGO");
    await userEvent.click(screen.getByRole("button", { name: "Validate" }));

    expect(await screen.findByText("Coupon has expired.")).toBeVisible();
    expect(mocks.validateCoupon).toHaveBeenCalledWith({
      coupon_code: "OLDGO",
      plan_code: "go",
    });
  });

  it("activates FREEGO without opening PayHere", async () => {
    renderPage();
    await selectPlan();
    await validateCoupon("FREEGO", {
      valid: true,
      coupon_code: "FREEGO",
      original_amount: "49.00",
      discount_amount: "49.00",
      final_amount: "0.00",
      currency: "USD",
      message: "Free plan coupon applied.",
    });
    mocks.createCheckout.mockReturnValueOnce({
      unwrap: () =>
        Promise.resolve({
          mode: "activated",
          plan_code: "go",
          subscription_status: "active",
          message: "Go activated successfully.",
        }),
    });

    expect(screen.queryByText(/PayHere checkout opens/)).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Activate Go for Free" }));

    await waitFor(() => expect(mocks.createCheckout).toHaveBeenCalledTimes(1));
    expect(mocks.createCheckout).toHaveBeenCalledWith(
      expect.objectContaining({
        plan_code: "go",
        coupon_code: "FREEGO",
        gateway: "payhere",
        idempotency_key: expect.any(String),
      }),
    );
    await waitFor(() => expect(mocks.refetchSubscription).toHaveBeenCalled());
    expect(mocks.submitHostedCheckout).not.toHaveBeenCalled();
    expect(sessionStorage.getItem("billingNotice")).toBe("Go activated successfully.");
  });

  it("keeps GO29OFF in the existing hosted PayHere flow", async () => {
    renderPage();
    await selectPlan();
    await validateCoupon("GO29OFF", {
      valid: true,
      coupon_code: "GO29OFF",
      original_amount: "49.00",
      discount_amount: "29.00",
      final_amount: "20.00",
      currency: "USD",
      message: "Discount applied.",
    });
    const hostedResponse = {
      mode: "form_post",
      gateway: "payhere",
      action_url: "https://payhere.example/checkout",
      fields: { order_id: "123" },
    };
    mocks.createCheckout.mockReturnValueOnce({
      unwrap: () => Promise.resolve(hostedResponse),
    });

    expect(screen.getByText("Discount: −$29.00")).toBeVisible();
    await userEvent.click(
      screen.getByRole("button", { name: "Continue to PayHere — $20.00" }),
    );

    await waitFor(() => expect(mocks.submitHostedCheckout).toHaveBeenCalledWith(hostedResponse));
  });

  it("clears validation when the selected plan or coupon text changes", async () => {
    renderPage();
    await selectPlan();
    const coupon = {
      valid: true,
      coupon_code: "FREEGO",
      original_amount: "49.00",
      discount_amount: "49.00",
      final_amount: "0.00",
      currency: "USD",
    };
    await validateCoupon("FREEGO", coupon);

    await userEvent.click(screen.getAllByRole("button", { name: "Choose Plan" })[0]);
    expect(screen.queryByLabelText("Validated coupon pricing summary")).not.toBeInTheDocument();
    expect(screen.getByDisplayValue("FREEGO")).toBeVisible();

    mocks.validateCoupon.mockReturnValueOnce({ unwrap: () => Promise.resolve(coupon) });
    await userEvent.click(screen.getByRole("button", { name: "Validate" }));
    await screen.findByLabelText("Validated coupon pricing summary");
    await userEvent.type(screen.getByLabelText("Coupon code"), "X");
    expect(screen.queryByLabelText("Validated coupon pricing summary")).not.toBeInTheDocument();
  });

  it("prevents duplicate checkout submissions", async () => {
    renderPage();
    await selectPlan();
    mocks.createCheckout.mockReturnValue({ unwrap: () => new Promise(() => undefined) });
    const checkout = screen.getByRole("button", {
      name: "Continue to PayHere — $49.00",
    });

    fireEvent.click(checkout);
    fireEvent.click(checkout);

    expect(mocks.createCheckout).toHaveBeenCalledTimes(1);
    expect(checkout).toBeDisabled();
  });
});

