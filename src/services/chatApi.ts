import { apiBase } from "./apiBase";
import type { CampaignChatRequest, CampaignChatResponse } from "../types/chat";

export const chatApi = apiBase.injectEndpoints({
  endpoints: (build) => ({
    sendCampaignChatMessage: build.mutation<CampaignChatResponse, CampaignChatRequest>({
      query: (body) => ({
        url: "ai/campaign-chat/",
        method: "POST",
        body,
      }),
    }),
  }),
  overrideExisting: false,
});

export const { useSendCampaignChatMessageMutation } = chatApi;
