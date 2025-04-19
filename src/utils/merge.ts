import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import * as XLSX from 'xlsx';
import expressionParser from 'docxtemplater/expressions.js';

/**
 * Merge Excel data with a Word template
 * @param templateContent Word template file content as Uint8Array
 * @param excelContent Excel file content as Uint8Array
 * @returns Merged document as Uint8Array
 */
export const mergeExcel = (
  templateContent: Uint8Array,
  excelContent: Uint8Array
): Uint8Array => {
  try {
    // Process the Excel content
    const workbook = XLSX.read(excelContent, {
      type: 'array',
      cellDates: true,  // Convert date cells to JS dates
      cellNF: true      // Keep number formats
    });

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
