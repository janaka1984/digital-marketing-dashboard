import { fetchBaseQuery, createApi } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "@utils/env";
import { signOut, signIn } from "@features/auth/authSlice";

const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as any).auth.accessToken;
    if (token) headers.set("authorization", `Bearer ${token}`);
    headers.set("accept", "application/json");
    return headers;
  },
});

// 🔁 Wrapper to handle 401 errors (refresh token)
const baseQueryWithReauth: typeof baseQuery = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const state = (api.getState() as any).auth;
    const refreshToken = state.refreshToken;

    if (refreshToken) {
      // Try refreshing
      const refreshResult = await baseQuery(
        { url: "api/token/refresh/", method: "POST", body: { refresh: refreshToken } },
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

  return result;
};

export const apiBase = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Event", "Stats", "Campaign"],
  endpoints: () => ({}),
});
