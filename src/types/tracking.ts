export type EventItem = {
  id: number | string;
  event_name: string;
  event_time: number; // epoch seconds
  event_source_url?: string | null;  
  user_data?: {
    client_ip_address?: string;
    client_user_agent?: string;
  };  
  custom_data?: Record<string, unknown>;
};

export type EventStats = {
  total: number;
  pageviews: number;
  unique_visitors: number;
  last_24h: number;
};

export type CampaignPerformance = {
   id?: number | string;

  payload__utm_campaign: string | null;
  payload__utm_source: string | null;
  payload__utm_medium: string | null;

  pageviews: number;
  clicks: number;
  conversions: number; // keep as is
  conversion_rate: number;

  initiated: number;
  purchases: number;
  revenue: number;
};
