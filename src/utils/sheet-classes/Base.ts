import { WorkBook, utils } from 'xlsx';
import { TableData } from '../word';

export class Base {
  outData: WorkBook;
  report: WorkBook;
  calculations: TableData;
  practitioners: WorkBook;
  headers: string[] = [];
  data: unknown[][] = [[]];
  sheet: string;
  aigPcts: Record<string, number> = {};

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
