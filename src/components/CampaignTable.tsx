import { Box } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import type { CampaignPerformance } from "@types";

type Props = {
  rows: CampaignPerformance[];
  loading: boolean;
};

export default function CampaignTable({ rows, loading }: Props) {
  // Compute totals
  const totals = rows.reduce(
    (acc, row) => {
      acc.pageviews += row.pageviews || 0;
      acc.clicks += row.clicks || 0;
      acc.initiated += row.initiated || 0;
      acc.purchases += row.purchases || 0;
      acc.revenue += row.revenue || 0;
      return acc;
    },
    { pageviews: 0, clicks: 0, initiated: 0, purchases: 0, revenue: 0 }
  );

  // Add total row
  const rowsWithTotal = [
    ...rows,
    {
      id: "total-row",
      utm_campaign: "Total",
      utm_source: "",
      utm_medium: "",
      pageviews: totals.pageviews,
      clicks: totals.clicks,
      initiated: totals.initiated,
      purchases: totals.purchases,
      revenue: totals.revenue,
      conversion_rate: 0,
    },
  ];

  const columns: GridColDef[] = [
    { field: "utm_campaign", headerName: "Campaign", flex: 1 },
    { field: "utm_source", headerName: "Source", flex: 1 },
    { field: "utm_medium", headerName: "Medium", flex: 1 },
    { field: "pageviews", headerName: "PageViews", flex: 1 },
    { field: "clicks", headerName: "Clicks", flex: 1 },
    { field: "initiated", headerName: "Initiated", flex: 1 },
    { field: "purchases", headerName: "Purchases", flex: 1 },
    { field: "revenue", headerName: "Revenue (LKR)", flex: 1 },
    { field: "conversion_rate", headerName: "Conv. Rate (%)", flex: 1 },
  ];

  return (
    <Box sx={{ height: 400, width: "100%" }}>
      <DataGrid
        rows={rowsWithTotal}
        columns={columns}
        getRowId={(row) =>
          row.id ||
          `${row.utm_campaign}-${row.utm_source}-${row.utm_medium}`
        }
        loading={loading}
        disableRowSelectionOnClick
      />
    </Box>
  );
}
