import { WorkBook } from "xlsx";
import { ReportSheets } from "../ReportFile";
import { BaseReportHandler } from "./BaseHandler";

interface MedValues { }

export class MedHandler extends BaseReportHandler {
  private _medCalculated = false;
  private _medValues: Partial<MedValues> = {};

  constructor(_workbook: WorkBook) {
    super(_workbook, ReportSheets.spatial);
  }

  calculateMedValues() {
    if (this._medCalculated) return;

    this._medCalculated = true;
  }

}
