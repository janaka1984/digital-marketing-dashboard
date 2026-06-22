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
    route: string;
    range: string;
    level: "campaign";
    snapshot: unknown;
  };
};

export type CampaignChatResponse = {
  answer: string;
};
