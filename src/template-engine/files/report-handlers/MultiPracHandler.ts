import { WorkBook } from "xlsx";
import { ReportSheets } from "../ReportFile";
import { BaseReportHandler } from "./BaseHandler";

interface MultiPracValues { }

export class MultiPracHandler extends BaseReportHandler {
  private _multiPracCalculated = false;
  private _multiPracValues: Partial<MultiPracValues> = {};

  constructor(_workbook: WorkBook) {
    super(_workbook, ReportSheets.spatial);
  }

  calculateMultiPracValues() {
    if (this._multiPracCalculated) return;

    this._multiPracCalculated = true;
  }

}
