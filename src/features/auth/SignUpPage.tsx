import { useState } from "react";
import {
  Box,
  Button,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "@utils/env";

export default function SignUpPage() {
  const navigate = useNavigate();

  // ✅ State keys now match backend field names exactly
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "client",
    agency_name: "",
    company_website: "",
    business_name: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      // ✅ Auto-set username = email (if using email login)
      const payload = { ...form, username: form.email };

      await axios.post(`${API_BASE_URL}/accounts/auth/register/`, payload);
      navigate("/login");
    } catch (err: any) {
      console.error("Signup failed", err);
      setError("Registration failed. Please check your details and try again.");
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
            <Typography variant="h5">Create Account</Typography>

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

            <TextField
              label="Business Name"
              name="business_name"
              value={form.business_name}
              onChange={handleChange}
              fullWidth
              required
            />

            <TextField
              label="Email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              fullWidth
              required
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

            {form.role === "agency" && (
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
              Sign Up
            </Button>

            <Typography align="center">
              Already have an account?{" "}
              <Link
                to="/login"
                style={{ textDecoration: "none", color: "#1976d2" }}
              >
                Log in
              </Link>
            </Typography>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}
