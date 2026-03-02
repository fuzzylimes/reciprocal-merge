/**
 * File system service using standard browser APIs.
 */

/**
 * Type for file read result
 */
export interface FileData {
  path: string;      // Filename in browser
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
            path: file.name,
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

/**
 * Save data to a file
 * @param content Data to save
 * @param suggestedName Suggested filename
 * @returns Promise resolving to success status
 */
export async function saveFile(
  content: Uint8Array,
  suggestedName: string,
): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      // Create a Blob from the data
      const blob = new Blob([content as BlobPart]);

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
