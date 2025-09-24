import { Card, CardContent, Stack, Typography } from '@mui/material';

export default function StatCard({
  title, value, subtitle
}: { title: string; value: string | number; subtitle?: string; }) {
  return (
    <Card>
      <CardContent>
        <Stack spacing={0.5}>
          <Typography variant="overline" color="text.secondary">{title}</Typography>
          <Typography variant="h5">{value}</Typography>
          {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
        </Stack>
      </CardContent>
    </Card>
  );
}
