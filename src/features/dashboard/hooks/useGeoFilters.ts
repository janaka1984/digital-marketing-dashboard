import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  GEO_GROUP_BY_OPTIONS,
  GEO_METRIC_OPTIONS,
  GEO_RANGE_OPTIONS,
  GeoGroupBy,
  GeoMetric,
  GeoRange,
} from "@services/geoSummaryApi";

export type UseGeoFiltersResult = {
  filters: {
    range: GeoRange;
    region: string;
    campaign: string;
    metric: GeoMetric;
    group_by: GeoGroupBy;
  };
  setFilter: (key: "range" | "region" | "campaign" | "metric" | "group_by", value: string) => void;
  clearFilters: () => void;
};

const DEFAULT_FILTERS = {
  range: "last7" as GeoRange,
  region: "",
  campaign: "",
  metric: "events" as GeoMetric,
  group_by: "district" as GeoGroupBy,
};

const VALID_RANGES = new Set<string>(GEO_RANGE_OPTIONS);
const VALID_METRICS = new Set<string>(GEO_METRIC_OPTIONS);
const VALID_GROUP_BY = new Set<string>(GEO_GROUP_BY_OPTIONS);

export function useGeoFilters(): UseGeoFiltersResult {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(() => {
    const rangeRaw = searchParams.get("range") || DEFAULT_FILTERS.range;
    const regionRaw = (searchParams.get("region") || searchParams.get("district") || "").trim();
    const campaignRaw = (searchParams.get("campaign") || "").trim();
    const metricRaw = searchParams.get("metric") || DEFAULT_FILTERS.metric;
    const groupByRaw = searchParams.get("group_by") || DEFAULT_FILTERS.group_by;

    return {
      range: (VALID_RANGES.has(rangeRaw) ? rangeRaw : DEFAULT_FILTERS.range) as GeoRange,
      region: regionRaw,
      campaign: campaignRaw,
      metric: (VALID_METRICS.has(metricRaw) ? metricRaw : DEFAULT_FILTERS.metric) as GeoMetric,
      group_by: (VALID_GROUP_BY.has(groupByRaw) ? groupByRaw : DEFAULT_FILTERS.group_by) as GeoGroupBy,
    };
  }, [searchParams]);

  const setFilter: UseGeoFiltersResult["setFilter"] = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);

    // Normalize legacy alias to canonical key for all new updates.
    next.delete("district");
    setSearchParams(next, { replace: true });
  };

  const clearFilters = () => {
    const next = new URLSearchParams(searchParams);
    next.set("range", DEFAULT_FILTERS.range);
    next.set("metric", DEFAULT_FILTERS.metric);
    next.set("group_by", DEFAULT_FILTERS.group_by);
    next.delete("region");
    next.delete("district");
    next.delete("campaign");
    setSearchParams(next, { replace: true });
  };

  return { filters, setFilter, clearFilters };
}

