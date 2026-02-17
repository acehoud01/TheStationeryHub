import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1A2E44',
      light: '#2C4A6E',
      dark: '#0F1C2A',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#C8A45C',
      light: '#E0C080',
      dark: '#A07830',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F5F7FA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A2E44',
      secondary: '#5A6A7A',
    },
    success: { main: '#2E7D32' },
    warning: { main: '#ED6C02' },
    error: { main: '#D32F2F' },
  },
  typography: {
    fontFamily: '"DM Sans", "Helvetica Neue", Arial, sans-serif',
    h1: { fontFamily: '"Cormorant Garamond", Georgia, serif', fontWeight: 600 },
    h2: { fontFamily: '"Cormorant Garamond", Georgia, serif', fontWeight: 600 },
    h3: { fontFamily: '"Cormorant Garamond", Georgia, serif', fontWeight: 600 },
    h4: { fontFamily: '"Cormorant Garamond", Georgia, serif', fontWeight: 500 },
    h5: { fontFamily: '"Cormorant Garamond", Georgia, serif', fontWeight: 500 },
    h6: { fontFamily: '"Cormorant Garamond", Georgia, serif', fontWeight: 500 },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 500 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { boxShadow: '0 2px 12px rgba(26,46,68,0.08)' },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: { boxShadow: '0 2px 8px rgba(26,46,68,0.12)' },
      },
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
