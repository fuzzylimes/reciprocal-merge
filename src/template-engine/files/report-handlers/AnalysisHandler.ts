import { WorkBook } from "xlsx";
import { ReportSheets } from "../ReportFile";
import { BaseReportHandler } from "./BaseHandler";

interface AnalysisValues {
  totalCsNum: number;
  top10cs: TopCs[];
  top10rx: TopRx[];
}

interface TopCs {
  totalCsRx: number; // K
  totalRx: number; // L
  percentCsPaid: number; // O
}

interface TopRx {
  number: number;
  drug: string;
  doses: number;
}

/**
 * Handler for all data from the Analysis sheet
 */
export class AnalysisHandler extends BaseReportHandler {
  private _analysisCalculated = false;
  private _top10csCalculated = false;
  private _top10rxCalculated = false;
  private _analysisValues: Partial<AnalysisValues> = {};

  constructor(_workbook: WorkBook) {
    super(_workbook, ReportSheets.analysis);
  }

  private calculateAnalysisValues(): void {
    if (this._analysisCalculated) return;
    // Total CS Rx value
    this._analysisValues.totalCsNum = this.getCellNumber('J62');
  }

  // Grabs the values out of Top 10 Practitioner CS
  private calculateTop10cs() {
    if (this._top10csCalculated) return;

    const topCS: TopCs[] = [];
    for (let i = 0; i < 10; i++) {
      const totalCsRx = this.getCellNumber(`K${7 + i}`);
      const totalRx = this.getCellNumber(`L${7 + i}`)
      const percentCsPaid = this.getCellNumber(`O${7 + i}`);

      topCS.push({ totalCsRx, totalRx, percentCsPaid })
    }

    this._analysisValues.top10cs = topCS;

    this._top10csCalculated = true;
  }

  // Grabs the values out of Top 10 Rx's filled
  private calculateTop10rx() {
    if (this._top10rxCalculated) return;

    const top10: TopRx[] = [];
    for (let i = 0; i < 10; i++) {
      const row = 19 + i;
      // If there's in indicator in the column to the left, then we know we need to handle it.
      if (this.getCellValue(`A${row}`)) {
        const number = i + 1;
        const drug = this.getCellValue(`B${row}`) ?? '';
        const doses = this.getCellNumber(`C${row}`);

        top10.push({ number, drug, doses });
      }
    }

    this._analysisValues.top10rx = top10;

    this._top10rxCalculated = true;
  }


  // Public getters for summary properties
  get totalCsNum(): number {
    this.calculateAnalysisValues();
    return this._analysisValues.totalCsNum || 0;
  }

  get top10cs(): TopCs[] {
    this.calculateTop10cs();
    return this._analysisValues.top10cs || [];
  }

  get top10rx(): TopRx[] {
    this.calculateTop10rx();
    return this._analysisValues.top10rx || [];
  }
}
