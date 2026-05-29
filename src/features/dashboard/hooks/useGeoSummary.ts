import { useEffect, useMemo, useState } from "react";
import { useGetEventsGeoSummaryQuery } from "@services/dashboardApi";
import { GeoSummaryFilters } from "@services/geoSummaryApi";

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}

export function useGeoSummary(filters: GeoSummaryFilters) {
  const debouncedRegion = useDebouncedValue(filters.region, 250);
  const debouncedCampaign = useDebouncedValue(filters.campaign, 250);

  const queryArgs = useMemo(
    () => ({
      range: filters.range,
      metric: filters.metric,
      group_by: filters.group_by,
      region: debouncedRegion,
      campaign: debouncedCampaign,
      client_id: filters.client_id,
    }),
    [filters.range, filters.metric, filters.group_by, filters.client_id, debouncedRegion, debouncedCampaign]
  );

  const query = useGetEventsGeoSummaryQuery(queryArgs);
  const rawData = query.data as any;

  const locations = Array.isArray(rawData?.locations) ? rawData.locations : [];
  const filterOptions = {
    districts: Array.isArray(rawData?.filter_options?.districts) ? rawData.filter_options.districts : [],
    campaigns: Array.isArray(rawData?.filter_options?.campaigns)
      ? rawData.filter_options.campaigns.filter((campaign: string) => campaign?.trim?.())
      : [],
    sources: Array.isArray(rawData?.filter_options?.sources) ? rawData.filter_options.sources : [],
  };

  return {
    ...query,
    data: rawData,
    locations,
    filterOptions,
  };
}

