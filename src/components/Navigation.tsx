import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import MergeIcon from '@mui/icons-material/MergeType';
import CreateIcon from '@mui/icons-material/Create';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface NavigationProps {
  currentTab: number;
  onTabChange: (event: React.SyntheticEvent, newValue: number) => void;
}

function Navigation({ currentTab, onTabChange }: NavigationProps) {
  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Document Templating Tool
      </Typography>
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
      </Tabs>
    </Box>
  );
}

export default Navigation;
