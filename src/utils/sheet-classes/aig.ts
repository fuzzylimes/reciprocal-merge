import { utils, WorkBook } from "xlsx";
import { Base } from "./Base";
import { aigRecord, allrxSheet, csrxSheet, ReportSheets as rs } from '../sheets';
import { PractitionerSheets as ps } from "../sheets";
import { findPractitionerByDea, Practitioner } from "../excel";
import { headers } from "../sheets";
import { aigLookup, IaigDef } from "../aig-helper";
import { toPercent } from "../format";

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
  aigDetails: IaigDef;
  top5: aigRecord[] = [];

  constructor(outData: WorkBook, sheetNumber: number) {
    super(outData, `aig${sheetNumber}`, headers.aig);
    this.aigNum = sheetNumber;
    this.aigDetails = aigLookup[sheetNumber]
  }

  static buildAll(outData: WorkBook) {
    const sheets: aig[] = [];

    for (let i = 1; i <= 20; i++) {
      sheets.push(new aig(outData, i));
    }

    return sheets;
  }

  async build() {
    // Handles name matches for filtering.
    // Supports wildcards by including a * between each piece
    const matchesName = (row: csrxSheet, names: string[]) => {
      return (names ?? []).some((word) => {
        const rowText = String(row["Drug Name"]).toLowerCase();
        if (word.includes('*')) {
          const parts = word.split('*');
          return parts.every(part => rowText.includes(part.toLowerCase()));
        }
        return rowText.includes(word.toLowerCase());
      });
    };

    const matchesFamily = (row: csrxSheet, family?: string) => {
      return !family || String(row.Family?.toLowerCase()) === family?.toLowerCase();
    };

    const highlow = (rows: csrxSheet[]) => {
      let high = 0;
      let low = 10000000;

      // handle the case where there are now rows
      if (rows.length === 0) {
        low = 0;
      } else {
        for (const row of rows) {
          const val = Number(row["mg/day"]);
          if (val > high) high = val;
          if (val < low) low = val;
        }
      }

      return { high, low };
    }

    const medCalc = (rows: csrxSheet[], aig: IaigDef) => {
      const { high, low } = highlow(rows);
      const highmed = high * aig.med!;
      const lowmed = low * aig.med!;

      Base.aigData[this.aigDetails.aigReference].highmed = highmed;
      Base.aigData[this.aigDetails.aigReference].lowmed = lowmed;
    }

    const methadoneMed = (rows: csrxSheet[]) => {
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

      Base.aigData[this.aigDetails.aigReference].highmed = hlv.high;
      Base.aigData[this.aigDetails.aigReference].lowmed = hlv.low;
    }

    const sheet = Base.report.Sheets[rs.csrx];
    const rows = utils.sheet_to_json<csrxSheet>(sheet, { blankrows: true });
    if (!rows) {
      return;
    }
    const { names, family, per, med, duMonthCell: duField, label } = this.aigDetails;

    let drugRows: csrxSheet[] = rows;

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
    drugRows = drugRows.filter(row => !String(row["Drug Name"]).toLowerCase().endsWith('ml'));

    const overRows = drugRows.filter(row => applyOperation(Number(row["mg/day"]), this.aigDetails));
    const ratio = overRows.length / drugRows.length;
    // Set the values to be used back over in common
    Base.aigData[this.aigDetails.aigReference].highpct = ratio;

    if (per && familyCount) {
      const perVal = drugRows.length / familyCount;
      Base.aigData[this.aigDetails.aigReference].per = perVal;
    }

    if (med) {
      // from overRows, find the lowest mg/day (F), highest mg/day (f)
      if (family === 'methadone') {
        methadoneMed(overRows);
      } else {
        medCalc(overRows, this.aigDetails);
      }
    }

    // Multiple checks to get the DEA numbers. First check is to pull back value from the calculations sheet and see if it's > 300
    const [duValue] = Base.calculations.getDuAndTimesByRowLabel(duField);
    const over300 = (duValue ?? 0) > 300;

    // Need to sum all values in order to get "top 5" prescribers
    // If over 300, use the filtered drugRows, otherwise use the full set (overRows)
    const prescribers: Record<string, number> = {};
    for (const row of over300 ? drugRows : overRows) {
      const p = String(row["DEA#"]);
      const v = Number(row.Qty);

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
    const allrx = Base.report.Sheets[rs.allrx];
    const allrxRows = utils.sheet_to_json<allrxSheet>(allrx);

    // Fetch the top5 details from practitioner file
    for (const [i, dea] of top5.entries()) {
      const pracWorkSheet = Base.practitioners.Sheets[ps.ref];
      let p: Partial<Practitioner> = {};
      try {
        p = findPractitionerByDea(pracWorkSheet, dea);
      } catch {
        Base.missingDea.push(dea);
      }

      // filter allrxRows by the dea number (J)
      const filteredDEA = allrxRows.filter(r => r["DEA#"] && String(r["DEA#"]) === dea);
      // filtered length = totalRx
      let totalRx: number | undefined = filteredDEA.length;
      // count non-null values in R = numCS
      const filteredControls = filteredDEA.filter(r => r["DEA Sched"])
      let numCS: number | undefined = filteredControls.length;
      // CSP = numCS / totalRx (%) - only include these if CSP > 20%
      let csp: number | undefined = numCS / totalRx;
      // If CSP > 20%...
      let csCash = null;
      if (csp > .2) {
        // another filtered list of non-null values in R
        const cash = filteredControls.filter(r => r["Pay Type"]);
        // count non-null values in F / numCS = CSCash - only include if > 20%
        const csCashCheck = cash.length / numCS;
        if (csCashCheck > .2) {
          csCash = csCashCheck;
        }
      } else {
        totalRx = undefined;
        numCS = undefined;
        csp = undefined;
      }

      const uniquePatients = new Set(filteredDEA.map(r => r["Patient ID"]));

      // TODO: Calculate milage between two points (how can we do this?)
      const top10Position = Base.top10dea.indexOf(dea) + 1;
      let miles: unknown = 'Over _ miles';
      if (top10Position > 0) {
        miles = { t: 'f', f: `topdr!L${top10Position + 1}` }
      }

      const record: aigRecord = {
        AIG: i === 0 ? label : '',
        Name: p.Practitioner ?? '',
        isTop10: !!top10Position,
        Specialty: p.Specialty ?? '',
        PracticeLocation: p.PracticeLocation ?? '',
        DEA: dea,
        State: p.State ?? '',
        Discipline: p.Discipline ?? '',
        numCS,
        totalRx,
        CSP: toPercent(csp),
        CSCash: toPercent(csCash),
        numpt: uniquePatients.size,
        Miles: miles
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
