import { apiBase } from './apiBase';

export type AgencyClient = {
  id: number;
  business_name: string;
  user_email: string;
};

export const accountsApi = apiBase.injectEndpoints({
  endpoints: (build) => ({
    listAgencyClients: build.query<AgencyClient[], void>({
      query: () => `accounts/agency/clients/`,
      providesTags: [{ type: 'Clients', id: 'LIST' }],
    }),
    inviteClient: build.mutation<{ ok: boolean; token: string }, { email: string; business_name?: string }>({
      query: (body) => ({
        url: `accounts/agency/invite/`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Clients', id: 'LIST' }],
    }),
  }),
});

export const { useListAgencyClientsQuery, useInviteClientMutation } = accountsApi;
