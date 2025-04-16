import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid2';
import Paper from '@mui/material/Paper';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import FileSelector from './FileSelector';
import { getCellValue, saveExcelFile } from '../utils/excel';
import { Ifile } from '../utils/file-system-service';
import ProcessLocation from './ProcessLocation';
import { isTauriEnv } from '../utils/environment';
import { Base } from '../utils/sheet-classes/Base';
import { WorkBook } from 'xlsx';
import { generateInputFile } from '../template-engine';

function GenerateTab() {
  const [reportFile, setReportFile] = useState<Ifile>({ path: '', content: null })
  const [calculationsFile, setCalculationsFile] = useState<Ifile>({ path: '', content: null })
  const [prevCalculationsFile, setPrevCalculationsFile] = useState<Ifile>({ path: '', content: null });
  const [practitionersFile, setPractitionersFile] = useState<Ifile>({ path: '', content: null })

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [missingDeaIds, setMissingDeaIds] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [generatedWorkbook, setGeneratedWorkbook] = useState<WorkBook | null>(null);
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

  // Function to save the generated workbook
  const saveGeneratedFile = async (workbook: WorkBook) => {
    try {
      // Get a reasonable filename based on the report file
      const pharmacyName = getCellValue(workbook, 'common', 'A2');
      const dateRange = getCellValue(workbook, 'common', 'E2');
      const endDate = dateRange?.split(' - ')[1];
      const outputName = `${pharmacyName ?? ''} input ${endDate ?? ''}.xlsx`

      const success = await saveExcelFile(workbook, outputName);

      if (!isTauriEnv()) {
        showNotification('Document saved or cancelled', 'info');
        return;
      }

      if (success) {
        showNotification('Template Excel file successfully generated!', 'success');
      } else {
        showNotification('Save operation cancelled', 'info');
      }
    } catch (error) {
      console.error('Error saving Excel file:', error);
      showNotification('Failed to save the generated file. See console for details.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle continue action from the missing DEA modal
  const handleConfirmGeneration = async () => {
    setModalOpen(false);
    if (generatedWorkbook) {
      await saveGeneratedFile(generatedWorkbook);
    }
  };

  // Handle cancel action from the missing DEA modal
  const handleCancelGeneration = () => {
    setModalOpen(false);
    setGeneratedWorkbook(null);
    setIsProcessing(false);
  };

  // Main generate handler
  const handleGenerate = async () => {
    if (!practitionersFile.content || !reportFile.content || !calculationsFile.content || !prevCalculationsFile.content) return;

    setIsProcessing(true);

    try {
      Base.reset();
      // Generate the template Excel file
      const workbook = await generateInputFile(
        reportFile,
        calculationsFile,
        prevCalculationsFile,
        practitionersFile
      );

      // Store the generated workbook for later use
      setGeneratedWorkbook(workbook);

      // Check if there are missing DEA IDs
      if (Base.missingDea && Base.missingDea.length > 0) {
        // Show the modal with missing DEA IDs
        setMissingDeaIds([...Base.missingDea]);
        setModalOpen(true);
        return; // Exit early, wait for user decision
      }

      // No missing DEA IDs, continue with normal flow
      await saveGeneratedFile(workbook);
    } catch (error: unknown) {
      console.error('Error during template generation:', error);
      if (error instanceof Error) {
        showNotification(`Failed to generate template: ${error.message}.`, 'error');
      } else {
        showNotification('Failed to generate template. See console for details.', 'error');
      }
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

      {/* Missing DEA IDs Modal */}
      <Dialog
        open={modalOpen}
        onClose={handleCancelGeneration}
        aria-labelledby="missing-dea-dialog-title"
        aria-describedby="missing-dea-dialog-description"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="missing-dea-dialog-title">Missing DEA Information</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            The database file is missing information for the following DEA IDs:
          </Typography>
          <Box sx={{ maxHeight: '200px', overflowY: 'auto', my: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            {missingDeaIds.map((dea, index) => (
              <Typography key={`dea-${index}`} variant="body2" sx={{ mb: 0.5 }}>
                • {dea}
              </Typography>
            ))}
          </Box>
          <Typography variant="body1">
            If you choose to continue, some DEA information will be missing in the generated file.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ mb: 1, mx: 1 }}>
          <Button onClick={handleCancelGeneration} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmGeneration} color="primary" variant="contained">
            Continue Anyway
          </Button>
        </DialogActions>
      </Dialog>

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
