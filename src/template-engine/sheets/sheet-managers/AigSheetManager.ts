import { aigLookup, IaigDef } from "../utils/aig-helper";
import { toDecimalPercent } from "../../../utils/format";
import { csrxSheet } from "../../files/report-handlers/CsRxHandler";
import { Practitioner } from "../../files/PractitionersFile";
import { TemplateGenerator } from "../../TemplateGenerator";
import { SheetManagerController } from "../SheetManagerController";
import { headers, sheetNames } from "../utils/constants";
import { SheetManager } from "./SheetManager";

type aigRecord = {
  AIG: string;
  Name: string;
  isTop10: boolean
  Specialty: string;
  PracticeLocation: string;
  DEA: string;
  State?: string;
  Discipline?: string;
  numCS?: number;
  totalRx?: number;
  CSP?: number;
  CSCash?: number;
  numpt?: number;
  Miles?: unknown;
}

type aigCommon = {
  highpct?: number;
  per?: number;
  highmed?: number;
  lowmed?: number;
}

export class AigSheetManager extends SheetManager {
  private _aigNum: number;
  private data: aigRecord[] = [];
  private common: aigCommon = {};

  constructor(
    generator: TemplateGenerator,
    controller: SheetManagerController,
    aigNumber: number
  ) {
    super(generator, controller, `${sheetNames.aig}${aigNumber}`, headers.aig);
    this._aigNum = aigNumber;
  }

  collect(): void {
    const reportFile = this.generator.report;
    const calcFile = this.generator.calculations;
    const pracFile = this.generator.practitioners;
    const aigDetails = aigLookup[this._aigNum]

    // Get the rows we need
    let csRxRows = reportFile.csrx.csrxRows;
    if (!csRxRows || csRxRows.length === 0) {
      return;
    }

    const { names, family, per, med, duMonthCell: duField, label } = aigDetails;

    // Apply family filter if needed
    if (family) {
      csRxRows = csRxRows.filter(row => this.matchesFamily(row, family));
    }

    const familyCount = csRxRows.length;

    // Apply names filter if needed
    if (names && names.length > 0) {
      csRxRows = csRxRows.filter(row => this.matchesName(row, names));
    }

    // Filter out liquids
    csRxRows = csRxRows.filter(row => !String(row["Drug Name"]).toLowerCase().endsWith('ml'));

    // Get rows that match the operation criteria
    const opMatches = csRxRows.filter(row => this.applyOperation(Number(row["mg/day"]), aigDetails));
    const highMatchRatio = csRxRows.length ? opMatches.length / csRxRows.length : 0;

    // Store in shared controller data
    this.common.highpct = toDecimalPercent(highMatchRatio);

    if (per && familyCount) {
      const perVal = csRxRows.length / familyCount;
      this.common.per = toDecimalPercent(perVal);
    }

    if (med) {
      // Calculate MED values
      if (family === 'methadone') {
        this.calculateMethadoneMed(opMatches);
      } else {
        this.calculateMed(opMatches, aigDetails);
      }
    }

    // Get DU values from calculations
    const duMonth = calcFile.drugs.get(duField)?.duMonth;
    const over300 = (duMonth ?? 0) > 300;

    // Calculate top 5 prescribers
    const prescribers = this.calculateTopPrescribers(over300 ? csRxRows : opMatches);
    const top5Deas = prescribers.map(p => p[0]).slice(0, 5);
    const practitionerDetails = pracFile.findPractionersByDeaList(...top5Deas);

    // Get all Rx data
    const allRxRows = reportFile.allrx.allRxRows;

    // Process each DEA in top 5
    for (const [i, dea] of top5Deas.entries()) {
      // Get practitioner data
      let practitioner: Partial<Practitioner> = practitionerDetails[dea];
      if (!practitioner) {
        this.controller.addMissingDea(dea);
        practitioner = {};
      }

      // filter allRxRows by the dea number (J)
      const filteredDEA = allRxRows.filter(r => r["DEA#"] && String(r["DEA#"]) === dea);
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

      // Get unique patients
      const uniquePatients = new Set(filteredDEA.map(r => r["Patient ID"]));

      // Check if in top 10
      const top10Position = reportFile.spatial.top10Dea.indexOf(dea) + 1;
      let miles: unknown = 'Over _ miles';
      if (top10Position > 0) {
        miles = { t: 'f', f: `topdr!L${top10Position + 1}` };
      }

      // Create record
      const record: aigRecord = {
        AIG: i === 0 ? label : '',
        Name: practitioner.Practitioner ?? '',
        isTop10: !!top10Position,
        Specialty: practitioner.Specialty ?? '',
        PracticeLocation: practitioner.PracticeLocation ?? '',
        DEA: dea,
        State: practitioner.State ?? '',
        Discipline: practitioner.Discipline ?? '',
        numCS,
        totalRx,
        CSP: toDecimalPercent(csp),
        CSCash: toDecimalPercent(csCash),
        numpt: uniquePatients.size,
        Miles: miles
      };

      this.data.push(record);
    }
  }

  generate(): void {
    // Create the sheet data
    const data = this.data.map(record =>
      this.headers.map(header => record[header as keyof aigRecord])
    );

    // Add to workbook
    this.generator.addSheet(this.sheetName, this.headers, data);
  }

  // Helper methods
  private matchesName(row: csrxSheet, names: string[]): boolean {
    return (names ?? []).some((word) => {
      const rowText = String(row["Drug Name"]).toLowerCase();
      if (word.includes('*')) {
        const parts = word.split('*');
        const hasAllParts = parts.every(part => rowText.includes(part.toLowerCase()));
        return hasAllParts;
      }
      return rowText.includes(word.toLowerCase());
    });
  }

  private matchesFamily(row: csrxSheet, family?: string): boolean {
    return !family || String(row.Family?.toLowerCase()) === family?.toLowerCase();
  }

  private getHighLow(rows: csrxSheet[]): { high: number, low: number } {
    let high = 0;
    let low = 10000000;

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

  private calculateMed(rows: csrxSheet[], aig: IaigDef): void {
    const { high, low } = this.getHighLow(rows);
    const highmed = high * aig.med!;
    const lowmed = low * aig.med!;

    this.common.highmed = highmed;
    this.common.lowmed = lowmed;
  }

  private calculateMethadoneMed(rows: csrxSheet[]): void {
    const hl = this.getHighLow(rows);
    const hlv = { high: 0, low: 0 };

    for (const [k, v] of Object.entries(hl)) {
      let multiplier = 4;
      if (v > 20 && v <= 40) multiplier = 8;
      else if (v > 40 && v <= 60) multiplier = 10;
      else if (v > 60) multiplier = 12;

      hlv[k as keyof typeof hlv] = v * multiplier;
    }

    this.common.highmed = hlv.high;
    this.common.lowmed = hlv.low;
  }

  private calculateTopPrescribers(rows: csrxSheet[]): [string, number][] {
    const prescribers: Record<string, number> = {};

    for (const row of rows) {
      const dea = String(row["DEA#"]);
      const qty = Number(row.Qty);

      if (prescribers[dea]) {
        prescribers[dea] += qty;
      } else {
        prescribers[dea] = qty;
      }
    }

    return Object.entries(prescribers).sort((a, b) => b[1] - a[1]);
  }

  private applyOperation(value: number, def: IaigDef): boolean {
    const operationMap: Record<string, (value: number, threshold: number) => boolean> = {
      '>': (v, t) => v > t,
      '<': (v, t) => v < t,
      '>=': (v, t) => v >= t,
      '<=': (v, t) => v <= t,
      '==': (v, t) => v === t,
      '===': (v, t) => v === t,
      '!=': (v, t) => v !== t,
      '!==': (v, t) => v !== t,
    };

    const op = operationMap[def.operation];
    if (!op) {
      throw new Error(`Unknown operation: ${def.operation}`);
    }

    return op(value, def.high);
  }

  get commonData(): aigCommon {
    return this.common;
  }
}
