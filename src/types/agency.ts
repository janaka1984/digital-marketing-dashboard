// src/types/agency.ts

export interface AgencyClient {
  client_id: number;
  client_name: string;
  pageviews: number;
  clicks: number;
  initiated: number;
  last_event: string;
}

export interface AgencyDeviceItem {
  name: string;
  count: number;
}

export interface AgencySourceItem {
  src: string;
  count: number;
}

export interface AgencyDailyItem {
  day: string;
  count: number;
}

export interface AgencyOverviewResponse {
  summary: {
    total_clients: number;
    active_clients: number;
    inactive_clients: number;
    total_events: number;
    pageviews: number;
    clicks: number;
    initiated: number;
  };

  clients: AgencyClient[];

  device_breakdown: AgencyDeviceItem[];
  traffic_sources: AgencySourceItem[];
  daily: AgencyDailyItem[];

  clients_daily: Record<number, AgencyDailyItem[]>;
  clients_device_breakdown: Record<number, AgencyDeviceItem[]>;
  clients_traffic_sources: Record<number, AgencySourceItem[]>;
}
