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

  // Static property - shared across ALL instances
  static aigData: Record<string, Partial<{
    highpct: number,
    highmed: number,
    lowmed: number,
    per: number,
    month: number,
    times: number,
  }>> = {
      aig1: {},
      aig2: {},
      aig3: {},
      aig4: {},
      aig5: {},
      aig6: {},
      aig7: {},
      aig8: {},
      aig9: {},
      aig10: {},
      aig11: {},
      aig12: {},
      aig13: {},
      aig14: {},
      aig15: {},
      aig16: {},
      aig17: {},
      aig18: {},
      aig19: {},
      aig20: {},
    };

  constructor(outData: WorkBook, report: WorkBook, calculations: TableData, practitioners: WorkBook, sheet: string, headers: string[]) {
    this.outData = outData;
    this.report = report;
    this.calculations = calculations;
    this.practitioners = practitioners;
    this.sheet = sheet;
    this.headers = headers;
  }

  async build() {
    console.log(this.sheet, JSON.stringify(this.data));
    const commonWorksheet = utils.aoa_to_sheet([this.headers, ...this.data]);
    utils.book_append_sheet(this.outData, commonWorksheet, this.sheet);
  }
}
