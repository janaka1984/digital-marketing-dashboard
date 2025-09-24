import { Box, Chip, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { useListEventsQuery } from '@services/eventApi';

export default function EventTable() {
  const { data, isFetching, isError } = useListEventsQuery({ page: 1, pageSize: 25 });

  if (isError) return <Typography color="error">Failed to load events.</Typography>;

  return (
    <Box sx={{ width: '100%', overflowX: 'auto' }}>
      <Table size="small" aria-label="events table">
        <TableHead>
          <TableRow>
            <TableCell>Time</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Source URL</TableCell>
            <TableCell>User Data</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data?.map((e) => (
            <TableRow key={e.id}>
              <TableCell>{dayjs.unix(e.event_time).format('YYYY-MM-DD HH:mm:ss')}</TableCell>
              <TableCell>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Chip size="small" label={e.event_name} />
                </Stack>
              </TableCell>
              <TableCell sx={{ maxWidth: 360, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {e.event_source_url || '-'}
              </TableCell>
              <TableCell>
                <Typography variant="caption" color="text.secondary">
                  {e.user_data ? JSON.stringify(e.user_data).slice(0, 80) + '…' : '-'}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
          {isFetching && (
            <TableRow>
              <TableCell colSpan={4}><Typography variant="body2">Loading…</Typography></TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Box>
  );
}
