import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Alert,
  Snackbar
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { PractitionerRecord } from '../dea-search/types';

interface ResultsTableProps {
  practitioners: PractitionerRecord[];
  onNewSearch: () => void;
}

const ResultsTable: React.FC<ResultsTableProps> = ({ practitioners, onNewSearch }) => {
  const [copied, setCopied] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  // Determine which fields to display (excluding calculated fields)
  const displayFields = [
    'First/Facility',
    'Middle',
    'Last',
    'Suffix',
    'Designation',
    'Specialty',
    'PracticeLocation',
    'DEA',
    'State',
    'Address',
    'Discipline'
  ];

  // Function to copy the table to clipboard in a format Excel can parse
  const copyToClipboard = () => {
    try {
      // Create data rows
      const rows = practitioners.map(p =>
        displayFields.map(field =>
          p[field as keyof PractitionerRecord] || ''
        ).join('\t')
      );

      console.log(rows.length);

      if (rows.length < 2) {
        rows.push('\t\t\t\t\t\t\t\t\t\t');
      }

      console.log(rows.length);

      // Combine headers and rows with newlines
      const clipboardData = rows.join('\n');

      // Copy to clipboard
      navigator.clipboard.writeText(clipboardData).then(() => {
        setCopied(true);
        setNotification({
          open: true,
          message: 'Data copied to clipboard! Ready to paste into Excel.',
          severity: 'success'
        });
      }).catch((e) => { throw e; });
    } catch (error) {
      console.error('Failed to copy:', error);
      setNotification({
        open: true,
        message: 'Failed to copy data. See console for details.',
        severity: 'error'
      });
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Practitioner Data Ready
      </Typography>

      <Typography variant="body1" component={'p'}>
        {practitioners.length} new practitioner records are ready. Copy the data below and paste it into your Excel file:
      </Typography>

      <Alert severity="info" sx={{ my: 2 }}>
        <Typography variant="body1">
          Instructions:
        </Typography>
        <Typography>
          <ol>
            <li>Click the &quot;Copy to Clipboard&quot; button below</li>
            <li>Open your Excel file and select the first empty row in your practitioner table</li>
            <li>Paste the data (Ctrl+V or Command+V)</li>
          </ol>
        </Typography>
      </Alert>

      <TableContainer component={Paper} sx={{ mb: 3, maxHeight: 400 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {displayFields.map(field => (
                <TableCell key={field}>{field}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {practitioners.map((practitioner, index) => (
              <TableRow key={index}>
                {displayFields.map(field => (
                  <TableCell key={field}>
                    {String(practitioner[field as keyof PractitionerRecord] || '')}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="contained"
          color={copied ? 'success' : 'primary'}
          startIcon={copied ? <CheckCircleIcon /> : <ContentCopyIcon />}
          onClick={copyToClipboard}
        >
          {copied ? 'Copied!' : 'Copy to Clipboard'}
        </Button>

        <Button
          variant="outlined"
          onClick={onNewSearch}
        >
          Start New Search
        </Button>
      </Box>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ResultsTable;
