import { createTheme, responsiveFontSizes } from '@mui/material/styles';

const BORDER_COLOR = '#3f51b5'; // indigo 500 — fixed color
// const BG_COLOR = '#ffffff';     // you can change to '#f3e5f5' for magenta tint

let theme = createTheme({
  palette: {
    mode: 'light', // 👈 even if you toggle dark mode, overrides will win
    primary: { main: '#3f51b5' },
    secondary: { main: '#e91e63' },
    background: {
      default: '#f8f9fa',
      paper: '#fff',
    },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          border: `1px solid ${BORDER_COLOR}`,
          // backgroundColor: BG_COLOR,     // 👈 force background
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: `1px solid ${BORDER_COLOR}`,
          // backgroundColor: BG_COLOR,     // 👈 force background
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          borderBottom: `2px solid ${BORDER_COLOR}`,
          // backgroundColor: BG_COLOR,     // 👈 force background
          color: BORDER_COLOR,           // 👈 make text/icons visible
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: `2px solid ${BORDER_COLOR}`,
          // backgroundColor: BG_COLOR,     // 👈 force background
        },
      },
    },
  },
  typography: {
    fontFamily: 'Inter, system-ui, Roboto, Arial',
  },
});

theme = responsiveFontSizes(theme);

export default theme;
