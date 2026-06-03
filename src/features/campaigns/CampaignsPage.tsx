import {
  Box,
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
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useMemo, useState } from "react";
import { GridColDef, GridRowParams } from "@mui/x-data-grid";
import { DataGrid } from "@mui/x-data-grid";
import { useGetDashboardCampaignsQuery } from "@services/dashboardApi";
import { useAppSelector } from "@store/hooks";

type CampaignLevel = "campaign" | "adset" | "ad";
type DrawerTab = "overview" | "adsets" | "ads";

type CampaignRow = {
  id: string | number;
  raw: Record<string, any>;
  name: string;
  source: string;
  status: string;
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

const numericFields: Array<keyof Pick<
  CampaignRow,
  | "pageviews"
  | "impressions"
  | "reach"
  | "clicks"
  | "spend"
  | "initiated"
  | "purchases"
  | "revenue"
>> = ["pageviews", "impressions", "reach", "clicks", "spend", "initiated", "purchases", "revenue"];

const tableCellSx = {
  py: 1,
  fontSize: 12,
  whiteSpace: "nowrap",
};

const panelSx = {
  p: 2,
  bgcolor: "background.paper",
  borderRadius: 2,
  boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
};

const numberValue = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const readValue = (row: Record<string, any>, key: string): unknown =>
  key.split(".").reduce<unknown>(
    (value, pathKey) => (value && typeof value === "object" ? (value as Record<string, any>)[pathKey] : undefined),
    row
  );

const pick = (row: Record<string, any>, keys: string[], fallback: string | number = ""): string | number => {
  for (const key of keys) {
    const value = readValue(row, key);
    if (value !== undefined && value !== null && value !== "" && typeof value !== "object") return value as string | number;
  }
  return fallback;
};

const getApiRows = (data: any, level: CampaignLevel) => {
  if (Array.isArray(data)) return data;
  const levelKey = level === "adset" ? "adsets" : level === "ad" ? "ads" : "campaigns";
  return data?.[levelKey] || data?.results || data?.rows || data?.data || data?.campaigns || [];
};

const startDateKeys = [
  "start_date",
  "start",
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
  "end_date",
  "end",
  "end_time",
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

const normalizeRow = (row: Record<string, any>, index: number, level: CampaignLevel): CampaignRow => {
  const campaignId = pick(row, ["campaign_id", "campaignId", "campaign.id", "campaign_id_meta", "id"]);
  const adsetId = pick(row, ["adset_id", "adsetId", "adset.id", "adset_id_meta", "id"]);
  const name = String(
    pick(
      row,
      level === "campaign"
        ? ["name", "campaign_name", "campaign.name", "campaign", "utm_campaign", "payload__utm_campaign"]
        : level === "adset"
          ? ["name", "adset_name", "adset.name", "adset", "campaign_name", "campaign.name"]
          : ["name", "ad_name", "ad.name", "ad", "creative_name"],
      "Untitled"
    )
  );

  return {
    id: pick(
      row,
      level === "campaign"
        ? ["row_id", "campaign_id", "id"]
        : level === "adset"
          ? ["row_id", "adset_id", "id"]
          : ["row_id", "ad_id", "id"],
      `${level}-${index}`
    ),
    raw: row,
    name,
    source: String(pick(row, ["source", "platform", "utm_source", "payload__utm_source"], "-")),
    status: String(pick(row, ["status"], "-")),
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
    start_date: String(pick(row, startDateKeys, "")),
    end_date: String(pick(row, endDateKeys, "")),
    latest_at: String(pick(row, latestDateKeys, "")),
    campaign_id: campaignId || undefined,
    adset_id: adsetId || undefined,
  };
};

const rowIdentity = (row: CampaignRow, level: CampaignLevel) => {
  if (level === "campaign") return `campaign:${row.campaign_id || row.id || row.name}:${row.source}`;
  if (level === "adset") return `adset:${row.campaign_id || ""}:${row.adset_id || row.id || row.name}:${row.source}`;
  return `ad:${row.campaign_id || ""}:${row.adset_id || ""}:${row.id || row.name}:${row.source}`;
};

const metricSignature = (row: CampaignRow) =>
  [
    row.pageviews,
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
    existing.start_date = earliestDate(existing.start_date, row.start_date);
    existing.end_date = latestDate(existing.end_date, row.end_date);
    existing.latest_at = latestDate(existing.latest_at, row.latest_at);
    existing.ctr = existing.impressions ? (existing.clicks / existing.impressions) * 100 : 0;
    existing.cpc = existing.clicks ? existing.spend / existing.clicks : 0;
    existing.roas = existing.spend ? existing.revenue / existing.spend : 0;
    existing.conversion_rate = existing.pageviews ? (existing.purchases / existing.pageviews) * 100 : 0;
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

const sortLatestFirst = (rows: CampaignRow[]) => [...rows].sort((first, second) => latestTimestamp(second) - latestTimestamp(first));

const normalizeRows = (data: any, level: CampaignLevel) =>
  sortLatestFirst(
    mergeRowsByLevel(
      getApiRows(data, level).map((row: Record<string, any>, index: number) => normalizeRow(row, index, level)),
      level
    )
  );

const totalRow = (rows: CampaignRow[], label = "Total"): CampaignRow => {
  const totals = rows.reduce(
    (acc, row) => {
      numericFields.forEach((field) => {
        acc[field] += row[field] || 0;
      });
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
    } as Record<(typeof numericFields)[number], number>
  );

  return {
    id: "total-row",
    raw: {},
    name: label,
    source: "",
    status: "",
    ...totals,
    ctr: totals.impressions ? (totals.clicks / totals.impressions) * 100 : 0,
    cpc: totals.clicks ? totals.spend / totals.clicks : 0,
    roas: totals.spend ? totals.revenue / totals.spend : 0,
    conversion_rate: totals.pageviews ? (totals.purchases / totals.pageviews) * 100 : 0,
    start_date: "",
    end_date: "",
    latest_at: "",
    isTotal: true,
  };
};

const formatNumber = (value: number) => Math.round(value || 0).toLocaleString();
const formatMoney = (value: number) =>
  (value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const formatPercent = (value: number) => `${(value || 0).toFixed(2)}%`;
const formatDecimal = (value: number) => (value || 0).toFixed(2);
const formatDate = (value: string) => {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
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

  const label = normalized === "active" ? "Active" : normalized === "inactive" ? "Inactive" : status;

  return <Chip size="small" label={label} color={color} variant="outlined" sx={{ height: 22, fontSize: 11 }} />;
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
    <TableContainer sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: "#F7F9FC" }}>
            {["Name", "Status", "PageViews", "Impr.", "Reach", "Clicks", "CTR", "CPC", "Spend", "Purchases", "Revenue", "ROAS"].map(
              (header) => (
                <TableCell key={header} sx={{ ...tableCellSx, fontWeight: 600 }}>
                  {header}
                </TableCell>
              )
            )}
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
                    "& .MuiTableCell-root": { fontWeight: row.isTotal ? 700 : 400 },
                  }}
                >
                  <TableCell sx={{ ...tableCellSx, minWidth: 170 }}>{row.name}</TableCell>
                  <TableCell sx={tableCellSx}>
                    <StatusBadge status={displayStatus(row)} />
                  </TableCell>
                  <TableCell sx={tableCellSx}>{formatNumber(row.pageviews)}</TableCell>
                  <TableCell sx={tableCellSx}>{formatNumber(row.impressions)}</TableCell>
                  <TableCell sx={tableCellSx}>{formatNumber(row.reach)}</TableCell>
                  <TableCell sx={tableCellSx}>{formatNumber(row.clicks)}</TableCell>
                  <TableCell sx={tableCellSx}>{formatPercent(row.ctr)}</TableCell>
                  <TableCell sx={tableCellSx}>{formatMoney(row.cpc)}</TableCell>
                  <TableCell sx={tableCellSx}>{formatMoney(row.spend)}</TableCell>
                  <TableCell sx={tableCellSx}>{formatNumber(row.purchases)}</TableCell>
                  <TableCell sx={tableCellSx}>{formatMoney(row.revenue)}</TableCell>
                  <TableCell sx={tableCellSx}>{formatDecimal(row.roas)}</TableCell>
                </TableRow>
              ))}

          {!loading && !rows.length ? (
            <TableRow>
              <TableCell colSpan={12} sx={{ py: 5, textAlign: "center", color: "text.secondary" }}>
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
    <Box sx={{ p: 1.5, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
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
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignRow | null>(null);
  const [selectedAdset, setSelectedAdset] = useState<CampaignRow | null>(null);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });

  const campaignId = selectedCampaign?.campaign_id || selectedCampaign?.id;
  const adsetId = selectedAdset?.adset_id || selectedAdset?.id;

  const { currentData, isFetching } = useGetDashboardCampaignsQuery({
    level: mainLevel,
    range,
    platform,
    status,
  });

  const { currentData: adsetsData, isFetching: isAdsetsFetching } = useGetDashboardCampaignsQuery(
    {
      level: "adset",
      campaign_id: campaignId,
      range,
      platform,
      status,
    },
    { skip: !campaignId }
  );

  const { currentData: adsData, isFetching: isAdsFetching } = useGetDashboardCampaignsQuery(
    {
      level: "ad",
      campaign_id: campaignId,
      adset_id: adsetId,
      range,
      platform,
      status,
    },
    { skip: !campaignId }
  );

  const rows = useMemo(() => normalizeRows(currentData, mainLevel), [currentData, mainLevel]);
  const adsetRows = useMemo(() => normalizeRows(adsetsData, "adset"), [adsetsData]);
  const adRows = useMemo(() => normalizeRows(adsData, "ad"), [adsData]);
  const drawerTotals = totalRow(selectedAdset ? adRows : adsetRows);
  const mainTotals = useMemo(() => totalRow(rows), [rows]);
  const resetSelections = () => {
    setSelectedCampaign(null);
    setSelectedAdset(null);
  };

  const columns: GridColDef[] = [
    { field: "name", headerName: mainLevel === "campaign" ? "Campaign" : mainLevel === "adset" ? "Ad Set" : "Ad", minWidth: 220, flex: 1 },
    { field: "source", headerName: "Source", width: 100 },
    {
      field: "status",
      headerName: "Status",
      width: 105,
      renderCell: (params) => (params.row.isTotal ? null : <StatusBadge status={displayStatus(params.row)} />),
    },
    { field: "start_date", headerName: "Start", width: 115, valueFormatter: (value) => formatDate(String(value || "")) },
    { field: "end_date", headerName: "End", width: 115, valueFormatter: (value) => formatDate(String(value || "")) },
    { field: "pageviews", headerName: "PageViews", width: 105, valueFormatter: (value) => formatNumber(numberValue(value)) },
    { field: "impressions", headerName: "Impressions", width: 115, valueFormatter: (value) => formatNumber(numberValue(value)) },
    { field: "reach", headerName: "Reach", width: 95, valueFormatter: (value) => formatNumber(numberValue(value)) },
    { field: "clicks", headerName: "Clicks", width: 90, valueFormatter: (value) => formatNumber(numberValue(value)) },
    { field: "ctr", headerName: "CTR", width: 85, valueFormatter: (value) => formatPercent(numberValue(value)) },
    { field: "cpc", headerName: "CPC", width: 85, valueFormatter: (value) => formatMoney(numberValue(value)) },
    { field: "spend", headerName: "Spend", width: 100, valueFormatter: (value) => formatMoney(numberValue(value)) },
    { field: "initiated", headerName: "Initiated", width: 105, valueFormatter: (value) => formatNumber(numberValue(value)) },
    { field: "purchases", headerName: "Purchases", width: 105, valueFormatter: (value) => formatNumber(numberValue(value)) },
    { field: "revenue", headerName: "Revenue", width: 105, valueFormatter: (value) => formatMoney(numberValue(value)) },
    { field: "roas", headerName: "ROAS", width: 85, valueFormatter: (value) => formatDecimal(numberValue(value)) },
    { field: "conversion_rate", headerName: "Conv. Rate (%)", width: 130, valueFormatter: (value) => formatPercent(numberValue(value)) },
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

  return (
    <Stack spacing={3}>
      <Typography variant="h4" fontWeight={600}>
        {role === "agency" ? "Client Campaign Overview" : "My Campaign Performance"}
      </Typography>

      <Box sx={panelSx}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} useFlexGap flexWrap="wrap" alignItems={{ md: "flex-end" }}>
          <FormControl size="small" sx={{ minWidth: { xs: "100%", md: 170 } }}>
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

          <FormControl size="small" sx={{ minWidth: { xs: "100%", md: 160 } }}>
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

          <FormControl size="small" sx={{ minWidth: { xs: "100%", md: 160 } }}>
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

          <Box sx={{ minWidth: { xs: "100%", md: 300 } }}>
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
        </Stack>
      </Box>

      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1} sx={{ mb: 1.5 }}>
          <Typography variant="h6">{levelLabels[mainLevel]}</Typography>
          <Typography variant="caption" color="text.secondary">
            {mainLevel === "campaign" ? "Click a campaign to inspect ad sets and ads" : "Totals only include the selected level"}
          </Typography>
        </Stack>

        <Box sx={{ width: "100%" }}>
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
            onPaginationModelChange={(model) => setPaginationModel({ page: model.page, pageSize: 10 })}
            pageSizeOptions={[10]}
            localeText={{ noRowsLabel: `No ${levelLabels[mainLevel].toLowerCase()} found` }}
            getRowClassName={(params) => (params.row.isTotal ? "total-row" : "")}
            sx={{
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
                bgcolor: mainLevel === "campaign" ? "rgba(94,53,177,0.04)" : "inherit",
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
          {rows.length ? (
            <Stack
              direction="row"
              spacing={2}
              useFlexGap
              flexWrap="wrap"
              sx={{
                px: 1.5,
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
                ["Spend", formatMoney(mainTotals.spend)],
                ["Revenue", formatMoney(mainTotals.revenue)],
                ["ROAS", formatDecimal(mainTotals.roas)],
              ].map(([label, value]) => (
                <Typography key={label} variant="caption" sx={{ fontWeight: 700 }}>
                  {label}: {value}
                </Typography>
              ))}
            </Stack>
          ) : null}
        </Box>
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
            <Box sx={{ p: 2.5, borderBottom: "1px solid", borderColor: "divider" }}>
              <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700 }} noWrap>
                    {selectedCampaign.name}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                    <StatusBadge status={displayStatus(selectedCampaign)} />
                    <Typography variant="caption" color="text.secondary">
                      {selectedCampaign.source}
                    </Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.75 }}>
                    {formatDate(selectedCampaign.start_date)} - {formatDate(selectedCampaign.end_date)}
                  </Typography>
                </Box>
                <IconButton size="small" onClick={closeDrawer} aria-label="Close campaign drawer">
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

            <Tabs value={drawerTab} onChange={(_, value) => setDrawerTab(value)} sx={{ px: 2, borderBottom: "1px solid", borderColor: "divider" }}>
              <Tab value="overview" label="Overview" />
              <Tab value="adsets" label="Ad Sets" />
              <Tab value="ads" label="Ads" />
            </Tabs>

            <Box sx={{ p: 2, overflow: "auto", flex: 1 }}>
              {drawerTab === "overview" ? (
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" }, gap: 1.5 }}>
                  <MetricCard label="Spend" value={formatMoney(selectedCampaign.spend)} />
                  <MetricCard label="Clicks" value={formatNumber(selectedCampaign.clicks)} />
                  <MetricCard label="PageViews" value={formatNumber(selectedCampaign.pageviews)} />
                  <MetricCard label="Initiated" value={formatNumber(selectedCampaign.initiated)} />
                  <MetricCard label="Purchases" value={formatNumber(selectedCampaign.purchases)} />
                  <MetricCard label="Revenue" value={formatMoney(selectedCampaign.revenue)} />
                  <MetricCard label="ROAS" value={formatDecimal(selectedCampaign.roas)} />
                </Box>
              ) : null}

              {drawerTab === "adsets" ? (
                <DenseMetricTable rows={adsetRows} loading={isAdsetsFetching} emptyText="No adsets found" onRowClick={selectAdset} />
              ) : null}

              {drawerTab === "ads" ? (
                <Stack spacing={1.5}>
                  {selectedAdset ? (
                    <Typography variant="subtitle2" color="text.secondary">
                      Ads in {selectedAdset.name}
                    </Typography>
                  ) : null}
                  <DenseMetricTable rows={adRows} loading={isAdsFetching} emptyText="No ads found" />
                </Stack>
              ) : null}
            </Box>

            <Box sx={{ px: 2, py: 1.5, borderTop: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
              <Stack direction="row" spacing={2} useFlexGap flexWrap="wrap">
                <Typography variant="caption">
                  Spend: <strong>{formatMoney(drawerTotals.spend)}</strong>
                </Typography>
                <Typography variant="caption">
                  Clicks: <strong>{formatNumber(drawerTotals.clicks)}</strong>
                </Typography>
                <Typography variant="caption">
                  Purchases: <strong>{formatNumber(drawerTotals.purchases)}</strong>
                </Typography>
                <Typography variant="caption">
                  ROAS: <strong>{formatDecimal(drawerTotals.roas)}</strong>
                </Typography>
              </Stack>
            </Box>
          </Stack>
        ) : null}
      </Drawer>
    </Stack>
  );
}
