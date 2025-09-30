// src/features/dashboard/CampaignTable.tsx
import { Box } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import type { CampaignPerformance } from '@types';

type Props = {
  rows: CampaignPerformance[];
  loading: boolean;
};

export default function CampaignTable({ rows, loading }: Props) {
  const columns: GridColDef[] = [
    { field: 'payload__utm_campaign', headerName: 'Campaign', flex: 1 },
    { field: 'payload__utm_source', headerName: 'Source', flex: 1 },
    { field: 'payload__utm_medium', headerName: 'Medium', flex: 1 },
    { field: 'pageviews', headerName: 'PageViews', flex: 1 },
    { field: 'clicks', headerName: 'Clicks', flex: 1 },
    { field: 'conversions', headerName: 'Conversions', flex: 1 },
  ];

  return (
    <Box sx={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(row) =>
          `${row.payload__utm_campaign || 'unknown'}-${row.payload__utm_source || ''}-${row.payload__utm_medium || ''}`
        }
        loading={loading}
        disableRowSelectionOnClick
      />
    </Box>
  );
}
