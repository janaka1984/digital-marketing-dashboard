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
  useAddUpdateCredentialMutation,
} from "@services/integrationApi";

export default function IntegrationsPage() {
  const { data: dataSources = [], isLoading } = useListDataSourcesQuery();
  const [addDataSource] = useAddDataSourceMutation();
  const [addUpdateCredential] = useAddUpdateCredentialMutation();

  const user = useAppSelector((s) => s.auth.user);
  const [clients, setClients] = useState<any[]>([]);

  const emptyForm = {
    client_id: "",
    source_type: "meta",
    external_id: "",
    access_token: "",
    api_version: "",
    business_id: "",
    test_event_code: "",
    marketing_access_token: "",
    marketing_ad_account_id: "",
  };

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Load clients if agency
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

      await addUpdateCredential({
        data_source_id: ds.id,
        ...form,
      });

      alert("Integration added successfully!");
      setForm(emptyForm);
    } catch (err) {
      console.error("Error adding integration:", err);
      alert("Failed to save integration. Check console for details.");
    }
  };

  const handleUpdateIntegration = async () => {
    try {
      if (!editingId) return;

      await addUpdateCredential({
        data_source_id: editingId,
        ...form,
      }).unwrap();

      alert("Integration updated successfully!");

      // RESET FORM + EXIT EDIT MODE
      setForm(emptyForm);
      setEditingId(null);
    } catch (err) {
      console.error("Error updating integration:", err);
      alert("Failed to update integration.");
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
            {editingId ? "Edit Integration" : "Add Integration"}
          </Typography>

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

          <TextField label="External ID" name="external_id" value={form.external_id} onChange={handleChange} fullWidth />
          <TextField label="Access Token" name="access_token" value={form.access_token} onChange={handleChange} fullWidth />
          <TextField label="Marketing Access Token" name="marketing_access_token" value={form.marketing_access_token} onChange={handleChange} fullWidth />
          <TextField label="Marketing Ad Account ID" name="marketing_ad_account_id" value={form.marketing_ad_account_id} onChange={handleChange} fullWidth />
          <TextField label="API Version" name="api_version" value={form.api_version} onChange={handleChange} fullWidth />
          <TextField label="Business ID" name="business_id" value={form.business_id} onChange={handleChange} fullWidth />
          <TextField label="Test Event Code" name="test_event_code" value={form.test_event_code} onChange={handleChange} fullWidth />

          <Button
            variant="contained"
            onClick={editingId ? handleUpdateIntegration : handleAddIntegration}
          >
            {editingId ? "Update Integration" : "Save Integration"}
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

              <Button
                variant="outlined"
                size="small"
                sx={{ mt: 1 }}
                onClick={() => {
                  setEditingId(ds.id);
                  setForm({
                    client_id: ds.client_id || "",
                    source_type: ds.source_type || "meta",
                    external_id: ds.external_id || "",
                    access_token: ds.credentials?.access_token || "",
                    api_version: ds.credentials?.api_version || "",
                    business_id: ds.credentials?.business_id || "",
                    test_event_code: ds.credentials?.test_event_code || "",
                    marketing_access_token: ds.credentials?.marketing_access_token || "",
                    marketing_ad_account_id: ds.credentials?.marketing_ad_account_id || "",
                  });

                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                Edit
              </Button>
            </Box>
          ))
        )}
      </Paper>
    </Stack>
  );
}
