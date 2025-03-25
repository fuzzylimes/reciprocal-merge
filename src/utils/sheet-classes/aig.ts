import { utils, WorkBook } from "xlsx";
import { TableData, getCellValue as getWordCellValue } from "../word";
import { Base } from "./Base";
import { aigLookup, applyOperation, ReportSheets as rs } from '../sheets';
import { row } from "./common";

export class aig extends Base {
  aigNum: number = 0;
  aigDea: string[] = [];

  constructor(outData: WorkBook, report: WorkBook, calculations: TableData, practitioners: WorkBook, sheetNumber: number) {
    super(outData, report, calculations, practitioners, `aig${sheetNumber}`);
    this.aigNum = sheetNumber;
  }

  async name() {
    this.headers.push('Name');
  }

  async specialty() {
    this.headers.push('Specialty');
  }

  async practiceLocation() {
    this.headers.push('PracticeLocation');
  }

  async dea() {
    this.headers.push('DEA');
    const sheet = this.report.Sheets[rs.csrx];
    const rows = utils.sheet_to_json<row>(sheet, { header: "A", blankrows: true })?.slice(1);
    if (!rows) {
      this.data[0].push('');
      return;
    }
    const aigDetails = aigLookup[this.aigNum];
    // Fix this, as it's only for alprazolam
    let drugRows: row[] = [];
    if (aigDetails.names && aigDetails.names.length > 0 && !aigDetails.family) {
      drugRows = rows.filter(row => (aigDetails.names ?? []).some(word => String(row.I).toLowerCase().includes(word.toLowerCase())));
    } else if (aigDetails.family && !aigDetails.names) {
      // TODO
    } else if (aigDetails.names && aigDetails.family) {
      // TODO
    }
    const overRows = drugRows.filter(row => applyOperation(Number(row.F), aigDetails));
    const ratio = overRows.length / drugRows.length * 100;
    // Set the values to be used back over in common
    this.aigPcts[`aig${this.aigNum}`] = ratio;

    // Multiple checks to get the DEA numbers. First check is to pull back value from the calculations sheet and see if it's > 300
    const duValue = getWordCellValue(this.calculations, 'B19');
    if (Number(duValue) > 300) {
      // TODO
    } else {
      // Otherwise, we need to do some other BS....
    }

  }

  async state() {
    this.headers.push('State');
  }

  async numCS() {
    this.headers.push('numCS');
  }

  async totalRx() {
    this.headers.push('totalRx');
  }

  async csp() {
    this.headers.push('CSP');
  }

  async csCash() {
    this.headers.push('CSCash');
  }

  async discipline() {
    this.headers.push('Discipline');
  }

  async miles() {
    this.headers.push('Miles');
  }

  async numpt() {
    this.headers.push('numpt');
  }

  static buildAll(outData: WorkBook, report: WorkBook, calculations: TableData, practitioners: WorkBook) {
    const sheets: aig[] = [];

    for (let i = 1; i <= 20; i++) {
      sheets.push(new aig(outData, report, calculations, practitioners, i));
    }

    return sheets;
  }

  async build() {
    await this.name();
    await this.specialty();
    await this.practiceLocation();
    await this.dea();
    await this.state();
    await this.numCS();
    await this.totalRx();
    await this.csp();
    await this.csCash();
    await this.discipline();
    await this.miles();
    await this.numpt();

    await super.build();
  }
}