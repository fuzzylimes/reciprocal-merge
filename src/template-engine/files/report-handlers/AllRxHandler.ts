import { WorkBook } from "xlsx";
import { ReportSheets } from "../ReportFile";
import { BaseReportHandler } from "./BaseHandler";

interface AllRxValues { }

export class AllRxHandler extends BaseReportHandler {
  private _allRxCalculated = false;
  private _allRxValues: Partial<AllRxValues> = {};

  constructor(_workbook: WorkBook) {
    super(_workbook, ReportSheets.spatial);
  }

  calculateAllRxValues() {
    if (this._allRxCalculated) return;

    this._allRxCalculated = true;
  }

}
