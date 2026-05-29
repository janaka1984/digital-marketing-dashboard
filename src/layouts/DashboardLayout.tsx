import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  Stack,
  Toolbar,
  useMediaQuery
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from './Sidebar';
import { useColorMode } from '@theme/useColorMode';
import { useTheme } from '@mui/material/styles';

const DRAWER_WIDTH = 280;
const MINI_DRAWER_WIDTH = 88;
const HEADER_HEIGHT = 78;

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { toggleColorMode } = useColorMode();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const currentDrawerWidth = isDesktop ? (collapsed ? MINI_DRAWER_WIDTH : DRAWER_WIDTH) : DRAWER_WIDTH;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (muiTheme) => muiTheme.zIndex.drawer + 1,
          height: HEADER_HEIGHT,
          bgcolor: 'background.paper',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'divider',
          ml: { md: `${currentDrawerWidth}px` },
          width: { md: `calc(100% - ${currentDrawerWidth}px)` },
          transition: 'all 0.2s ease'
        }}
      >
        <Toolbar sx={{ height: '100%', minHeight: '0 !important', gap: 2, px: { xs: 1.5, md: 2.5 } }}>
          <IconButton
            onClick={() => (isDesktop ? setCollapsed((v) => !v) : setMobileOpen((v) => !v))}
            size="large"
            edge="start"
            sx={{
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(100,181,246,0.18)' : 'rgba(94,53,177,0.12)',
              borderRadius: 0,
              color: 'text.primary',
              '&:hover': {
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(100,181,246,0.28)' : 'rgba(94,53,177,0.2)'
              }
            }}
          >
            <MenuIcon />
          </IconButton>
          <Stack direction="row" sx={{ ml: 'auto' }}>
            <IconButton
              sx={{
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(100,181,246,0.18)' : '#EAF4FF',
                color: 'text.primary',
                borderRadius: 0
              }}
              onClick={toggleColorMode}
            >
              {theme.palette.mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Stack>

          {/* To Do later
          <OutlinedInput
            size="small"
            placeholder="Search"
            startAdornment={
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            }
            endAdornment={
              <InputAdornment position="end">
                <TuneIcon sx={{ color: 'primary.main' }} />
              </InputAdornment>
            }
            sx={{ width: { xs: '100%', md: 520 }, bgcolor: '#F6F8FB' }}
          />

          <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton sx={{ bgcolor: '#EFE9FB', borderRadius: 2 }}>
              <GraphicEqIcon sx={{ color: 'primary.main' }} />
            </IconButton>
            <IconButton sx={{ bgcolor: '#EAF4FF', borderRadius: 2 }}>
              <TranslateIcon sx={{ color: 'secondary.main' }} />
            </IconButton>
            <IconButton sx={{ bgcolor: '#FFF8E1', borderRadius: 2 }}>
              <NotificationsNoneIcon sx={{ color: '#F9A825' }} />
            </IconButton>
            <IconButton sx={{ bgcolor: '#EAF4FF', borderRadius: 2 }}>
              <OpenInFullIcon sx={{ color: 'secondary.main' }} />
            </IconButton>
            <Tooltip title={user?.name || 'Profile'}>
              <Avatar sx={{ width: 42, height: 42, bgcolor: '#FFC107', color: '#111936', fontWeight: 700 }}>
                {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
              </Avatar>
            </Tooltip>
            <IconButton sx={{ bgcolor: '#EAF4FF', borderRadius: 2 }} onClick={toggleColorMode}>
              {theme.palette.mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
            <IconButton sx={{ bgcolor: '#EAF4FF', borderRadius: 2 }}>
              <SettingsOutlinedIcon sx={{ color: 'secondary.main' }} />
            </IconButton>
          </Box>
          */}
        </Toolbar>
      </AppBar>

      <Drawer
        variant={isDesktop ? 'permanent' : 'temporary'}
        anchor="left"
        open={isDesktop ? true : mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          width: currentDrawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: currentDrawerWidth,
            boxSizing: 'border-box',
            height: '100vh',
            top: 0,
            borderRight: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            transition: 'width 0.2s ease',
            overflowX: 'hidden'
          }
        }}
      >
        <Sidebar collapsed={isDesktop ? collapsed : false} onNavigate={!isDesktop ? () => setMobileOpen(false) : undefined} />
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 3 },
          mt: `${HEADER_HEIGHT}px`,
          transition: 'all 0.2s ease'
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
