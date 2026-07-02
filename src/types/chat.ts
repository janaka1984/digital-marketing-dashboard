export type CampaignChatRole = "assistant" | "user";

export type CampaignChatMessage = {
  id: string;
  role: CampaignChatRole;
  content: string;
  createdAt: string;
};

export type CampaignChatRequest = {
  message: string;
  context: {
    range: string;
    level: "campaign";
    client_id?: string;
    platform?: string;
  };
};

export type CampaignChatResponse = {
  answer: string;
};
