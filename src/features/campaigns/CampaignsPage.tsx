import {
  Box,
  Button,
  Breadcrumbs,
  Chip,
  Drawer,
  FormControl,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CloseIcon from "@mui/icons-material/Close";
import { useMemo, useState } from "react";
import { GridColDef, GridRowParams } from "@mui/x-data-grid";
import { DataGrid } from "@mui/x-data-grid";
import {
  useGenerateAiRecommendationsMutation,
  useGetAiRecommendationsQuery,
  useGetDashboardCampaignsQuery,
} from "@services/dashboardApi";
import { useAppSelector } from "@store/hooks";
import { dashboardTitleSx } from "@theme/index";

type CampaignLevel = "campaign" | "adset" | "ad";
type DrawerTab = "overview" | "adsets" | "ads";

export type CampaignRow = {
  id: string | number;
  raw: Record<string, any>;
  name: string;
  source: string;
  status: string;
  currency: string;
  pageviews: number;
  impressions: number;
  reach: number;
  clicks: number;
  ctr: number;
  cpc: number;
  spend: number;
  initiated: number;
  purchases: number;
  revenue: number;
  roas: number;
  conversion_rate: number;
  daily_budget: number;
  lifetime_budget: number;
  allocated_budget: number;
  budget_type: string;
  recommended_budget: number;
  has_recommended_budget: boolean;
  recommendation_action: string;
  recommendation_detail: string;
  budget_recommendation: string;
  budget_utilization: number;
  start_date: string;
  end_date: string;
  latest_at: string;
  campaign_id?: string | number;
  adset_id?: string | number;
  isTotal?: boolean;
};

const ranges = [
  ["today", "Today"],
  ["yesterday", "Yesterday"],
  ["last7", "Last 7 Days"],
  ["last30", "Last 30 Days"],
  ["last90", "Last 90 Days"],
  ["thisyear", "This Year"],
];

const levelLabels: Record<CampaignLevel, string> = {
  campaign: "Campaigns",
  adset: "Ad Sets",
  ad: "Ads",
};

const numericFields: Array<
  keyof Pick<
    CampaignRow,
    | "pageviews"
    | "impressions"
    | "reach"
    | "clicks"
    | "spend"
    | "initiated"
    | "purchases"
    | "revenue"
  >
> = [
  "pageviews",
  "impressions",
  "reach",
  "clicks",
  "spend",
  "initiated",
  "purchases",
  "revenue",
];

const tableCellSx = {
  py: 1,
  fontSize: 12,
  whiteSpace: "nowrap",
};

const panelSx = {
  p: { xs: 1.5, sm: 2 },
  bgcolor: "background.paper",
  borderRadius: 2,
  boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
};

const numberValue = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const numberWithFallback = (value: unknown, fallback: number) =>
  value === undefined || value === null || value === ""
    ? fallback
    : numberValue(value);

const budgetWithFallback = (value: unknown, fallback: number) =>
  value === undefined || value === null || value === ""
    ? fallback
    : numberValue(value);

const hasValue = (value: unknown) =>
  value !== undefined && value !== null && value !== "";

const readValue = (row: Record<string, any>, key: string): unknown =>
  key
    .split(".")
    .reduce<unknown>(
      (value, pathKey) =>
        value && typeof value === "object"
          ? (value as Record<string, any>)[pathKey]
          : undefined,
      row,
    );

const pick = (
  row: Record<string, any>,
  keys: string[],
  fallback: string | number = "",
): string | number => {
  for (const key of keys) {
    const value = readValue(row, key);
    if (
      value !== undefined &&
      value !== null &&
      value !== "" &&
      typeof value !== "object"
    )
      return value as string | number;
  }
  return fallback;
};

const getApiRows = (data: any, level: CampaignLevel) => {
  if (Array.isArray(data)) return data;
  const levelKey =
    level === "adset" ? "adsets" : level === "ad" ? "ads" : "campaigns";
  return (
    data?.[levelKey] ||
    data?.results ||
    data?.rows ||
    data?.data ||
    data?.campaigns ||
    []
  );
};

const getRecommendationRows = (data: any) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.recommendations)) return data.recommendations;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const startDateKeys = [
  "start",
  "date_start",
  "campaign_start",
  "start_date",
  "start_time",
  "campaign_start_date",
  "campaign_start_time",
  "adset_start_date",
  "adset_start_time",
  "ad_start_date",
  "ad_start_time",
  "effective_start_time",
  "meta_start_time",
  "campaign.start_date",
  "campaign.start_time",
  "adset.start_date",
  "adset.start_time",
];

const endDateKeys = [
  "end",
  "date_stop",
  "campaign_end",
  "end_date",
  "end_time",
  "date_end",
  "stop_date",
  "stop_time",
  "campaign_end_date",
  "campaign_end_time",
  "campaign_stop_date",
  "campaign_stop_time",
  "adset_end_date",
  "adset_end_time",
  "adset_stop_date",
  "adset_stop_time",
  "ad_end_date",
  "ad_end_time",
  "ad_stop_date",
  "ad_stop_time",
  "effective_end_time",
  "meta_stop_time",
  "campaign.end_date",
  "campaign.stop_time",
  "adset.end_date",
  "adset.stop_time",
];

const latestDateKeys = [
  "updated_time",
  "created_time",
  "last_updated",
  "last_synced_at",
  "date_start",
  "date_stop",
  ...startDateKeys,
  ...endDateKeys,
];

export const normalizeRow = (
  row: Record<string, any>,
  index: number,
  level: CampaignLevel,
): CampaignRow => {
  const campaignId = pick(row, [
    "campaign_id",
    "campaignId",
    "campaign.id",
    "campaign_id_meta",
    "id",
  ]);
  const adsetId = pick(row, [
    "adset_id",
    "adsetId",
    "adset.id",
    "adset_id_meta",
    "id",
  ]);
  const allocatedBudgetRaw = pick(
    row,
    ["allocated_budget", "current_budget", "ai_recommendation.current_budget"],
    "",
  );
  const optimizerAction = pick(
    row,
    ["recommendation_action", "ai_recommendation.recommendation_action"],
    "",
  );
  const optimizerDetail = pick(
    row,
    ["recommendation_detail", "explanation", "ai_recommendation.explanation"],
    "",
  );
  const nestedRecommendedBudget = readValue(
    row,
    "ai_recommendation.recommended_budget",
  );
  const flatRecommendedBudget = readValue(row, "recommended_budget");
  const hasOptimizerRecommendation =
    hasValue(nestedRecommendedBudget) ||
    hasValue(optimizerAction) ||
    hasValue(optimizerDetail) ||
    hasValue(readValue(row, "current_budget"));
  const recommendedBudgetRaw = hasValue(nestedRecommendedBudget)
    ? nestedRecommendedBudget
    : hasOptimizerRecommendation
      ? flatRecommendedBudget
      : "";
  const name = String(
    pick(
      row,
      level === "campaign"
        ? [
            "name",
            "campaign_name",
            "campaign.name",
            "campaign",
            "utm_campaign",
            "payload__utm_campaign",
          ]
        : level === "adset"
          ? [
              "name",
              "adset_name",
              "adset.name",
              "adset",
              "campaign_name",
              "campaign.name",
            ]
          : ["name", "ad_name", "ad.name", "ad", "creative_name"],
      "Untitled",
    ),
  );

  return {
    id: pick(
      row,
      level === "campaign"
        ? ["row_id", "campaign_id", "id"]
        : level === "adset"
          ? ["row_id", "adset_id", "id"]
          : ["row_id", "ad_id", "id"],
      `${level}-${index}`,
    ),
    raw: row,
    name,
    source: String(
      pick(
        row,
        ["source", "platform", "utm_source", "payload__utm_source"],
        "-",
      ),
    ),
    status: String(pick(row, ["status"], "-")),
    currency: String(pick(row, ["currency"], "")),
    pageviews: numberValue(row.pageviews),
    impressions: numberValue(row.impressions),
    reach: numberValue(row.reach),
    clicks: numberValue(row.clicks),
    ctr: numberValue(row.ctr),
    cpc: numberValue(row.cpc),
    spend: numberValue(row.spend),
    initiated: numberValue(row.initiated),
    purchases: numberValue(row.purchases),
    revenue: numberValue(row.revenue),
    roas: numberValue(row.roas),
    conversion_rate: numberValue(row.conversion_rate),
    daily_budget: numberValue(row.daily_budget),
    lifetime_budget: numberValue(row.lifetime_budget),
    allocated_budget: numberValue(allocatedBudgetRaw),
    budget_type: String(pick(row, ["budget_type"], "")),
    recommended_budget: hasValue(recommendedBudgetRaw)
      ? numberValue(recommendedBudgetRaw)
      : 0,
    has_recommended_budget: hasValue(recommendedBudgetRaw),
    recommendation_action: String(optimizerAction || ""),
    recommendation_detail: String(optimizerDetail || ""),
    budget_recommendation: String(pick(row, ["budget_recommendation"], "")),
    budget_utilization: numberValue(row.budget_utilization),
    start_date: String(pick(row, startDateKeys, "")),
    end_date: String(pick(row, endDateKeys, "")),
    latest_at: String(pick(row, latestDateKeys, "")),
    campaign_id: campaignId || undefined,
    adset_id: adsetId || undefined,
  };
};

const rowIdentity = (row: CampaignRow, level: CampaignLevel) => {
  if (level === "campaign")
    return `campaign:${row.campaign_id || row.id || row.name}:${row.source}`;
  if (level === "adset")
    return `adset:${row.campaign_id || ""}:${row.adset_id || row.id || row.name}:${row.source}`;
  return `ad:${row.campaign_id || ""}:${row.adset_id || ""}:${row.id || row.name}:${row.source}`;
};

const metricSignature = (row: CampaignRow) =>
  [
    row.pageviews,
    row.currency,
    row.impressions,
    row.reach,
    row.clicks,
    row.ctr,
    row.cpc,
    row.spend,
    row.initiated,
    row.purchases,
    row.revenue,
    row.roas,
    row.conversion_rate,
    row.allocated_budget,
    row.recommended_budget,
    row.has_recommended_budget,
    row.recommendation_action,
    row.recommendation_detail,
    row.budget_recommendation,
    row.budget_utilization,
    row.start_date,
    row.end_date,
    row.latest_at,
  ].join("|");

const earliestDate = (current: string, next: string) => {
  if (!current) return next;
  if (!next) return current;
  const currentTime = new Date(current).getTime();
  const nextTime = new Date(next).getTime();
  if (Number.isNaN(currentTime)) return next;
  if (Number.isNaN(nextTime)) return current;
  return nextTime < currentTime ? next : current;
};

const latestDate = (current: string, next: string) => {
  if (!current) return next;
  if (!next) return current;
  const currentTime = new Date(current).getTime();
  const nextTime = new Date(next).getTime();
  if (Number.isNaN(currentTime)) return next;
  if (Number.isNaN(nextTime)) return current;
  return nextTime > currentTime ? next : current;
};

const mergeRowsByLevel = (rows: CampaignRow[], level: CampaignLevel) => {
  const grouped = new Map<string, CampaignRow>();
  const signatures = new Map<string, Set<string>>();

  rows.forEach((row) => {
    const key = rowIdentity(row, level);
    const signature = metricSignature(row);
    const seen = signatures.get(key) || new Set<string>();

    if (seen.has(signature)) return;
    seen.add(signature);
    signatures.set(key, seen);

    const existing = grouped.get(key);
    if (!existing) {
      grouped.set(key, { ...row, id: key });
      return;
    }

    numericFields.forEach((field) => {
      existing[field] += row[field] || 0;
    });
    const rowIsNewer = latestTimestamp(row) >= latestTimestamp(existing);
    if (rowIsNewer || !existing.allocated_budget) {
      existing.allocated_budget =
        row.allocated_budget || existing.allocated_budget;
      existing.daily_budget = row.daily_budget || existing.daily_budget;
      existing.lifetime_budget =
        row.lifetime_budget || existing.lifetime_budget;
      existing.budget_type = row.budget_type || existing.budget_type;
      existing.currency = row.currency || existing.currency;
      existing.cpc = row.cpc || existing.cpc;
    }
    if (
      row.has_recommended_budget &&
      (rowIsNewer || !existing.has_recommended_budget)
    ) {
      existing.recommended_budget = row.recommended_budget;
      existing.has_recommended_budget = true;
      existing.recommendation_action =
        row.recommendation_action || existing.recommendation_action;
      existing.recommendation_detail =
        row.recommendation_detail || existing.recommendation_detail;
      existing.budget_recommendation =
        row.budget_recommendation || existing.budget_recommendation;
    }
    existing.start_date = earliestDate(existing.start_date, row.start_date);
    existing.end_date = latestDate(existing.end_date, row.end_date);
    existing.latest_at = latestDate(existing.latest_at, row.latest_at);
    existing.roas = row.roas || existing.roas;
    existing.budget_utilization =
      row.budget_utilization || existing.budget_utilization;
    existing.ctr = existing.impressions
      ? (existing.clicks / existing.impressions) * 100
      : 0;
    existing.conversion_rate = existing.pageviews
      ? (existing.purchases / existing.pageviews) * 100
      : 0;
  });

  return Array.from(grouped.values());
};

const latestTimestamp = (row: CampaignRow) => {
  const dates = [row.latest_at, row.start_date, row.end_date]
    .map((value) => new Date(value).getTime())
    .filter((value) => !Number.isNaN(value));

  if (dates.length) return Math.max(...dates);
  const numericId = Number(row.id);
  return Number.isFinite(numericId) ? numericId : 0;
};

const sortLatestFirst = (rows: CampaignRow[]) =>
  [...rows].sort(
    (first, second) => latestTimestamp(second) - latestTimestamp(first),
  );

const normalizeRows = (data: any, level: CampaignLevel) =>
  sortLatestFirst(
    mergeRowsByLevel(
      getApiRows(data, level).map((row: Record<string, any>, index: number) =>
        normalizeRow(row, index, level),
      ),
      level,
    ),
  );

const recommendationTimestamp = (row: Record<string, any>) => {
  const value = String(pick(row, ["updated_at", "created_at"], ""));
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
};

const buildRecommendationMap = (data: any, level: CampaignLevel) => {
  const map = new Map<string, Record<string, any>>();

  getRecommendationRows(data).forEach((row: Record<string, any>) => {
    const entityType = String(
      pick(row, ["entity_type", "level"], level),
    ).toLowerCase();
    const entityId = String(
      pick(row, ["entity_id", "campaign_id", "adset_id", "ad_id"], ""),
    );
    if (!entityId || entityType !== level) return;

    const existing = map.get(entityId);
    if (
      !existing ||
      recommendationTimestamp(row) >= recommendationTimestamp(existing)
    ) {
      map.set(entityId, row);
    }
  });

  return map;
};

const applyAiRecommendations = (
  rows: CampaignRow[],
  recommendationsData: any,
  level: CampaignLevel,
) => {
  const recommendationMap = buildRecommendationMap(recommendationsData, level);
  if (!recommendationMap.size) return rows;

  return rows.map((row) => {
    const entityId = String(
      level === "campaign"
        ? row.campaign_id || row.id
        : level === "adset"
          ? row.adset_id || row.id
          : row.id,
    );
    const recommendation = recommendationMap.get(entityId);
    if (!recommendation) return row;

    const currentBudget = pick(
      recommendation,
      ["current_budget", "allocated_budget"],
      "",
    );
    const recommendedBudget = pick(recommendation, ["recommended_budget"], "");
    const action = String(pick(recommendation, ["recommendation_action"], ""));
    const detail = String(
      pick(
        recommendation,
        ["explanation", "recommendation_detail", "reason_code"],
        "",
      ),
    );

    return {
      ...row,
      allocated_budget: hasValue(currentBudget)
        ? numberValue(currentBudget)
        : row.allocated_budget,
      recommended_budget: hasValue(recommendedBudget)
        ? numberValue(recommendedBudget)
        : row.recommended_budget,
      has_recommended_budget: hasValue(recommendedBudget),
      recommendation_action: action,
      recommendation_detail: detail,
    };
  });
};

const normalizeTotals = (data: any) =>
  data?.totals || data?.total || data?.summary || null;

const totalRow = (
  rows: CampaignRow[],
  label = "Total",
  backendTotals?: Record<string, any> | null,
): CampaignRow => {
  const totals = rows.reduce(
    (acc, row) => {
      numericFields.forEach((field) => {
        acc[field] += row[field] || 0;
      });
      acc.allocated_budget += row.allocated_budget || 0;
      acc.recommended_budget += row.has_recommended_budget
        ? row.recommended_budget || 0
        : 0;
      return acc;
    },
    {
      pageviews: 0,
      impressions: 0,
      reach: 0,
      clicks: 0,
      spend: 0,
      initiated: 0,
      purchases: 0,
      revenue: 0,
      allocated_budget: 0,
      recommended_budget: 0,
    } as Record<
      | (typeof numericFields)[number]
      | "allocated_budget"
      | "recommended_budget",
      number
    >,
  );

  const resolvedTotals = {
    currency: String(
      backendTotals?.currency || rows.find((row) => row.currency)?.currency || "",
    ),
    pageviews: numberWithFallback(backendTotals?.pageviews, totals.pageviews),
    impressions: numberWithFallback(
      backendTotals?.impressions,
      totals.impressions,
    ),
    reach: numberWithFallback(backendTotals?.reach, totals.reach),
    clicks: numberWithFallback(backendTotals?.clicks, totals.clicks),
    spend: numberWithFallback(backendTotals?.spend, totals.spend),
    initiated: numberWithFallback(backendTotals?.initiated, totals.initiated),
    purchases: numberWithFallback(backendTotals?.purchases, totals.purchases),
    revenue: numberWithFallback(backendTotals?.revenue, totals.revenue),
    allocated_budget:
      totals.allocated_budget ||
      budgetWithFallback(
        backendTotals?.allocated_budget,
        totals.allocated_budget,
      ),
    recommended_budget:
      totals.recommended_budget ||
      budgetWithFallback(
        backendTotals?.recommended_budget,
        totals.recommended_budget,
      ),
  };

  return {
    id: "total-row",
    raw: {},
    name: label,
    source: "",
    status: "",
    ...resolvedTotals,
    ctr: resolvedTotals.impressions
      ? (resolvedTotals.clicks / resolvedTotals.impressions) * 100
      : 0,
    cpc: numberValue(backendTotals?.cpc),
    roas: numberValue(backendTotals?.roas),
    conversion_rate: resolvedTotals.pageviews
      ? (resolvedTotals.purchases / resolvedTotals.pageviews) * 100
      : 0,
    daily_budget: 0,
    lifetime_budget: 0,
    budget_type: "",
    has_recommended_budget: hasValue(backendTotals?.recommended_budget),
    recommendation_action: String(
      pick(
        backendTotals || {},
        ["recommendation_action", "budget_recommendation"],
        "",
      ),
    ),
    recommendation_detail: String(
      pick(backendTotals || {}, ["recommendation_detail"], ""),
    ),
    budget_recommendation: String(
      pick(backendTotals || {}, ["budget_recommendation"], ""),
    ),
    budget_utilization: numberValue(backendTotals?.budget_utilization),
    start_date: "",
    end_date: "",
    latest_at: "",
    isTotal: true,
  };
};

const formatNumber = (value: number) => Math.round(value || 0).toLocaleString();
export const formatMoney = (value: number, currency?: string) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
  }).format(value ?? 0);
const formatPercent = (value: number) => `${(value || 0).toFixed(2)}%`;
const formatDecimal = (value: number) => (value || 0).toFixed(2);
const formatRoas = (value: number) => `${formatDecimal(value)}x`;
const formatBudgetUtilization = (value: number) =>
  `${(value || 0).toFixed(1)}%`;
const formatBudgetType = (value: string) => {
  const normalized = value.toLowerCase();
  if (normalized === "daily") return "Daily";
  if (normalized === "lifetime") return "Lifetime";
  return "-";
};
const formatDate = (value: string) => {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
};

const toApiDate = (date: Date) => date.toISOString().slice(0, 10);

const getDateRange = (range: string) => {
  const today = new Date();
  const start = new Date(today);

  if (range === "yesterday") {
    start.setDate(today.getDate() - 1);
    return { date_from: toApiDate(start), date_to: toApiDate(start) };
  }

  if (range === "last7") start.setDate(today.getDate() - 6);
  else if (range === "last30") start.setDate(today.getDate() - 29);
  else if (range === "last90") start.setDate(today.getDate() - 89);
  else if (range === "thisyear") start.setMonth(0, 1);

  return { date_from: toApiDate(start), date_to: toApiDate(today) };
};

const getApiErrorMessage = (error: unknown) => {
  const data =
    typeof error === "object" && error && "data" in error
      ? (error as { data?: unknown }).data
      : null;

  if (typeof data === "string") return data;
  if (data && typeof data === "object") {
    const detail = (data as Record<string, unknown>).detail;
    if (typeof detail === "string") return detail;
    return JSON.stringify(data);
  }

  return "Could not generate AI recommendations.";
};

const isPastDate = (value: string) => {
  if (!value) return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime()) && date.getTime() < Date.now();
};

const displayStatus = (row: CampaignRow) => {
  if (isPastDate(row.end_date)) return "Inactive";
  if (!row.status || row.status === "-") return "-";
  return row.status.toLowerCase() === "active" ? "Active" : row.status;
};

function StatusBadge({ status }: { status: string }) {
  if (!status) return null;

  const normalized = status.toLowerCase();
  const color =
    normalized === "active"
      ? "success"
      : normalized === "paused" || normalized === "inactive"
        ? "warning"
        : "default";

  const label =
    normalized === "active"
      ? "Active"
      : normalized === "inactive"
        ? "Inactive"
        : status;

  return (
    <Chip
      size="small"
      label={label}
      color={color}
      variant="outlined"
      sx={{ height: 22, fontSize: 11 }}
    />
  );
}

const displayRecommendationAction = (row: CampaignRow) => {
  if (!row.has_recommended_budget) return "";

  const currentBudget = row.allocated_budget || 0;
  const recommendedBudget = row.recommended_budget || 0;
  const sameBudget = Math.abs(recommendedBudget - currentBudget) < 0.005;

  if (sameBudget && currentBudget <= 0) return "no_budget";
  if (sameBudget) return "maintain";
  if (recommendedBudget > currentBudget) return "increase";
  return "decrease";
};

function RecommendationBadge({
  recommendation,
  detail,
}: {
  recommendation: string;
  detail?: string;
}) {
  const normalized = recommendation.toLowerCase().replace(/\s+/g, "_");
  const config: Record<
    string,
    {
      label: string;
      color: "success" | "error" | "warning" | "info" | "default";
    }
  > = {
    increase: { label: "Increase", color: "success" },
    decrease: { label: "Decrease", color: "error" },
    monitor: { label: "Monitor", color: "warning" },
    maintain: { label: "Maintain", color: "info" },
    no_budget: { label: "No Budget", color: "default" },
  };
  const badge = config[normalized] || {
    label: recommendation || "-",
    color: "default" as const,
  };

  const chip = (
    <Chip
      size="small"
      label={badge.label}
      color={badge.color}
      variant="outlined"
      sx={{ height: 22, fontSize: 11 }}
    />
  );

  return detail ? (
    <Tooltip title={detail} arrow>
      {chip}
    </Tooltip>
  ) : (
    chip
  );
}

function DenseMetricTable({
  rows,
  loading,
  emptyText,
  onRowClick,
}: {
  rows: CampaignRow[];
  loading: boolean;
  emptyText: string;
  onRowClick?: (row: CampaignRow) => void;
}) {
  const displayRows = rows.length ? [...rows, totalRow(rows)] : [];

  return (
    <TableContainer
      sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}
    >
      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: "#F7F9FC" }}>
            {[
              "Name",
              "Status",
              "PageViews",
              "Impr.",
              "Reach",
              "Clicks",
              "CTR",
              "CPC",
              "Spend",
              "Purchases",
              "Revenue",
              "ROAS",
            ].map((header) => (
              <TableCell key={header} sx={{ ...tableCellSx, fontWeight: 600 }}>
                {header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {loading
            ? Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {Array.from({ length: 12 }).map((__, cellIndex) => (
                    <TableCell key={cellIndex} sx={tableCellSx}>
                      <Skeleton height={22} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            : displayRows.map((row) => (
                <TableRow
                  key={row.id}
                  hover={!row.isTotal}
                  onClick={() => !row.isTotal && onRowClick?.(row)}
                  sx={{
                    cursor: onRowClick && !row.isTotal ? "pointer" : "default",
                    bgcolor: row.isTotal ? "action.hover" : "inherit",
                    "& .MuiTableCell-root": {
                      fontWeight: row.isTotal ? 700 : 400,
                    },
                  }}
                >
                  <TableCell sx={{ ...tableCellSx, minWidth: 170 }}>
                    {row.name}
                  </TableCell>
                  <TableCell sx={tableCellSx}>
                    <StatusBadge status={displayStatus(row)} />
                  </TableCell>
                  <TableCell sx={tableCellSx}>
                    {formatNumber(row.pageviews)}
                  </TableCell>
                  <TableCell sx={tableCellSx}>
                    {formatNumber(row.impressions)}
                  </TableCell>
                  <TableCell sx={tableCellSx}>
                    {formatNumber(row.reach)}
                  </TableCell>
                  <TableCell sx={tableCellSx}>
                    {formatNumber(row.clicks)}
                  </TableCell>
                  <TableCell sx={tableCellSx}>
                    {formatPercent(row.ctr)}
                  </TableCell>
                  <TableCell sx={tableCellSx}>
                    {formatMoney(row.cpc, row.currency)}
                  </TableCell>
                  <TableCell sx={tableCellSx}>
                    {formatMoney(row.spend, row.currency)}
                  </TableCell>
                  <TableCell sx={tableCellSx}>
                    {formatNumber(row.purchases)}
                  </TableCell>
                  <TableCell sx={tableCellSx}>
                    {formatMoney(row.revenue, row.currency)}
                  </TableCell>
                  <TableCell sx={tableCellSx}>{formatRoas(row.roas)}</TableCell>
                </TableRow>
              ))}

          {!loading && !rows.length ? (
            <TableRow>
              <TableCell
                colSpan={12}
                sx={{ py: 5, textAlign: "center", color: "text.secondary" }}
              >
                {emptyText}
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <Box
      sx={{
        p: 1.5,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
      }}
    >
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h5" sx={{ mt: 0.5, fontWeight: 700 }}>
        {value}
      </Typography>
    </Box>
  );
}

export default function CampaignsPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const user = useAppSelector((s) => s.auth.user);
  const role = user?.role || "client";

  const [range, setRange] = useState("last7");
  const [platform, setPlatform] = useState("all");
  const [status, setStatus] = useState("all");
  const [mainLevel, setMainLevel] = useState<CampaignLevel>("campaign");
  const [drawerTab, setDrawerTab] = useState<DrawerTab>("adsets");
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignRow | null>(
    null,
  );
  const [selectedAdset, setSelectedAdset] = useState<CampaignRow | null>(null);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [generationError, setGenerationError] = useState("");
  const [
    generateAiRecommendations,
    { isLoading: isGeneratingRecommendations },
  ] = useGenerateAiRecommendationsMutation();

  const campaignId = selectedCampaign?.campaign_id || selectedCampaign?.id;
  const adsetId = selectedAdset?.adset_id || selectedAdset?.id;
  const selectedClientId = user?.id || null;

  const { currentData, isFetching, refetch } = useGetDashboardCampaignsQuery({
    level: mainLevel,
    range,
    platform,
    status,
  });

  const { currentData: recommendationsData, refetch: refetchRecommendations } =
    useGetAiRecommendationsQuery({
      entity_type: mainLevel,
      platform,
    });

  const { currentData: adsetsData, isFetching: isAdsetsFetching } =
    useGetDashboardCampaignsQuery(
      {
        level: "adset",
        campaign_id: campaignId,
        range,
        platform,
        status,
      },
      { skip: !campaignId },
    );

  const { currentData: adsetRecommendationsData } =
    useGetAiRecommendationsQuery(
      {
        entity_type: "adset",
        platform,
      },
      { skip: !campaignId },
    );

  const { currentData: adsData, isFetching: isAdsFetching } =
    useGetDashboardCampaignsQuery(
      {
        level: "ad",
        campaign_id: campaignId,
        adset_id: adsetId,
        range,
        platform,
        status,
      },
      { skip: !campaignId },
    );

  const { currentData: adRecommendationsData } = useGetAiRecommendationsQuery(
    {
      entity_type: "ad",
      platform,
    },
    { skip: !adsetId },
  );

  const rows = useMemo(
    () =>
      applyAiRecommendations(
        normalizeRows(currentData, mainLevel),
        recommendationsData,
        mainLevel,
      ),
    [currentData, mainLevel, recommendationsData],
  );
  const adsetRows = useMemo(
    () =>
      applyAiRecommendations(
        normalizeRows(adsetsData, "adset"),
        adsetRecommendationsData,
        "adset",
      ),
    [adsetsData, adsetRecommendationsData],
  );
  const adRows = useMemo(
    () =>
      applyAiRecommendations(
        normalizeRows(adsData, "ad"),
        adRecommendationsData,
        "ad",
      ),
    [adsData, adRecommendationsData],
  );
  const drawerTotals = totalRow(
    selectedAdset ? adRows : adsetRows,
    "Total",
    normalizeTotals(selectedAdset ? adsData : adsetsData),
  );
  const mainTotals = useMemo(
    () => totalRow(rows, "Total", normalizeTotals(currentData)),
    [currentData, rows],
  );
  const resetSelections = () => {
    setSelectedCampaign(null);
    setSelectedAdset(null);
  };

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName:
        mainLevel === "campaign"
          ? "Campaign"
          : mainLevel === "adset"
            ? "Ad Set"
            : "Ad",
      minWidth: 220,
      flex: 1,
    },
    { field: "source", headerName: "Source", width: 100 },
    {
      field: "status",
      headerName: "Status",
      width: 105,
      renderCell: (params) =>
        params.row.isTotal ? null : (
          <StatusBadge status={displayStatus(params.row)} />
        ),
    },
    {
      field: "start_date",
      headerName: "Start",
      width: 115,
      valueFormatter: (value) => formatDate(String(value || "")),
    },
    {
      field: "end_date",
      headerName: "End",
      width: 115,
      valueFormatter: (value) => formatDate(String(value || "")),
    },
    {
      field: "pageviews",
      headerName: "PageViews",
      width: 105,
      valueFormatter: (value) => formatNumber(numberValue(value)),
    },
    {
      field: "impressions",
      headerName: "Impressions",
      width: 115,
      valueFormatter: (value) => formatNumber(numberValue(value)),
    },
    {
      field: "reach",
      headerName: "Reach",
      width: 95,
      valueFormatter: (value) => formatNumber(numberValue(value)),
    },
    {
      field: "clicks",
      headerName: "Clicks",
      width: 90,
      valueFormatter: (value) => formatNumber(numberValue(value)),
    },
    {
      field: "ctr",
      headerName: "CTR",
      width: 85,
      valueFormatter: (value) => formatPercent(numberValue(value)),
    },
    {
      field: "cpc",
      headerName: "CPC",
      width: 85,
      valueFormatter: (value, row) =>
        formatMoney(numberValue(value), row.currency || mainTotals.currency),
    },
    {
      field: "allocated_budget",
      headerName: "Budget",
      width: 125,
      valueFormatter: (value, row) =>
        formatMoney(numberValue(value), row.currency || mainTotals.currency),
    },
    {
      field: "recommended_budget",
      headerName: "AI Rec",
      width: 125,
      valueGetter: (_value, row) =>
        row.has_recommended_budget ? row.recommended_budget : null,
      valueFormatter: (value, row) =>
        hasValue(value)
          ? formatMoney(numberValue(value), row.currency || mainTotals.currency)
          : "-",
    },
    {
      field: "recommendation_action",
      headerName: "AI Action",
      width: 125,
      renderCell: (params) => {
        const action = displayRecommendationAction(params.row);
        return params.row.has_recommended_budget && action ? (
          <RecommendationBadge
            recommendation={action}
            detail={params.row.recommendation_detail}
          />
        ) : null;
      },
    },
    {
      field: "budget_type",
      headerName: "Budget Type",
      width: 120,
      valueFormatter: (value) => formatBudgetType(String(value || "")),
    },
    {
      field: "spend",
      headerName: "Spend",
      width: 125,
      valueFormatter: (value, row) =>
        formatMoney(numberValue(value), row.currency || mainTotals.currency),
    },
    {
      field: "initiated",
      headerName: "Initiated",
      width: 105,
      valueFormatter: (value) => formatNumber(numberValue(value)),
    },
    {
      field: "purchases",
      headerName: "Purchases",
      width: 105,
      valueFormatter: (value) => formatNumber(numberValue(value)),
    },
    {
      field: "revenue",
      headerName: "Revenue",
      width: 125,
      valueFormatter: (value, row) =>
        formatMoney(numberValue(value), row.currency || mainTotals.currency),
    },
    {
      field: "roas",
      headerName: "ROAS",
      width: 85,
      valueFormatter: (value) => formatRoas(numberValue(value)),
    },
    {
      field: "budget_utilization",
      headerName: "Budget Utilization",
      width: 155,
      valueFormatter: (value) => formatBudgetUtilization(numberValue(value)),
    },
    {
      field: "conversion_rate",
      headerName: "Conv. Rate (%)",
      width: 130,
      valueFormatter: (value) => formatPercent(numberValue(value)),
    },
  ];
  const tableRows = rows;

  const openCampaign = (params: GridRowParams<CampaignRow>) => {
    if (params.row.isTotal || mainLevel !== "campaign") return;
    setSelectedCampaign(params.row);
    setSelectedAdset(null);
    setDrawerTab("adsets");
  };

  const closeDrawer = () => {
    setSelectedCampaign(null);
    setSelectedAdset(null);
    setPaginationModel((model) => ({ ...model, page: 0 }));
  };

  const selectAdset = (row: CampaignRow) => {
    setSelectedAdset(row);
    setDrawerTab("ads");
  };

  const handleGenerateAiRecommendations = async () => {
    const { date_from, date_to } = getDateRange(range);
    const payload = {
      ...(selectedClientId ? { client_id: selectedClientId } : {}),
      platform: platform && platform !== "all" ? platform : "meta",
      entity_type: "campaign",
      date_from,
      date_to,
      total_budget: null,
      use_llm: true,
      use_vector_memory: true,
    };

    setGenerationError("");

    try {
      await generateAiRecommendations(payload).unwrap();

      refetch();
      refetchRecommendations();
    } catch (error) {
      setGenerationError(getApiErrorMessage(error));
    }
  };

  return (
    <Stack
      spacing={3}
      sx={{ minWidth: 0, maxWidth: "100%", overflowX: "hidden" }}
    >
      <Typography variant="h4" sx={dashboardTitleSx}>
        {role === "agency"
          ? "Client Campaign Overview"
          : "My Campaign Performance"}
      </Typography>

      <Box sx={panelSx}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          useFlexGap
          flexWrap="wrap"
          alignItems={{ sm: "flex-end" }}
        >
          <FormControl
            size="small"
            sx={{ flex: { xs: "1 1 100%", sm: "1 1 170px", lg: "0 0 170px" } }}
          >
            <Typography variant="caption" sx={{ mb: 0.5 }}>
              Date Range
            </Typography>
            <Select
              value={range}
              onChange={(event) => {
                resetSelections();
                setRange(event.target.value);
              }}
            >
              {ranges.map(([value, label]) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl
            size="small"
            sx={{ flex: { xs: "1 1 100%", sm: "1 1 160px", lg: "0 0 160px" } }}
          >
            <Typography variant="caption" sx={{ mb: 0.5 }}>
              Platform
            </Typography>
            <Select
              value={platform}
              onChange={(event) => {
                resetSelections();
                setPlatform(event.target.value);
              }}
            >
              <MenuItem value="all">All Sources</MenuItem>
              <MenuItem value="meta">Meta</MenuItem>
            </Select>
          </FormControl>

          <FormControl
            size="small"
            sx={{ flex: { xs: "1 1 100%", sm: "1 1 160px", lg: "0 0 160px" } }}
          >
            <Typography variant="caption" sx={{ mb: 0.5 }}>
              Status
            </Typography>
            <Select
              value={status}
              onChange={(event) => {
                resetSelections();
                setStatus(event.target.value);
              }}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>

          <Box
            sx={{ flex: { xs: "1 1 100%", sm: "1 1 300px", lg: "0 0 300px" } }}
          >
            <Typography variant="caption" sx={{ mb: 0.5, display: "block" }}>
              Level
            </Typography>
            <ToggleButtonGroup
              exclusive
              fullWidth
              size="small"
              value={mainLevel}
              onChange={(_, value) => {
                if (!value) return;
                resetSelections();
                setMainLevel(value);
              }}
            >
              <ToggleButton value="campaign">Campaigns</ToggleButton>
              <ToggleButton value="adset">Ad Sets</ToggleButton>
              <ToggleButton value="ad">Ads</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Button
            size="small"
            variant="outlined"
            startIcon={<AutoAwesomeIcon fontSize="small" />}
            onClick={handleGenerateAiRecommendations}
            disabled={isGeneratingRecommendations}
            sx={{ alignSelf: { xs: "stretch", sm: "flex-end" }, minHeight: 40 }}
          >
            {isGeneratingRecommendations
              ? "Generating..."
              : "Generate AI Recommendations"}
          </Button>
        </Stack>
        {generationError ? (
          <Typography
            variant="caption"
            color="error"
            sx={{ display: "block", mt: 1 }}
          >
            {generationError}
          </Typography>
        ) : null}
      </Box>

      <Paper
        sx={{
          p: { xs: 1.5, sm: 2 },
          borderRadius: 2,
          overflow: "hidden",
          minWidth: 0,
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          spacing={1}
          sx={{ mb: 1.5 }}
        >
          <Typography variant="h6">{levelLabels[mainLevel]}</Typography>
          <Typography variant="caption" color="text.secondary">
            {mainLevel === "campaign"
              ? "Click a campaign to inspect ad sets and ads"
              : "Totals only include the selected level"}
          </Typography>
        </Stack>

        <Box
          sx={{
            width: "100%",
            maxWidth: "100%",
            minWidth: 0,
            overflowX: "auto",
            overflowY: "hidden",
            pb: 1,
            "&::-webkit-scrollbar": {
              height: 8,
            },
            "&::-webkit-scrollbar-thumb": {
              bgcolor: "divider",
              borderRadius: 999,
            },
          }}
        >
          <DataGrid
            key={`${mainLevel}-${range}-${platform}-${status}`}
            rows={tableRows}
            columns={columns}
            loading={isFetching}
            onRowClick={openCampaign}
            disableRowSelectionOnClick
            autoHeight
            density="compact"
            disableColumnMenu
            paginationModel={paginationModel}
            onPaginationModelChange={(model) =>
              setPaginationModel({ page: model.page, pageSize: 10 })
            }
            pageSizeOptions={[10]}
            localeText={{
              noRowsLabel: `No ${levelLabels[mainLevel].toLowerCase()} found`,
            }}
            getRowClassName={(params) =>
              params.row.isTotal ? "total-row" : ""
            }
            sx={{
              minWidth: 2200,
              width: "max-content",
              maxWidth: "none",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              bgcolor: "background.paper",
              "& .MuiDataGrid-columnHeaders": {
                bgcolor: "#F7F9FC",
                borderBottom: "1px solid #E5EAF1",
                fontWeight: 600,
              },
              "& .MuiDataGrid-cell": {
                borderBottom: "1px solid #EEF2F6",
                fontSize: 12,
              },
              "& .MuiDataGrid-footerContainer": {
                minHeight: 42,
              },
              "& .MuiDataGrid-row:hover": {
                bgcolor:
                  mainLevel === "campaign" ? "rgba(94,53,177,0.04)" : "inherit",
              },
              "& .total-row": {
                bgcolor: "action.hover",
                fontWeight: 700,
              },
              "& .total-row .MuiDataGrid-cell": {
                fontWeight: 700,
              },
            }}
          />
        </Box>
        {rows.length ? (
          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            flexWrap="wrap"
            sx={{
              px: { xs: 1, sm: 1.5 },
              py: 1,
              mt: 0.5,
              bgcolor: "action.hover",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
            }}
          >
            {[
              ["Total PageViews", formatNumber(mainTotals.pageviews)],
              ["Impressions", formatNumber(mainTotals.impressions)],
              ["Reach", formatNumber(mainTotals.reach)],
              ["Clicks", formatNumber(mainTotals.clicks)],
              [
                "Allocated Budget",
                formatMoney(mainTotals.allocated_budget, mainTotals.currency),
              ],
              ["Spend", formatMoney(mainTotals.spend, mainTotals.currency)],
              ["Revenue", formatMoney(mainTotals.revenue, mainTotals.currency)],
              [
                "Recommended Budget",
                formatMoney(
                  mainTotals.recommended_budget,
                  mainTotals.currency,
                ),
              ],
              ["ROAS", formatRoas(mainTotals.roas)],
              [
                "Budget Utilization",
                formatBudgetUtilization(mainTotals.budget_utilization),
              ],
            ].map(([label, value]) => (
              <Box
                key={label}
                sx={{
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  bgcolor: "background.paper",
                  border: "1px solid",
                  borderColor: "divider",
                  minWidth: { xs: "calc(50% - 4px)", sm: "auto" },
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    color: "text.secondary",
                    lineHeight: 1.2,
                  }}
                >
                  {label}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ display: "block", fontWeight: 700, lineHeight: 1.3 }}
                >
                  {value}
                </Typography>
              </Box>
            ))}
          </Stack>
        ) : null}
      </Paper>

      <Drawer
        anchor={isMobile ? "bottom" : "right"}
        open={Boolean(selectedCampaign)}
        onClose={closeDrawer}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: 600, md: 640 },
            height: { xs: "100%", sm: "100%" },
            borderRadius: { xs: "12px 12px 0 0", sm: 0 },
          },
        }}
      >
        {selectedCampaign ? (
          <Stack sx={{ height: "100%" }}>
            <Box
              sx={{ p: 2.5, borderBottom: "1px solid", borderColor: "divider" }}
            >
              <Stack
                direction="row"
                alignItems="flex-start"
                justifyContent="space-between"
                spacing={2}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700 }} noWrap>
                    {selectedCampaign.name}
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ mt: 1 }}
                  >
                    <StatusBadge status={displayStatus(selectedCampaign)} />
                    <Typography variant="caption" color="text.secondary">
                      {selectedCampaign.source}
                    </Typography>
                  </Stack>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mt: 0.75 }}
                  >
                    {formatDate(selectedCampaign.start_date)} -{" "}
                    {formatDate(selectedCampaign.end_date)}
                  </Typography>
                </Box>
                <IconButton
                  size="small"
                  onClick={closeDrawer}
                  aria-label="Close campaign drawer"
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Stack>

              <Breadcrumbs sx={{ mt: 2, fontSize: 12 }}>
                <Typography color="text.secondary" variant="caption">
                  Campaigns
                </Typography>
                <Typography
                  variant="caption"
                  color={selectedAdset ? "primary" : "text.primary"}
                  sx={{ cursor: selectedAdset ? "pointer" : "default" }}
                  onClick={() => {
                    setSelectedAdset(null);
                    setDrawerTab("adsets");
                  }}
                >
                  {selectedCampaign.name}
                </Typography>
                {selectedAdset ? (
                  <Typography variant="caption" color="text.primary">
                    {selectedAdset.name}
                  </Typography>
                ) : null}
              </Breadcrumbs>
            </Box>

            <Tabs
              value={drawerTab}
              onChange={(_, value) => setDrawerTab(value)}
              sx={{ px: 2, borderBottom: "1px solid", borderColor: "divider" }}
            >
              <Tab value="overview" label="Overview" />
              <Tab value="adsets" label="Ad Sets" />
              <Tab value="ads" label="Ads" />
            </Tabs>

            <Box sx={{ p: 2, overflow: "auto", flex: 1 }}>
              {drawerTab === "overview" ? (
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
                    gap: 1.5,
                  }}
                >
                  <MetricCard
                    label="Spend"
                    value={formatMoney(
                      selectedCampaign.spend,
                      selectedCampaign.currency || mainTotals.currency,
                    )}
                  />
                  <MetricCard
                    label="Clicks"
                    value={formatNumber(selectedCampaign.clicks)}
                  />
                  <MetricCard
                    label="PageViews"
                    value={formatNumber(selectedCampaign.pageviews)}
                  />
                  <MetricCard
                    label="Initiated"
                    value={formatNumber(selectedCampaign.initiated)}
                  />
                  <MetricCard
                    label="Purchases"
                    value={formatNumber(selectedCampaign.purchases)}
                  />
                  <MetricCard
                    label="Revenue"
                    value={formatMoney(
                      selectedCampaign.revenue,
                      selectedCampaign.currency || mainTotals.currency,
                    )}
                  />
                  <MetricCard
                    label="ROAS"
                    value={formatRoas(selectedCampaign.roas)}
                  />
                </Box>
              ) : null}

              {drawerTab === "adsets" ? (
                <DenseMetricTable
                  rows={adsetRows}
                  loading={isAdsetsFetching}
                  emptyText="No adsets found"
                  onRowClick={selectAdset}
                />
              ) : null}

              {drawerTab === "ads" ? (
                <Stack spacing={1.5}>
                  {selectedAdset ? (
                    <Typography variant="subtitle2" color="text.secondary">
                      Ads in {selectedAdset.name}
                    </Typography>
                  ) : null}
                  <DenseMetricTable
                    rows={adRows}
                    loading={isAdsFetching}
                    emptyText="No ads found"
                  />
                </Stack>
              ) : null}
            </Box>

            <Box
              sx={{
                px: 2,
                py: 1.5,
                borderTop: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
              }}
            >
              <Stack direction="row" spacing={2} useFlexGap flexWrap="wrap">
                <Typography variant="caption">
                  Spend:{" "}
                  <strong>
                    {formatMoney(drawerTotals.spend, drawerTotals.currency)}
                  </strong>
                </Typography>
                <Typography variant="caption">
                  Clicks: <strong>{formatNumber(drawerTotals.clicks)}</strong>
                </Typography>
                <Typography variant="caption">
                  Purchases:{" "}
                  <strong>{formatNumber(drawerTotals.purchases)}</strong>
                </Typography>
                <Typography variant="caption">
                  ROAS: <strong>{formatRoas(drawerTotals.roas)}</strong>
                </Typography>
              </Stack>
            </Box>
          </Stack>
        ) : null}
      </Drawer>
    </Stack>
  );
}
