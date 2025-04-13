import { WorkBook } from "xlsx";
import { ReportSheets } from "../ReportFile";
import { BaseReportHandler } from "./BaseHandler";
import { medSheet } from "../../../utils/sheets";

interface MedValues {
  medData: medSheet[];
  highMedData: medSheet[];
}

export class MedHandler extends BaseReportHandler<medSheet> {
  private _medCalculated = false;
  private _medValues: Partial<MedValues> = {};

  constructor(_workbook: WorkBook) {
    super(_workbook, ReportSheets.medWatch);
  }

  calculateMedValues() {
    if (this._medCalculated) return;

    const rows = this.getAllRows({ blankrows: true });
    const cleaned = rows.filter(r => r["DEA#"]);
    const highmedRows = cleaned.filter(r => Number(r["Daily M.E.D per Prescription"]) > 120)
    this._medValues.medData = cleaned;
    this._medValues.highMedData = highmedRows;

    this._medCalculated = true;
  }

  get medData(): medSheet[] {
    this.calculateMedValues();
    return this._medValues.medData || [];
  }

  get highMedData(): medSheet[] {
    this.calculateMedValues();
    return this._medValues.highMedData || [];
  }

}
