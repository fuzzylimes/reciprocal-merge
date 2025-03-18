import { useState } from 'react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Navigation from './components/Navigation';
import MergeTab from './components/MergeTab';
import GenerateTab from './components/GenerateTab';

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

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Navigation currentTab={currentTab} onTabChange={handleTabChange} />

        <Box sx={{ mt: 3 }}>
          {currentTab === 0 && <MergeTab />}
          {currentTab === 1 && <GenerateTab />}
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;
