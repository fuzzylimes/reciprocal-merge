import { WorkBook } from "xlsx";
import { ReportSheets } from "../ReportFile";
import { BaseReportHandler } from "./BaseHandler";

type trinitySheet = {
  'Patient ID': number;
  'Family': string;
}

interface TrinityValues {
  drugFamilyToPatientsMapping: Record<string, Record<number, boolean>>;
}

export class TrinityHandler extends BaseReportHandler<trinitySheet> {
  private _trinityCalculated = false;
  private _trinityValues: Partial<TrinityValues> = {};

  constructor(_workbook: WorkBook) {
    super(_workbook, ReportSheets.trinityConcerns);
  }

  calculateTrinityValues() {
    if (this._trinityCalculated) return;

    const rows = this.getAllRows();

    const mapping: Record<string, Record<number, boolean>> = {};

    for (const row of rows) {
      const family = row.Family.toLowerCase();
      const patientId = row['Patient ID'];

      if (mapping[family]) {
        if (!mapping[family][patientId]) {
          mapping[family][patientId] = true;
        }
      } else {
        mapping[family] = { [patientId]: true };
      }
    }

    this._trinityValues.drugFamilyToPatientsMapping = mapping;
    this._trinityCalculated = true;
  }

  get trinityMapping(): Record<string, Record<number, boolean>> {
    this.calculateTrinityValues();
    return this._trinityValues.drugFamilyToPatientsMapping || {};
  }

}
