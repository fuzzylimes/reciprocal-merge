import { utils, WorkBook } from "xlsx";
import { TableData, getCellValue as getWordCellValue } from "../word";
import { Base } from "./Base";
import { ReportSheets as rs } from '../sheets';
import { row } from "./common";
import { findPractitionerByDea, Practitioner } from "../excel";

interface IaigDef {
  names?: string[];
  family?: string;
  operation: string;
  amount: number;
}

type aigRecord = {
  Name: string;
  Specialty: string;
  PracticeLocation: string;
  DEA: string;
  State: string;
  numCS: string;
  totalRx: string;
  CSP: string;
  CSCash: string;
  Discipline: string;
  Miles: string;
  numpt: string;
}

const aigLookup: Record<number, IaigDef> = {
  1: {
    names: ['alprazolam', 'xanax'],
    operation: '>',
    amount: 4
  },
}

const operationMap: Record<string, (value: number, threshold: number) => boolean> = {
  '>': (value, threshold) => value > threshold,
  '<': (value, threshold) => value < threshold,
  '>=': (value, threshold) => value >= threshold,
  '<=': (value, threshold) => value <= threshold,
  '==': (value, threshold) => value === threshold,
  '===': (value, threshold) => value === threshold,
  '!=': (value, threshold) => value !== threshold,
  '!==': (value, threshold) => value !== threshold,
};

// Function to apply the operation
const applyOperation = (value: number, entry: IaigDef): boolean => {
  const operationFunc = operationMap[entry.operation];
  if (!operationFunc) {
    throw new Error(`Unknown operation: ${entry.operation}`);
  }
  return operationFunc(value, entry.amount);
}

export class aig extends Base {
  aigNum: number = 0;
  aigDea: string[] = [];

  constructor(outData: WorkBook, report: WorkBook, calculations: TableData, practitioners: WorkBook, sheetNumber: number) {
    super(outData, report, calculations, practitioners, `aig${sheetNumber}`);
    this.aigNum = sheetNumber;
    this.headers = ["Name", "Specialty", "PracticeLocation", "DEA", "State", "numCS", "totalRx", "CSP", "CSCash", "Discipline", "Miles", "numpt"];
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
      // Need to sum all values in overRows in order to get "top 5" prescribers
      const prescribers: Record<string, number> = {};
      for (const row of drugRows) {
        const p = String(row.K);
        const v = Number(row.D);

        if (prescribers[p]) {
          prescribers[p] += v;
        } else {
          prescribers[p] = v;
        }
      }

      const top5Prescribers = Object.entries(prescribers)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
      
      this.aigDea = top5Prescribers.map(p => p[0])

      // Fetch the top5 details from practitioner file
      const practitioners: Practitioner[] = [];
      for (const dea of this.aigDea) {
        const p = findPractitionerByDea(this.practitioners, dea);
        if (!p) throw Error('Practitioner does not exist');
        practitioners.push(p);
      }

      // pull in all Rx tab
      const allrx = this.report.Sheets[rs.allrx];
      const allrxRows = utils.sheet_to_json<row>(sheet, { header: "A"})?.slice(1);

      // filter allrxRows by the dea number (J)
      // filtered length = totalRx
      // count non-null values in R = numCS
      // CSP = numCS / totalRx (%) - only include these if CSP > 20%
      // If CSP > 20%...
      // another filtered list of non-null values in R
      // count non-null values in F / numCS = CSCash - only include if > 20%

      // Miles are distance from practioner address to pharmacy

    } else if (ratio > 0) {
      // get the unique dea numbers from overRows
      // do the same thing as above, only using overRows

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
    await this.dea();
    await this.name();
    await this.specialty();
    await this.practiceLocation();
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
