/**
 * Unified file system service that works in both Tauri and web browser environments.
 * Uses standard, well-supported browser APIs for the web implementation.
 */

import { isTauriEnv } from './environment';

/**
 * Type for file read result 
 */
export interface FileData {
  path: string;      // Full path in Tauri, just filename in browser
  name: string;      // File name
  content: Uint8Array; // File content
}

/**
 * Options for file operations
 */
export interface FileOptions {
  extensions?: string[];
  description?: string;
  multiple?: boolean;
}

export interface Ifile {
  path: string;
  content: Uint8Array | null;
}

/**
 * Open a file dialog and read the selected file
 * @param options File selection options
 * @returns Promise resolving to file data or null if cancelled
 */
export async function readFile(options: FileOptions = {}): Promise<FileData | null> {
  // In Tauri environment, use Tauri APIs
  if (isTauriEnv()) {
    try {
      // Dynamically import Tauri plugins to prevent errors in web environment
      const { open } = await import('@tauri-apps/plugin-dialog');
      const { readFile } = await import('@tauri-apps/plugin-fs');

      // Configure file filters for Tauri dialog
      const filters = options.extensions ? [{
        name: options.description || 'Files',
        extensions: options.extensions
      }] : undefined;

      // Open file dialog
      const selected = await open({
        multiple: options.multiple === true,
        filters
      });

      // Handle selection
      if (selected && !Array.isArray(selected)) {
        // Read file content
        const content = await readFile(selected);

        // Extract filename from path
        const pathParts = selected.split(/[/\\]/);
        const fileName = pathParts[pathParts.length - 1];

        return {
          path: selected,
          name: fileName,
          content: content instanceof Uint8Array ? content : new Uint8Array(content)
        };
      }

      return null;
    } catch (error) {
      console.error('Error reading file in Tauri:', error);
      return null;
    }
  }
  // In web environment, use standard browser APIs
  else {
    return new Promise((resolve) => {
      // Create file input element
      const input = document.createElement('input');
      input.type = 'file';

      // Set accepted file types if provided
      if (options.extensions && options.extensions.length > 0) {
        input.accept = options.extensions.map(ext => `.${ext}`).join(',');
      }

      // Handle file selection
      input.onchange = async (event) => {
        const target = event.target as HTMLInputElement;
        const files = target.files;

        if (files && files.length > 0) {
          const file = files[0];

          try {
            // Read file as ArrayBuffer and convert to Uint8Array
            const arrayBuffer = await file.arrayBuffer();
            const content = new Uint8Array(arrayBuffer);

            resolve({
              path: file.name,  // Browser only gives us the filename, not the full path
              name: file.name,
              content
            });
          } catch (error) {
            console.error('Error reading file:', error);
            resolve(null);
          }
        } else {
          resolve(null);
        }
      };

      // Handle dialog cancellation
      // This is tricky in browsers, we use a focus event as a heuristic
      window.addEventListener('focus', () => {
        // If after a short delay there's still no file, assume user cancelled
        setTimeout(() => {
          if (input.files && input.files.length === 0) {
            resolve(null);
          }
        }, 300);
      }, { once: true });

      // Trigger file dialog
      input.click();
    });
  }
}

/**
 * Save data to a file
 * @param content Data to save
 * @param suggestedName Suggested filename
 * @param options File save options
 * @returns Promise resolving to success status
 */
export async function saveFile(
  content: Uint8Array,
  suggestedName: string,
  options: FileOptions = {}
): Promise<boolean> {
  // In Tauri environment
  if (isTauriEnv()) {
    try {
      // Dynamically import Tauri plugins
      const { save } = await import('@tauri-apps/plugin-dialog');
      const { writeFile } = await import('@tauri-apps/plugin-fs');

      // Configure file filters
      const filters = options.extensions ? [{
        name: options.description || 'Files',
        extensions: options.extensions
      }] : undefined;

      // Show save dialog
      const savePath = await save({
        defaultPath: suggestedName,
        filters
      });

      if (savePath) {
        // Write the file
        await writeFile(savePath, content);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error saving file in Tauri:', error);
      return false;
    }
  }
  // In web environment, use the standard Blob + download approach
  else {
    return new Promise((resolve) => {
      try {
        // Create a Blob from the data
        const blob = new Blob([content]);

        // Create a URL for the Blob
        const url = URL.createObjectURL(blob);

        // Create a download link
        const a = document.createElement('a');
        a.href = url;
        a.download = suggestedName;
        a.style.display = 'none';

        // Set up event listeners to detect when the save operation might be complete
        // This is a best-effort approach since browsers don't provide direct feedback
        let saveCompleted = false;

        // Listen for the focus event which often happens after save dialog interaction
        window.addEventListener('focus', () => {
          if (!saveCompleted) {
            saveCompleted = true;

            // Clean up
            setTimeout(() => {
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
              resolve(true);
            }, 100); // Give a bit more time to ensure save completes
          }
        }, { once: true });

        // Add to document, click to trigger download
        document.body.appendChild(a);
        a.click();

        // Fallback: If focus event doesn't fire (e.g., user stays in same tab)
        // resolve after a reasonable timeout
        setTimeout(() => {
          if (!saveCompleted) {
            saveCompleted = true;
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            resolve(true);
          }
        }, 60000);
      } catch (error) {
        console.error('Error saving file in browser:', error);
        resolve(false);
      }
    });
  }
}
