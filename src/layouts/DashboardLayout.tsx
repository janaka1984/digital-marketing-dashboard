import {
  AppBar,
  Box,
  InputBase,
  Paper,
  Drawer,
  IconButton,
  Stack,
  Typography,
  Toolbar,
  useMediaQuery
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import TuneIcon from '@mui/icons-material/Tune';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from './Sidebar';
import { useColorMode } from '@theme/useColorMode';
import { useTheme } from '@mui/material/styles';

const DRAWER_WIDTH = 280;
const MINI_DRAWER_WIDTH = 88;
const HEADER_HEIGHT = 92;

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { toggleColorMode } = useColorMode();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const currentDrawerWidth = isDesktop ? (collapsed ? MINI_DRAWER_WIDTH : DRAWER_WIDTH) : DRAWER_WIDTH;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: isDark ? '#0F172A' : '#EEF2F7' }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (muiTheme) => muiTheme.zIndex.drawer + 1,
          height: HEADER_HEIGHT,
          bgcolor: isDark ? '#111936' : '#FFFFFF',
          color: theme.palette.text.primary,
          borderBottom: `1px solid ${theme.palette.divider}`,
          width: '100%',
          boxShadow: 'none',
          transition: 'all 0.2s ease'
        }}
      >
        <Toolbar sx={{ height: '100%', minHeight: '0 !important', gap: 2, px: { xs: 1.5, md: 2.5 } }}>
          <Stack direction="row" alignItems="center" spacing={1.2} sx={{ minWidth: { md: currentDrawerWidth - 24 } }}>
            
            <Typography
              sx={{
                fontSize: { xs: '1.4rem', md: '2rem' },
                fontWeight: 800,
                color: theme.palette.text.primary,
                letterSpacing: 0.2,
                lineHeight: 1,
                fontFamily: '"Montserrat", "Poppins", "Segoe UI", sans-serif',
                display: { xs: 'none', sm: 'block' }
              }}
            >
              AdFlux <Box component="span" sx={{ color: '#5B6EF5' }}>AI</Box>
            </Typography>
          </Stack>

          <IconButton
            onClick={() => (isDesktop ? setCollapsed((v) => !v) : setMobileOpen((v) => !v))}
            size="large"
            sx={{
              bgcolor: isDark ? 'rgba(179,157,219,0.16)' : '#EFE7FB',
              borderRadius: 2,
              color: theme.palette.primary.main
            }}
          >
            <MenuIcon />
          </IconButton>

          <Paper
            elevation={0}
            sx={{
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              gap: 1,
              height: 56,
              flex: 1,
              maxWidth: 540,
              px: 2,
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              bgcolor: isDark ? '#1A2742' : '#F8FAFD'
            }}
          >
            <SearchIcon sx={{ color: theme.palette.text.secondary }} />
            <InputBase
              placeholder="Search"
              sx={{ flex: 1, fontSize: '1.05rem', color: theme.palette.text.primary }}
            />
            <IconButton
              sx={{
                bgcolor: isDark ? 'rgba(179,157,219,0.2)' : '#EDE6F8',
                borderRadius: 2,
                color: theme.palette.primary.main
              }}>
              <TuneIcon />
            </IconButton>
          </Paper>

          <Stack direction="row" sx={{ ml: 'auto', gap: 1 }}>
            <IconButton
              sx={{
                bgcolor: isDark ? 'rgba(255,193,7,0.2)' : '#FFF4D6',
                borderRadius: 2,
                color: isDark ? '#FFD54F' : '#E6A400'
              }}
            >
              <NotificationsNoneIcon />
            </IconButton>
            <IconButton
              sx={{
                bgcolor: isDark ? 'rgba(100,181,246,0.2)' : '#EAF4FF',
                borderRadius: 2,
                color: isDark ? '#90CAF9' : '#2F80ED'
              }}
              onClick={toggleColorMode}
            >
              {theme.palette.mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Stack>
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
            borderRadius: 0,
            height: `calc(100vh - ${HEADER_HEIGHT}px)`,
            top: HEADER_HEIGHT,
            borderRight: `1px solid ${theme.palette.divider}`,
            bgcolor: isDark ? '#111936' : '#FFFFFF',
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
          bgcolor: isDark ? '#0F172A' : '#EEF2F7',
          transition: 'all 0.2s ease'
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
