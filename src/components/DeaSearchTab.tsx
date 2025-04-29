import { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Paper, TextField, Button, Grid2 as Grid, CircularProgress, Snackbar, Alert, LinearProgress, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FileSelector from './FileSelector';
import { Ifile } from '../utils/file-system-service';
import { Client } from '../dea-search/client';
import { PractitionerRecord, PrescriberDetails } from '../dea-search/types';
import PrescriberVerification from './PrescriberVerification';
import { loadExcelFile, saveExcelFile } from '../utils/excel';
import { utils, WorkBook } from 'xlsx';
import ProcessLocation from './ProcessLocation';
import ResultsTable from './ResultsTable';

const DeaSearchTab = () => {
  // Form inputs
  const [deaInput, setDeaInput] = useState<string>('');
  const [cookieInput, setCookieInput] = useState<string>('');
  const [practitionersFile, setPractitionersFile] = useState<Ifile>({ path: '', content: null });

  // State
  const [deaList, setDeaList] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [currentDea, setCurrentDea] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [currentPrescriber, setCurrentPrescriber] = useState<PrescriberDetails | null>(null);
  const [practitionersWorkbook, setPractitionersWorkbook] = useState<WorkBook | null>(null);
  const [existingPractitioners, setExistingPractitioners] = useState<Map<string, PractitionerRecord>>(new Map());
  const [newPractitioners, setNewPractitioners] = useState<PractitionerRecord[]>([]);
  const [recordExists, setRecordExists] = useState<boolean>(false);
  const [existingRecord, setExistingRecord] = useState<PractitionerRecord | null>(null);
  const [pendingRecord, setPendingRecord] = useState<PractitionerRecord | null>(null);

  // Final saving state
  const [saveComplete, setSaveComplete] = useState<boolean>(false);

  // Notification
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  // Load practitioners file when selected
  useEffect(() => {
    if (practitionersFile.content) {
      try {
        const workbook = loadExcelFile(practitionersFile.content);
        setPractitionersWorkbook(workbook);

        // Load existing practitioners into memory
        const refSheet = workbook.Sheets['Reference'];
        if (refSheet) {
          const practitioners = utils.sheet_to_json<PractitionerRecord>(refSheet);
          const pracMap = new Map<string, PractitionerRecord>();

          practitioners.forEach((prac) => {
            if (prac.DEA) {
              pracMap.set(prac.DEA, prac);
            }
          });

          setExistingPractitioners(pracMap);
        }
      } catch (error) {
        console.error('Error loading practitioners file:', error);
        showNotification('Error loading practitioners file. Check console for details.', 'error');
      }
    }
  }, [practitionersFile]);

  // Parse DEA input into a list when starting search
  const parseDeaInput = () => {
    // Split by commas, trim whitespace, and filter out empty strings
    const deas = deaInput
      .split(',')
      .map(dea => dea.trim())
      .filter(dea => dea.length > 0);

    return deas;
  };

  // Start the search process
  const handleStartSearch = () => {
    const deas = parseDeaInput();
    if (deas.length === 0) {
      showNotification('Please enter at least one DEA number', 'warning');
      return;
    }

    // Reset state before starting
    setNewPractitioners([]);
    setSaveComplete(false);
    setDeaList(deas);
    setCurrentIndex(0);
    setIsSearching(true);
  };

  // Save all new practitioners to the file
  const saveAllPractitioners = useCallback(async () => {
    if (!practitionersWorkbook || newPractitioners.length === 0) {
      return false;
    }

    try {
      // Get Reference sheet
      let refSheet = practitionersWorkbook.Sheets['Reference'];

      if (!refSheet) {
        // If this is blank, they shouldn't be using the tool
        throw Error('Empty PractitionerDB')
      }

      // Get the current range of the sheet
      const range = utils.decode_range(refSheet['!ref'] || 'A1:A1');
      const lastRow = range.e.r;

      // Get the headers
      const headers = utils.sheet_to_json<string[]>(refSheet, { header: 1 })[0];

      // Append each new practitioner
      newPractitioners.forEach((practitioner, index) => {
        const rowIndex = lastRow + 1 + index;

        // For each header column, set the corresponding cell
        headers.forEach((header, colIndex) => {
          // Skip calculated fields
          if (header === 'Last Name First' || header === 'Practitioner') {
            return;
          }

          // Get the value for this field
          const value = practitioner[header as keyof PractitionerRecord];

          // Only set if there's a value
          if (value !== undefined) {
            const cellRef = utils.encode_cell({ r: rowIndex, c: colIndex });
            refSheet[cellRef] = { v: value };
          }
        });
      });

      // Update the sheet range
      const newRange = {
        s: range.s,
        e: { r: lastRow + newPractitioners.length, c: range.e.c }
      };
      refSheet['!ref'] = utils.encode_range(newRange);

      // Save the workbook
      const success = await saveExcelFile(practitionersWorkbook, practitionersFile.path, "xlsm");

      if (success) {
        showNotification(`Added ${newPractitioners.length} new practitioners to the database!`, 'success');
        return true;
      } else {
        showNotification('Failed to save practitioner data', 'error');
        return false;
      }
    } catch (error) {
      console.error('Error saving practitioners data:', error);
      showNotification('Error saving practitioner data. See console for details.', 'error');
      return false;
    }
  }, [newPractitioners, practitionersFile.path, practitionersWorkbook]);

  // Handle practitioner file selection
  const handlePractitionersFileChange = (path: string, content: Uint8Array) => {
    setPractitionersFile({ path, content });
  };

  // Handle file selection errors
  const handleFileSelectionError = (error: unknown) => {
    console.error('Error during file selection:', error);
    showNotification('Failed to select file. See console for details.', 'error');
  };

  // Show notification
  const showNotification = (message: string, severity: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  // Close notification
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  // Reset the search process
  const resetSearch = () => {
    setCurrentIndex(-1);
    setCurrentDea('');
    setCurrentPrescriber(null);
    setIsSearching(false);
    setNewPractitioners([]);
    setSaveComplete(false);
  };

  // Handle new search after completion
  const handleNewSearch = () => {
    resetSearch();
    setDeaInput('');
  };

  const handleCompletion = useCallback(() => {
    if (newPractitioners.length > 0) {
      // Show the results table
      setSaveComplete(true);
    } else {
      // No new practitioners to save
      showNotification('Search complete. No new practitioners to add.', 'info');
      resetSearch();
    }
  }, [newPractitioners.length]);

  // Skip current prescriber
  const handleSkip = () => {
    setCurrentPrescriber(null);
    setCurrentIndex(prevIndex => prevIndex + 1);
  };

  // Cancel the search process
  const handleCancel = () => {
    resetSearch();
    showNotification('Search process cancelled', 'info');
  };

  // Check if a record already exists and show comparison dialog
  const checkExistingRecord = (record: PractitionerRecord) => {
    const existingRecord = existingPractitioners.get(record.DEA);

    if (existingRecord) {
      setExistingRecord(existingRecord);
      setPendingRecord(record);
      setRecordExists(true);
      return true;
    }

    return false;
  };

  // Save a practitioner record
  const handleSave = (practitionerRecord: PractitionerRecord) => {
    // Check if the record already exists
    if (checkExistingRecord(practitionerRecord)) {
      return; // Dialog will handle this case
    }

    // Add to new practitioners list
    setNewPractitioners(prev => [...prev, practitionerRecord]);

    // Also add to existing map to prevent duplicate additions
    setExistingPractitioners(prev => {
      const updated = new Map(prev);
      updated.set(practitionerRecord.DEA, practitionerRecord);
      return updated;
    });

    // Move to next DEA
    setCurrentPrescriber(null);
    setCurrentIndex(prevIndex => prevIndex + 1);
  };

  // Handle updating an existing record
  const handleUpdateRecord = () => {
    if (pendingRecord) {
      // Update the record in the existingPractitioners map
      setExistingPractitioners(prev => {
        const updated = new Map(prev);
        updated.set(pendingRecord.DEA, pendingRecord);
        return updated;
      });

      // Add to the list of records to save
      setNewPractitioners(prev => [...prev, pendingRecord]);
    }

    // Close dialog and move to next DEA
    setRecordExists(false);
    setExistingRecord(null);
    setPendingRecord(null);
    setCurrentPrescriber(null);
    setCurrentIndex(prevIndex => prevIndex + 1);
  };

  // Handle skipping record update
  const handleSkipUpdate = () => {
    setRecordExists(false);
    setExistingRecord(null);
    setPendingRecord(null);
    setCurrentPrescriber(null);
    setCurrentIndex(prevIndex => prevIndex + 1);
  };

  // Search for the next DEA number
  useEffect(() => {
    const searchNextDea = async () => {
      if (currentIndex >= 0 && currentIndex < deaList.length) {
        const dea = deaList[currentIndex];
        setCurrentDea(dea);

        // Check if this DEA already exists in our records
        if (existingPractitioners.has(dea)) {
          showNotification(`DEA ${dea} already exists in the database`, 'info');
          // Move to next DEA
          setCurrentIndex(prevIndex => prevIndex + 1);
          return;
        }

        try {
          const client = new Client(cookieInput, true);
          const html = await client.getDeaHtml(dea);
          const prescriberDetails = client.parseHtml(html);

          // Set DEA number on the prescriber details
          prescriberDetails.DEA = dea;

          setCurrentPrescriber(prescriberDetails);
        } catch (error) {
          console.error(`Error searching for DEA ${dea}:`, error);
          showNotification(`Failed to retrieve information for DEA ${dea}`, 'error');
          // Move to next DEA
          setCurrentIndex(prevIndex => prevIndex + 1);
        }
      } else if (currentIndex >= deaList.length && deaList.length > 0) {
        // All searches complete - call the new handler instead of saving
        handleCompletion();
      }
    };

    if (isSearching && currentIndex >= 0) {
      void searchNextDea();
    }
  }, [currentIndex, deaList, isSearching, cookieInput, existingPractitioners, newPractitioners.length, saveAllPractitioners, handleCompletion]);

  // Check if the search button should be enabled
  const isSearchEnabled =
    deaInput.trim() !== '' &&
    cookieInput.trim() !== '' &&
    practitionersFile.path !== '' &&
    !isSearching;

  return (
    <Box role="tabpanel" id="dea-search-tabpanel" aria-labelledby="dea-search-tab">
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" component="h2" gutterBottom>
          DEA Search and Update
        </Typography>
        <ProcessLocation />

        {saveComplete ? (
          // Show the results table
          <ResultsTable
            practitioners={newPractitioners}
            onNewSearch={handleNewSearch}
          />
        ) : !currentPrescriber ? (
          // Search Form
          <Grid container spacing={3}>
            <Grid size={12}>
              <TextField
                label="DEA Numbers (comma separated)"
                fullWidth
                value={deaInput}
                onChange={(e) => setDeaInput(e.target.value)}
                placeholder="Enter DEA numbers separated by commas"
                slotProps={{
                  htmlInput: {
                    pattern: '[A-Za-z0-9, ]*',
                  }
                }}
                disabled={isSearching}
                margin="normal"
                helperText="Example: AB1234567, CD7654321"
              />
            </Grid>

            <Grid size={12}>
              <TextField
                label="Session Cookie"
                fullWidth
                value={cookieInput}
                onChange={(e) => setCookieInput(e.target.value)}
                placeholder="Paste your session cookie here"
                disabled={isSearching}
                margin="normal"
                helperText="Cookie from www.medproid.com session"
              />
            </Grid>

            <Grid size={12}>
              <FileSelector
                label="Practitioners Excel File"
                value={practitionersFile.path}
                disabled={isSearching}
                onChange={handlePractitionersFileChange}
                fileTypes={['xlsx', 'xls', 'xlsm']}
                fileDescription="Excel Files"
                onError={handleFileSelectionError}
              />
            </Grid>

            <Grid size={12} sx={{ mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={isSearching ? <CircularProgress size={24} color="inherit" /> : <SearchIcon />}
                onClick={handleStartSearch}
                disabled={!isSearchEnabled}
              >
                {isSearching ? 'Searching...' : 'Search DEAs'}
              </Button>
            </Grid>

            {isSearching && (
              <Grid size={12} sx={{ mt: 2 }}>
                <Typography variant="body1">
                  Searching for DEA: {currentDea} ({currentIndex + 1} of {deaList.length})
                </Typography>
                <LinearProgress variant="determinate" value={(currentIndex / deaList.length) * 100} sx={{ mt: 1 }} />
              </Grid>
            )}
          </Grid>
        ) : (
          // Prescriber Verification Form
          <PrescriberVerification
            prescriber={currentPrescriber}
            onSave={handleSave}
            onSkip={handleSkip}
            onCancel={handleCancel}
            currentIndex={currentIndex + 1}
            totalCount={deaList.length}
          />
        )}
      </Paper>

      {/* Record exists dialog */}
      <Dialog
        open={recordExists}
        onClose={handleSkipUpdate}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Record Already Exists</DialogTitle>
        <DialogContent>
          <Typography variant="body1" component={'p'}>
            A practitioner with DEA number {pendingRecord?.DEA} already exists in the database.
            Would you like to update this record with the new information?
          </Typography>

          <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 1, mb: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold">Existing Record:</Typography>
            {existingRecord && (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body2">
                    <strong>First/Facility:</strong> {existingRecord['First/Facility']}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body2">
                    <strong>Middle:</strong> {existingRecord.Middle}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body2">
                    <strong>Last:</strong> {existingRecord.Last}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body2">
                    <strong>Suffix:</strong> {existingRecord.Suffix}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body2">
                    <strong>Designation:</strong> {existingRecord.Designation}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body2">
                    <strong>Specialty:</strong> {existingRecord.Specialty}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body2">
                    <strong>Practice Location:</strong> {existingRecord.PracticeLocation}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body2">
                    <strong>State:</strong> {existingRecord.State}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body2">
                    <strong>Discipline:</strong> {existingRecord.Discipline}
                  </Typography>
                </Grid>
              </Grid>
            )}
          </Box>

          <Box sx={{ bgcolor: 'primary.lighter', p: 2, borderRadius: 1 }}>
            <Typography variant="subtitle1" fontWeight="bold">New Record:</Typography>
            {pendingRecord && (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body2">
                    <strong>First/Facility:</strong> {pendingRecord['First/Facility']}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body2">
                    <strong>Middle:</strong> {pendingRecord.Middle}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body2">
                    <strong>Last:</strong> {pendingRecord.Last}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body2">
                    <strong>Suffix:</strong> {pendingRecord.Suffix}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body2">
                    <strong>Designation:</strong> {pendingRecord.Designation}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body2">
                    <strong>Specialty:</strong> {pendingRecord.Specialty}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body2">
                    <strong>Practice Location:</strong> {pendingRecord.PracticeLocation}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body2">
                    <strong>State:</strong> {pendingRecord.State}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body2">
                    <strong>Discipline:</strong> {pendingRecord.Discipline}
                  </Typography>
                </Grid>
              </Grid>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSkipUpdate}>Skip</Button>
          <Button onClick={handleUpdateRecord} variant="contained" color="primary">
            Update Record
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
};

export default DeaSearchTab;
