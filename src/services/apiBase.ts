import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '@utils/env';

export const apiBase = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      // const token = (getState() as any).auth.token;
      // if (token) headers.set('authorization', `Bearer ${token}`);
      headers.set('accept', 'application/json');
      return headers;
    }
  }),
  tagTypes: ['Event', 'Stats','Campaign'],
  endpoints: () => ({})
});
