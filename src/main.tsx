import React from 'react';
import ReactDOM from 'react-dom/client';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import theme from '@theme/index';
import App from './App';
import { store } from '@store/index';
import { ColorModeProvider } from '@theme/useColorMode';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <ColorModeProvider>
          <CssBaseline />
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ColorModeProvider>
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
);
