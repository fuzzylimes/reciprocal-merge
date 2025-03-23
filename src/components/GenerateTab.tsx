import { useState, useEffect } from 'react';
import { open, save } from '@tauri-apps/plugin-dialog';
import { readFile, writeFile } from '@tauri-apps/plugin-fs';
import * as XLSX from 'xlsx';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid2';
import Paper from '@mui/material/Paper';
import InputAdornment from '@mui/material/InputAdornment';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CreateIcon from '@mui/icons-material/Create';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

import { TemplateConfigSchema, type TemplateConfig } from '../models/template-item';
import templateData from '../models/template.json';

function GenerateTab() {
  const [config, setConfig] = useState<TemplateConfig | null>(null);
  const [fileSources, setFileSources] = useState<string[]>([]);
  const [sourceFiles, setSourceFiles] = useState<Record<string, string>>({});
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

  // Effect to load the template data on component mount
  useEffect(() => {
    loadTemplateData();
  }, []);

  // Load and process the template data
  const loadTemplateData = async () => {
    try {
      // Validate against our schema
      const validatedData = TemplateConfigSchema.parse(templateData);
      setConfig(validatedData);

      // Extract unique file sources
      const sources = new Set<string>();

      Object.values(validatedData).forEach(items => {
        items.forEach(item => {
          sources.add(item.fileSource);
        });
      });

      setFileSources(Array.from(sources));
    } catch (error) {
      console.error('Failed to load template data:', error);
      showNotification('Failed to load template configuration', 'error');
    }
  };

  // File selection handler for each source
  const handleSelectSourceFile = async (source: string) => {
    try {
      const selected = await open({
        multiple: false,
        filters: [{
          name: 'All Files',
          extensions: ['xlsx', 'xls', 'docx', 'doc']
        }]
      });

      if (selected && !Array.isArray(selected)) {
        setSourceFiles(prev => ({
          ...prev,
          [source]: selected
        }));
      }
    } catch (error) {
      console.error(`Failed to select file for ${source}:`, error);
      showNotification(`Failed to select file for ${source}`, 'error');
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

  // Check if all required sources have files
  const areAllSourcesSelected = () => {
    return fileSources.every(source => sourceFiles[source] !== undefined);
  };

  // Main generate handler
  const handleGenerate = async () => {
    if (!config || !areAllSourcesSelected()) return;

    setIsProcessing(true);

    try {
      // Create a workbook for each sheet in the template
      const workbook = XLSX.utils.book_new();

      // Process each sheet in the template
      for (const [sheetName, items] of Object.entries(config)) {
        // Create worksheet with headers based on columnNames
        const headers = items.map(item => item.columnName);
        const ws = XLSX.utils.aoa_to_sheet([headers]);

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(workbook, ws, sheetName);
      }

      // Show save dialog for the generated template
      const savePath = await save({
        filters: [{
          name: 'Excel Files',
          extensions: ['xlsx']
        }]
      });

      if (savePath) {
        // Convert workbook to binary
        const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        // Save the file
        await writeFile(savePath, excelBuffer);
        showNotification('Template generated successfully!', 'success');
      } else {
        showNotification('Save operation cancelled', 'info');
      }
    } catch (error) {
      console.error('Error generating template:', error);
      showNotification('Failed to generate template. See console for details.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Box
      role="tabpanel"
      id="generate-tabpanel"
      aria-labelledby="generate-tab"
    >
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" component="h2" gutterBottom>
          Generate Template Files
        </Typography>

        {config && (
          <>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Template loaded successfully. Please select the source files to generate the template.
            </Typography>

            {/* Dynamically generated source file inputs */}
            <Grid container spacing={3}>
              {fileSources.map((source) => (
                <Grid size={12} key={source}>
                  <TextField
                    fullWidth
                    label={source}
                    value={sourceFiles[source] || ''}
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
                    onClick={() => handleSelectSourceFile(source)}
                    sx={{ mt: 1 }}
                    disabled={isProcessing}
                  >
                    Select
                  </Button>
                </Grid>
              ))}
            </Grid>

            {/* Generate Button Section */}
            <Grid container sx={{ mt: 3 }}>
              <Grid size={12}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={isProcessing ? <CircularProgress size={24} color="inherit" /> : <CreateIcon />}
                  onClick={handleGenerate}
                  disabled={!areAllSourcesSelected() || isProcessing}
                >
                  {isProcessing ? 'Processing...' : 'Generate Template'}
                </Button>
              </Grid>
            </Grid>
          </>
        )}

        {!config && (
          <Typography variant="body1" color="error">
            Failed to load template configuration. Please check the console for details.
          </Typography>
        )}
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
