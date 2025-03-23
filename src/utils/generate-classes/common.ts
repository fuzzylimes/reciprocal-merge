import { WorkBook } from 'xlsx';
import { TableData } from '../word';
import { IGenerate } from '../generate';

export class common implements IGenerate {
  outData: WorkBook;
  report: WorkBook;
  calculations: TableData;
  practitioners: WorkBook;

  // Private constructor that takes both path and data
  constructor(outData: WorkBook, report: WorkBook, calculations: TableData, practitioners: WorkBook) {
    this.outData = outData;
    this.report = report;
    this.calculations = calculations;
    this.practitioners = practitioners;
  }

  async build() {

  }
}
