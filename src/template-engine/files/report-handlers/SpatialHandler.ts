import { WorkBook } from "xlsx";
import { BaseReportHandler } from "./BaseHandler";
import { ReportSheets } from "../ReportFile";
import { toDecimalPercent } from "../../../utils/format";

const Top10Columns = ['C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
const RxDistanceColumns = ['E', 'G'];

interface SpatialValues {
  top10Distances: Top10Distance[];
  pharmToPhys: Partial<SpatialDistances>;
  pharmToPat: Partial<SpatialDistances>;
  physToPat: Partial<SpatialDistances>;
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

  constructor(_workbook: WorkBook) {
    super(_workbook, ReportSheets.spatial);
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
      const sum = v.slice(2, 8).reduce((partialSum: number, a) => partialSum + Number(a), 0);
      const isCounted = !!sum;
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
    const pharmToPhysColumns = this.getRowsAsColumns(36, 42, RxDistanceColumns, { header: "A" });
    const pharmToPhys = this.calculateDistanceColumn(pharmToPhysColumns);
    this._spatialValues.pharmToPhys = pharmToPhys;

    const pharmToPatColumns = this.getRowsAsColumns(49, 55, RxDistanceColumns, { header: "A" });
    const pharmToPat = this.calculateDistanceColumn(pharmToPatColumns);
    this._spatialValues.pharmToPat = pharmToPat;

    const physToPatColumns = this.getRowsAsColumns(62, 68, RxDistanceColumns, { header: "A" });
    const physToPat = this.calculateDistanceColumn(physToPatColumns);
    this._spatialValues.physToPat = physToPat;

    this._spatialCalculated = true;
  }

  private calculateDistanceColumn(columns: Map<string, unknown[]>): Partial<SpatialDistances> {
    const sd: Partial<SpatialDistances> = {};
    for (const i of [1, 2, 3, 4, 5, 6]) {
      sd[i as keyof SpatialDistances] = {
        csRxPercent: toDecimalPercent(columns.get('E')?.[i - 1]),
        nonCsRxPercent: toDecimalPercent(columns.get('G')?.[i - 1])
      }
    }

    return sd;
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

  get pharmToPat(): Partial<SpatialDistances> {
    this.calculateSpatialValues();
    return this._spatialValues.pharmToPat || {};
  }

  get physToPat(): Partial<SpatialDistances> {
    this.calculateSpatialValues();
    return this._spatialValues.physToPat || {};
  }

}
