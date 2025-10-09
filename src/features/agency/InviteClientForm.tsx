import { useState } from "react";
import { Box, Button, Paper, Stack, TextField, Typography } from "@mui/material";
import axios from "axios";

export default function InviteClientForm() {
  const [form, setForm] = useState({
    email: "",
    businessName: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("/api/accounts/agency/invite/", form, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      alert("Invite sent!");
      setForm({ email: "", businessName: "" });
    } catch (err) {
      console.error("Invite failed", err);
    }
  };

  return (
    <Box p={2}>
      <Paper sx={{ p: 4, maxWidth: 420 }}>
        <form onSubmit={onSubmit}>
          <Stack spacing={2}>
            <Typography variant="h6">Invite New Client</Typography>
            <TextField label="Client Email" name="email" value={form.email} onChange={handleChange} fullWidth />
            <TextField label="Business Name" name="businessName" value={form.businessName} onChange={handleChange} fullWidth />
            <Button type="submit" variant="contained" fullWidth>
              Send Invite
            </Button>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}
