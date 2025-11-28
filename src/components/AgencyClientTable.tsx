import { Box } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import type { AgencyClient } from "@types";


interface Props {
  rows: AgencyClient[];
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
