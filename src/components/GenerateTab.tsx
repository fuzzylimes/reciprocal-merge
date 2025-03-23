import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid2';
import Paper from '@mui/material/Paper';

import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import FileSelector from './FileSelector';
import { generateInputFile } from '../utils/generate';
import { save } from '@tauri-apps/plugin-dialog';
import { saveExcelFile } from '../utils/excel';

function GenerateTab() {
  const [reportFilePath, setReportFilePath] = useState<string>('');
  const [calculationsFilePath, setCalculationsFilePath] = useState<string>('');
  const [practitionersFilePath, setPractitionersFilePath] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  const showNotification = (message: string, severity: 'success' | 'error' | 'info' = 'info') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  const handleFileSelectionError = (error: unknown) => {
    showNotification('Failed to select file. See console for details.', 'error');
    console.error('Error during file selection:', error);
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  // Main generate handler
  const handleGenerate = async () => {
    if (!practitionersFilePath || !reportFilePath || !calculationsFilePath) return;

    setIsProcessing(true);

    try {
      // Generate the template Excel file
      const generatedWorkbook = await generateInputFile(
        reportFilePath,
        calculationsFilePath,
        practitionersFilePath
      );

      // Show file save dialog
      const savePath = await save({
        filters: [{
          name: 'Excel Files',
          extensions: ['xlsx']
        }]
      });

      if (savePath) {
        // Save the generated Excel file
        await saveExcelFile(generatedWorkbook, savePath);
        showNotification('Template Excel file successfully generated!', 'success');
      } else {
        showNotification('Save operation cancelled', 'info');
      }
    } catch (error) {
      console.error('Error during template generation:', error);
      showNotification('Failed to generate template. See console for details.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Check if all required files are selected and not processing
  const isGenerateEnabled = reportFilePath !== '' && calculationsFilePath !== '' && practitionersFilePath !== '' && !isProcessing;

  return (
    <Box
      role="tabpanel"
      id="merge-tabpanel"
      aria-labelledby="merge-tab"
    >
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" component="h2" gutterBottom>
          Generate Template Input File
        </Typography>
        <Grid container spacing={3}>
          {/* Report File Section */}
          <FileSelector
            label="Report Excel File"
            value={reportFilePath}
            disabled={isProcessing}
            onChange={setReportFilePath}
            fileTypes={[{
              name: 'Excel Files',
              extensions: ['xlsx', 'xls', 'xlsm']
            }]}
            onError={handleFileSelectionError}
          />

          {/* Calculations File Section */}
          <FileSelector
            label="Calculations Word File"
            value={calculationsFilePath}
            disabled={isProcessing}
            onChange={setCalculationsFilePath}
            fileTypes={[{
              name: 'Word Files',
              extensions: ['docx']
            }]}
            onError={handleFileSelectionError}
          />

          {/* Practitioners File Section */}
          <FileSelector
            label="Practitioners Excel File"
            value={practitionersFilePath}
            disabled={isProcessing}
            onChange={setPractitionersFilePath}
            fileTypes={[{
              name: 'Excel Files',
              extensions: ['xlsx', 'xls', 'xlsm']
            }]}
            onError={handleFileSelectionError}
          />

          {/* Merge Button Section */}
          <Grid size={12} sx={{ mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={isProcessing ? <CircularProgress size={24} color="inherit" /> : <PlayArrowIcon />}
              onClick={handleGenerate}
              disabled={!isGenerateEnabled}
            >
              {isProcessing ? 'Processing...' : 'Generate Template'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Notification */}
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
}

export default GenerateTab;
