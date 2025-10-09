import { createContext, useContext, useMemo, useState } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { pink } from '@mui/material/colors';
import baseTheme from './index';

// Create color mode context
const ColorModeContext = createContext({ toggleColorMode: () => {} });

export const useColorMode = () => useContext(ColorModeContext);

export function ColorModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<'light' | 'dark'>('light');

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
      },
    }),
    []
  );

  const theme = useMemo(
    () =>
      createTheme({
        ...baseTheme,
        palette: {
          mode,
          ...(mode === 'light'
            ? {
                primary: {
                  main: pink[500],   // Magenta base color
                  light: pink[300],
                  dark: pink[700],
                  contrastText: '#fff',
                },
                secondary: { main: '#6A1B9A' },
                background: {
                  default: '#F9FAFB',
                  paper: '#FFFFFF',
                },
                text: {
                  primary: '#212B36',
                  secondary: '#6A1B9A',
                },
              }
            : {
                primary: {
                  main: pink[300],   // Softer magenta in dark mode
                  light: pink[200],
                  dark: pink[400],
                  contrastText: '#000',
                },
                secondary: { main: '#CE93D8' },
                background: {
                  default: '#121212',
                  paper: '#1E1E1E',
                },
                text: {
                  primary: '#E0E0E0',
                  secondary: '#F48FB1',
                },
              }),
        },
      }),
    [mode]
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
