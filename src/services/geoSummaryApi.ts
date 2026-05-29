export const GEO_RANGE_OPTIONS = [
  "today",
  "yesterday",
  "last7",
  "last30",
  "last90",
  "thisyear",
] as const;

export const GEO_METRIC_OPTIONS = ["events", "unique_visitors"] as const;
export const GEO_GROUP_BY_OPTIONS = ["district", "city"] as const;

export type GeoRange = (typeof GEO_RANGE_OPTIONS)[number];
export type GeoMetric = (typeof GEO_METRIC_OPTIONS)[number];
export type GeoGroupBy = (typeof GEO_GROUP_BY_OPTIONS)[number];

export type GeoSummaryFilters = {
  range: GeoRange;
  region: string;
  campaign: string;
  metric: GeoMetric;
  group_by: GeoGroupBy;
  client_id?: number;
};

export type GeoSummaryLocation = {
  geo_country: string | null;
  geo_region: string | null;
  geo_city: string | null;
  geo_latitude: number | null;
  geo_longitude: number | null;
  count?: number;
  events_count?: number;
  unique_visitors_count?: number;
  events?: number;
  unique_visitors?: number;
};

export type GeoSummaryResponse = {
  range: GeoRange;
  locations: GeoSummaryLocation[];
  metric: GeoMetric;
  group_by: GeoGroupBy;
  applied_filters: {
    region: string | null;
    district: string | null;
    campaign: string | null;
  };
  filter_options: {
    districts: string[];
    campaigns: string[];
    sources?: string[];
    metrics: GeoMetric[];
    group_by: GeoGroupBy[];
  };
};

export function buildGeoSummaryQuery(params: Partial<GeoSummaryFilters>) {
  const search = new URLSearchParams();

  if (params.range) search.set("range", params.range);
  if (params.region) search.set("region", params.region);
  if (params.campaign) search.set("campaign", params.campaign);
  if (params.metric) search.set("metric", params.metric);
  if (params.group_by) search.set("group_by", params.group_by);
  if (params.client_id != null && Number.isFinite(Number(params.client_id))) {
    search.set("client_id", String(params.client_id));
  }

  const query = search.toString();
  return query ? `tracking/events-geo-summary/?${query}` : "tracking/events-geo-summary/";
}
