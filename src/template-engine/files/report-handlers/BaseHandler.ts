import { Sheet2JSONOpts, utils, WorkBook, WorkSheet } from "xlsx";
import { ReportSheets } from "../ReportFile";
import { row } from "../../../utils/sheet-classes/common";

export class BaseReportHandler {
  _sheet: WorkSheet;

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

  getRows(start: number, end: number, opts?: Sheet2JSONOpts) {
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

}
