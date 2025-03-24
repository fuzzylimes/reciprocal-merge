import { readFile, writeFile } from '@tauri-apps/plugin-fs';
import { WorkBook, read, write } from 'xlsx';

/**
 * Loads and parses an Excel file
 * @param filePath Path to the Excel file
 * @returns Promise resolving to the parsed Excel workbook
 */
export const loadExcelFile = async (filePath: string): Promise<WorkBook> => {
  const excelContent = await readFile(filePath);
  const workbook = read(excelContent, {
    type: 'array',
    cellDates: true,  // Convert date cells to JS dates
    cellNF: true      // Keep number formats
  });

  return workbook;
};

/**
 * Saves a workbook to an Excel file
 * @param workbook The workbook to save
 * @param filePath Path where to save the file
 */
export const saveExcelFile = async (workbook: WorkBook, filePath: string): Promise<void> => {
  // Write workbook to binary string
  const excelData = write(workbook, {
    bookType: 'xlsx',
    type: 'array'
  });

  await writeFile(filePath, excelData);
};

export const getCellValue = (workbook: WorkBook, sheetName: string, cell: string): string | undefined => {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    console.error(`Sheet ${sheetName} not found in workbook`);
    return undefined
  }

  const cellValue = sheet[cell];
  if (!cellValue) {
    console.error(`Cell ${cell} not found in sheet ${sheetName}`);
    return undefined
  }

  return cellValue.v;
}
