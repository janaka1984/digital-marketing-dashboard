import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Drawer,
  IconButton,
  InputBase,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useGetDashboardCampaignsQuery } from "@services/dashboardApi";
import { useSendCampaignChatMessageMutation } from "@services/chatApi";
import type { CampaignChatMessage } from "../../types/chat";

type CampaignChatProps = {
  open: boolean;
  initialMessage?: string;
  topOffset?: number;
  onClose: () => void;
};

const rangeOptions = [
  ["last7", "Last 7 days"],
  ["last30", "Last 30 days"],
  ["last90", "Last 90 days"],
  ["thisyear", "This year"],
];

const suggestions = ["Summarize campaign performance", "Which campaign spent the most?", "Show budget recommendations"];

const nowIso = () => new Date().toISOString();

const messageId = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const welcomeMessage: CampaignChatMessage = {
  id: "welcome",
  role: "assistant",
  content: "Ask about campaign spend, clicks, purchases, ROAS, or AI budget recommendations.",
  createdAt: nowIso(),
};

const apiErrorMessage = (error: unknown) => {
  const fallback = "Campaign AI Chat API request failed. Check the Network tab and backend logs, then try again.";
  if (!error || typeof error !== "object") return fallback;

  const maybeError = error as {
    status?: number | string;
    data?: unknown;
    error?: string;
  };

  if (typeof maybeError.data === "string") return maybeError.data;
  if (maybeError.data && typeof maybeError.data === "object") {
    const data = maybeError.data as { detail?: unknown; error?: unknown; message?: unknown };
    const detail = data.detail || data.error || data.message;
    if (typeof detail === "string") return detail;
  }

  if (maybeError.error) return maybeError.error;
  return maybeError.status ? `${fallback} Status: ${maybeError.status}.` : fallback;
};

export default function CampaignChat({ open, initialMessage = "", topOffset = 0, onClose }: CampaignChatProps) {
  const theme = useTheme();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [range, setRange] = useState("last90");
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<CampaignChatMessage[]>([welcomeMessage]);
  const [handledInitialMessage, setHandledInitialMessage] = useState("");
  const [sendCampaignChatMessage, { isLoading: isSendingToBackend }] = useSendCampaignChatMessageMutation();
  const threadRef = useRef<HTMLDivElement | null>(null);

  const { isFetching } = useGetDashboardCampaignsQuery(
    {
      level: "campaign",
      range,
      status: "all",
    },
    { skip: !open }
  );

  useEffect(() => {
    if (!open) return;
    requestAnimationFrame(() => {
      threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: "smooth" });
    });
  }, [messages, open]);

  const appendMessage = (role: CampaignChatMessage["role"], content: string) => {
    setMessages((current) => [
      ...current,
      {
        id: messageId(),
        role,
        content,
        createdAt: nowIso(),
      },
    ]);
  };

  const submitMessage = async (content: string) => {
    const trimmed = content.trim();
    if (!trimmed) return;

    appendMessage("user", trimmed);
    setDraft("");

    const searchParams = new URLSearchParams(location.search);
    const clientId = searchParams.get("client_id") || searchParams.get("client") || undefined;
    const platform = searchParams.get("platform") || undefined;

    try {
      const response = await sendCampaignChatMessage({
        message: trimmed,
        context: {
          range,
          level: "campaign",
          ...(clientId ? { client_id: clientId } : {}),
          ...(platform && platform !== "all" ? { platform } : {}),
        },
      }).unwrap();
      appendMessage("assistant", response.answer || "Campaign AI Chat API returned an empty answer.");
    } catch (error) {
      console.error("Campaign AI Chat API request failed", error);
      appendMessage("assistant", apiErrorMessage(error));
    }
  };

  useEffect(() => {
    const trimmed = initialMessage.trim();
    if (!open || !trimmed || handledInitialMessage === trimmed) return;
    setHandledInitialMessage(trimmed);
    submitMessage(trimmed);
  }, [handledInitialMessage, initialMessage, open]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    submitMessage(draft);
  };

  const isBusy = isFetching || isSendingToBackend;

  const handleDraftKeyDown = (event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.shiftKey) return;
    event.preventDefault();
    if (!draft.trim() || isBusy) return;
    submitMessage(draft);
  };

  return (
    <Drawer
      anchor={isMobile ? "bottom" : "right"}
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true, disableScrollLock: true }}
      sx={{
        "& .MuiBackdrop-root": {
          top: { xs: 0, sm: topOffset },
        },
      }}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 480 },
          top: { xs: "auto", sm: topOffset },
          height: { xs: "92vh", sm: `calc(100% - ${topOffset}px)` },
          borderRadius: { xs: "12px 12px 0 0", sm: 0 },
          bgcolor: "background.paper",
        },
      }}
    >
      <Stack sx={{ height: "100%", minHeight: 0 }}>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
          <Box
            sx={{
              display: "grid",
              placeItems: "center",
              width: 38,
              height: 38,
              borderRadius: 2,
              bgcolor: "primary.main",
              color: "primary.contrastText",
            }}
          >
            <AutoAwesomeIcon fontSize="small" />
          </Box>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="subtitle1" fontWeight={700}>
              Campaign AI Chat
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Opened from Ask Campaign AI search
            </Typography>
          </Box>
          <IconButton onClick={onClose} aria-label="Close campaign chat">
            <CloseIcon />
          </IconButton>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 2, py: 1.5, borderBottom: "1px solid", borderColor: "divider" }}>
          <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
            Context
          </Typography>
          <Select size="small" value={range} onChange={(event) => setRange(event.target.value)} sx={{ minWidth: 150 }}>
            {rangeOptions.map(([value, label]) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </Select>
          {isFetching ? <CircularProgress size={18} /> : null}
        </Stack>

        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ px: 2, py: 1.5 }}>
          {suggestions.map((suggestion) => (
            <Chip
              key={suggestion}
              label={suggestion}
              size="small"
              variant="outlined"
              onClick={() => submitMessage(suggestion)}
              sx={{ borderRadius: 1.5 }}
            />
          ))}
        </Stack>

        <Stack ref={threadRef} spacing={1.25} sx={{ flex: 1, minHeight: 0, overflowY: "auto", px: 2, pb: 2 }}>
          {messages.map((message) => {
            const isUser = message.role === "user";
            return (
              <Box key={message.id} sx={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start" }}>
                <Paper
                  elevation={0}
                  sx={{
                    maxWidth: "86%",
                    px: 1.5,
                    py: 1,
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: isUser ? "primary.main" : "divider",
                    bgcolor: isUser ? "primary.main" : "action.hover",
                    color: isUser ? "#fff" : "text.primary",
                    whiteSpace: "pre-line",
                  }}
                >
                  <Typography variant="body2" color="inherit">
                    {message.content}
                  </Typography>
                </Paper>
              </Box>
            );
          })}
        </Stack>

        <Box component="form" onSubmit={handleSubmit} sx={{ p: 2, borderTop: "1px solid", borderColor: "divider" }}>
          <Paper
            elevation={0}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 1.5,
              py: 0.75,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              bgcolor: "background.default",
            }}
          >
            <InputBase
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleDraftKeyDown}
              placeholder="Ask about campaign performance"
              multiline
              maxRows={4}
              sx={{ flex: 1, fontSize: 14 }}
            />
            <Button type="submit" variant="contained" size="small" disabled={!draft.trim() || isBusy} endIcon={<SendIcon />}>
              Send
            </Button>
          </Paper>
        </Box>
      </Stack>
    </Drawer>
  );
}
