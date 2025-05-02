import React from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid2 as Grid
} from '@mui/material';
import { PractitionerRecord, PrescriberDetails } from '../dea-search/types';

interface ExistingRecordDialogProps {
  open: boolean;
  existingRecord: PractitionerRecord | null;
  pendingRecord: PrescriberDetails | null;
  onUpdate: () => void;
  onSkip: () => void;
}

const ExistingRecordDialog: React.FC<ExistingRecordDialogProps> = ({
  open,
  existingRecord,
  pendingRecord,
  onUpdate,
  onSkip
}) => {
  return (
    <Dialog
      open={open}
      onClose={onSkip}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>Record Already Exists</DialogTitle>
      <DialogContent>
        <Typography variant="body1" component={'p'}>
          A practitioner with DEA number {existingRecord?.DEA} already exists in the database.
          Would you like to update this record with the new information?
        </Typography>

        <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 1, mb: 2, mt: 2 }}>
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
          <Typography variant="subtitle1" fontWeight="bold">New Information:</Typography>
          {pendingRecord && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="body2">
                  <strong>First/Facility:</strong> {pendingRecord.FirstFacility}
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
                  <strong>Specialty:</strong> {pendingRecord.SlnSpecialty || pendingRecord.BestSpecialty || ''}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="body2">
                  <strong>Practice Location:</strong> {pendingRecord.SlnPracticeLocation || pendingRecord.DeaPracticeLocation || ''}
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
        <Button onClick={onSkip}>Skip</Button>
        <Button onClick={onUpdate} variant="contained" color="primary">
          Update Record
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExistingRecordDialog;
