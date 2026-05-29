import { useMemo, useState } from "react";
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
    client_id?: number;
  };
  setFilter: (
    key: "range" | "region" | "campaign" | "metric" | "group_by" | "client_id",
    value: string
  ) => void;
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
  const initialFilters = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const rangeRaw = params.get("range") || DEFAULT_FILTERS.range;
    const regionRaw = (params.get("region") || params.get("district") || "").trim();
    const campaignRaw = (params.get("campaign") || "").trim();
    const metricRaw = params.get("metric") || DEFAULT_FILTERS.metric;
    const groupByRaw = params.get("group_by") || DEFAULT_FILTERS.group_by;
    const clientIdRaw = params.get("client_id") || params.get("client") || "";
    const parsedClientId = Number(clientIdRaw);
    const client_id = Number.isFinite(parsedClientId) && parsedClientId > 0 ? parsedClientId : undefined;

    return {
      range: (VALID_RANGES.has(rangeRaw) ? rangeRaw : DEFAULT_FILTERS.range) as GeoRange,
      region: regionRaw,
      campaign: campaignRaw,
      metric: (VALID_METRICS.has(metricRaw) ? metricRaw : DEFAULT_FILTERS.metric) as GeoMetric,
      group_by: (VALID_GROUP_BY.has(groupByRaw) ? groupByRaw : DEFAULT_FILTERS.group_by) as GeoGroupBy,
      client_id,
    };
  }, []);

  const [filters, setFilters] = useState(initialFilters);

  const setFilter: UseGeoFiltersResult["setFilter"] = (key, value) => {
    setFilters((prev) => {
      if (key === "client_id") {
        const parsed = Number(value);
        return {
          ...prev,
          client_id: Number.isFinite(parsed) && parsed > 0 ? parsed : undefined,
        };
      }
      return {
        ...prev,
        [key]: value,
      };
    });
  };

  const clearFilters = () => {
    setFilters((prev) => ({
      ...DEFAULT_FILTERS,
      client_id: prev.client_id,
    }));
  };

  return { filters, setFilter, clearFilters };
}

