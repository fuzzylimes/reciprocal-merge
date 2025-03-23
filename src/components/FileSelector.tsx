import { open } from '@tauri-apps/plugin-dialog';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid2';
import InputAdornment from '@mui/material/InputAdornment';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

interface FileSelectorProps {
  label: string;
  value: string;
  disabled?: boolean;
  onChange: (filePath: string) => void;
  fileTypes?: Array<{
    name: string;
    extensions: string[];
  }>;
  onError?: (error: unknown) => void;
}

function FileSelector({
  label,
  value,
  disabled = false,
  onChange,
  fileTypes = [],
  onError
}: FileSelectorProps) {

  const handleSelectFile = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: fileTypes.length > 0 ? fileTypes : undefined
      });

      if (selected && !Array.isArray(selected)) {
        onChange(selected);
      }
    } catch (error) {
      console.error(`Failed to select file for ${label}:`, error);
      if (onError) {
        onError(error);
      }
    }
  };

  return (
    <Grid size={12}>
      <TextField
        fullWidth
        label={label}
        value={value}
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
        onClick={handleSelectFile}
        sx={{ mt: 1 }}
        disabled={disabled}
      >
        Select
      </Button>
    </Grid>
  );
}

export default FileSelector;
