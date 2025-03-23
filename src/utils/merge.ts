import { readFile } from '@tauri-apps/plugin-fs';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import * as XLSX from 'xlsx';
import expressionParser from 'docxtemplater/expressions.js';
import { loadExcelFile } from './excel';

// Document merging function
export const mergeExcel = async (templatePath: string, excelPath: string) => {
  try {
    // Read the template file
    const templateContent = await readFile(templatePath);

    // Read and process the Excel file
    const workbook = await loadExcelFile(excelPath);

    // Convert Excel data to JSON
    const jsonData: Record<string, unknown> = {};

    for (const sheetName of workbook.SheetNames) {
      const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

      // If sheet name is 'common' and has data, take the first row as a flat object
      if (sheetName === 'common' && sheetData.length > 0) {
        jsonData[sheetName] = sheetData[0];
      } else {
        jsonData[sheetName] = sheetData;
      }
    }

    // Process Word template with docxtemplater
    const zip = new PizZip(templateContent);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      parser: expressionParser
    });

    // Set the data for the template
    doc.setData(jsonData);

    // Render the document
    doc.render();

    // Get the output document as a binary buffer
    const output = doc.getZip().generate({ type: 'uint8array' });

    return output;
  } catch (error) {
    console.error('Error in mergeExcel:', error);
    throw error;
  }
};
