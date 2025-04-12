import { WorkBook } from "xlsx";
import { ReportSheets } from "../ReportFile";
import { BaseReportHandler } from "./BaseHandler";
import { multipracSheet } from "../../../utils/sheets";

interface MultiPracValues {
  uniquePats: Set<number>;
 }

export class MultiPracHandler extends BaseReportHandler<multipracSheet> {
  private _multiPracCalculated = false;
  private _multiPracValues: Partial<MultiPracValues> = {};

  constructor(_workbook: WorkBook) {
    super(_workbook, ReportSheets.spatial);
  }

  calculateMultiPracValues() {
    if (this._multiPracCalculated) return;

    const uniquePats = new Set<number>();
    const rows = this.getAllRows();
    for (const row of rows) {
      const pat = row["Patient ID"];
      uniquePats.add(pat);
    }
    this._multiPracValues.uniquePats = uniquePats;

    this._multiPracCalculated = true;
  }

  get uniquePats(): Set<number> {
    this.calculateMultiPracValues();
    return this._multiPracValues.uniquePats || new Set();
  }

}
