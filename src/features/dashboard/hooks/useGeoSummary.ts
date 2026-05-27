import { useEffect, useMemo, useState } from "react";
import { useGetEventsGeoSummaryQuery } from "@services/dashboardApi";
import { GeoSummaryFilters, GeoSummaryLocation } from "@services/geoSummaryApi";

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
      ...filters,
      region: debouncedRegion,
      campaign: debouncedCampaign,
    }),
    [filters, debouncedRegion, debouncedCampaign]
  );

  const query = useGetEventsGeoSummaryQuery(queryArgs);
  const rawData = query.data as any;
  const locations = Array.isArray(rawData?.locations)
    ? rawData.locations
    : Array.isArray(rawData?.results)
      ? rawData.results
      : [];

  const fallbackDistricts = Array.from(
    new Set(
      locations
        .map((loc: any) => (loc?.geo_region || loc?.region || loc?.district || "").toString().trim())
        .filter(Boolean)
    )
  ) as string[];

  const fallbackCampaigns = Array.from(
    new Set(
      locations
        .map((loc: any) => (loc?.campaign || loc?.utm_campaign || "").toString().trim())
        .filter(Boolean)
    )
  ) as string[];

  const toNumber = (value: unknown): number => {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  };

  const pickFirstNumber = (obj: any, keys: string[]): number => {
    for (const key of keys) {
      const value = obj?.[key];
      if (value !== undefined && value !== null && value !== "") {
        const parsed = toNumber(value);
        if (parsed || parsed === 0) return parsed;
      }
    }
    return 0;
  };

  const normalizedLocations = locations.map((loc: any) => {
    const eventsCount = pickFirstNumber(loc, [
      "events_count",
      "event_count",
      "events",
      "total_events",
      "count_events",
      "count",
    ]);
    const uniqueVisitorsCount = pickFirstNumber(loc, [
      "unique_visitors_count",
      "unique_visitor_count",
      "unique_visitors",
      "unique_users_count",
      "unique_user_count",
      "unique_users",
      "unique_user",
      "users_unique",
    ]);
    return {
      ...loc,
      geo_region: loc?.geo_region ?? loc?.region ?? loc?.district ?? null,
      geo_city: loc?.geo_city ?? loc?.city ?? null,
      events_count: eventsCount,
      unique_visitors_count: uniqueVisitorsCount,
      count: filters.metric === "unique_visitors" ? uniqueVisitorsCount : eventsCount,
    };
  });

  const hasCampaignDimension = normalizedLocations.some((loc: any) =>
    Boolean(
      (loc?.campaign || loc?.utm_campaign || loc?.payload__utm_campaign || "")
        .toString()
        .trim()
    )
  );

  const locallyFilteredLocations = normalizedLocations.filter((loc: any) => {
    const region = (loc?.geo_region || "").toString();
    const campaign = (loc?.campaign || loc?.utm_campaign || loc?.payload__utm_campaign || "").toString();
    const regionMatch = !filters.region || region === filters.region;
    const campaignMatch =
      !filters.campaign || !hasCampaignDimension || campaign === filters.campaign;
    return regionMatch && campaignMatch;
  });

  const groupedLocations: GeoSummaryLocation[] = Array.from(
    locallyFilteredLocations.reduce((acc: Map<string, any>, loc: any) => {
      const key =
        filters.group_by === "city"
          ? (loc?.geo_city || "Unknown City").toString()
          : (loc?.geo_region || "Unknown Region").toString();

      const existing = acc.get(key);
      if (!existing) {
        acc.set(key, { ...loc });
      } else {
        existing.events_count =
          Number(existing.events_count || 0) + Number(loc.events_count || 0);
        existing.unique_visitors_count =
          Number(existing.unique_visitors_count || 0) + Number(loc.unique_visitors_count || 0);
        existing.count =
          filters.metric === "unique_visitors"
            ? existing.unique_visitors_count
            : existing.events_count;
      }
      return acc;
    }, new Map<string, any>())
    .values()
  ) as GeoSummaryLocation[];

  const filterOptions = {
    districts:
      rawData?.filter_options?.districts ||
      rawData?.filter_options?.regions ||
      rawData?.districts ||
      rawData?.regions ||
      fallbackDistricts,
    campaigns:
      rawData?.filter_options?.campaigns ||
      rawData?.campaigns ||
      fallbackCampaigns,
  };

  return {
    ...query,
    data: rawData,
    locations: groupedLocations,
    filterOptions,
  };
}
