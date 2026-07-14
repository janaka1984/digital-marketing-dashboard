import {
  AppBar,
  Box,
  InputBase,
  Paper,
  Alert,
  Button,
  Drawer,
  IconButton,
  Snackbar,
  Stack,
  Typography,
  Toolbar,
  useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import { useColorMode } from "@theme/useColorMode";
import { useTheme } from "@mui/material/styles";
import CampaignChat from "@components/chat/CampaignChat";
import { useGetSubscriptionQuery } from "@services/billingApi";
import {
  isRestrictedSubscription,
  subscriptionPackageLabel,
} from "@features/billing/billingUtils";

const DRAWER_WIDTH = 280;
const MINI_DRAWER_WIDTH = 88;
const HEADER_HEIGHT = 92;

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [searchDraft, setSearchDraft] = useState("");
  const [chatSeedMessage, setChatSeedMessage] = useState("");
  const [billingNotice, setBillingNotice] = useState("");
  const navigate = useNavigate();
  const { toggleColorMode } = useColorMode();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const { data: subscription } = useGetSubscriptionQuery();
  const showSubscriptionWarning = isRestrictedSubscription(subscription);
  const packageName = subscriptionPackageLabel(subscription);
  const subscriptionWarning =
    subscription?.status === "expired"
      ? "Your free trial has expired. Select a plan and complete payment to continue."
      : "Your trial or subscription is not active. Choose a plan to continue.";

  const currentDrawerWidth = isDesktop
    ? collapsed
      ? MINI_DRAWER_WIDTH
      : DRAWER_WIDTH
    : DRAWER_WIDTH;

  useEffect(() => {
    const handleBillingNotice = (event: Event) => {
      setBillingNotice((event as CustomEvent<string>).detail || "");
    };

    window.addEventListener("billingNotice", handleBillingNotice);
    return () => {
      window.removeEventListener("billingNotice", handleBillingNotice);
    };
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: isDark ? "#0F172A" : "#EEF2F7",
      }}
    >
      <AppBar
        position="fixed"
        sx={{
          zIndex: (muiTheme) => muiTheme.zIndex.drawer + 1,
          height: HEADER_HEIGHT,
          bgcolor: isDark ? "#111936" : "#FFFFFF",
          color: theme.palette.text.primary,
          borderBottom: `1px solid ${theme.palette.divider}`,
          width: "100%",
          boxShadow: "none",
          transition: "all 0.2s ease",
        }}
      >
        <Toolbar
          sx={{
            height: "100%",
            minHeight: "0 !important",
            gap: 2,
            px: { xs: 1.5, md: 2.5 },
          }}
        >
          <Stack
            alignItems="flex-start"
            justifyContent="center"
            spacing={0.35}
            sx={{ minWidth: { md: currentDrawerWidth - 24 } }}
          >
            <Typography
              sx={{
                fontSize: { xs: "1.4rem", md: "2rem" },
                fontWeight: 800,
                color: theme.palette.text.primary,
                letterSpacing: 0.2,
                lineHeight: 1,
                fontFamily: "Roboto, sans-serif",
                display: { xs: "none", sm: "block" },
              }}
            >
              AdFlux{" "}
              <Box
                component="span"
                sx={{
                  background: `linear-gradient(180deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                AI
              </Box>
            </Typography>
            {packageName ? (
              <Typography
                sx={{
                  display: { xs: "none", sm: "block" },
                  color: "text.secondary",
                  fontSize: "0.72rem",
                  fontWeight: 500,
                  lineHeight: 1,
                }}
              >
                {packageName}
              </Typography>
            ) : null}
          </Stack>

          <IconButton
            onClick={() =>
              isDesktop ? setCollapsed((v) => !v) : setMobileOpen((v) => !v)
            }
            size="large"
            sx={{
              bgcolor: isDark ? "rgba(179,157,219,0.16)" : "#EFE7FB",
              borderRadius: 2,
              color: theme.palette.primary.main,
            }}
          >
            <MenuIcon />
          </IconButton>

          <Paper
            elevation={0}
            onClick={() => setChatOpen(true)}
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              gap: 1,
              height: 56,
              flex: 1,
              maxWidth: 540,
              px: 2,
              borderRadius: 3,
              border: `1px solid ${chatOpen ? theme.palette.primary.main : theme.palette.divider}`,
              bgcolor: isDark ? "#1A2742" : "#F8FAFD",
              boxShadow: chatOpen
                ? `0 0 0 3px ${isDark ? "rgba(126,87,194,0.24)" : "rgba(94,53,177,0.12)"}`
                : "none",
              cursor: "text",
              transition: "border-color 0.2s ease, box-shadow 0.2s ease",
            }}
          >
            <SearchIcon
              sx={{
                color: chatOpen
                  ? theme.palette.primary.main
                  : theme.palette.text.secondary,
              }}
            />
            <InputBase
              placeholder="Ask Campaign AI"
              value={searchDraft}
              onChange={(event) => setSearchDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key !== "Enter") return;
                event.preventDefault();
                const trimmed = searchDraft.trim();
                if (!trimmed) {
                  setChatOpen(true);
                  return;
                }
                setChatSeedMessage(trimmed);
                setSearchDraft("");
                setChatOpen(true);
              }}
              sx={{
                flex: 1,
                fontSize: "1.05rem",
                color: theme.palette.text.primary,
              }}
            />
            <IconButton
              onClick={() => setChatOpen(true)}
              sx={{
                bgcolor: isDark ? "rgba(179,157,219,0.2)" : "#EDE6F8",
                borderRadius: 2,
                color: theme.palette.primary.main,
              }}
            >
              <AutoAwesomeIcon />
            </IconButton>
          </Paper>

          <Stack direction="row" sx={{ ml: "auto", gap: 1 }}>
            <IconButton
              sx={{
                bgcolor: isDark ? "rgba(255,193,7,0.2)" : "#FFF4D6",
                borderRadius: 2,
                color: isDark ? "#FFD54F" : "#E6A400",
              }}
            >
              <NotificationsNoneIcon />
            </IconButton>
            <IconButton
              sx={{
                bgcolor: isDark ? "rgba(100,181,246,0.2)" : "#EAF4FF",
                borderRadius: 2,
                color: isDark ? "#90CAF9" : "#2F80ED",
              }}
              onClick={toggleColorMode}
            >
              {theme.palette.mode === "dark" ? (
                <LightModeIcon />
              ) : (
                <DarkModeIcon />
              )}
            </IconButton>
          </Stack>
        </Toolbar>
      </AppBar>

      <CampaignChat
        open={chatOpen}
        initialMessage={chatSeedMessage}
        topOffset={HEADER_HEIGHT}
        onClose={() => setChatOpen(false)}
      />

      <Snackbar
        open={Boolean(billingNotice)}
        autoHideDuration={4500}
        onClose={() => setBillingNotice("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity="info"
          variant="outlined"
          onClose={() => setBillingNotice("")}
          sx={{
            width: "100%",
            maxWidth: 420,
            borderRadius: 2,
            borderColor: "primary.light",
            bgcolor: "background.paper",
            color: "text.primary",
            boxShadow: (muiTheme) =>
              muiTheme.palette.mode === "dark"
                ? "0 14px 36px rgba(0,0,0,0.42)"
                : "0 14px 36px rgba(17,25,54,0.16)",
            "& .MuiAlert-icon": {
              color: "primary.main",
            },
            "& .MuiAlert-message": {
              fontWeight: 600,
              lineHeight: 1.45,
            },
          }}
        >
          {billingNotice}
        </Alert>
      </Snackbar>

      <Drawer
        variant={isDesktop ? "permanent" : "temporary"}
        anchor="left"
        open={isDesktop ? true : mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          width: currentDrawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: currentDrawerWidth,
            boxSizing: "border-box",
            borderRadius: 0,
            height: `calc(100vh - ${HEADER_HEIGHT}px)`,
            top: HEADER_HEIGHT,
            borderRight: `1px solid ${theme.palette.divider}`,
            bgcolor: isDark ? "#111936" : "#FFFFFF",
            transition: "width 0.2s ease",
            overflowX: "hidden",
          },
        }}
      >
        <Sidebar
          collapsed={isDesktop ? collapsed : false}
          onNavigate={!isDesktop ? () => setMobileOpen(false) : undefined}
        />
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          maxWidth: "100%",
          overflowX: "hidden",
          p: { xs: 2, md: 3 },
          mt: `${HEADER_HEIGHT}px`,
          bgcolor: isDark ? "#0F172A" : "#EEF2F7",
          transition: "all 0.2s ease",
        }}
      >
        {showSubscriptionWarning ? (
          <Alert
            icon={<WarningAmberIcon fontSize="inherit" />}
            severity="warning"
            action={
              <Button
                color="inherit"
                size="small"
                onClick={() => navigate("/billing/plans")}
                sx={{ fontWeight: 700, whiteSpace: "nowrap" }}
              >
                Choose a plan
              </Button>
            }
            sx={{
              mb: 3,
              px: { xs: 1.5, md: 2.5 },
              py: 1.25,
              alignItems: "center",
              border: 0,
              borderRadius: 3,
              bgcolor: isDark ? "rgba(245, 158, 11, 0.12)" : "#FFF8EC",
              color: isDark ? "#FCD68A" : "#704000",
              "& .MuiAlert-icon": {
                color: isDark ? "#FBBF24" : "#F5A623",
              },
              "& .MuiAlert-message": {
                py: 0.5,
                fontSize: { xs: "0.9rem", md: "1rem" },
              },
            }}
          >
            {subscriptionWarning}
          </Alert>
        ) : null}
        <Outlet />
      </Box>
    </Box>
  );
}
