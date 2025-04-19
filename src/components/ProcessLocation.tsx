/**
 * Small information text informing the user that their uploaded files are processed locally.
 */
import LockIcon from '@mui/icons-material/Lock';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { isTauriEnv } from '../utils/environment';

function ProcessLocation() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
        <LockIcon fontSize="small" sx={{ mr: 0.5, fontSize: 14 }} />
        Files are processed locally {isTauriEnv() ? "on your device" : "in your browser"}
      </Typography>
    </Box>
  )
}

export default ProcessLocation;
