import { Sheet2JSONOpts, utils, WorkBook, WorkSheet } from "xlsx";
import { ReportSheets } from "../ReportFile";
import { row } from "../../../utils/sheets";

export class BaseReportHandler<T = row> {
  _sheet: WorkSheet;
  private _cachedRows: T[] | null = null;

  constructor(private readonly _workbook: WorkBook, sheet: ReportSheets) {
    this._sheet = this._workbook.Sheets[sheet];
  }

  getCellValue(cellRef: string): string | undefined {
    const cell = this._sheet[cellRef];
    return cell ? String(cell.v) : undefined;
  }

  getCellNumber(cellRef: string) {
    const v = Number(this.getCellValue(cellRef));
    return v ?? 0;
  }

  getCellPercent(cellRef: string) {
    const v = this.getCellNumber(cellRef);
    return Math.round(v * 100) / 100
  }

  getAllRows(opts?: Sheet2JSONOpts): T[] {
    // Return cached rows if available and no special options provided
    if (this._cachedRows) {
      return this._cachedRows;
    }

    // Parse the sheet
    const result = utils.sheet_to_json<T>(this._sheet, opts) || [];

    // Cache the result
    this._cachedRows = result;

    return result;
  }

  getRows(start: number, end: number, opts?: Sheet2JSONOpts): row[] {
    return utils.sheet_to_json<row>(this._sheet, opts)?.slice(start, end) ?? [];
  }

  getRowsAsColumns(start: number, end: number, cols: string[], opts?: Sheet2JSONOpts) {
    const rows = this.getRows(start, end, opts);
    const colValues: Map<string, unknown[]> = new Map();

    // Initialize the column map
    for (const col of cols) {
      colValues.set(col, []);
    }

    // Iterate and populate each of the columns
    for (const row of rows) {
      for (const col of cols) {
        colValues.get(col)!.push(row[col]);
      }
    }

    return colValues;
  }

  // Optional method to clear the cache if needed
  clearCache() {
    this._cachedRows = null;
  }
}
