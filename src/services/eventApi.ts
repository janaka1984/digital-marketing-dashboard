import { apiBase } from './apiBase';
import type { EventItem, EventStats, CampaignPerformance } from '@types/index';

export const eventApi = apiBase.injectEndpoints({
  endpoints: (build) => ({
    // Recent events
    listEvents: build.query<EventItem[], void>({
      query: () => '/events/recent',
      providesTags: (result) =>
        result
          ? [
              ...result.map((e) => ({ type: 'Event' as const, id: e.id })),
              { type: 'Event', id: 'LIST' },
            ]
          : [{ type: 'Event', id: 'LIST' }],
    }),

    // Stats (overview KPIs)
    getEventStats: build.query<EventStats, void>({
      query: () => '/events/stats',
      providesTags: [{ type: 'Stats', id: 'AGG' }],
    }),

    // Campaign performance
    getCampaignPerformance: build.query<CampaignPerformance[], void>({
      query: () => '/events/campaigns',
      providesTags: [{ type: 'Campaign', id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useListEventsQuery,
  useGetEventStatsQuery,
  useGetCampaignPerformanceQuery,
} = eventApi;
