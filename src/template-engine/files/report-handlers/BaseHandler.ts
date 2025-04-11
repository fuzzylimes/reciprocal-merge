import { WorkBook, WorkSheet } from "xlsx";
import { ReportSheets } from "../ReportFile";

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

}
