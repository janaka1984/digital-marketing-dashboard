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
  const [open, setOpen] = useState(true);
  const { toggleColorMode } = useColorMode();

  return (
    <Box sx={{ display: 'flex', minHeight: '100dvh' }}>
      <AppBar position="fixed" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', color: 'text.primary' }}>
        <Toolbar>
          <IconButton onClick={() => setOpen((v) => !v)} size="large" edge="start" sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>{APP_NAME}</Typography>
          {/* 🌙/☀️ Toggle Button */}
          <IconButton onClick={toggleColorMode} color="inherit">
            <Brightness4Icon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={open}
        onClose={() => setOpen(false)}
        ModalProps={{ keepMounted: true }} // Better open performance on mobile.
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' }
        }}
      >
        <Toolbar />
        <Divider />
        <Sidebar />
      </Drawer>

      <Box component="main" 
      sx={{ flexGrow: 1, 
        p: 3, 
      //   ml: open ? `${DRAWER_WIDTH}px` : 0, 
      // transition: 'margin .2s ease' 
    }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
