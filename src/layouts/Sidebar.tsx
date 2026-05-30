import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Box,
  Button,
  Tooltip
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CampaignIcon from '@mui/icons-material/Campaign';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import EventIcon from '@mui/icons-material/Event';
import SettingsIcon from '@mui/icons-material/Settings';
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';
import GroupIcon from '@mui/icons-material/Group';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { signOut } from '@features/auth/authSlice';
import { useTheme } from '@mui/material/styles';

type SidebarProps = {
  collapsed?: boolean;
  onNavigate?: () => void;
};

export default function Sidebar({ collapsed = false, onNavigate }: SidebarProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const role = user?.role || 'client';

  const clientMenu = [
    { text: 'Overview', icon: <DashboardIcon />, path: '/client/overview' },
    { text: 'Campaigns', icon: <CampaignIcon />, path: '/campaigns' },
    { text: 'Traffic & Funnel', icon: <ShowChartIcon />, path: '/traffic-funnel' },
    { text: 'Sources', icon: <TravelExploreIcon />, path: '/sources' },
    { text: 'Events', icon: <EventIcon />, path: '/events' },
    { text: 'Integrations', icon: <IntegrationInstructionsIcon />, path: '/integrations' }
  ];

  const agencyMenu = [
    { text: 'Overview', icon: <DashboardIcon />, path: '/agency/overview' },
    { text: 'Analytics', icon: <ShowChartIcon />, path: '/agency/analytics' },
    { text: 'Clients', icon: <GroupIcon />, path: '/agency/clients' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' }
  ];

  const menuItems = role === 'agency' ? agencyMenu : clientMenu;

  const routeTo = (path: string) => {
    navigate(path);
    onNavigate?.();
  };

  const handleLogout = () => {
    dispatch(signOut());
    navigate('/login');
    onNavigate?.();
  };

  return (
    <Box display="flex" flexDirection="column" height="100%" bgcolor="background.paper">
      <Box flexGrow={1} sx={{ px: collapsed ? 0.75 : 1.25, py: 1.5 }}>
        

        <List sx={{ p: 0 }}>
          {menuItems.map((item) => {
            const active = pathname === item.path;
            const content = (
              <ListItemButton
                key={item.text}
                selected={active}
                onClick={() => routeTo(item.path)}
                sx={{
                  mb: 0.5,
                  borderRadius: 2.5,
                  px: collapsed ? 1 : 1.5,
                  py: 1,
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  '& .MuiListItemText-primary': {
                    fontWeight: active ? 600 : 500,
                    color: active ? 'primary.main' : 'text.primary'
                  },
                  '& .MuiListItemIcon-root': {
                    color: active ? 'primary.main' : 'text.secondary'
                  },
                  '&.Mui-selected': {
                    bgcolor: isDark ? 'rgba(179,157,219,0.2)' : 'rgba(94,53,177,0.12)'
                  },
                  '&.Mui-selected:hover': {
                    bgcolor: isDark ? 'rgba(179,157,219,0.28)' : 'rgba(94,53,177,0.18)'
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: collapsed ? 0 : 38, mr: collapsed ? 0 : 0.5 }}>{item.icon}</ListItemIcon>
                {!collapsed ? <ListItemText primary={item.text} /> : null}
              </ListItemButton>
            );

            return collapsed ? (
              <Tooltip key={item.text} title={item.text} placement="right">
                {content}
              </Tooltip>
            ) : (
              content
            );
          })}
        </List>
      </Box>

      <Divider />

      <Box sx={{ p: collapsed ? 1 : 2 }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={collapsed ? undefined : <LogoutIcon />}
          onClick={handleLogout}
          sx={{ minWidth: 0, px: collapsed ? 0 : 1.5 }}
        >
          {collapsed ? <LogoutIcon fontSize="small" /> : 'Logout'}
        </Button>
      </Box>
    </Box>
  );
}
