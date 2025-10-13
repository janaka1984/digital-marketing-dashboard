import {
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
  MenuItem,
} from "@mui/material";
import { useState, useEffect } from "react";
import axios from "axios";
import { useAppSelector } from "@store/hooks";
import { API_BASE_URL } from "@utils/env";
import {
  useListDataSourcesQuery,
  useAddDataSourceMutation,
  useAddCredentialMutation,
} from "@services/integrationApi";

export default function IntegrationsPage() {
  const { data: dataSources = [], isLoading } = useListDataSourcesQuery();
  const [addDataSource] = useAddDataSourceMutation();
  const [addCredential] = useAddCredentialMutation();

  const user = useAppSelector((s) => s.auth.user);
  const [clients, setClients] = useState<any[]>([]);

  const [form, setForm] = useState({
    client_id: "",
    source_type: "meta",
    external_id: "",
    access_token: "",
    api_version: "",
    business_id: "",
    test_event_code: "",
  });

  // 🔹 Load clients if agency
  useEffect(() => {
    const fetchClients = async () => {
      if (user?.role === "agency") {
        try {
          const authState = JSON.parse(localStorage.getItem("authState") || "{}");
          const token = authState?.accessToken;
          const res = await axios.get(`${API_BASE_URL}/accounts/agency/clients/`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setClients(res.data);
        } catch (err) {
          console.error("Failed to fetch clients:", err);
        }
      }
    };
    fetchClients();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddIntegration = async () => {
    try {
      const ds = await addDataSource({
        client_id: form.client_id || undefined,
        source_type: form.source_type,
        external_id: form.external_id,
      }).unwrap();

      await addCredential({
        data_source_id: ds.id,
        access_token: form.access_token,
        api_version: form.api_version,
        business_id: form.business_id,
        test_event_code: form.test_event_code,
      });

      alert(" Integration added successfully!");
      setForm({
        client_id: "",
        source_type: "meta",
        external_id: "",
        access_token: "",
        api_version: "",
        business_id: "",
        test_event_code: "",
      });
    } catch (err) {
      console.error("Error adding integration:", err);
      alert(" Failed to save integration. Check console for details.");
    }
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h4" fontWeight={600} color="primary">
        Integrations
      </Typography>

      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Stack spacing={2}>
          <Typography variant="h6" fontWeight={600}>
            Add Integration
          </Typography>

          {/* 🔹 Only show this if user is an agency */}
          {user?.role === "agency" && (
            <TextField
              select
              label="Select Client"
              name="client_id"
              value={form.client_id}
              onChange={handleChange}
              fullWidth
            >
              {clients.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.business_name} — {c.user_email}
                </MenuItem>
              ))}
            </TextField>
          )}

          <TextField
            select
            label="Platform"
            name="source_type"
            value={form.source_type}
            onChange={handleChange}
          >
            <MenuItem value="meta">Meta (Facebook/Instagram)</MenuItem>
            <MenuItem value="google_ads">Google Ads</MenuItem>
            <MenuItem value="tiktok_ads">TikTok Ads</MenuItem>
          </TextField>

          <TextField
            label="External ID (Pixel or Account ID)"
            name="external_id"
            value={form.external_id}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Access Token"
            name="access_token"
            value={form.access_token}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="API Version"
            name="api_version"
            value={form.api_version}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Business ID"
            name="business_id"
            value={form.business_id}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Test Event Code"
            name="test_event_code"
            value={form.test_event_code}
            onChange={handleChange}
            fullWidth
          />

          <Button variant="contained" onClick={handleAddIntegration}>
            Save Integration
          </Button>
        </Stack>
      </Paper>

      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" mb={2}>
          Existing Integrations
        </Typography>
        {isLoading ? (
          <Typography>Loading...</Typography>
        ) : (
          dataSources.map((ds) => (
            <Box key={ds.id} sx={{ mb: 2 }}>
              <Typography>
                <b>{ds.source_type.toUpperCase()}</b> – {ds.external_id}
              </Typography>
              {ds.credentials && (
                <Typography variant="body2" color="text.secondary">
                  Token: {ds.credentials.access_token.slice(0, 12)}... | Version:{" "}
                  {ds.credentials.api_version}
                </Typography>
              )}
            </Box>
          ))
        )}
      </Paper>
    </Stack>
  );
}
