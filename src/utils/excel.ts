import { readFile, writeFile } from '@tauri-apps/plugin-fs';
import { WorkBook, WorkSheet, read, utils, write } from 'xlsx';
import { row } from './sheet-classes/common';

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

  // return value off of cell object
  return cellValue.v;
}

export const sumColumn = (sheet: WorkSheet, rStart: number, rEnd: number, col: string): number => {
  const rows = utils.sheet_to_json<row>(sheet, { header: "A", blankrows: true })?.slice(rStart, rEnd);
  if (!rows) {
    return 0
  }

  let sum = 0;
  for (const row of rows) {
    sum += Number(row[col]) || 0;
  }
  return sum;
}