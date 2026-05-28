import { createContext, useContext, useMemo, useState } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import baseTheme from './index';

const ColorModeContext = createContext({ toggleColorMode: () => {} });

export const useColorMode = () => useContext(ColorModeContext);

export function ColorModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<'light' | 'dark'>('light');

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => setMode((prev) => (prev === 'light' ? 'dark' : 'light'))
    }),
    []
  );

  const theme = useMemo(
    () =>
      createTheme({
        ...baseTheme,
        palette: {
          ...baseTheme.palette,
          mode,
          ...(mode === 'light'
            ? {
                primary: { main: '#5E35B1', light: '#7E57C2', dark: '#4527A0', contrastText: '#FFFFFF' },
                secondary: { main: '#1E88E5' },
                background: { default: '#E9EEF3', paper: '#FFFFFF' },
                text: { primary: '#111936', secondary: '#6B778C' },
                divider: '#DDE3EA'
              }
            : {
                primary: { main: '#B39DDB', light: '#D1C4E9', dark: '#9575CD', contrastText: '#1E1E1E' },
                secondary: { main: '#64B5F6' },
                background: { default: '#101726', paper: '#182235' },
                text: { primary: '#E8EDF7', secondary: '#A5B4CB' },
                divider: '#27344A'
              })
        },
        components: {
          ...baseTheme.components,
          MuiPaper: {
            styleOverrides: {
              root: {
                borderRadius: 12,
                boxShadow: 'none',
                backgroundImage: 'none',
                ...(mode === 'dark' ? { backgroundColor: '#182235', color: '#E8EDF7' } : {})
              }
            }
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 12,
                boxShadow: 'none',
                border: mode === 'dark' ? '1px solid #27344A' : '1px solid #E5EAF1'
              }
            }
          },
          MuiOutlinedInput: {
            styleOverrides: {
              root: {
                borderRadius: 10,
                backgroundColor: mode === 'dark' ? '#111B2C' : '#FFFFFF',
                color: mode === 'dark' ? '#E8EDF7' : '#111936',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: mode === 'dark' ? '#31435E' : '#C9D4E5'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: mode === 'dark' ? '#4A6287' : '#99AAC5'
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: mode === 'dark' ? '#64B5F6' : '#5E35B1'
                }
              },
              input: {
                color: mode === 'dark' ? '#E8EDF7' : '#111936'
              }
            }
          },
          MuiInputLabel: {
            styleOverrides: {
              root: {
                color: mode === 'dark' ? '#A5B4CB' : '#6B778C',
                '&.Mui-focused': {
                  color: mode === 'dark' ? '#64B5F6' : '#5E35B1'
                }
              }
            }
          },
          MuiSelect: {
            styleOverrides: {
              icon: {
                color: mode === 'dark' ? '#A5B4CB' : '#6B778C'
              },
              select: {
                color: mode === 'dark' ? '#E8EDF7' : '#111936'
              }
            }
          },
          MuiMenu: {
            styleOverrides: {
              paper: {
                backgroundColor: mode === 'dark' ? '#182235' : '#FFFFFF',
                color: mode === 'dark' ? '#E8EDF7' : '#111936',
                border: mode === 'dark' ? '1px solid #27344A' : '1px solid #E5EAF1'
              }
            }
          },
          MuiMenuItem: {
            styleOverrides: {
              root: {
                '&.Mui-selected': {
                  backgroundColor: mode === 'dark' ? 'rgba(100,181,246,0.2)' : 'rgba(94,53,177,0.12)'
                },
                '&.Mui-selected:hover': {
                  backgroundColor: mode === 'dark' ? 'rgba(100,181,246,0.28)' : 'rgba(94,53,177,0.18)'
                }
              }
            }
          },
          MuiPopover: {
            styleOverrides: {
              paper: {
                backgroundImage: 'none'
              }
            }
          },
          MuiTextField: {
            defaultProps: {
              variant: 'outlined'
            }
          }
        }
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
