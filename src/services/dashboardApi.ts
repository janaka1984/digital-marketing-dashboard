import { apiBase } from "./apiBase";
import { AgencyOverviewResponse } from "../types/agency";
import { buildGeoSummaryQuery, GeoSummaryFilters, GeoSummaryResponse } from "./geoSummaryApi";

export const dashboardApi = apiBase.injectEndpoints({
  endpoints: (build) => ({

    // Overview (Page 1)
    getDashboardOverview: build.query({
        query: (params: any = {}) => {
            const { range, days = 30 } = params;

            return range
            ? `tracking/dashboard-overview/?range=${range}`
            : `tracking/dashboard-overview/?days=${days}`;
        },
    }),

    // Funnel
    getDashboardFunnel: build.query({
        query: (params: any = {}) => {
            const { range, days = 30 } = params;

            return range
            ? `tracking/dashboard-funnel/?range=${range}`
            : `tracking/dashboard-funnel/?days=${days}`;
        },
    }),

    // Campaigns (Page 2)
    getDashboardCampaigns: build.query({
      query: (params: any = {}) => {
        const {
          level = "campaign",
          range,
          days = 30,
          platform,
          status,
          campaign_id,
          adset_id,
        } = params;
        const queryParams = new URLSearchParams();

        queryParams.set("level", level);
        if (range) queryParams.set("range", range);
        else queryParams.set("days", String(days));
        if (platform && platform !== "all") queryParams.set("platform", platform);
        if (status) queryParams.set("status", status);
        if (campaign_id) queryParams.set("campaign_id", String(campaign_id));
        if (adset_id) queryParams.set("adset_id", String(adset_id));

        return `tracking/dashboard-campaigns/?${queryParams.toString()}`;
      },
    }),

    generateAiRecommendations: build.mutation({
      query: (body: any) => ({
        url: "ai-optimizer/recommendations/generate/",
        method: "POST",
        body,
      }),
    }),

    getAiRecommendations: build.query({
      query: (params: any = {}) => {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "" && value !== "all") {
            queryParams.set(key, String(value));
          }
        });

        const queryString = queryParams.toString();
        return `ai-optimizer/recommendations/${queryString ? `?${queryString}` : ""}`;
      },
    }),

    // Agency Overview (for agency users)
    getAgencyOverview: build.query<AgencyOverviewResponse, { range?: string; days?: number }>({
      query: (params: any = {}) => {
        const { range, days = 30 } = params;

        return range
          ? `tracking/agency-overview/?range=${range}`
          : `tracking/agency-overview/?days=${days}`;
      },
    }),

    // Geo summary for map
    getEventsGeoSummary: build.query<GeoSummaryResponse, Partial<GeoSummaryFilters>>({
      query: (params = {}) => buildGeoSummaryQuery(params),
    }),

  }),
  // ensures no conflict with eventApi
  overrideExisting: false,
});

export const {
  useGetDashboardOverviewQuery,
  useGetDashboardFunnelQuery,
  useGetDashboardCampaignsQuery,
  useGenerateAiRecommendationsMutation,
  useGetAiRecommendationsQuery,
  useGetAgencyOverviewQuery,
  useGetEventsGeoSummaryQuery,
} = dashboardApi;
