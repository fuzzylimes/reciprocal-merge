import { useState } from 'react';
import { open, save } from '@tauri-apps/plugin-dialog';
import { readFile, writeFile } from '@tauri-apps/plugin-fs';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid2';
import Paper from '@mui/material/Paper';
import InputAdornment from '@mui/material/InputAdornment';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import MergeTypeIcon from '@mui/icons-material/MergeType';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import * as XLSX from 'xlsx';
import expressionParser from 'docxtemplater/expressions.js';

function MergeTab() {
  const [excelFilePath, setExcelFilePath] = useState<string>('');
  const [templateFilePath, setTemplateFilePath] = useState<string>('');
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

  // File selection handler for Excel file
  const handleSelectExcelFile = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [{
          name: 'Excel Files',
          extensions: ['xlsx', 'xls', 'xlsm']
        }]
      });

      if (selected && !Array.isArray(selected)) {
        setExcelFilePath(selected);
      }
    } catch (error) {
      console.error('Failed to select Excel file:', error);
      showNotification('Failed to select Excel file', 'error');
    }
  };

  // File selection handler for Word template file
  const handleSelectTemplateFile = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [{
          name: 'Word Files',
          extensions: ['docx']
        }]
      });

      if (selected && !Array.isArray(selected)) {
        setTemplateFilePath(selected);
      }
    } catch (error) {
      console.error('Failed to select template file:', error);
      showNotification('Failed to select template file', 'error');
    }
  };

  const showNotification = (message: string, severity: 'success' | 'error' | 'info' = 'info') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  // Document merging function
  const mergeExcel = async (templatePath: string, excelPath: string) => {
    try {
      // Read the template file
      const templateContent = await readFile(templatePath);

      // Read and process the Excel file
      const excelContent = await readFile(excelPath);
      const workbook = XLSX.read(excelContent);

      // Convert Excel data to JSON
      const jsonData: Record<string, unknown> = {};

      for (const sheetName of workbook.SheetNames) {
        const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        // If sheet name is 'common' and has data, take the first row as a flat object
        if (sheetName === 'common' && sheetData.length > 0) {
          jsonData[sheetName] = sheetData[0];
        } else {
          jsonData[sheetName] = sheetData;
        }
      }

      // Process Word template with docxtemplater
      const zip = new PizZip(templateContent);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        parser: expressionParser
      });

      // Set the data for the template
      doc.setData(jsonData);

      // Render the document
      doc.render();

      // Get the output document as a binary buffer
      const output = doc.getZip().generate({ type: 'uint8array' });

      return output;
    } catch (error) {
      console.error('Error in mergeExcel:', error);
      throw error;
    }
  };

  // Main merge handler
  const handleMerge = async () => {
    if (!excelFilePath || !templateFilePath) return;

    setIsProcessing(true);

    try {
      // Perform the merge
      const mergedContent = await mergeExcel(templateFilePath, excelFilePath);

      // Show file save dialog
      const savePath = await save({
        filters: [{
          name: 'Word Document',
          extensions: ['docx']
        }]
      });

      if (savePath) {
        // Save the merged document
        await writeFile(savePath, mergedContent);
        showNotification('Document successfully merged and saved!', 'success');
      } else {
        showNotification('Save operation cancelled', 'info');
      }
    } catch (error) {
      console.error('Error during merge process:', error);
      showNotification('Failed to merge documents. See console for details.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Check if both files are selected to enable the merge button
  const isMergeEnabled = excelFilePath !== '' && templateFilePath !== '' && !isProcessing;

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
        <Grid container spacing={3}>
          {/* Input Excel File Section */}
          <Grid size={12}>
            <TextField
              fullWidth
              label="Input Excel File"
              value={excelFilePath}
              slotProps={{
                input: {
                  readOnly: true,
                  startAdornment: (
                    <InputAdornment position="start">
                      <InsertDriveFileIcon />
                    </InputAdornment>
                  ),
                }
              }}
              variant="outlined"
              margin="normal"
            />
            <Button
              variant="contained"
              onClick={handleSelectExcelFile}
              sx={{ mt: 1 }}
              disabled={isProcessing}
            >
              Select
            </Button>
          </Grid>

          {/* Template Word File Section */}
          <Grid size={12}>
            <TextField
              fullWidth
              label="Template Word File"
              value={templateFilePath}
              slotProps={{
                input: {
                  readOnly: true,
                  startAdornment: (
                    <InputAdornment position="start">
                      <InsertDriveFileIcon />
                    </InputAdornment>
                  ),
                }
              }}
              variant="outlined"
              margin="normal"
            />
            <Button
              variant="contained"
              onClick={handleSelectTemplateFile}
              sx={{ mt: 1 }}
              disabled={isProcessing}
            >
              Select
            </Button>
          </Grid>

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
