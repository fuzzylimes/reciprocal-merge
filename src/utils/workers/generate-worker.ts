// Web Worker for handling template generation
import { WorkBook } from 'xlsx';
import { generateInputFile } from '../../template-engine';
import { Ifile } from '../file-system-service';
import { DOMParser } from '@xmldom/xmldom';
import { AIGLookup } from '../../template-engine/sheets/utils/aig-helper';

// Patch the global scope to include DOMParser for XML processing
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
(self as any).DOMParser = DOMParser;

export interface workerPost {
  reportFile: Ifile;
  calculationsFile: Ifile;
  prevCalculationsFile: Ifile;
  practitionersFile: Ifile;
  aigOverrides: AIGLookup;
}

export interface workerResponse {
  type: string;
  message: string;
  progress?: number;
  error?: string;
  workbook?: WorkBook;
  missingDea?: string[];
}

// Set up worker message handling
self.onmessage = (event) => {
  try {
    const {
      reportFile,
      calculationsFile,
      prevCalculationsFile,
      practitionersFile,
      aigOverrides
    } = event.data as workerPost;

    // Send initial progress update
    self.postMessage({
      type: 'progress',
      message: 'Initializing template generation...',
      progress: 10
    });

    // Create an instance of the TemplateGenerator
    const templateGenerator = generateInputFile(
      reportFile,
      calculationsFile,
      prevCalculationsFile,
      practitionersFile,
      aigOverrides
    );

    // Send progress update
    self.postMessage({
      type: 'progress',
      message: 'Processing data...',
      progress: 40
    });

    // Generate the workbook
    const workbook = templateGenerator.generate();

    // Send progress update
    self.postMessage({
      type: 'progress',
      message: 'Finalizing template...',
      progress: 90
    });

    // Get missing DEA IDs if available
    const missingDea = templateGenerator.sheetManager.missingDea || [];

    // Send success message with the generated workbook and missing DEA info
    self.postMessage({
      type: 'complete',
      workbook,
      missingDea
    });

  } catch (error) {
    // Send error message
    self.postMessage({
      type: 'error',
      message: error instanceof Error ? error.message : 'Unknown error during generation',
      error: error instanceof Error ? error.stack : String(error)
    });
  }
};

// Notify that the worker is ready
self.postMessage({ type: 'ready' });
