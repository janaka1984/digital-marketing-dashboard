// src/features/auth/LoginPage.tsx
import { Box, Button, Paper, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useAppDispatch } from "@store/hooks";
import { signIn } from "./authSlice";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "@utils/env";

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      // 1 Get JWT tokens from Django SimpleJWT endpoint
      const tokenRes = await axios.post(`${API_BASE_URL}/accounts/auth/token/`, {
        username: email,
        password: pwd,
      });
      const { access, refresh } = tokenRes.data;

      // 2 Fetch user info from backend (to get role)
      const meRes = await axios.get(`${API_BASE_URL}/accounts/auth/me/`, {
        headers: { Authorization: `Bearer ${access}` },
      });

      const user = meRes.data;

      // 3 Store tokens and user data in Redux
      dispatch(
        signIn({
          name: user.username || email,
          email: user.email,
          role: user.role, //  store agency/client role
          accessToken: access,
          refreshToken: refresh,
        })
      );

      // 4 Redirect to dashboard
      if (user?.role === "agency") {
          navigate("/agency/overview");
      } else {
          navigate("/client/overview");
      }
    } catch (err: any) {
      console.error("Login failed", err);
      setError("Invalid email or password. Please try again.");
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
      <Paper sx={{ p: 4, width: 380 }}>
        <Stack spacing={2}>
          <Typography variant="h5">Sign In</Typography>

          <form onSubmit={onSubmit}>
            <Stack spacing={2}>
              <TextField
                label="Email / Username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                required
              />
              <TextField
                label="Password"
                type="password"
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                fullWidth
                required
              />

              {error && <Typography color="error">{error}</Typography>}

              <Button type="submit" variant="contained" fullWidth>
                Continue
              </Button>
            </Stack>
          </form>

          <Typography align="center">
            Don’t have an account?{" "}
            <Link to="/signup" style={{ textDecoration: "none", color: "#1976d2" }}>
              Sign Up
            </Link>
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}
