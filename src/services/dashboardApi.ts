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
        const { range, days = 30 } = params;

        return range
          ? `tracking/dashboard-campaigns/?range=${range}`
          : `tracking/dashboard-campaigns/?days=${days}`;
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
  useGetAgencyOverviewQuery,
  useGetEventsGeoSummaryQuery,
} = dashboardApi;
