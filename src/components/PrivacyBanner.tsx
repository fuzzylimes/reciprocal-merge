import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Collapse,
  IconButton
} from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import StorageIcon from '@mui/icons-material/Storage';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import CodeIcon from '@mui/icons-material/Code';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import InfoIcon from '@mui/icons-material/Info';
import LockIcon from '@mui/icons-material/Lock';
import DesktopWindowsIcon from '@mui/icons-material/DesktopWindows';
import WebIcon from '@mui/icons-material/Web';
import { isTauriEnv } from '../utils/environment';

export default function PrivacyBanner() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const isTauri = isTauriEnv();

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          border: '1px solid #e0e0e0',
          borderLeft: '4px solid #1976d2',
          bgcolor: '#f5f9ff'
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <LockIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="body1" fontWeight="medium">
              {isTauri
                ? "This desktop application processes files locally - nothing leaves your device"
                : "Your files never leave your device - all processing happens locally in your browser"}
            </Typography>
          </Box>

          <Box>
            <IconButton
              size="small"
              onClick={() => setExpanded(!expanded)}
              aria-expanded={expanded}
              aria-label="show more"
            >
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
            <IconButton
              size="small"
              onClick={() => setDialogOpen(true)}
              aria-label="privacy information"
            >
              <InfoIcon />
            </IconButton>
          </Box>
        </Box>

        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Box sx={{ mt: 2 }}>
            <List dense disablePadding>
              {!isTauri && (
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CloudOffIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Network connection blocker"
                    secondary="All external network requests are actively blocked"
                  />
                </ListItem>
              )}

              <ListItem disableGutters>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  {isTauri ? <DesktopWindowsIcon fontSize="small" /> : <WebIcon fontSize="small" />}
                </ListItemIcon>
                <ListItemText
                  primary={isTauri ? "Desktop application" : "Browser-based processing"}
                  secondary={isTauri
                    ? "Running as a desktop app with local file access"
                    : "Files are processed directly in your browser with no uploads"}
                />
              </ListItem>

              <ListItem disableGutters>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <StorageIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="No data storage"
                  secondary="Nothing is saved between sessions unless you explicitly save a file"
                />
              </ListItem>
            </List>

            <Button
              size="small"
              variant="outlined"
              startIcon={<CodeIcon />}
              sx={{ mt: 1 }}
              onClick={() => window.open('https://github.com/YOUR-USERNAME/YOUR-REPO', '_blank')}
            >
              View Source Code
            </Button>
          </Box>
        </Collapse>
      </Paper>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
      >
        <DialogTitle>
          Privacy & {isTauri ? "Desktop" : "Browser"} Processing Information
        </DialogTitle>
        <DialogContent>
          <Typography component={'p'}>
            This document templating tool is designed to function completely offline,
            processing all data locally {isTauri ? "on your device" : "within your browser"}.
            We understand the sensitivity of your documents and have implemented several privacy protections:
          </Typography>

          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>How Your Data Stays Local</Typography>

          <List>
            {!isTauri && (
              <ListItem>
                <ListItemIcon><CloudOffIcon /></ListItemIcon>
                <ListItemText
                  primary="Active Network Blocking"
                  secondary="After the initial page load, a network blocker actively prevents any outgoing connections, ensuring your data can't leave your device."
                />
              </ListItem>
            )}

            <ListItem>
              <ListItemIcon>{isTauri ? <DesktopWindowsIcon /> : <StorageIcon />}</ListItemIcon>
              <ListItemText
                primary={isTauri ? "Desktop Application" : "Browser-Based Processing"}
                secondary={isTauri
                  ? "As a desktop application, all file access and processing happens directly on your computer, with no network transmission."
                  : "We use the File System Access API and standard browser capabilities to process files directly in your browser."}
              />
            </ListItem>

            <ListItem>
              <ListItemIcon><SecurityIcon /></ListItemIcon>
              <ListItemText
                primary="No Server Communication"
                secondary="All document merging and Excel processing happens locally using libraries that execute entirely on your device."
              />
            </ListItem>
          </List>

          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Technical Implementation</Typography>
          <Typography component={'p'}>
            {isTauri
              ? "This application is built using Tauri, a framework for building lightweight, secure desktop applications with web technologies. Tauri provides a safe runtime environment that processes all your files locally on your device."
              : "When you select Excel or Word files in this application, they are never uploaded to a server. Instead, we use browser APIs to read and process them directly on your device. All merging and document generation is performed using client-side JavaScript."}
          </Typography>

          {!isTauri && (
            <Typography component={'p'}>
              For advanced users and security researchers: We implement network connection blocking by
              overriding browser network APIs like fetch, XMLHttpRequest, and sendBeacon to prevent any
              communication with external servers after the initial page load.
            </Typography>
          )}

          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Transparency</Typography>
          <Typography component={'p'}>
            Our source code is available publicly on GitHub. You can review it to verify
            our privacy and security measures, or even host the application yourself.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            Close
          </Button>
          <Button
            variant="outlined"
            onClick={() => window.open('https://github.com/fuzzylimes/reciprocal-merge', '_blank')}
          >
            View Source Code
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
