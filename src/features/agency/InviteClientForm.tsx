import { useState } from "react";
import {
  Box, Paper, Stack, Typography, Button, Dialog, DialogTitle, DialogContent, TextField, DialogActions, IconButton
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useListAgencyClientsQuery, useInviteClientMutation } from "@services/accountsApi";

export default function AgencyClientsPage() {
  const { data: clients = [], isLoading } = useListAgencyClientsQuery();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: "", business_name: "" });
  const [invite, { isLoading: inviting }] = useInviteClientMutation();
  const [inviteToken, setInviteToken] = useState<string | null>(null);

  const onInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await invite(inviteForm).unwrap();
    setInviteToken(res.token);
    setInviteForm({ email: "", business_name: "" });
  };

  const signupLink = inviteToken ? `${window.location.origin}/signup?token=${inviteToken}` : "";

  return (
    <Box p={{ xs: 2, md: 4 }} display="grid" gap={3}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h4" fontWeight={700}>Clients</Typography>
        <Button variant="contained" onClick={() => { setInviteOpen(true); setInviteToken(null); }}>
          Invite Client
        </Button>
      </Stack>

      <Paper sx={{ p: 3 }}>
        {isLoading ? (
          <Typography>Loading...</Typography>
        ) : clients.length === 0 ? (
          <Typography color="text.secondary">No clients yet. Invite your first client.</Typography>
        ) : (
          <Stack spacing={1}>
            {clients.map(c => (
              <Paper key={c.id} sx={{ p: 2 }}>
                <Typography fontWeight={600}>{c.business_name}</Typography>
                <Typography variant="body2" color="text.secondary">{c.user_email}</Typography>
              </Paper>
            ))}
          </Stack>
        )}
      </Paper>

      {/* Invite dialog */}
      <Dialog open={inviteOpen} onClose={() => setInviteOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Invite a Client</DialogTitle>
        <DialogContent>
          {!inviteToken ? (
            <Box component="form" onSubmit={onInvite} sx={{ mt: 1 }}>
              <Stack spacing={2}>
                <TextField
                  label="Client Email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  required
                  fullWidth
                />
                <TextField
                  label="Business Name"
                  value={inviteForm.business_name}
                  onChange={(e) => setInviteForm({ ...inviteForm, business_name: e.target.value })}
                  fullWidth
                />
              </Stack>
            </Box>
          ) : (
            <Stack spacing={1} sx={{ mt: 1 }}>
              <Typography>Share this signup link with your client:</Typography>
              <Paper sx={{ p: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Typography sx={{ wordBreak: "break-all" }}>{signupLink}</Typography>
                <IconButton onClick={() => navigator.clipboard.writeText(signupLink)}>
                  <ContentCopyIcon />
                </IconButton>
              </Paper>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          {!inviteToken ? (
            <>
              <Button onClick={() => setInviteOpen(false)}>Cancel</Button>
              <Button onClick={onInvite} variant="contained" disabled={inviting}>Send Invite</Button>
            </>
          ) : (
            <Button onClick={() => setInviteOpen(false)} variant="contained">Done</Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
