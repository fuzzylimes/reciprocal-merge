import { WorkBook } from "xlsx";
import { ReportSheets } from "../ReportFile";
import { BaseReportHandler } from "./BaseHandler";

type irSheet = {
  'Drug Name': string;
  'Patient ID': number;
}

interface ImmediateReleaseValues {
  patToDrugMap: Record<number, Set<string>>;
}

export class ImmediateReleaseHandler extends BaseReportHandler<irSheet> {
  private _immediateReleaseCalculated = false;
  private _immediateReleaseValues: Partial<ImmediateReleaseValues> = {};

  constructor(_workbook: WorkBook) {
    super(_workbook, ReportSheets.immediateRelease);
  }

  calculateImmediateReleaseValues() {
    if (this._immediateReleaseCalculated) return;

    const rows = this.getAllRows({ blankrows: true });
    // Check to see if patientId is associated with more than one unique drug name
    // If it is, it needs to be counted and added to the generated value
    const mapping: Record<number, Set<string>> = {};
    for (const row of rows) {
      if (!row['Drug Name'] || row['Drug Name'] === 'Drug Name') continue;

      const drugName = row['Drug Name'].toLowerCase();
      const patientId = row['Patient ID'];

      if (mapping[patientId]) {
        mapping[patientId].add(drugName);
      } else {
        mapping[patientId] = new Set<string>([drugName]);
      }
    }
    this._immediateReleaseValues.patToDrugMap = mapping;

    this._immediateReleaseCalculated = true;
  }

  get patToDrugMapping(): Record<number, Set<string>> {
    this.calculateImmediateReleaseValues();
    return this._immediateReleaseValues.patToDrugMap || {};
  }

}
