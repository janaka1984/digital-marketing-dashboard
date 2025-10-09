// src/theme/index.ts
import { createTheme, responsiveFontSizes } from '@mui/material/styles';
import { pink } from '@mui/material/colors'; // MUI's magenta-like palette

let theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: pink[500],       // 💜 Magenta base color
      light: pink[300],
      dark: pink[700],
      contrastText: '#fff',
    },
    secondary: {
      main: '#6A1B9A',       // Deep purple accent
    },
    background: {
      default: '#F9FAFB',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#212B36',
      secondary: '#6A1B9A',  // Slight magenta tint for secondary text
    },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: 'Inter, system-ui, Roboto, Arial',
    h4: { fontWeight: 700, color: pink[700] },
    h5: { fontWeight: 600, color: pink[700] },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
        containedPrimary: {
          backgroundColor: pink[500],
          color: '#fff',
          '&:hover': { backgroundColor: pink[700] },
        },
        outlinedPrimary: {
          borderColor: pink[500],
          color: pink[700],
          '&:hover': {
            borderColor: pink[700],
            backgroundColor: pink[50],
          },
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: pink[600],
          '&:hover': { textDecoration: 'underline' },
        },
      },
    },
  },
});

theme = responsiveFontSizes(theme);

export default theme;
