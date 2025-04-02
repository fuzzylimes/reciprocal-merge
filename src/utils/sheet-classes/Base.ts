import { WorkBook, utils } from 'xlsx';
import { TableData } from '../word';
import { aigReference, aigTracking } from '../aig-helper';

export class Base {
  outData: WorkBook;
  headers: string[] = [];
  data: unknown[][] = [[]];
  sheet: string;
  // Static properties - shared across ALL instances
  static report: WorkBook;
  static calculations: TableData;
  static prevCalculations: TableData;
  static practitioners: WorkBook;
  static top10Count: number = 0;
  static top10dea: string[] = [];
  static aigData: Record<aigReference, Partial<aigTracking>> = Object.fromEntries(
    Object.values(aigReference).map(key => [key, {}])
  ) as Record<aigReference, Partial<aigTracking>>;

  constructor(outData: WorkBook, sheet: string, headers: string[]) {
    this.outData = outData;
    this.sheet = sheet;
    this.headers = headers;
  }

  async build() {
    const commonWorksheet = utils.aoa_to_sheet([this.headers, ...this.data]);
    utils.book_append_sheet(this.outData, commonWorksheet, this.sheet);
  }
}
