import { utils, WorkBook, WorkSheet } from "xlsx";
import { ReportSheets } from "../../../utils/sheets";

export class SheetManager {
  private _workbook: WorkBook;
  private _loadedSheets: Map<ReportSheets, WorkSheet> = new Map();
  private _jsonCache: Map<ReportSheets, unknown[]> = new Map();

  constructor(workbook: WorkBook) {
    this._workbook = workbook;
  }

  getSheet(sheetName: ReportSheets): WorkSheet {
    if (!this._loadedSheets.has(sheetName)) {
      this._loadedSheets.set(sheetName, this._workbook.Sheets[sheetName]);
    }
    return this._loadedSheets.get(sheetName)!;
  }

  getSheetAsJson<T>(sheetName: ReportSheets): T[] {
    if (!this._jsonCache.has(sheetName)) {
      const sheet = this.getSheet(sheetName);
      this._jsonCache.set(sheetName, utils.sheet_to_json<T>(sheet));
    }
    return this._jsonCache.get(sheetName) as T[];
  }
}
