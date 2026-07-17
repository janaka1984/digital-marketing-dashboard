import { apiBase } from "./apiBase";

export type IntegrationDataSource = {
  id: number;
  client_id?: number | string | null;
  source_type: string;
  external_id?: string | null;
  facebook_oauth_available?: boolean;
};

export type IntegrationCredential = {
  id?: number;
  access_token?: string | null;
  marketing_access_token?: string | null;
  marketing_ad_account_id?: string | null;
  api_version?: string | null;
  business_id?: string | null;
  test_event_code?: string | null;
  facebook_oauth_available?: boolean;
  [key: string]: unknown;
};

export type FacebookOAuthInitResponse = {
  oauth_url: string;
  credential_id?: number;
  data_source_id?: number;
};

export type FacebookAdAccountOption = {
  id: string;
  name?: string;
  account_id?: string;
  normalized_account_id?: string;
  sources?: string[];
  business_ids?: string[];
  business_names?: string[];
};

export const integrationApi = apiBase.injectEndpoints({
  endpoints: (build) => ({
    listDataSources: build.query<IntegrationDataSource[], void>({
      query: () => "integrations/datasources/",
      providesTags: [{ type: "Integration", id: "LIST" }],
    }),
    addDataSource: build.mutation<
      IntegrationDataSource,
      { client_id?: string | number; source_type: string; external_id?: string }
    >({
      query: (data) => ({
        url: "integrations/datasources/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Integration", id: "LIST" }],
    }),
    getDataSourceCredentials: build.query<IntegrationCredential, number>({
      query: (dataSourceId) => `integrations/datasources/${dataSourceId}/credentials/`,
      providesTags: (_result, _error, dataSourceId) => [
        { type: "Integration", id: `CREDENTIALS-${dataSourceId}` },
      ],
    }),
    updateDataSourceCredentials: build.mutation<
      IntegrationCredential,
      { dataSourceId: number; body: Record<string, unknown> }
    >({
      query: ({ dataSourceId, body }) => ({
        url: `integrations/datasources/${dataSourceId}/credentials/`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { dataSourceId }) => [
        { type: "Integration", id: `CREDENTIALS-${dataSourceId}` },
        { type: "Integration", id: "LIST" },
      ],
    }),
    initiateFacebookOAuth: build.mutation<
      FacebookOAuthInitResponse,
      { dataSourceId: number; frontend_callback_url: string }
    >({
      query: ({ dataSourceId, frontend_callback_url }) => ({
        url: `integrations/credentials/${dataSourceId}/facebook-oauth/initiate/`,
        method: "POST",
        body: { frontend_callback_url },
      }),
    }),
    selectFacebookAdAccount: build.mutation<
      IntegrationCredential,
      { credentialId: number; selection_token: string; selected_ad_account_id: string }
    >({
      query: ({ credentialId, selection_token, selected_ad_account_id }) => ({
        url: `integrations/credentials/${credentialId}/facebook-oauth/select-ad-account/`,
        method: "POST",
        body: { selection_token, selected_ad_account_id },
      }),
    }),
  }),
});

export const {
  useListDataSourcesQuery,
  useAddDataSourceMutation,
  useLazyGetDataSourceCredentialsQuery,
  useUpdateDataSourceCredentialsMutation,
  useInitiateFacebookOAuthMutation,
  useSelectFacebookAdAccountMutation,
} = integrationApi;
