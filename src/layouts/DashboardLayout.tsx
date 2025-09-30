// DashboardLayout.tsx
import { AppBar, Box, Divider, Drawer, IconButton, Toolbar, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from './Sidebar';
import { APP_NAME } from '@utils/env';
import { useColorMode } from '@theme/useColorMode';
import Brightness4Icon from '@mui/icons-material/Brightness4';

const DRAWER_WIDTH = 260;

export default function DashboardLayout() {
  const [open, setOpen] = useState(false);   // 👈 start closed
  const { toggleColorMode } = useColorMode();

  return (
    <Box sx={{ display: 'flex' }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          // width: open ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%',
          // ml: open ? `${DRAWER_WIDTH}px` : 0,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          color: 'text.primary',
          // transition: 'all 0.3s ease',
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          {/* Toggle button always visible */}
          <IconButton
            onClick={() => setOpen((v) => !v)}
            size="large"
            edge="start"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {APP_NAME}
          </Typography>
          <IconButton onClick={toggleColorMode} color="inherit">
            <Brightness4Icon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer */}
      <Drawer
        variant="temporary" // 👈 overlay instead of pushing
        anchor="left"
        open={open}
        onClose={() => setOpen(false)}
        // ModalProps={{ keepMounted: true }} // better performance on mobile
        sx={{
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        <Divider />
        <Sidebar />
      </Drawer>



      {/* Main Content */}
      <Box
  component="main"
  sx={{
    flexGrow: 1,
    p: { xs: 2, sm: 3 },                // responsive padding
    width: { sm: `calc(100% - ${open ? DRAWER_WIDTH : 0}px)` }, // 👈 shrink only when open
    ml: open ? `${DRAWER_WIDTH}px` : 0, // 👈 shift to the right
    transition: 'all 0.3s ease',
  }}
>
  <Toolbar />
  <Outlet />
</Box>

    </Box>
  );
}
