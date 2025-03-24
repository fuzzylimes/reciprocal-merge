import { WorkBook, utils } from 'xlsx';
import { TableData } from '../word';

export class Base {
  outData: WorkBook;
  report: WorkBook;
  calculations: TableData;
  practitioners: WorkBook;
  headers: string[] = [];
  data: string[][] = [[]];
  sheet: string;

  constructor(outData: WorkBook, report: WorkBook, calculations: TableData, practitioners: WorkBook, sheet: string) {
    this.outData = outData;
    this.report = report;
    this.calculations = calculations;
    this.practitioners = practitioners;
    this.sheet = sheet;
  }

  async build() {
    const commonWorksheet = utils.aoa_to_sheet([this.headers, ...this.data]);
    utils.book_append_sheet(this.outData, commonWorksheet, this.sheet);
  }
}
