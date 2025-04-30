import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import MergeIcon from '@mui/icons-material/MergeType';
import CreateIcon from '@mui/icons-material/Create';
import SearchIcon from '@mui/icons-material/Search';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import React from 'react';
import { Chip } from '@mui/material';

interface NavigationProps {
  currentTab: number;
  onTabChange: (event: React.SyntheticEvent, newValue: number) => void;
}

function Navigation({ currentTab, onTabChange }: NavigationProps) {
  const appVersion = import.meta.env.VITE_APP_VERSION;

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4" component="h1">
          Document Templating Tool
        </Typography>
        <Chip
          label={`v${appVersion}`}
          size="small"
          color="primary"
          variant="outlined"
          sx={{ ml: 2 }}
        />
      </Box>
      <Tabs
        value={currentTab}
        onChange={onTabChange}
        aria-label="document templating navigation tabs"
      >
        <Tab
          icon={<MergeIcon />}
          iconPosition='start'
          label="Merge"
          id="merge-tab"
          aria-controls="merge-tabpanel"
        />
        <Tab
          icon={<CreateIcon />}
          iconPosition='start'
          label="Generate"
          id="generate-tab"
          aria-controls="generate-tabpanel"
        />
        <Tab
          icon={<SearchIcon />}
          iconPosition='start'
          label="DEA Search"
          id="dea-search-tab"
          aria-controls="dea-search-tabpanel"
        />
      </Tabs>
    </Box>
  );
}

export default Navigation;
