import { Card, CardContent, Typography, Stack, Box } from '@mui/material';
import type { SvgIconComponent } from '@mui/icons-material';

type Props = {
  title: string;
  value: number | string;
  icon?: SvgIconComponent;
  color?: string;
};

export default function StatCard({ title, value, icon: Icon, color = '#5E35B1' }: Props) {
  return (
    <Card
      sx={{
        position: 'relative',
        overflow: 'hidden',
        height: '100%',
        minHeight: 150,
        color: '#fff',
        border: 'none',
        boxShadow: '0 8px 20px rgba(17, 25, 54, 0.14)',
        background: `linear-gradient(135deg, ${color} 0%, ${color}DD 65%, ${color}CC 100%)`
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          width: 170,
          height: 170,
          borderRadius: '50%',
          right: -40,
          top: -50,
          bgcolor: 'rgba(255,255,255,0.12)'
        }}
      />
      <CardContent sx={{ p: 2.25, position: 'relative', zIndex: 1, height: '100%' }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1.5}>
          <Stack spacing={0.65} sx={{ minWidth: 0, flex: 1 }}>
            <Typography sx={{ fontSize: '1.35rem', fontWeight: 700, lineHeight: 1.15, letterSpacing: 0.2 }}>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </Typography>
            <Typography
              sx={{
                fontSize: '0.82rem',
                fontWeight: 600,
                color: 'rgba(255,255,255,0.95)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {title}
            </Typography>
          </Stack>

          {Icon ? (
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                border: '6px solid rgba(255,255,255,0.28)',
                display: 'grid',
                placeItems: 'center',
                color: 'rgba(255,255,255,0.52)'
              }}
            >
              <Icon sx={{ fontSize: 38 }} />
            </Box>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}
