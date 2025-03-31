import { WorkBook, utils } from 'xlsx';
import { TableData } from '../word';
import { aigReference, aigTracking } from '../aig-helper';

export class Base {
  outData: WorkBook;
  report: WorkBook;
  calculations: TableData;
  practitioners: WorkBook;
  headers: string[] = [];
  data: unknown[][] = [[]];
  sheet: string;

  // Static property - shared across ALL instances
  static aigData: Record<aigReference, Partial<aigTracking>> = Object.fromEntries(
    Object.values(aigReference).map(key => [key, {}])
  ) as Record<aigReference, Partial<aigTracking>>;

  constructor(outData: WorkBook, report: WorkBook, calculations: TableData, practitioners: WorkBook, sheet: string, headers: string[]) {
    this.outData = outData;
    this.report = report;
    this.calculations = calculations;
    this.practitioners = practitioners;
    this.sheet = sheet;
    this.headers = headers;
  }

  async build() {
    const commonWorksheet = utils.aoa_to_sheet([this.headers, ...this.data]);
    utils.book_append_sheet(this.outData, commonWorksheet, this.sheet);
  }
}
