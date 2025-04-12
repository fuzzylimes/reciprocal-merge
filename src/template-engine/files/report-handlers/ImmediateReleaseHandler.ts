import { WorkBook } from "xlsx";
import { ReportSheets } from "../ReportFile";
import { BaseReportHandler } from "./BaseHandler";
import { irSheet } from "../../../utils/sheets";

interface ImmediateReleaseValues { }

export class ImmediateReleaseHandler extends BaseReportHandler<irSheet> {
  private _immediateReleaseCalculated = false;
  private _immediateReleaseValues: Partial<ImmediateReleaseValues> = {};

  constructor(_workbook: WorkBook) {
    super(_workbook, ReportSheets.spatial);
  }

  calculateImmediateReleaseValues() {
    if (this._immediateReleaseCalculated) return;

    this._immediateReleaseCalculated = true;
  }

}
