import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
  MenuItem,
} from "@mui/material";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "@utils/env";

export default function SignUpPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get("token");

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "client", // default
    business_name: "",
    agency_name: "",
    company_website: "",
    token: token || "",
  });

  const [inviteInfo, setInviteInfo] = useState<any>(null);
  const [error, setError] = useState("");

  // Fetch invite details if token is in URL
  useEffect(() => {
    if (token) {
      axios
        .get(`${API_BASE_URL}/accounts/agency/accept-invite/?token=${token}`)
        .then((res) => {
          setInviteInfo(res.data);
          setForm((f) => ({
            ...f,
            email: res.data.email || "",
            business_name: res.data.business_name || "",
            role: "client", // invited users are always clients
          }));
        })
        .catch(() => setError("Invalid or expired invite link."));
    }
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const payload = { ...form, username: form.email };
      await axios.post(`${API_BASE_URL}/accounts/auth/register/`, payload);
      navigate("/login");
    } catch (err: any) {
      console.error("Signup failed", err);

      if (err.response?.data) {
        const data = err.response.data;
        if (typeof data === "string") setError(data);
        else if (typeof data === "object") {
          const message = Object.entries(data)
            .map(([f, msgs]) => `${f}: ${(msgs as string[]).join(", ")}`)
            .join("\n");
          setError(message);
        } else setError("Registration failed. Please check your details.");
      } else setError("Network error. Please try again later.");
    }
  };

  return (
    <Box
      display="grid"
      minHeight="100dvh"
      alignItems="center"
      justifyContent="center"
      p={2}
    >
      <Paper sx={{ p: 4, width: 420 }}>
        <form onSubmit={onSubmit}>
          <Stack spacing={2}>
            <Typography variant="h5">
              {token ? "Accept Invite & Create Account" : "Create Account"}
            </Typography>

            {inviteInfo && (
              <Typography variant="body2" color="text.secondary">
                You’ve been invited by <b>{inviteInfo.agency}</b>
              </Typography>
            )}

            {/* Show dropdown only if not an invited signup */}
            {!token && (
              <TextField
                select
                label="Account Type"
                name="role"
                value={form.role}
                onChange={handleChange}
                fullWidth
              >
                <MenuItem value="agency">Agency</MenuItem>
                <MenuItem value="client">Individual Client</MenuItem>
              </TextField>
            )}

            <TextField
              label="Business Name"
              name="business_name"
              value={form.business_name}
              onChange={handleChange}
              fullWidth
              required
              disabled={!!token}
            />

            <TextField
              label="Email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              fullWidth
              required
              disabled={!!token}
            />

            <TextField
              label="Password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              fullWidth
              required
            />

            {/* Extra fields for Agency signup */}
            {!token && form.role === "agency" && (
              <>
                <TextField
                  label="Agency Name"
                  name="agency_name"
                  value={form.agency_name}
                  onChange={handleChange}
                  fullWidth
                />
                <TextField
                  label="Company Website"
                  name="company_website"
                  value={form.company_website}
                  onChange={handleChange}
                  fullWidth
                />
              </>
            )}

            {error && <Typography color="error">{error}</Typography>}

            <Button type="submit" variant="contained" fullWidth>
              {token ? "Join Agency" : "Sign Up"}
            </Button>

            {!token && (
              <Typography align="center">
                Already have an account?{" "}
                <Link
                  to="/login"
                  style={{ textDecoration: "none", color: "#1976d2" }}
                >
                  Log in
                </Link>
              </Typography>
            )}
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}
