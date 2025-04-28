import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid2 as Grid,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Divider,
  LinearProgress
} from '@mui/material';
import { PractitionerRecord, PrescriberDetails } from '../dea-search/types';

interface PrescriberVerificationProps {
  prescriber: PrescriberDetails;
  onSave: (practitioner: PractitionerRecord) => void;
  onSkip: () => void;
  onCancel: () => void;
  currentIndex: number;
  totalCount: number;
}

const PrescriberVerification = ({
  prescriber,
  onSave,
  onSkip,
  onCancel,
  currentIndex,
  totalCount
}: PrescriberVerificationProps) => {
  // Create an initial practitioner record from the prescriber details
  const createInitialPractitionerRecord = (details: PrescriberDetails): PractitionerRecord => {
    const lastName = details.Last || '';
    const firstName = details.FirstFacility || '';

    return {
      'First/Facility': firstName,
      Middle: details.Middle,
      Last: lastName,
      Suffix: details.Suffix,
      Designation: details.Designation,
      Specialty: details.SlnSpecialty || details.BestSpecialty || '',
      PracticeLocation: details.SlnPracticeLocation || details.DeaPracticeLocation || '',
      DEA: details.DEA,
      State: details.State || '',
      Discipline: details.Discipline || '',
      'PC Note - Pharm': '',
      'PC Notes Date': new Date().toISOString().split('T')[0],
      'Last Name First': `${lastName}${lastName && firstName ? ', ' : ''}${firstName}`,
      Practitioner: `${firstName}${firstName && lastName ? ' ' : ''}${lastName}`,
      Placeholder: ''
    };
  };

  const [practitionerRecord, setPractitionerRecord] = useState<PractitionerRecord>(
    createInitialPractitionerRecord(prescriber)
  );

  const [specialtySource, setSpecialtySource] = useState<'sln' | 'best' | 'custom'>(
    prescriber.SlnSpecialty ? 'sln' : prescriber.BestSpecialty ? 'best' : 'custom'
  );

  const [locationSource, setLocationSource] = useState<'sln' | 'dea' | 'custom'>(
    prescriber.SlnPracticeLocation ? 'sln' : prescriber.DeaPracticeLocation ? 'dea' : 'custom'
  );

  const [customSpecialty, setCustomSpecialty] = useState<string>('');
  const [customLocation, setCustomLocation] = useState<string>('');

  // Reset and initialize when a new prescriber is provided
  useEffect(() => {
    const initialRecord = createInitialPractitionerRecord(prescriber);
    setPractitionerRecord(initialRecord);

    // Set default radio selections
    setSpecialtySource(
      prescriber.SlnSpecialty ? 'sln' : prescriber.BestSpecialty ? 'best' : 'custom'
    );

    setLocationSource(
      prescriber.SlnPracticeLocation ? 'sln' : prescriber.DeaPracticeLocation ? 'dea' : 'custom'
    );

    // Reset custom fields
    setCustomSpecialty('');
    setCustomLocation('');
  }, [prescriber]);

  // Update the name fields and derived fields
  const updateNameFields = (
    field: 'First/Facility' | 'Middle' | 'Last' | 'Suffix',
    value: string
  ) => {
    setPractitionerRecord(prev => {
      const updated = { ...prev, [field]: value };

      // Also update derived fields
      const firstName = updated['First/Facility'] || '';
      const lastName = updated['Last'] || '';

      updated['Last Name First'] = `${lastName}${lastName && firstName ? ', ' : ''}${firstName}`;
      updated['Practitioner'] = `${firstName}${firstName && lastName ? ' ' : ''}${lastName}`;

      return updated;
    });
  };

  // Handle text field changes
  const handleChange = (field: keyof PractitionerRecord, value: string) => {
    if (field === 'First/Facility' || field === 'Middle' || field === 'Last' || field === 'Suffix') {
      updateNameFields(field, value);
    } else {
      setPractitionerRecord(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // Handle specialty source change
  const handleSpecialtySourceChange = (source: 'sln' | 'best' | 'custom') => {
    setSpecialtySource(source);

    let newSpecialty = '';
    if (source === 'sln') {
      newSpecialty = prescriber.SlnSpecialty || '';
    } else if (source === 'best') {
      newSpecialty = prescriber.BestSpecialty || '';
    } else if (source === 'custom') {
      newSpecialty = customSpecialty;
    }

    setPractitionerRecord(prev => ({
      ...prev,
      Specialty: newSpecialty
    }));
  };

  // Handle location source change
  const handleLocationSourceChange = (source: 'sln' | 'dea' | 'custom') => {
    setLocationSource(source);

    let newLocation = '';
    if (source === 'sln') {
      newLocation = prescriber.SlnPracticeLocation || '';
    } else if (source === 'dea') {
      newLocation = prescriber.DeaPracticeLocation || '';
    } else if (source === 'custom') {
      newLocation = customLocation;
    }

    setPractitionerRecord(prev => ({
      ...prev,
      PracticeLocation: newLocation
    }));
  };

  // Handle custom specialty change
  const handleCustomSpecialtyChange = (value: string) => {
    setCustomSpecialty(value);
    if (specialtySource === 'custom') {
      setPractitionerRecord(prev => ({
        ...prev,
        Specialty: value
      }));
    }
  };

  // Handle custom location change
  const handleCustomLocationChange = (value: string) => {
    setCustomLocation(value);
    if (locationSource === 'custom') {
      setPractitionerRecord(prev => ({
        ...prev,
        PracticeLocation: value
      }));
    }
  };

  // Handle save
  const handleSave = () => {
    onSave(practitionerRecord);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Verify Prescriber Information ({currentIndex} of {totalCount})
      </Typography>

      <LinearProgress
        variant="determinate"
        value={((currentIndex - 1) / totalCount) * 100}
        sx={{ mb: 3 }}
      />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            label="DEA Number"
            fullWidth
            value={practitionerRecord.DEA}
            onChange={(e) => handleChange('DEA', e.target.value)}
            margin="normal"
            required
            disabled
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            label="First Name/Facility"
            fullWidth
            value={practitionerRecord['First/Facility']}
            onChange={(e) => handleChange('First/Facility', e.target.value)}
            margin="normal"
            required
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            label="Middle Name"
            fullWidth
            value={practitionerRecord.Middle || ''}
            onChange={(e) => handleChange('Middle', e.target.value)}
            margin="normal"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            label="Last Name"
            fullWidth
            value={practitionerRecord.Last || ''}
            onChange={(e) => handleChange('Last', e.target.value)}
            margin="normal"
          />
        </Grid>

        <Grid size={12}>
          <Divider sx={{ my: 2 }} />

          <FormControl component="fieldset" sx={{ width: '100%' }}>
            <FormLabel component="legend">Specialty</FormLabel>
            <RadioGroup
              value={specialtySource}
              onChange={(e) => handleSpecialtySourceChange(e.target.value as 'sln' | 'best' | 'custom')}
            >
              <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 12, md: 4 }}>
                  <FormControlLabel
                    value="sln"
                    control={<Radio />}
                    label="SLN Specialty"
                    disabled={!prescriber.SlnSpecialty}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 8 }}>
                  <TextField
                    fullWidth
                    size="small"
                    value={prescriber.SlnSpecialty || ''}
                    disabled
                    variant="outlined"
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <FormControlLabel
                    value="best"
                    control={<Radio />}
                    label="Best Specialty"
                    disabled={!prescriber.BestSpecialty}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 8 }}>
                  <TextField
                    fullWidth
                    size="small"
                    value={prescriber.BestSpecialty || ''}
                    disabled
                    variant="outlined"
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <FormControlLabel
                    value="custom"
                    control={<Radio />}
                    label="Custom"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 8 }}>
                  <TextField
                    fullWidth
                    size="small"
                    value={customSpecialty}
                    onChange={(e) => handleCustomSpecialtyChange(e.target.value)}
                    disabled={specialtySource !== 'custom'}
                    variant="outlined"
                    placeholder="Enter custom specialty"
                  />
                </Grid>
              </Grid>
            </RadioGroup>
          </FormControl>
        </Grid>

        <Grid size={12}>
          <Divider sx={{ my: 2 }} />

          <FormControl component="fieldset" sx={{ width: '100%' }}>
            <FormLabel component="legend">Practice Location</FormLabel>
            <RadioGroup
              value={locationSource}
              onChange={(e) => handleLocationSourceChange(e.target.value as 'sln' | 'dea' | 'custom')}
            >
              <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 12, md: 4 }}>
                  <FormControlLabel
                    value="sln"
                    control={<Radio />}
                    label="SLN Location"
                    disabled={!prescriber.SlnPracticeLocation}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 8 }}>
                  <TextField
                    fullWidth
                    size="small"
                    value={prescriber.SlnPracticeLocation || ''}
                    disabled
                    variant="outlined"
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <FormControlLabel
                    value="dea"
                    control={<Radio />}
                    label="DEA Location"
                    disabled={!prescriber.DeaPracticeLocation}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 8 }}>
                  <TextField
                    fullWidth
                    size="small"
                    value={prescriber.DeaPracticeLocation || ''}
                    disabled
                    variant="outlined"
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <FormControlLabel
                    value="custom"
                    control={<Radio />}
                    label="Custom"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 8 }}>
                  <TextField
                    fullWidth
                    size="small"
                    value={customLocation}
                    onChange={(e) => handleCustomLocationChange(e.target.value)}
                    disabled={locationSource !== 'custom'}
                    variant="outlined"
                    placeholder="Enter custom location"
                  />
                </Grid>
              </Grid>
            </RadioGroup>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            label="State"
            fullWidth
            value={practitionerRecord.State || ''}
            onChange={(e) => handleChange('State', e.target.value)}
            margin="normal"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            label="Discipline"
            fullWidth
            value={practitionerRecord.Discipline || ''}
            onChange={(e) => handleChange('Discipline', e.target.value)}
            margin="normal"
          />
        </Grid>

        <Grid size={12}>
          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button
              variant="outlined"
              color="error"
              onClick={onCancel}
            >
              Cancel
            </Button>

            <Box>
              <Button
                variant="outlined"
                onClick={onSkip}
                sx={{ mr: 1 }}
              >
                Skip
              </Button>

              <Button
                variant="contained"
                color="primary"
                onClick={handleSave}
              >
                Save
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PrescriberVerification;
