import { readFile } from '@tauri-apps/plugin-fs';
import PizZip from 'pizzip';

export class TableData {
  /** 
   * @param rows The table as a 2D array of cell values 
   * @param cellMap The same data in a more convenient map format
   */
  constructor(
    private readonly rows: string[][],
    private readonly cellMap: Map<string, string>
  ) { }

  /**
   * Extract table data from a Word document
   * @param filePath Path to the Word document
   * @param tableIndex Index of the table to extract (0 for first table)
   * @returns TableData object containing the table content
   */
  static async fromDocx(filePath: string, tableIndex = 0): Promise<TableData> {
    try {
      // Read the docx file
      const docBuffer = await readFile(filePath);

      // Unzip the docx file
      const zip = new PizZip(docBuffer);

      // Get the main document content
      const contentXml = zip.files['word/document.xml']?.asText();
      if (!contentXml) {
        throw new Error('Could not find word/document.xml in the docx file');
      }

      // Create a DOM parser to parse the XML
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(contentXml, 'text/xml');

      // Find all tables in the document
      const tables = xmlDoc.getElementsByTagName('w:tbl');

      if (tables.length === 0) {
        throw new Error('No tables found in the document');
      }

      if (tableIndex >= tables.length) {
        throw new Error(`Table index ${tableIndex} is out of range. Document has ${tables.length} tables.`);
      }

      // Get the requested table
      const table = tables[tableIndex];

      // Get all rows in the table
      const rows = table.getElementsByTagName('w:tr');
      const tableData: string[][] = [];
      const cellMap = new Map<string, string>();

      // Process each row
      for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
        const row = rows[rowIndex];
        const cells = row.getElementsByTagName('w:tc');
        const rowData: string[] = [];

        // Process each cell in the row
        for (let cellIndex = 0; cellIndex < cells.length; cellIndex++) {
          const cell = cells[cellIndex];
          // Extract text content from paragraphs in the cell
          const paragraphs = cell.getElementsByTagName('w:p');
          let cellText = '';

          for (let p = 0; p < paragraphs.length; p++) {
            const textElements = paragraphs[p].getElementsByTagName('w:t');
            for (let t = 0; t < textElements.length; t++) {
              cellText += textElements[t].textContent || '';
            }
            // Add paragraph break if there are multiple paragraphs
            if (p < paragraphs.length - 1) {
              cellText += '\n';
            }
          }

          rowData.push(cellText);

          // Create Excel-like cell reference (A1, B1, C1, etc.)
          const cellRef = String.fromCharCode(65 + cellIndex) + (rowIndex + 1);
          cellMap.set(cellRef, cellText);
        }

        tableData.push(rowData);
      }

      return new TableData(tableData, cellMap);
    } catch (error) {
      console.error('Error extracting table from docx:', error);
      throw error;
    }
  }

  /**
   * Get a specific cell value by its cell reference (e.g., "A1", "B2")
   * @param cellRef The cell reference (e.g., "A1", "B2")
   * @returns The cell value as a string
   */
  getCellValue(cellRef: string): string | undefined {
    return this.cellMap.get(cellRef);
  }

  /**
   * Get a specific cell value by its row and column indices (0-based)
   * @param rowIndex Row index (0-based)
   * @param colIndex Column index (0-based)
   * @returns The cell value as a string
   */
  getCellByIndex(rowIndex: number, colIndex: number): string | undefined {
    if (rowIndex >= 0 && rowIndex < this.rows.length) {
      const row = this.rows[rowIndex];
      if (colIndex >= 0 && colIndex < row.length) {
        return row[colIndex];
      }
    }
    return undefined;
  }

  /**
   * Find a cell by its content and return its reference
   * @param searchText Text to search for
   * @param exactMatch Whether to require an exact match
   * @returns The cell reference (e.g., "A1") if found, undefined otherwise
   */
  findCellByContent(searchText: string, exactMatch = false): string | undefined {
    for (const [cellRef, content] of this.cellMap.entries()) {
      if (exactMatch ? content === searchText : content.includes(searchText)) {
        return cellRef;
      }
    }
    return undefined;
  }

  /**
   * Get all values from a specific column
   * @param colIndex Column index (0-based)
   * @returns Array of cell values in the column
   */
  getColumnValues(colIndex: number): string[] {
    return this.rows.map(row => row[colIndex] || '');
  }

  /**
   * Get all values from a specific row
   * @param rowIndex Row index (0-based)
   * @returns Array of cell values in the row
   */
  getRowValues(rowIndex: number): string[] {
    return this.rows[rowIndex] || [];
  }

  /**
   * Safely converts a string to a number, handling commas and other formatting
   * @param cellRef The cell reference or value to convert
   * @returns The parsed number or 0 if the input is invalid
   */
  getNumericValue(cellRef: string): number {
    const value = this.cellMap.get(cellRef);
    if (!value) return 0;
    // Remove commas and other non-numeric characters except decimal point and minus sign
    const cleanedValue = value.replace(/[^\d.-]/g, '');
    const parsedValue = parseFloat(cleanedValue);
    return isNaN(parsedValue) ? 0 : parsedValue;
  }

  /**
   * Get a cell value by finding a row where column 0 includes the label,
   * then returning the value from the specified column
   * @param label Text to search for in column 0
   * @param columnIndex Column index to return (default is 1, i.e., column B)
   * @param exactMatch Whether to require an exact match (default false)
   * @returns The cell value as a string, or undefined if not found
   */
  getCellByRowLabel(label: string, columnIndex = 1, exactMatch = false): string | undefined {
    const column0Values = this.getColumnValues(0);

    for (let rowIndex = 0; rowIndex < column0Values.length; rowIndex++) {
      const rowLabel = column0Values[rowIndex];
      if (exactMatch ? rowLabel === label : rowLabel.toLowerCase().includes(label)) {
        return this.getCellByIndex(rowIndex, columnIndex);
      }
    }

    return undefined;
  }

  /**
   * Gets DU and Times values by searching for a row label
   * @param label Text to search for in column 0
   * @param columnIndex Column index to return (default is 1)
   * @param exactMatch Whether to require an exact match (default false)
   * @returns Array containing [DU value, Times value]
   */
  getDuAndTimesByRowLabel(label: string, columnIndex = 1, exactMatch = false): [string | undefined, string | undefined] {
    const column0Values = this.getColumnValues(0);

    for (let rowIndex = 0; rowIndex < column0Values.length; rowIndex++) {
      const rowLabel = column0Values[rowIndex];
      if (exactMatch ? rowLabel === label : rowLabel.toLowerCase().includes(label.toLowerCase())) {
        const du = this.getCellByIndex(rowIndex, columnIndex);
        const times = this.getCellByIndex(rowIndex + 2, columnIndex);
        return [du, times];
      }
    }

    return [undefined, undefined];
  }

  /**
   * Get access to the raw rows data
   */
  getRows(): string[][] {
    return this.rows;
  }

  /**
   * Get access to the raw cell map
   */
  getCellMap(): Map<string, string> {
    return this.cellMap;
  }
}
