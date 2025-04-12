import { WorkBook } from "xlsx";
import { ReportSheets } from "../ReportFile";
import { BaseReportHandler } from "./BaseHandler";

interface CsRxValues { }

export class CsRxHandler extends BaseReportHandler {
  private _csRxCalculated = false;
  private _csRxValues: Partial<CsRxValues> = {};

  constructor(_workbook: WorkBook) {
    super(_workbook, ReportSheets.spatial);
  }

  calculateCsRxValues() {
    if (this._csRxCalculated) return;

    this._csRxCalculated = true;
  }

}
