import { useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid2';
import InputAdornment from '@mui/material/InputAdornment';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { readFile } from '../utils/file-system-service';

interface FileSelectorProps {
  label: string;
  value: string;
  disabled?: boolean;
  onChange: (filePath: string, fileContent: Uint8Array) => void;
  fileTypes?: string[];
  fileDescription?: string;
  onError?: (error: unknown) => void;
}

function FileSelector({
  label,
  value,
  disabled = false,
  onChange,
  fileTypes = [],
  fileDescription,
  onError
}: FileSelectorProps) {
  const [isSelecting, setIsSelecting] = useState(false);

  const handleSelectFile = async () => {
    if (isSelecting) return; // Prevent multiple selections at once

    setIsSelecting(true);
    try {
      // Use custom readFile method to use correct method depending on browser/Tauri
      const selectedFile = await readFile({
        extensions: fileTypes,
        description: fileDescription
      });

      if (selectedFile) {
        // Pass both the file path and content to the parent component
        onChange(selectedFile.path, selectedFile.content);
      }
    } catch (error) {
      console.error(`Failed to select file for ${label}:`, error);
      if (onError) {
        onError(error);
      }
    } finally {
      setIsSelecting(false);
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
        disabled={disabled || isSelecting}
      >
        {isSelecting ? 'Selecting...' : 'Select'}
      </Button>
    </Grid>
  );
}

export default FileSelector;
