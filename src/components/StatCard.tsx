// src/components/StatCard.tsx
import { Card, CardContent, Typography, Stack, Box } from '@mui/material';
import type { SvgIconComponent } from '@mui/icons-material';

type Props = {
  title: string;
  value: number | string;
  icon?: SvgIconComponent;       // optional icon
  color?: string;                // background color
};

export default function StatCard({ title, value, icon: Icon, color }: Props) {
  return (
    <Card
      // sx={{
      //   bgcolor: 'transparent',
      //   // boxShadow: 'none',
      //   borderRadius: 2,
      //   border: '1px solid',
      //   borderColor: 'divider',
      //   backgroundColor: color || '#2065D1', // default to blue if no color provided
      //   color: '#fff',
      //   boxShadow: '0 8px 16px rgba(0,0,0,0.08)',
      // }}
        sx={{
        backdropFilter: 'blur(12px)',                  // ✅ frosted blur
        backgroundColor: `${color}33`,                 // ✅ 20% opacity (33 in hex = ~20%)
        border: '1px solid',
        borderColor: `${color}55`,                     // ✅ 33% opacity border
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        color: 'text.primary',
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2}>
          {/* Title + Icon */}
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="subtitle2" color="text.secondary" sx={{ opacity: 0.9 }}>
              {title}
            </Typography>
            {Icon && (
              <Box
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  borderRadius: '50%',
                  p: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon fontSize="small" />
              </Box>
            )}
          </Stack>

          {/* Value */}
          <Typography variant="h4" fontWeight={700}>
            {value}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
