import { useState, useEffect, useCallback, useRef } from 'react';
import { Box, Typography, Paper, TextField, Button, Grid2 as Grid, CircularProgress, Snackbar, Alert, LinearProgress, Tooltip } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import FileSelector from './FileSelector';
import { Ifile } from '../utils/file-system-service';
import { Client } from '../dea-search/client';
import { PractitionerRecord, PrescriberDetails } from '../dea-search/types';
import PrescriberVerification from './PrescriberVerification';
import { loadExcelFile } from '../utils/excel';
import { utils } from 'xlsx';
import ProcessLocation from './ProcessLocation';
import ResultsTable from './ResultsTable';
import ExistingRecordDialog from './ExistingRecordDialog';
import { CookieExpiredError } from '../utils/cookie-expired-error';

// Simple queue item to track DEA data and status
interface DeaQueueItem {
  dea: string;
  data?: PrescriberDetails;
  isLoading: boolean;
  error?: string;
}

const DeaSearchTab = () => {
  // Form inputs
  const [deaInput, setDeaInput] = useState<string>('');
  const [cookieInput, setCookieInput] = useState<string>('');
  const [practitionersFile, setPractitionersFile] = useState<Ifile>({ path: '', content: null });

  // Search state
  const [deaQueue, setDeaQueue] = useState<DeaQueueItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [existingPractitioners, setExistingPractitioners] = useState<Map<string, PractitionerRecord>>(new Map());
  const [newPractitioners, setNewPractitioners] = useState<PractitionerRecord[]>([]);
  const [saveComplete, setSaveComplete] = useState<boolean>(false);

  // Dialog state for existing records
  const [recordExists, setRecordExists] = useState<boolean>(false);
  const [existingRecord, setExistingRecord] = useState<PractitionerRecord | null>(null);
  const [pendingRecord, setPendingRecord] = useState<PrescriberDetails | null>(null);

  // Refs to track processing state without triggering re-renders
  const fetchRequestedRef = useRef<Set<number>>(new Set()); // Track which indexes we've initiated fetches for
  const loadingMarkedRef = useRef<Set<number>>(new Set()); // Track which indexes we've already marked as loading

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

  // Parse DEA input into a unique list
  const parseDeaInput = () => {
    return [...new Set(deaInput
      .split(',')
      .map(dea => dea.trim())
      .filter(dea => dea.length > 0))];
  };

  // Start the search process
  const handleStartSearch = () => {
    const deas = parseDeaInput();
    if (deas.length === 0) {
      showNotification('Please enter at least one DEA number', 'warning');
      return;
    }

    // Reset all state
    setNewPractitioners([]);
    setSaveComplete(false);
    fetchRequestedRef.current = new Set(); // Reset tracking of fetch requests
    loadingMarkedRef.current = new Set(); // Reset tracking of loading markers

    // Initialize the queue with all DEAs
    const initialQueue: DeaQueueItem[] = deas.map(dea => ({
      dea,
      isLoading: false
    }));

    setDeaQueue(initialQueue);
    setCurrentIndex(0);
    setIsSearching(true);
  };

  // Helper to show notifications
  const showNotification = (message: string, severity: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  // Reset search state
  const resetSearch = () => {
    setCurrentIndex(-1);
    setDeaQueue([]);
    setIsSearching(false);
    setNewPractitioners([]);
    setSaveComplete(false);
    fetchRequestedRef.current = new Set();
    loadingMarkedRef.current = new Set();
  };

  // Handle new search after completion
  const handleNewSearch = () => {
    resetSearch();
    setDeaInput('');
  };

  // Handle completion of search
  const handleCompletion = useCallback((justSaved: boolean = false) => {
    // If we just saved a record OR we have records in the state, show the results
    if (justSaved || newPractitioners.length > 0) {
      setSaveComplete(true);
    } else {
      showNotification('Search complete. No new practitioners to add.', 'info');
      resetSearch();
    }
  }, [newPractitioners.length]);

  // Fetch DEA data for a specific index with protection against duplicate state updates
  const fetchDeaData = useCallback(async (index: number) => {
    if (index < 0 || index >= deaQueue.length) return;

    const queueItem = deaQueue[index];
    if (queueItem.isLoading || queueItem.data || queueItem.error) {
      console.log(`Skipping index ${index} - already processed or in progress`);
      return;
    }

    console.log(`Processing DEA request for index ${index}: ${queueItem.dea}`);

    // Mark as loading (only once)
    if (!loadingMarkedRef.current.has(index)) {
      loadingMarkedRef.current.add(index);
      console.log(`Marking index ${index} as loading`);
      setDeaQueue(prev => {
        const updated = [...prev];
        updated[index] = { ...updated[index], isLoading: true };
        return updated;
      });
    }

    try {
      const client = new Client(cookieInput);
      const html = await client.getDeaHtml(queueItem.dea);
      const prescriberDetails = client.parseHtml(html);

      // Set DEA number on the prescriber details
      prescriberDetails.DEA = queueItem.dea;
      console.log(`Successfully fetched data for DEA ${queueItem.dea}`);

      if (existingPractitioners.has(queueItem.dea)) {
        console.log(`DEA ${queueItem.dea} already exists in database, marking as exists`);
      }

      // Update queue with data
      setDeaQueue(prev => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          data: prescriberDetails,
          isLoading: false,
          error: existingPractitioners.has(queueItem.dea) ? 'exists' : undefined
        };
        return updated;
      });
    } catch (error) {
      // Handle case where the cookie is expired. There's no need to continue with anything if cookie is bad.
      if (error instanceof CookieExpiredError) {
        console.error('Cookie expired:', error);
        showNotification('Your session cookie has expired. Please log in again to get a new cookie.', 'error');

        // Reset the search process since we can't continue with an expired cookie
        resetSearch();
        return;
      }

      // Handle all other cases where we want to continue
      console.error(`Error searching for DEA ${queueItem.dea}:`, error);
      setDeaQueue(prev => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          error: `Failed to retrieve information`,
          isLoading: false
        };
        return updated;
      });
    }
  }, [deaQueue, cookieInput, existingPractitioners]);

  // Fetch data for current and next DEA with tracking to prevent duplicate requests
  useEffect(() => {
    if (!isSearching || currentIndex < 0) return;

    // For initial index, fetch item 0 and prefetch item 1 if they haven't been requested yet
    if (currentIndex === 0) {
      if (!fetchRequestedRef.current.has(0)) {
        fetchRequestedRef.current.add(0);
        console.log('Initially requesting index 0');
        void fetchDeaData(0);
      }

      if (deaQueue.length > 1 && !fetchRequestedRef.current.has(1)) {
        fetchRequestedRef.current.add(1);
        console.log('Initially requesting index 1');
        void fetchDeaData(1);
      }
    } else {
      // For subsequent indexes, prefetch the next item if it exists and hasn't been requested
      const nextIndex = currentIndex + 1;
      if (nextIndex < deaQueue.length && !fetchRequestedRef.current.has(nextIndex)) {
        fetchRequestedRef.current.add(nextIndex);
        console.log(`Prefetching index ${nextIndex}`);
        void fetchDeaData(nextIndex);
      }
    }
  }, [isSearching, currentIndex, deaQueue.length, fetchDeaData]);

  // Move to the next DEA
  const moveToNextDea = useCallback(() => {
    const nextIndex = currentIndex + 1;

    if (nextIndex >= deaQueue.length) {
      // All searches complete - default to false (no just-saved record)
      handleCompletion(false);
      return;
    }

    setCurrentIndex(nextIndex);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentIndex, deaQueue.length, handleCompletion]);

  // Update the handler for current item status
  useEffect(() => {
    if (!isSearching || currentIndex < 0 || currentIndex >= deaQueue.length) return;

    const currentItem = deaQueue[currentIndex];

    // If DEA exists and we have data, show the comparison dialog
    if (currentItem.error === 'exists' && currentItem.data) {
      const existingDea = currentItem.dea;
      const existingRecord = existingPractitioners.get(existingDea);

      if (existingRecord) {
        setExistingRecord(existingRecord);
        setPendingRecord(currentItem.data);
        setRecordExists(true);
      } else {
        // This shouldn't happen, but handle it just in case
        showNotification(`DEA ${currentItem.dea} exists but record not found`, 'error');
        moveToNextDea();
      }
      return;
    }

    // If other error, notify and move on
    if (currentItem.error && currentItem.error !== 'exists') {
      showNotification(`Error with DEA ${currentItem.dea}: ${currentItem.error}`, 'error');
      moveToNextDea();
      return;
    }

    // If still loading, just wait
  }, [isSearching, currentIndex, deaQueue, moveToNextDea, existingPractitioners]);

  // Skip current prescriber
  const handleSkip = () => {
    moveToNextDea();
  };

  // Cancel the search process
  const handleCancel = () => {
    resetSearch();
    showNotification('Search process cancelled', 'info');
  };

  // Save a practitioner record
  const handleSave = (practitionerRecord: PractitionerRecord) => {
    // Add to new practitioners list
    setNewPractitioners(prev => [...prev, practitionerRecord]);

    // Also add to existing map to prevent duplicate additions
    setExistingPractitioners(prev => {
      const updated = new Map(prev);
      updated.set(practitionerRecord.DEA, practitionerRecord);
      return updated;
    });

    // Check if this is the last record
    const isLastRecord = currentIndex === deaQueue.length - 1;

    if (isLastRecord) {
      // If it's the last record, complete with justSaved=true
      handleCompletion(true);
    } else {
      // Otherwise just move to the next DEA
      moveToNextDea();
    }
  };

  // Handle updating an existing record
  const handleUpdateRecord = () => {
    if (pendingRecord) {
      // Move to the verification form to let the user edit the details
      setDeaQueue(prev => {
        const updated = [...prev];
        if (currentIndex >= 0 && currentIndex < updated.length) {
          updated[currentIndex] = {
            ...updated[currentIndex],
            error: undefined // Clear the 'exists' flag
          };
        }
        return updated;
      });
    }

    // Close dialog
    setRecordExists(false);
    setExistingRecord(null);
    setPendingRecord(null);
  };

  // Handle skipping record update
  const handleSkipUpdate = () => {
    setRecordExists(false);
    setExistingRecord(null);
    setPendingRecord(null);
    moveToNextDea();
  };

  // Check if search button should be enabled
  const isSearchEnabled =
    deaInput.trim() !== '' &&
    cookieInput.trim() !== '' &&
    practitionersFile.path !== '' &&
    !isSearching;

  // Get current DEA info for display
  const getCurrentDea = () => {
    if (currentIndex < 0 || currentIndex >= deaQueue.length) return '';
    return deaQueue[currentIndex].dea;
  };

  // Get current prescriber data
  const getCurrentPrescriber = () => {
    if (currentIndex < 0 || currentIndex >= deaQueue.length) return null;
    return deaQueue[currentIndex].data || null;
  };

  // Check if currently loading
  const isCurrentlyLoading = () => {
    if (currentIndex < 0 || currentIndex >= deaQueue.length) return false;
    return deaQueue[currentIndex].isLoading;
  };

  return (
    <Box role="tabpanel" id="dea-search-tabpanel" aria-labelledby="dea-search-tab">
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" component="h2" gutterBottom>
          DEA Search and Update
        </Typography>
        <ProcessLocation />

        {saveComplete ? (
          // Results table
          <ResultsTable
            practitioners={newPractitioners}
            onNewSearch={handleNewSearch}
          />
        ) : !getCurrentPrescriber() || isCurrentlyLoading() ? (
          // Search form or loading state
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
              <Box sx={{ position: 'relative' }}>
                <TextField
                  label="Session Cookie"
                  fullWidth
                  value={cookieInput}
                  onChange={(e) => setCookieInput(e.target.value)}
                  placeholder="Paste your session cookie here"
                  disabled={isSearching}
                  margin="normal"
                  helperText="Cookie from web session"
                  slotProps={{
                    input: {
                      endAdornment: (
                        <Tooltip
                          title={
                            <Box sx={{ p: 1, whiteSpace: 'pre-line' }}>
                              To get the cookie:
                              <li>Press Ctrl + Shift + I to open dev console</li>
                              <li>Go to the Network tab</li>
                              <li>Clear out anything there</li>
                              <li>Click on the Doc filter</li>
                              <li>Log in to medproid.com</li>
                              <li>Look for HomeBody.asp in response → click</li>
                              <li>Under Headers sub-tab, find the Request Headers section</li>
                              <li>Copy the full value for the cookie (triple click)</li>
                              <li>Paste into this field</li>
                            </Box>
                          }
                          placement="top-end"
                          arrow
                        >
                          <Box
                            component="span"
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              cursor: 'help'
                            }}
                          >
                            <HelpOutlineIcon color="action" fontSize="small" />
                          </Box>
                        </Tooltip>
                      ),
                    }
                  }}
                />
              </Box>
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
                  {isCurrentlyLoading()
                    ? `Searching for DEA: ${getCurrentDea()} (${currentIndex + 1} of ${deaQueue.length})`
                    : `Loading DEA information... (${currentIndex + 1} of ${deaQueue.length})`
                  }
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={(currentIndex / deaQueue.length) * 100}
                  sx={{ mt: 1 }}
                />
              </Grid>
            )}
          </Grid>
        ) : (
          // Prescriber verification form
          <PrescriberVerification
            prescriber={getCurrentPrescriber()!}
            onSave={handleSave}
            onSkip={handleSkip}
            onCancel={handleCancel}
            currentIndex={currentIndex + 1}
            totalCount={deaQueue.length}
          />
        )}
      </Paper>

      {/* Use the extracted ExistingRecordDialog component */}
      <ExistingRecordDialog
        open={recordExists}
        existingRecord={existingRecord}
        pendingRecord={pendingRecord}
        onUpdate={handleUpdateRecord}
        onSkip={handleSkipUpdate}
      />

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

  // Helper function for file selection error
  function handleFileSelectionError(error: unknown): void {
    console.error('Error during file selection:', error);
    showNotification('Failed to select file. See console for details.', 'error');
  }

  // Helper function for practitioner file change
  function handlePractitionersFileChange(path: string, content: Uint8Array): void {
    setPractitionersFile({ path, content });
  }
};

export default DeaSearchTab;
