import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import App from './App';

// Google Fonts
const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap';
document.head.appendChild(link);

const C = {
  forest:      '#1B3A2D',
  forestMid:   '#2D5C47',
  forestLight: '#3D7A60',
  gold:        '#C8A45C',
  goldLight:   '#E2C07A',
  cream:       '#FAF7F2',
  stone:       '#8C8070',
  ink:         '#1C1814',
  border:      '#E5DED4',
};

const theme = createTheme({
  palette: {
    primary:    { main: C.forest, light: C.forestLight, dark: '#112618', contrastText: '#fff' },
    secondary:  { main: C.gold,   light: C.goldLight,   dark: '#9E7A38', contrastText: C.forest },
    background: { default: C.cream, paper: '#FFFFFF' },
    text:       { primary: C.ink, secondary: C.stone },
    error:      { main: '#B91C1C' },
    success:    { main: '#2E7D52' },
    warning:    { main: '#B45309' },
    info:       { main: '#1E5F8A' },
  },
  typography: {
    fontFamily: '"DM Sans", system-ui, sans-serif',
    h1: { fontFamily: '"Cormorant Garamond", Georgia, serif', fontWeight: 600, letterSpacing: '-0.02em' },
    h2: { fontFamily: '"Cormorant Garamond", Georgia, serif', fontWeight: 600, letterSpacing: '-0.015em' },
    h3: { fontFamily: '"Cormorant Garamond", Georgia, serif', fontWeight: 600, letterSpacing: '-0.01em' },
    h4: { fontFamily: '"Cormorant Garamond", Georgia, serif', fontWeight: 500 },
    h5: { fontFamily: '"Cormorant Garamond", Georgia, serif', fontWeight: 500 },
    h6: { fontFamily: '"DM Sans", system-ui, sans-serif', fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600, letterSpacing: '0.01em', fontFamily: '"DM Sans", system-ui, sans-serif' },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 8, padding: '10px 22px', fontSize: '0.925rem', fontWeight: 600, boxShadow: 'none', '&:hover': { boxShadow: 'none' } },
        containedPrimary: {
          background: `linear-gradient(135deg, ${C.forest} 0%, ${C.forestMid} 100%)`,
          '&:hover': { background: `linear-gradient(135deg, ${C.forestMid} 0%, ${C.forestLight} 100%)` },
        },
        containedSecondary: {
          background: `linear-gradient(135deg, ${C.gold} 0%, ${C.goldLight} 100%)`,
          color: C.forest,
          '&:hover': { background: C.goldLight },
        },
        outlined: { borderColor: C.border, '&:hover': { borderColor: C.forest } },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: `1px solid ${C.border}`,
          boxShadow: `0 2px 12px rgba(27,58,45,0.10)`,
          transition: 'all 0.25s ease',
          '&:hover': { boxShadow: `0 8px 32px rgba(27,58,45,0.18)`, transform: 'translateY(-2px)' },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            backgroundColor: '#fff',
            '&.Mui-focused fieldset': { borderColor: C.forest, borderWidth: 2 },
          },
        },
      },
    },
    MuiChip: { styleOverrides: { root: { borderRadius: 6, fontWeight: 600, fontSize: '0.78rem' } } },
    MuiAppBar: { styleOverrides: { root: { boxShadow: `0 1px 0 ${C.border}` } } },
    MuiPaper: { styleOverrides: { root: { borderRadius: 16 } } },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);