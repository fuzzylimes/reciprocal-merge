import { useState } from 'react';
import TextField from '@mui/material/TextField';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import FileOpenIcon from '@mui/icons-material/FileOpen';
import { readFile } from '../utils/file-system-service';
import { Box, IconButton, InputAdornment } from '@mui/material';

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
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 2, mb: 1 }}>
      <IconButton
        color='primary'
        size='large'
        onClick={handleSelectFile}
        loading={disabled || isSelecting}
      >
        <FileOpenIcon />
      </IconButton>

      <TextField
        fullWidth
        label={label}
        value={value}
        disabled={true}
        variant="outlined"
        sx={{ flex: 1 }}
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
      />
    </Box>
  );
}

export default FileSelector;
