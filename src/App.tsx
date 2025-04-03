import { useEffect, useState } from 'react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Navigation from './components/Navigation';
import MergeTab from './components/MergeTab';
import GenerateTab from './components/GenerateTab';
import { getEnvironmentInfo, isTauriEnv } from './utils/environment';
import { enableNetworkBlocker } from './utils/network-blocker';
import PrivacyBanner from './components/PrivacyBanner';

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  const [currentTab, setCurrentTab] = useState<number>(0);
  const [networkBlockerEnabled, setNetworkBlockerEnabled] = useState(false);
  const isTauri = isTauriEnv();

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  // Initialize environment-specific features
  useEffect(() => {
    console.info(JSON.stringify(getEnvironmentInfo(), null, 2));
    // Only enable network blocker in browser mode, not in Tauri
    if (!isTauri && !networkBlockerEnabled) {
      enableNetworkBlocker();
      setNetworkBlockerEnabled(true);

      // Add a console message for developers
      console.info(
        '%c🔒 PRIVACY NOTICE',
        'color: white; background: #1976d2; padding: 4px 8px; border-radius: 4px; font-weight: bold;',
        '\nThis application actively blocks all network requests after initial load.\nYour files are processed entirely in your browser and never leave your device.'
      );
    }
  }, [isTauri, networkBlockerEnabled]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Navigation currentTab={currentTab} onTabChange={handleTabChange} />

        <Box sx={{ mt: 3 }}>
          {currentTab === 0 && <MergeTab />}
          {currentTab === 1 && <GenerateTab />}
        </Box>

        <Box sx={{ mt: 3 }} >
          <PrivacyBanner />
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;
