import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
  MenuItem
} from '@mui/material';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '@utils/env';

export default function SignUpPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get('token');

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'client',
    business_name: '',
    agency_name: '',
    company_website: '',
    token: token || ''
  });

  const [inviteInfo, setInviteInfo] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (token) {
      axios
        .get(`${API_BASE_URL}/accounts/agency/accept-invite/?token=${token}`)
        .then((res) => {
          setInviteInfo(res.data);
          setForm((f) => ({
            ...f,
            email: res.data.email || '',
            business_name: res.data.business_name || '',
            role: 'client'
          }));
        })
        .catch(() => setError('Invalid or expired invite link.'));
    }
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const payload = { ...form, username: form.email };
      await axios.post(`${API_BASE_URL}/accounts/auth/register/`, payload);
      navigate('/login');
    } catch (err: any) {
      console.error('Signup failed', err);

      if (err.response?.data) {
        const data = err.response.data;
        if (typeof data === 'string') setError(data);
        else if (typeof data === 'object') {
          const message = Object.entries(data)
            .map(([f, msgs]) => `${f}: ${(msgs as string[]).join(', ')}`)
            .join('\n');
          setError(message);
        } else setError('Registration failed. Please check your details.');
      } else setError('Network error. Please try again later.');
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
      <Paper sx={{ width: '100%', maxWidth: 460, p: { xs: 3, sm: 4 } }}>
        <form onSubmit={onSubmit}>
          <Stack spacing={2}>
            <Stack spacing={0.5}>
              <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '1.8rem' } }}>
                {token ? 'Accept Invite & Create Account' : 'Create Account'}
              </Typography>
              {inviteInfo ? (
                <Typography variant="body2" color="text.secondary">
                  You have been invited by <b>{inviteInfo.agency}</b>
                </Typography>
              ) : null}
            </Stack>

            {!token ? (
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
            ) : null}

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

            {!token && form.role === 'agency' ? (
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
            ) : null}

            {error ? (
              <Typography color="error" sx={{ whiteSpace: 'pre-line' }}>
                {error}
              </Typography>
            ) : null}

            <Button type="submit" variant="contained" fullWidth size="large">
              {token ? 'Join Agency' : 'Sign Up'}
            </Button>

            {!token ? (
              <Typography align="center" variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Link to="/login" style={{ textDecoration: 'none' }}>
                  Log in
                </Link>
              </Typography>
            ) : null}
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}
