import { utils, WorkBook } from "xlsx";
import { TableData, getCellValue as getWordCellValue } from "../word";
import { Base } from "./Base";
import { aigRecord, ReportSheets as rs } from '../sheets';
import { PractitionerSheets as ps } from "../sheets";
import { row } from "./common";
import { findPractitionerByDea } from "../excel";
import { headers } from "../sheets";

interface IaigDef {
  names?: string[];
  family?: string;
  operation: string;
  amount: number;
}

const aigLookup: Record<number, IaigDef> = {
  1: {
    names: ['alprazolam', 'xanax'],
    operation: '>',
    amount: 4
  },
  2: {
    // TODO: This isn't going to work. These won't match.
    names: ['alprazolam 2mg', 'xanax 2mg'],
    operation: '>',
    amount: 4
  },
  3: {
    family: 'amphetamine',
    operation: '>',
    amount: 40
  }
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
  top5: aigRecord[] = [];

  constructor(outData: WorkBook, report: WorkBook, calculations: TableData, practitioners: WorkBook, sheetNumber: number) {
    super(outData, report, calculations, practitioners, `aig${sheetNumber}`, headers.aig);
    this.aigNum = sheetNumber;
  }

  static buildAll(outData: WorkBook, report: WorkBook, calculations: TableData, practitioners: WorkBook) {
    const sheets: aig[] = [];

    for (let i = 1; i <= 1; i++) {
      sheets.push(new aig(outData, report, calculations, practitioners, i));
    }

    return sheets;
  }

  async build() {
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
    const over300 = Number(duValue) > 300;
    // Need to sum all values in overRows in order to get "top 5" prescribers
    const prescribers: Record<string, number> = {};
    for (const row of over300 ? drugRows : overRows) {
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

    const top5 = top5Prescribers.map(p => p[0])

    // pull in all Rx tab
    const allrx = this.report.Sheets[rs.allrx];
    const allrxRows = utils.sheet_to_json<row>(allrx, { header: "A" })?.slice(1);

    // Fetch the top5 details from practitioner file
    for (const dea of top5) {
      const pracWorkSheet = this.practitioners.Sheets[ps.ref];
      const p = findPractitionerByDea(pracWorkSheet, dea);

      // filter allrxRows by the dea number (J)
      const filteredDEA = allrxRows.filter(r => r.J && String(r.J) === dea);
      // filtered length = totalRx
      let totalRx: number | null = filteredDEA.length;
      // count non-null values in R = numCS
      const filteredControls = filteredDEA.filter(r => r.R)
      let numCS: number | null = filteredControls.length;
      // CSP = numCS / totalRx (%) - only include these if CSP > 20%
      let csp: number | null = numCS / totalRx * 100;
      // If CSP > 20%...
      let csCash = null;
      if (csp > 20) {
        // another filtered list of non-null values in R
        const cash = filteredControls.filter(r => r.F);
        // count non-null values in F / numCS = CSCash - only include if > 20%
        csCash = cash.length / numCS * 100;
        if (csCash < 20) {
          csCash = null;
        }
      } else {
        totalRx = null;
        numCS = null;
        csp = null;
      }

      const uniquePatients = new Set(filteredDEA.map(r => r.L));

      // TODO: Calculate milage between two points (how can we do this?)

      const record: aigRecord = {
        Name: p.Practitioner,
        Specialty: p.Specialty,
        PracticeLocation: p.PracticeLocation,
        DEA: dea,
        State: p.State,
        Discipline: p.Discipline,
        numCS,
        totalRx,
        CSP: csp ? `${csp.toFixed(0)}%` : null,
        CSCash: csCash,
        numpt: uniquePatients.size,
        Miles: 'Over _ miles'
      }
      this.top5.push(record);
    }

    // Build out the data in the correct order
    this.data = this.getDataObject();

    await super.build();
  }

  getDataObject() {
    const data: unknown[][] = []
    for (const record of this.top5) {
      const d = [];
      for (const i of this.headers) {
        d.push(record[i as keyof aigRecord])
      }
      data.push(d);
    }
    return data;
  }
}
