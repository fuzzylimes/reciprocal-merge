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
  high: number;
  per?: boolean;
  med?: number;
}

const aigLookup: Record<number, IaigDef> = {
  1: {
    names: ['alprazolam', 'xanax'],
    operation: '>',
    high: 4
  },
  2: {
    names: ['alprazolam*2 mg', 'xanax*2 mg'],
    operation: '>',
    high: 4
  },
  3: {
    family: 'amphetamine',
    operation: '>',
    high: 40
  },
  4: {
    family: 'buprenorphine',
    names: ['8 mg'],
    operation: '>=',
    high: 32,
    per: true,
  },
  5: {
    family: 'carisoprodol',
    operation: '>=',
    high: 1400
  },
  6: {
    family: 'fentanyl',
    operation: '>',
    high: 37.5,
    med: 2.4
  },
  7: {
    family: 'hydrocodone',
    operation: '>=',
    high: 90,
    med: 1
  },
  8: {
    family: 'hydrocodone',
    names: ['10-325 mg'],
    operation: '>=',
    high: 90,
    per:true,
    med: 1
  },
  9: {
    family: 'hydromorphone',
    operation: '>=',
    high: 22.5,
    med: 4
  },
  10: {
    family: 'hydromorphone',
    names: ['8 mg'],
    operation: '>=',
    high: 22.5,
    med: 1
  },
  11: {
    family: 'lisdexamfetamine',
    operation: '>',
    high: 70
  },
  12: {
    family: 'methadone',
    operation: '>=',
    high: 20,
    med: 4 // 20 = 4; 20-40 = 8; 40-60 = 10; >60 = 12
  },
  13: {
    family: 'methylphenidate',
    operation: '>=',
    high: 60
  },
  14: {
    family: 'morphine',
    operation: '>=',
    high: 90,
    med: 1
  },
  15: {
    family: 'oxycodone',
    operation: '>=',
    high: 60,
    med: 1.5
  },
  16: {
    family: 'oxycodone',
    names: ['15 mg'],
    operation: '>=',
    high: 60,
    med: 1.5
  },
  17: {
    family: 'oxycodone',
    names: ['30 mg'],
    operation: '>=',
    high: 60,
    med: 1.5
  },
  18: {
    family: 'oxycodone',
    names: ['10-325 mg'],
    operation: '>=',
    high: 60,
    med: 1.5
  },
  19: {
    family: 'oxymorphone',
    operation: '>=',
    high: 30,
    med: 3
  },
  20: {
    family: 'tramadol',
    operation: '>',
    high: 900,
    med: 0.2
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
  return operationFunc(value, entry.high);
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
    // Handles name matches for filtering.
    // Supports wildcards by including a * between each piece
    const matchesName = (row: row, names: string[]) => {
      return (names ?? []).some((word) => {
        const rowText = String(row.I).toLowerCase();
        if (word.includes('*')) {
          const parts = word.split('*');
          return parts.every(part => rowText.includes(part.toLowerCase()));
        }
        return rowText.includes(word.toLowerCase());
      });
    };

    const matchesFamily = (row: row, family?: string) => {
      return !family || String(row.O) === family;
    };

    const sheet = this.report.Sheets[rs.csrx];
    const rows = utils.sheet_to_json<row>(sheet, { header: "A", blankrows: true })?.slice(1);
    if (!rows) {
      this.data[0].push('');
      return;
    }
    const aigDetails = aigLookup[this.aigNum];
    const { names, family, per, med } = aigDetails;

    let drugRows: row[] = rows;

    // Apply family filter if needed
    if (family) {
      drugRows = drugRows.filter(row => matchesFamily(row, family));
    }

    const familyCount = drugRows.length;

    // Apply names filter if needed
    if (names && names.length > 0) {
      drugRows = drugRows.filter(row => matchesName(row, names));
    }

    // filter out liquids
    drugRows = drugRows.filter(row => !String(row.I).toLowerCase().includes('ml'));

    const overRows = drugRows.filter(row => applyOperation(Number(row.F), aigDetails));
    const ratio = overRows.length / drugRows.length * 100;
    // Set the values to be used back over in common
    this.aigPcts[`aig${this.aigNum}`] = ratio;

    if (per && familyCount) {
      const perVal = drugRows.length / familyCount * 100;
      // TODO: figure out how to get this in common
    }

    if (med) {
      // from overRows, find the lowest mg/day (F), highest mg/day (f)
      if (family === 'methadone') {
        methadoneMed(overRows);
      } else {
        medCalc(overRows, med);
      }

    }

    // Multiple checks to get the DEA numbers. First check is to pull back value from the calculations sheet and see if it's > 300
    const duValue = getWordCellValue(this.calculations, 'B19');
    const over300 = Number(duValue) > 300;

    // Need to sum all values in order to get "top 5" prescribers
    // If over 300, use the filtered drugRows, otherwise use the full set (overRows)
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
