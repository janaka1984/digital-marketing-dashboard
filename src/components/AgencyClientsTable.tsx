// src/components/AgencyClientTable.tsx
import { Box } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

// -------- Types --------
export interface AgencyClientRow {
  client_id: number | string;
  client_name: string;
  pageviews: number;
  clicks: number;
  initiated: number;
  last_event: string;
}

interface Props {
  rows: AgencyClientRow[];
  loading?: boolean;
}

export default function AgencyClientTable({ rows, loading = false }: Props) {
  const columns: GridColDef[] = [
    { field: "client_name", headerName: "Client", flex: 1 },
    { field: "pageviews", headerName: "PageViews", flex: 1 },
    { field: "clicks", headerName: "Clicks", flex: 1 },
    { field: "initiated", headerName: "Initiated", flex: 1 },
    { field: "last_event", headerName: "Last Activity", flex: 1 },
  ];

  return (
    <Box sx={{ height: 420 }}>
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        getRowId={(row) => row.client_id}
        disableRowSelectionOnClick
      />
    </Box>
  );
}
