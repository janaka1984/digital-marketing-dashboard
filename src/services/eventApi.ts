import { apiBase } from './apiBase';


import type { EventItem, EventStats, CampaignPerformance } from '@types';

export const eventApi = apiBase.injectEndpoints({
  endpoints: (build) => ({
    
    listEvents: build.query<EventItem[], { page: number; pageSize: number }>({
      query: ({ page, pageSize }) => `tracking/events/recent?page=${page}&pageSize=${pageSize}`,
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
      query: () => 'tracking/events/stats',
      providesTags: [{ type: 'Stats', id: 'AGG' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useListEventsQuery,
  useGetEventStatsQuery,
} = eventApi;
