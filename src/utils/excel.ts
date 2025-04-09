import { WorkBook, WorkSheet, read, utils, write } from 'xlsx';
import { row } from './sheet-classes/common';
import { pracRefSheet } from './sheets';
import { saveFile } from './file-system-service';

/**
 * Loads and parses an Excel file
 * @param excelContent Excel file content
 * @returns Promise resolving to the parsed Excel workbook
 */
export const loadExcelFile = async (excelContent: Uint8Array): Promise<WorkBook> => {
  const workbook = read(excelContent, {
    type: 'array',
    cellDates: true,  // Convert date cells to JS dates
    cellNF: true,     // Keep number formats
  });

  return workbook;
};

/**
 * Saves a workbook to an Excel file using the unified file system service
 * @param workbook The workbook to save
 * @param fileName Suggested file name or path to save to
 * @returns Promise resolving to a boolean indicating success
 */
export const saveExcelFile = async (workbook: WorkBook, fileName: string): Promise<boolean> => {
  // Convert workbook to binary format
  const excelData = write(workbook, {
    bookType: 'xlsx',
    type: 'array'
  });

  // Convert the output to Uint8Array if it isn't already
  const binaryData = excelData instanceof Uint8Array
    ? excelData
    : new Uint8Array(excelData);

  // Use the unified file system service to save the file
  return await saveFile(
    binaryData,
    fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`,
    {
      extensions: ['xlsx'],
      description: 'Excel Files'
    }
  );
}

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

export const getCellNumericValue = (workbook: WorkBook, sheetName: string, cell: string) => {
  const r = getCellValue(workbook, sheetName, cell);
  return r ? Number(r) : undefined;
}

/**
 * Note: this doesn't actually work with the free version.
 * @param workbook 
 * @param sheetName 
 * @param cell 
 * @returns 
 */
export const doesCellHaveColor = (workbook: WorkBook, sheetName: string, cell: string): boolean => {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    console.error(`Sheet ${sheetName} not found in workbook`);
    return false;
  }

  const cellValue = sheet[cell];
  if (!cellValue) {
    console.error(`Cell ${cell} not found in sheet ${sheetName}`);
    return false;
  }

  // Check if the cell has style information with a fill
  if (cellValue.s && cellValue.s.fill) {
    // Check if there's a fill pattern type that's not 'none'
    if (cellValue.s.fill.patternType && cellValue.s.fill.patternType !== 'none') {
      return true;
    }

    // Check foreground color (if available)
    if (cellValue.s.fill.fgColor) {
      // If RGB or theme is specified, it likely has a color
      if (cellValue.s.fill.fgColor.rgb && cellValue.s.fill.fgColor.rgb !== 'FFFFFF') {
        return true;
      }
      if (cellValue.s.fill.fgColor.theme !== undefined) {
        return true;
      }
    }

    // Check background color (if available)
    if (cellValue.s.fill.bgColor) {
      // If RGB or theme is specified, it likely has a color
      if (cellValue.s.fill.bgColor.rgb && cellValue.s.fill.bgColor.rgb !== 'FFFFFF') {
        return true;
      }
      if (cellValue.s.fill.bgColor.theme !== undefined) {
        return true;
      }
    }
  }

  return false;
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

// PRACTITIONER
export type Practitioner = {
  Practitioner: string;
  Specialty: string;
  PracticeLocation: string;
  DEA: string;
  State: string;
  Discipline: string | null;
  Note: string | null;
  Date: Date | null;
}

/**
 * 
 * @param sheet The practitioner Worksheet
 * @param dea The practitioner id to search for
 * @returns Practitioner | undefined
 * @throws Error if practitioner doesn't exist in DB
 */
export const findPractitionerByDea = (sheet: WorkSheet, dea: string): Practitioner => {
  const rows = utils.sheet_to_json<pracRefSheet>(sheet, { blankrows: true });
  if (!rows) {
    throw Error(`Practitioner DB is empty.`)
  }

  // We're assuming that there can't be duplicate records, and if they are, then they're the same.
  // It's not the tools responsibility to manage the practioner file.
  const match = rows.find(r => r.DEA && String(r.DEA) === dea);

  if (!match) throw Error(`Practitioner ${dea} does not exist in practitioner DB.`);

  const prac: Practitioner = {
    Practitioner: String(match.Practitioner.split(' (')[0] ?? ''),
    Specialty: String(match.Specialty ?? ''),
    PracticeLocation: String(match.PracticeLocation ?? ''),
    DEA: dea,
    State: String(match.State ?? ''),
    Discipline: match.Discipline ? String(match.Discipline) : null,
    Note: match['PC Note - Pharm'] ? String(match['PC Note - Pharm']) : null,
    Date: match['PC Notes Date'] ? match['PC Notes Date'] : null
  }

  return prac;
}
