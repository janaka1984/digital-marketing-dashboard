import { apiBase } from "./apiBase";

export const integrationApi = apiBase.injectEndpoints({
  endpoints: (build) => ({
    listDataSources: build.query<any[], void>({
      query: () => "integrations/datasources/",
      providesTags: [{ type: "Integration", id: "LIST" }],
    }),
    addDataSource: build.mutation({
      query: (data) => ({
        url: "integrations/datasources/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Integration", id: "LIST" }],
    }),
    addUpdateCredential: build.mutation({
      query: (data) => ({
        url: "integrations/credentials/",
        method: "POST",
        body: data,
      }),
    }),

  }),
});

export const {
  useListDataSourcesQuery,
  useAddDataSourceMutation,
  useAddUpdateCredentialMutation,
} = integrationApi;
