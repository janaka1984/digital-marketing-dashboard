import { Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { useAppDispatch } from '@store/hooks';
import { signIn } from './authSlice';

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(signIn({ name: email || 'User' }));
  };

  return (
    <Box display="grid" minHeight="100dvh" alignItems="center" justifyContent="center" p={2}>
      <Paper sx={{ p: 4, width: 380 }}>
        <Stack spacing={2}>
          <Typography variant="h5">Sign in</Typography>
          <form onSubmit={onSubmit}>
            <Stack spacing={2}>
              <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth />
              <TextField label="Password" type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} fullWidth />
              <Button type="submit">Continue</Button>
            </Stack>
          </form>
        </Stack>
      </Paper>
    </Box>
  );
}
