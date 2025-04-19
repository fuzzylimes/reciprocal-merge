import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid2';
import Paper from '@mui/material/Paper';
import MergeTypeIcon from '@mui/icons-material/MergeType';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import FileSelector from './FileSelector';
import { mergeExcel } from '../utils/merge';
import { Ifile, saveFile } from '../utils/file-system-service';
import ProcessLocation from './ProcessLocation';
import { isTauriEnv } from '../utils/environment';
import { getCellValue, loadExcelFile } from '../utils/excel';

function MergeTab() {
  const [excelFile, setExcelFile] = useState<Ifile>({ path: '', content: null });
  const [templateFile, setTemplateFile] = useState<Ifile>({ path: '', content: null });
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

  const handleExcelFileChange = (path: string, content: Uint8Array) => {
    setExcelFile({ path, content });
  };

  const handleTemplateFileChange = (path: string, content: Uint8Array) => {
    setTemplateFile({ path, content });
  };

  const getOutputFileName = () => {
    if (!excelFile.content) throw Error('Error loading Excel File');

    const templateWorkbook = loadExcelFile(excelFile.content);
    const pharmacyName = getCellValue(templateWorkbook, 'common', 'A2');
    const dateRange = getCellValue(templateWorkbook, 'common', 'E2');
    const endDate = dateRange?.split(' - ')[1];
    return `${pharmacyName ?? ''} notes ${endDate ?? ''}.docx`
  }

  // Main merge handler
  const handleMerge = async () => {
    if (!excelFile.content || !templateFile.content) return;

    setIsProcessing(true);

    try {
      // Perform the merge using the file contents directly
      const mergedContent = mergeExcel(templateFile.content, excelFile.content);

      // Build filename from content in input workbook
      const outputFileName = getOutputFileName();

      // Save the file using our unified file system service
      const saved = await saveFile(
        mergedContent,
        outputFileName,
        { extensions: ['docx'], description: 'Word Documents' }
      );

      if (!isTauriEnv()) {
        showNotification('Document saved or cancelled', 'info');
        return;
      }

      if (saved) {
        showNotification('Document successfully merged and saved!', 'success');
      } else {
        showNotification('Save operation cancelled or failed', 'info');
      }
    } catch (error) {
      console.error('Error during merge process:', error);
      showNotification('Failed to merge documents. See console for details.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Check if both files are selected to enable the merge button
  const isMergeEnabled = excelFile.path !== '' && templateFile.path !== '' && !isProcessing;

  return (
    <Box
      role="tabpanel"
      id="merge-tabpanel"
      aria-labelledby="merge-tab"
    >
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" component="h2" gutterBottom>
          Merge Excel Data with Word Template
        </Typography>
        <ProcessLocation />
        <Grid container spacing={3}>
          {/* Input Excel File Section */}
          <FileSelector
            label="Input Excel File"
            value={excelFile.path}
            disabled={isProcessing}
            onChange={handleExcelFileChange}
            fileTypes={['xlsx', 'xls', 'xlsm']}
            fileDescription="Excel Files"
            onError={handleFileSelectionError}
          />

          {/* Template Word File Section */}
          <FileSelector
            label="Template Word File"
            value={templateFile.path}
            disabled={isProcessing}
            onChange={handleTemplateFileChange}
            fileTypes={['docx']}
            fileDescription="Word Files"
            onError={handleFileSelectionError}
          />

          {/* Merge Button Section */}
          <Grid size={12} sx={{ mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={isProcessing ? <CircularProgress size={24} color="inherit" /> : <MergeTypeIcon />}
              onClick={handleMerge}
              disabled={!isMergeEnabled}
            >
              {isProcessing ? 'Processing...' : 'Merge Documents'}
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

export default MergeTab;
