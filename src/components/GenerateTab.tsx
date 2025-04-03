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
import { saveExcelFile } from '../utils/excel';
import { Ifile } from '../utils/file-system-service';
import ProcessLocation from './ProcessLocation';
import { isTauriEnv } from '../utils/environment';

function GenerateTab() {
  const [reportFile, setReportFile] = useState<Ifile>({ path: '', content: null })
  const [calculationsFile, setCalculationsFile] = useState<Ifile>({ path: '', content: null })
  const [prevCalculationsFile, setPrevCalculationsFile] = useState<Ifile>({ path: '', content: null });
  const [practitionersFile, setPractitionersFile] = useState<Ifile>({ path: '', content: null })

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

  const handleReportFileChange = (path: string, content: Uint8Array) => {
    setReportFile({ path, content });
  };

  const handleCalculationsFileChange = (path: string, content: Uint8Array) => {
    setCalculationsFile({ path, content });
  };

  const handlePrevCalculationsFileChange = (path: string, content: Uint8Array) => {
    setPrevCalculationsFile({ path, content });
  };

  const handlePractitionersFileChange = (path: string, content: Uint8Array) => {
    setPractitionersFile({ path, content });
  };

  // Main generate handler
  const handleGenerate = async () => {
    if (!practitionersFile.content || !reportFile.content || !calculationsFile.content || !prevCalculationsFile.content) return;

    setIsProcessing(true);

    try {
      // Generate the template Excel file
      const generatedWorkbook = await generateInputFile(
        reportFile,
        calculationsFile,
        prevCalculationsFile,
        practitionersFile
      );

      // In browser environment, use automatic download
      // Get a reasonable filename based on the report file
      const fileName = reportFile.path.split(/[\\/]/).pop() || 'generated';
      const outputName = `${fileName.replace(/\.[^/.]+$/, '')}_template.xlsx`;

      const success = await saveExcelFile(generatedWorkbook, outputName);

      if (!isTauriEnv()) showNotification('Document saved or cancelled', 'info');

      if (success) {
        showNotification('Template Excel file successfully generated!', 'success');
      } else {
        showNotification('Save operation cancelled', 'info');
      }
    } catch (error: unknown) {
      console.error('Error during template generation:', error);
      if (error instanceof Error) {
        showNotification(`Failed to generate template: ${error.message}.`, 'error');
      } else {
        showNotification('Failed to generate template. See console for details.', 'error');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Check if all required files are selected and not processing
  const isGenerateEnabled = reportFile.path !== '' && calculationsFile.path !== '' && prevCalculationsFile.path !== '' && practitionersFile.path !== '' && !isProcessing;

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
        <ProcessLocation />
        <Grid container spacing={3}>
          {/* Report File Section */}
          <FileSelector
            label="Report Excel File"
            value={reportFile.path}
            disabled={isProcessing}
            onChange={handleReportFileChange}
            fileTypes={['xlsx', 'xls', 'xlsm']}
            fileDescription='Excel Files'
            onError={handleFileSelectionError}
          />

          {/* Calculations File Section */}
          <FileSelector
            label="Calculations Word File"
            value={calculationsFile.path}
            disabled={isProcessing}
            onChange={handleCalculationsFileChange}
            fileTypes={['docx']}
            fileDescription='Word Files'
            onError={handleFileSelectionError}
          />

          {/* Previous Calculations File Section */}
          <FileSelector
            label="Previous Calculations Word File"
            value={prevCalculationsFile.path}
            disabled={isProcessing}
            onChange={handlePrevCalculationsFileChange}
            fileTypes={['docx']}
            fileDescription='Word Files'
            onError={handleFileSelectionError}
          />

          {/* Practitioners File Section */}
          <FileSelector
            label="Practitioners Excel File"
            value={practitionersFile.path}
            disabled={isProcessing}
            onChange={handlePractitionersFileChange}
            fileTypes={['xlsx', 'xls', 'xlsm']}
            fileDescription='Excel Files'
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
