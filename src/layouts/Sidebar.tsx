// src/layouts/dashboard/Sidebar.tsx
import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Box,
  Button,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import CampaignIcon from "@mui/icons-material/Campaign";
import EventIcon from "@mui/icons-material/Event";
import SettingsIcon from "@mui/icons-material/Settings";
import IntegrationInstructionsIcon from "@mui/icons-material/IntegrationInstructions";
import GroupIcon from "@mui/icons-material/Group";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import { signOut } from "@features/auth/authSlice";

export default function Sidebar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);

  const role = user?.role || "client";

  // Base menu
  const baseMenu = [
    { text: "Overview", icon: <DashboardIcon />, path: "/" },
    { text: "Campaigns", icon: <CampaignIcon />, path: "/campaigns" },
    { text: "Events", icon: <EventIcon />, path: "/events" },
    { text: "Integrations", icon: <IntegrationInstructionsIcon />, path: "/integrations" },
  ];

  // Extra menu for agency users
  const agencyMenu = [
    { text: "Clients", icon: <GroupIcon />, path: "/agency/clients" },
    { text: "Settings", icon: <SettingsIcon />, path: "/settings" },
  ];

  const menuItems = role === "agency" ? [...baseMenu, ...agencyMenu] : baseMenu;

  const handleLogout = () => {
    dispatch(signOut());
    navigate("/login");
  };

  return (
    <Box display="flex" flexDirection="column" height="100%">
      {/* Top Section */}
      <Box flexGrow={1}>
        <Typography variant="h6" sx={{ px: 2, py: 1, mt: 1 }}>
          Dashboard
        </Typography>
        <Divider />
        <List sx={{ mt: 1 }}>
          {menuItems.map((item) => (
            <ListItemButton
              key={item.text}
              selected={pathname === item.path}
              onClick={() => navigate(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          ))}
        </List>
      </Box>

      {/* Bottom Section (Logout) */}
      <Divider />
      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          color="primary"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );
}
