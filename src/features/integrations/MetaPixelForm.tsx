import { useState } from "react";
import { Box, Button, Paper, Stack, TextField, Typography } from "@mui/material";
import axios from "axios";

export default function MetaPixelForm() {
  const [form, setForm] = useState({
    pixelId: "",
    scriptUrl: "https://s3.amazonaws.com/your-bucket/pixel-bootstrap.js",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("/api/integrations/meta-pixel/", form, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      alert("Meta Pixel saved!");
    } catch (err) {
      console.error("Meta Pixel save failed", err);
    }
  };

  return (
    <Box p={2}>
      <Paper sx={{ p: 4, maxWidth: 420 }}>
        <form onSubmit={onSubmit}>
          <Stack spacing={2}>
            <Typography variant="h6">Meta Pixel Integration</Typography>
            <TextField label="Pixel ID" name="pixelId" value={form.pixelId} onChange={handleChange} fullWidth />
            <TextField label="Script URL" name="scriptUrl" value={form.scriptUrl} onChange={handleChange} fullWidth />
            <Button type="submit" variant="contained" fullWidth>
              Save Integration
            </Button>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}
