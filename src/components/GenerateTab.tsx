import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid2';
import Paper from '@mui/material/Paper';
import InputAdornment from '@mui/material/InputAdornment';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CreateIcon from '@mui/icons-material/Create';

function GenerateTab() {
  const [practitionerDbPath, setPractitionerDbPath] = useState<string>('');
  const [excelDataPath, setExcelDataPath] = useState<string>('');
  const [wordDataPath, setWordDataPath] = useState<string>('');

  // File selection handlers (to be implemented with Tauri)
  const handleSelectPractitionerDb = async () => {
    // TODO: Implement file selection dialog using Tauri APIs
    console.log('Select Practitioner DB file');
  };

  const handleSelectExcelData = async () => {
    // TODO: Implement file selection dialog using Tauri APIs
    console.log('Select Excel Data file');
  };

  const handleSelectWordData = async () => {
    // TODO: Implement file selection dialog using Tauri APIs
    console.log('Select Word Data file');
  };

  const handleGenerate = async () => {
    // TODO: Implement template generation functionality
    console.log('Generate template');
  };

  // Check if all required files are selected to enable the generate button
  const isGenerateEnabled =
    practitionerDbPath !== '' &&
    excelDataPath !== '' &&
    wordDataPath !== '';

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

        <Grid container spacing={3}>
          {/* Practitioner DB Section */}
          <Grid size={12}>
            <TextField
              fullWidth
              label="Practitioner DB"
              value={practitionerDbPath}
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
              onClick={handleSelectPractitionerDb}
              sx={{ mt: 1 }}
            >
              Select
            </Button>
          </Grid>

          {/* Excel Data Section */}
          <Grid size={12}>
            <TextField
              fullWidth
              label="Excel Data"
              value={excelDataPath}
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
              onClick={handleSelectExcelData}
              sx={{ mt: 1 }}
            >
              Select
            </Button>
          </Grid>

          {/* Word Data Section */}
          <Grid size={12}>
            <TextField
              fullWidth
              label="Word Data"
              value={wordDataPath}
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
              onClick={handleSelectWordData}
              sx={{ mt: 1 }}
            >
              Select
            </Button>
          </Grid>

          {/* Generate Button Section */}
          <Grid size={12} sx={{ mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<CreateIcon />}
              onClick={handleGenerate}
              disabled={!isGenerateEnabled}
            >
              Generate Template
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}

export default GenerateTab;
