// src/App.jsx or src/main.jsx (depending on your setup)
import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import CrashPage from './pages/CrashPage';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <CrashPage />
    </ThemeProvider>
  );
}

export default App;