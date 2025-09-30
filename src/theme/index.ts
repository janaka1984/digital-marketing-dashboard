// src/theme/index.ts
import { createTheme, responsiveFontSizes } from '@mui/material/styles';

let theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#2065D1' }, // blue
    secondary: { main: '#3366FF' },
    background: {
      default: '#F9FAFB', // light gray background
      paper: '#FFFFFF',   // card/paper
    },
    text: {
      primary: '#212B36',
      secondary: '#637381',
    },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: 'Inter, system-ui, Roboto, Arial',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    subtitle2: { fontWeight: 500, color: '#637381' },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 8px rgba(145, 158, 171, 0.12)',
          border: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 8px rgba(145, 158, 171, 0.12)',
          border: 'none',
        },
      },
    },
  },
});

theme = responsiveFontSizes(theme);

export default theme;
