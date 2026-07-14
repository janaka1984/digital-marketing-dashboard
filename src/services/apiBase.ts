import { fetchBaseQuery, createApi } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "@utils/env";
import { signOut, signIn } from "@features/auth/authSlice";

const SUBSCRIPTION_REQUIRED_MESSAGE =
  "Your trial or subscription is not active. Choose a plan to continue.";

function isOverviewOrBillingPath(pathname: string) {
  return (
    pathname === "/" ||
    pathname === "/agency/overview" ||
    pathname === "/client/overview" ||
    pathname.startsWith("/billing")
  );
}

function handleSubscriptionRequiredRedirect() {
  if (typeof window === "undefined") return;
  const { pathname } = window.location;
  sessionStorage.setItem("billingNotice", SUBSCRIPTION_REQUIRED_MESSAGE);
  window.dispatchEvent(
    new CustomEvent("billingNotice", {
      detail: SUBSCRIPTION_REQUIRED_MESSAGE,
    }),
  );
  if (isOverviewOrBillingPath(pathname)) return;
  window.location.assign("/billing");
}

const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as any).auth.accessToken;
    if (token) headers.set("authorization", `Bearer ${token}`);
    headers.set("accept", "application/json");
    return headers;
  },
});

// Wrapper to handle 401 errors (refresh token)
const baseQueryWithReauth: typeof baseQuery = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const state = (api.getState() as any).auth;
    const refreshToken = state.refreshToken;

    if (refreshToken) {
      // Try refreshing
      const refreshResult = await baseQuery(
        { url: "/token/refresh/", method: "POST", body: { refresh: refreshToken } },
        api,
        extraOptions
      );

      if (refreshResult.data) {
        const newAccess = (refreshResult.data as any).access;
        api.dispatch(
          signIn({
            name: state.user?.name || "",
            accessToken: newAccess,
            refreshToken,
          })
        );

        // Retry original request
        result = await baseQuery(args, api, extraOptions);
      } else {
        api.dispatch(signOut());
      }
    } else {
      api.dispatch(signOut());
    }
  }

  if (result.error && result.error.status === 402) {
    const data = result.error.data as { code?: string } | undefined;
    if (data?.code === "subscription_required") {
      api.dispatch(
        apiBase.util.invalidateTags([{ type: "Subscription", id: "CURRENT" }]),
      );
      handleSubscriptionRequiredRedirect();
    }
  }

  return result;
};

export const apiBase = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "Event",
    "Stats",
    "Campaign",
    "Clients",
    "Integration",
    "BillingPlan",
    "Subscription",
    "Payment",
  ],
  endpoints: () => ({}),
});
