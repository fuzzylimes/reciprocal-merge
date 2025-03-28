import { utils, WorkBook } from "xlsx";
import { TableData, getCellValue as getWordCellValue, parseNumericString } from "../word";
import { Base } from "./Base";
import { aigRecord, ReportSheets as rs } from '../sheets';
import { PractitionerSheets as ps } from "../sheets";
import { row } from "./common";
import { findPractitionerByDea } from "../excel";
import { headers } from "../sheets";

interface IaigDef {
  names?: string[];
  family?: string;
  duField: string;
  operation: string;
  high: number;
  per?: boolean;
  med?: number;
}

const aigLookup: Record<number, IaigDef> = {
  1: {
    names: ['alprazolam', 'xanax'],
    operation: '>',
    high: 4,
    duField: 'B19'
  },
  2: {
    names: ['alprazolam*2 mg', 'xanax*2 mg'],
    operation: '>',
    high: 4,
    duField: 'B29'
  },
  3: {
    family: 'amphetamine',
    operation: '>',
    high: 40,
    duField: 'B34'
  },
  4: {
    family: 'buprenorphine',
    names: ['8 mg'],
    operation: '>=',
    high: 32,
    per: true,
    duField: 'B39'
  },
  5: {
    family: 'carisoprodol',
    operation: '>=',
    high: 1400,
    duField: 'B44'
  },
  6: {
    family: 'fentanyl',
    operation: '>',
    high: 37.5,
    med: 2.4,
    duField: 'B49'
  },
  7: {
    family: 'hydrocodone',
    operation: '>=',
    high: 90,
    med: 1,
    duField: 'B54'
  },
  8: {
    family: 'hydrocodone',
    names: ['10-325 mg'],
    operation: '>=',
    high: 90,
    per: true,
    med: 1,
    duField: 'B64'
  },
  9: {
    family: 'hydromorphone',
    operation: '>=',
    high: 22.5,
    med: 4,
    duField: 'B69'
  },
  10: {
    family: 'hydromorphone',
    names: ['8 mg'],
    operation: '>=',
    high: 22.5,
    med: 1,
    duField: 'B79'
  },
  11: {
    family: 'lisdexamfetamine',
    operation: '>',
    high: 70,
    duField: 'B84'
  },
  12: {
    family: 'methadone',
    operation: '>=',
    high: 20,
    med: 4,
    duField: 'B89'
  },
  13: {
    family: 'methylphenidate',
    operation: '>=',
    high: 60,
    duField: 'B94'
  },
  14: {
    family: 'morphine',
    operation: '>=',
    high: 90,
    med: 1,
    duField: 'B99'
  },
  15: {
    family: 'oxycodone',
    operation: '>=',
    high: 60,
    med: 1.5,
    duField: 'B104'
  },
  16: {
    family: 'oxycodone',
    names: ['15 mg'],
    operation: '>=',
    high: 60,
    med: 1.5,
    duField: 'B114'
  },
  17: {
    family: 'oxycodone',
    names: ['30 mg'],
    operation: '>=',
    high: 60,
    med: 1.5,
    duField: 'B119'
  },
  18: {
    family: 'oxycodone',
    names: ['10-325 mg'],
    operation: '>=',
    high: 60,
    med: 1.5,
    duField: 'B125'
  },
  19: {
    family: 'oxymorphone',
    operation: '>=',
    high: 30,
    med: 3,
    duField: 'B131'
  },
  20: {
    family: 'tramadol',
    operation: '>',
    high: 900,
    med: 0.2,
    duField: 'B137'
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

    for (let i = 1; i <= 20; i++) {
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

    const highlow = (rows: row[]) => {
      let high = 0;
      let low = 10000000;

      for (const row of rows) {
        const val = Number(row.F);
        if (val > high) high = val;
        if (val < low) low = val;
      }

      console.log(rows);

      return { high, low };
    }

    const medCalc = (rows: row[], aig: IaigDef) => {
      const { high, low } = highlow(rows);
      const highmed = high * aig.med!;
      const lowmed = low * aig.med!;

      Base.aigData[this.sheet]['highmed'] = highmed;
      Base.aigData[this.sheet]['lowmed'] = lowmed;
    }

    const methadoneMed = (rows: row[]) => {
      const hl = highlow(rows);
      const hlv = {
        high: 0,
        low: 0,
      }

      for (const [k, v] of Object.entries(hl)) {
        let multiplier = 4;
        if (v > 20 && v <= 40) multiplier = 8;
        else if (v > 40 && v <= 60) multiplier = 10;
        else if (v > 60) multiplier = 12;

        hlv[k as keyof typeof hlv] = v * multiplier;
      }

      Base.aigData[this.sheet]['highmed'] = hlv.high;
      Base.aigData[this.sheet]['lowmed'] = hlv.low;
    }

    const sheet = this.report.Sheets[rs.csrx];
    const rows = utils.sheet_to_json<row>(sheet, { header: "A", blankrows: true })?.slice(1);
    if (!rows) {
      this.data[0].push('');
      return;
    }
    const aigDetails = aigLookup[this.aigNum];
    const { names, family, per, med, duField } = aigDetails;

    console.log(this.sheet, aigDetails);

    let drugRows: row[] = rows;

    // Apply family filter if needed
    if (family) {
      drugRows = drugRows.filter(row => matchesFamily(row, family));
    }

    const familyCount = drugRows.length;

    console.log(familyCount, JSON.stringify(drugRows));

    // Apply names filter if needed
    if (names && names.length > 0) {
      drugRows = drugRows.filter(row => matchesName(row, names));
    }

    // filter out liquids
    drugRows = drugRows.filter(row => !String(row.I).toLowerCase().endsWith(' ml'));

    console.log(JSON.stringify(drugRows));

    const overRows = drugRows.filter(row => applyOperation(Number(row.F), aigDetails));
    const ratio = overRows.length / drugRows.length * 100;
    // Set the values to be used back over in common
    Base.aigData[this.sheet].highpct = ratio;

    if (per && familyCount) {
      const perVal = drugRows.length / familyCount * 100;
      Base.aigData[this.sheet]['per'] = perVal;
    }

    if (med) {
      // from overRows, find the lowest mg/day (F), highest mg/day (f)
      if (family === 'methadone') {
        methadoneMed(overRows);
      } else {
        medCalc(overRows, aigDetails);
      }
    }

    // Multiple checks to get the DEA numbers. First check is to pull back value from the calculations sheet and see if it's > 300
    const duValue = parseNumericString(getWordCellValue(this.calculations, duField));
    const over300 = Number(duValue) > 300;
    console.log(duValue);

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
      // TODO: Go back and remove this
      let p;
      try {
        p = findPractitionerByDea(pracWorkSheet, dea);
      } catch {
        p = {};
      }

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
        Name: p.Practitioner ?? '',
        Specialty: p.Specialty ?? '',
        PracticeLocation: p.PracticeLocation ?? '',
        DEA: dea,
        State: p.State ?? '',
        Discipline: p.Discipline ?? '',
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
