import React from 'react';
import { Alert, AlertTitle, Box, Button } from '@mui/material';

type State = { hasError: boolean; error?: Error };

export default class ErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <Box p={3}>
        <Alert severity="error">
          <AlertTitle>Something went wrong</AlertTitle>
          {this.state.error?.message}
          <Box mt={2}>
            <Button onClick={() => location.reload()} variant="contained">Reload</Button>
          </Box>
        </Alert>
      </Box>
    );
  }
}
