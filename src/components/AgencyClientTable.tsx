import { Box } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

export default function AgencyClientTable({ rows }: { rows: any[] }) {
  const columns: GridColDef[] = [
    { field: "client_name", headerName: "Client", flex: 1 },
    { field: "pageviews", headerName: "PageViews", flex: 1 },
    { field: "clicks", headerName: "Clicks", flex: 1 },
    { field: "initiated", headerName: "Initiated", flex: 1 },
    { field: "last_event", headerName: "Last Event", flex: 1 },
  ];

  return (
    <Box sx={{ height: 350, width: "100%" }}>
      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(row) => row.client_id}
        disableRowSelectionOnClick
      />
    </Box>
  );
}
