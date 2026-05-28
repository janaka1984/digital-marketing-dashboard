import { Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { useAppDispatch } from '@store/hooks';
import { signIn } from './authSlice';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '@utils/env';

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [error, setError] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const tokenRes = await axios.post(`${API_BASE_URL}/accounts/auth/token/`, {
        username: email,
        password: pwd
      });
      const { access, refresh } = tokenRes.data;

      const meRes = await axios.get(`${API_BASE_URL}/accounts/auth/me/`, {
        headers: { Authorization: `Bearer ${access}` }
      });

      const user = meRes.data;

      dispatch(
        signIn({
          name: user.username || email,
          email: user.email,
          role: user.role,
          accessToken: access,
          refreshToken: refresh
        })
      );

      if (user?.role === 'agency') {
        navigate('/agency/overview');
      } else {
        navigate('/client/overview');
      }
    } catch (err: any) {
      console.error('Login failed', err);
      setError('Invalid email or password. Please try again.');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        display: 'grid',
        placeItems: 'center',
        p: 2,
        background: 'linear-gradient(145deg, #eef2f6 0%, #e2e9f4 100%)'
      }}
    >
      <Paper sx={{ width: '100%', maxWidth: 420, p: { xs: 3, sm: 4 } }}>
        <Stack spacing={2.5}>
          <Stack spacing={0.5}>
            <Typography variant="h4" sx={{ fontSize: { xs: '1.6rem', sm: '1.9rem' } }}>
              Sign In
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Enter your credentials to continue.
            </Typography>
          </Stack>

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

              {error ? <Typography color="error">{error}</Typography> : null}

              <Button type="submit" variant="contained" fullWidth size="large">
                Continue
              </Button>
            </Stack>
          </form>

          <Typography align="center" variant="body2" color="text.secondary">
            Don&apos;t have an account?{' '}
            <Link to="/signup" style={{ textDecoration: 'none' }}>
              Sign Up
            </Link>
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}
