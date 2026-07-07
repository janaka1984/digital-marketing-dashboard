import { createTheme, responsiveFontSizes } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';

let theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#5E35B1',
      light: '#7E57C2',
      dark: '#4527A0',
      contrastText: '#FFFFFF'
    },
    secondary: {
      main: '#1E88E5'
    },
    success: {
      main: '#2E7D32'
    },
    warning: {
      main: '#F9A825'
    },
    error: {
      main: '#D32F2F'
    },
    background: {
      default: '#E9EEF3',
      paper: '#FFFFFF'
    },
    text: {
      primary: '#111936',
      secondary: '#6B778C'
    },
    divider: '#DDE3EA'
  },
  shape: { borderRadius: 12 },
  typography: {
    fontSize: 14,
    fontFamily: 'Roboto, sans-serif',
    h4: { fontWeight: 700, fontSize: '1.7rem', letterSpacing: 0.1 },
    h5: { fontWeight: 700, fontSize: '1.45rem', letterSpacing: 0.1 },
    h6: { fontWeight: 600, fontSize: '1.08rem', letterSpacing: 0.1 },
    subtitle1: { fontWeight: 500, fontSize: '1rem' },
    subtitle2: { fontWeight: 500, fontSize: '0.92rem' },
    body1: { fontSize: '0.98rem' },
    body2: { fontSize: '0.9rem', color: '#6B778C' },
    button: { textTransform: 'none', fontWeight: 500 }
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: 'none'
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: 'none',
          border: '1px solid #E5EAF1'
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none'
        }
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundColor: '#FFFFFF'
        }
      }
    }
  }
});

theme = responsiveFontSizes(theme);

export const dashboardTitleSx = (theme: Theme) => ({
  display: 'inline-flex',
  alignItems: 'center',
  fontFamily: 'Roboto, sans-serif',
  fontWeight: 700,
  letterSpacing: 0.1,
  color: 'text.primary',

  '&::before': {
    content: '""',
    width: 4,
    height: 28,
    mr: 1.25,
    borderRadius: 2,
    background: `linear-gradient(
      180deg,
      ${theme.palette.primary.main} 0%,
      ${theme.palette.secondary.main} 100%
    )`
  }
});

export default theme;
