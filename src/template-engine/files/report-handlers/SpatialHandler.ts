import { WorkBook } from "xlsx";
import { BaseReportHandler } from "./BaseHandler";
import { ReportSheets } from "../ReportFile";
import { toDecimalPercent } from "../../../utils/format";

const Top10Columns = ['C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
const RxDistanceColumns = ['E', 'G'];

// TODO: Redo these so that they're set to the calculated value objects, or something like it...

interface SpatialValues {
  top10Distances: Top10Distance[];
  pharmToPhys: SpatialDistances;
  pharmToPhysCsSum: number;
  pharmToPhysSum: number;
  pharmToPat: SpatialDistances;
  pharmToPatCsSum: number;
  pharmToPatSum: number;
  physToPat: SpatialDistances;
  physToPatCsSum: number;
  physToPatSum: number;
  spatialDeas: string[];
}

interface Top10Distance {
  dea: string;
  isCounted: boolean;
  totalApplicable: number;
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
  6: number;
}

interface SpatialDistances {
  1: SpatialDistance;
  2: SpatialDistance;
  3: SpatialDistance;
  4: SpatialDistance;
  5: SpatialDistance;
  6: SpatialDistance;
}

interface SpatialDistance {
  csRxPercent: number;
  nonCsRxPercent: number;
}

export class SpatialHandler extends BaseReportHandler {
  private _spatialCalculated = false;
  private _spatialValues: Partial<SpatialValues> = {};
  private _startBand: number;
  private _endBand: number;

  constructor(_workbook: WorkBook, start: number = 1, end: number = 6) {
    super(_workbook, ReportSheets.spatial);
    this._startBand = start;
    this._endBand = end;
  }

  private calculateSpatialValues(): void {
    if (this._spatialCalculated) return;

    // Build out the top10 distances and spatial DEA ids
    const top10d: Top10Distance[] = [];
    const spatialDeas: string[] = [];
    const top10columns = this.getRowsAsColumns(1, 10, Top10Columns, { header: "A", blankrows: true });
    for (const k of Top10Columns) {
      const v = top10columns.get(k) ?? [];
      const dea = String(v[0]);
      const start = 2 + this._startBand - 1;
      const end = 2 + this._endBand;
      const s = v.slice(start, end);
      const sum = s.reduce((partialSum: number, a) => partialSum + Number(a), 0);
      const isCounted = sum > 0;
      top10d.push({
        dea,
        totalApplicable: sum,
        isCounted,
        1: Number(v[2]),
        2: Number(v[3]),
        3: Number(v[4]),
        4: Number(v[5]),
        5: Number(v[6]),
        6: Number(v[7]),
      });

      if (isCounted) {
        spatialDeas.push(dea)
      }
    }
    this._spatialValues.top10Distances = top10d;
    this._spatialValues.spatialDeas = spatialDeas;

    // Collect spatial distances
    const pharmToPhysColumns = this.getRowsAsColumns(35, 41, RxDistanceColumns, { header: "A", blankrows: true });
    const { sd: pharmToPhys, csRxPercentSum: pharmToPhysCsSum, nonCsRxPercentSum: pharmToPhysSum } = this.calculateDistanceColumn(pharmToPhysColumns);
    this._spatialValues.pharmToPhys = pharmToPhys;
    this._spatialValues.pharmToPhysCsSum = toDecimalPercent(pharmToPhysCsSum);
    this._spatialValues.pharmToPhysSum = toDecimalPercent(pharmToPhysSum);

    const pharmToPatColumns = this.getRowsAsColumns(48, 54, RxDistanceColumns, { header: "A", blankrows: true });
    const { sd: pharmToPat, csRxPercentSum: pharmToPatCsSum, nonCsRxPercentSum: pharmToPatSum } = this.calculateDistanceColumn(pharmToPatColumns);
    this._spatialValues.pharmToPat = pharmToPat;
    this._spatialValues.pharmToPatCsSum = toDecimalPercent(pharmToPatCsSum);
    this._spatialValues.pharmToPatSum = toDecimalPercent(pharmToPatSum);

    const physToPatColumns = this.getRowsAsColumns(61, 67, RxDistanceColumns, { header: "A", blankrows: true });
    const { sd: physToPat, csRxPercentSum: physToPatCsSum, nonCsRxPercentSum: physToPatSum } = this.calculateDistanceColumn(physToPatColumns);
    this._spatialValues.physToPat = physToPat;
    this._spatialValues.physToPatCsSum = toDecimalPercent(physToPatCsSum);
    this._spatialValues.physToPatSum = toDecimalPercent(physToPatSum);

    this._spatialCalculated = true;
  }

  private calculateDistanceColumn(columns: Map<string, unknown[]>) {
    const sd: SpatialDistances = {} as SpatialDistances;
    let csRxPercentSum = 0;
    let nonCsRxPercentSum = 0;
    for (const i of [1, 2, 3, 4, 5, 6]) {
      const csRxPercent = columns.get('E')?.[i - 1];
      const nonCsRxPercent = columns.get('G')?.[i - 1];
      sd[i as keyof SpatialDistances] = {
        csRxPercent: Number(csRxPercent),
        nonCsRxPercent: Number(nonCsRxPercent),
      }
      if (i >= this._startBand && i <= this._endBand) {
        csRxPercentSum += (Number(csRxPercent) || 0);
        nonCsRxPercentSum += (Number(nonCsRxPercent) || 0);
      }
    }

    return { sd, csRxPercentSum, nonCsRxPercentSum };
  }

  get top10Dea(): string[] {
    this.calculateSpatialValues();
    return this._spatialValues.top10Distances?.map(d => d.dea) || [];
  }

  get spatialDea(): string[] {
    this.calculateSpatialValues();
    return this._spatialValues.spatialDeas || [];
  }

  get spatialCount(): number {
    this.calculateSpatialValues();
    return this._spatialValues.spatialDeas?.length || 0;
  }

  get top10Distances(): Top10Distance[] {
    this.calculateSpatialValues();
    return this._spatialValues.top10Distances || [];
  }

  get pharmToPhys(): Partial<SpatialDistances> {
    this.calculateSpatialValues();
    return this._spatialValues.pharmToPhys || {};
  }

  get pharmToPhysCsSum(): number {
    this.calculateSpatialValues();
    return this._spatialValues.pharmToPhysCsSum || 0;
  }

  get pharmToPhysSum(): number {
    this.calculateSpatialValues();
    return this._spatialValues.pharmToPhysSum || 0;
  }

  get pharmToPat(): Partial<SpatialDistances> {
    this.calculateSpatialValues();
    return this._spatialValues.pharmToPat || {};
  }

  get pharmToPatCsSum(): number {
    this.calculateSpatialValues();
    return this._spatialValues.pharmToPatCsSum || 0;
  }

  get pharmToPatSum(): number {
    this.calculateSpatialValues();
    return this._spatialValues.pharmToPatSum || 0;
  }

  get physToPat(): Partial<SpatialDistances> {
    this.calculateSpatialValues();
    return this._spatialValues.physToPat || {};
  }

  get physToPatCsSum(): number {
    this.calculateSpatialValues();
    return this._spatialValues.physToPatCsSum || 0;
  }

  get physToPatSum(): number {
    this.calculateSpatialValues();
    return this._spatialValues.physToPatSum || 0;
  }

}
