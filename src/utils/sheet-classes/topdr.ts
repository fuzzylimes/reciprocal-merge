import { utils, WorkBook } from "xlsx";
import { Base } from "./Base";
import { headers, topdrRecord, ReportSheets as rs } from "../sheets";
import { PractitionerSheets as ps } from "../../template-engine/files/PractitionersFile";
import { row } from "./common";
import * as c from '../constants';
import { findPractitionerByDea, getCellNumericValue, Practitioner } from "../excel";
import { toPercent } from "../format";

export class topdr extends Base {
  record: topdrRecord[] | undefined;
  constructor(outData: WorkBook) {
    super(outData, 'topdr', headers.topdr);
  }

  async build() {
    const sheet = Base.report.Sheets[rs.spatial];
    const rows = utils.sheet_to_json<row>(sheet, { header: "A", blankrows: true })?.slice(1, 2);
    if (!rows) {
      return;
    }

    // collect the DEA numbers for top 10
    const top10: string[] = [];
    for (const col of c.cthrul) {
      top10.push(rows[0][col] as string);
    }

    Base.top10dea = top10;
    const drRecords = [];
    // build out details for each dea number
    for (const [i, dr] of top10.entries()) {
      // pull in practitioner details like AIG
      const pracWorkSheet = Base.practitioners.Sheets[ps.ref];
      let p: Partial<Practitioner> = {};
      try {
        p = findPractitionerByDea(pracWorkSheet, dr);
      } catch { /* empty */ }

      // get csrx and totalrx from analysis page (K & L)
      const csrx = getCellNumericValue(Base.report, rs.analysis, `K${7 + i}`);
      const totalrx = getCellNumericValue(Base.report, rs.analysis, `L${7 + i}`);
      let csp, csCash;
      if (csrx && totalrx) {
        // CSP = ratio csrx / totalrx - only include if >= 20%
        const cspCalc = csrx / totalrx;
        if (cspCalc >= .2) {
          csp = cspCalc;
          // CS Cash = O, 7-16, in Analysis - only if CSP >= 20% and Cash >= 20%
          const cashCell = getCellNumericValue(Base.report, rs.analysis, `O${7 + i}`);
          if (cashCell && cashCell >= .2) {
            csCash = cashCell;
          }
        }
      }

      const drRecord: topdrRecord = {
        Number: i + 1,
        DEA: dr,
        Name: p.Practitioner,
        PracticeLocation: p.PracticeLocation,
        Specialty: p.Specialty,
        State: p.State,
        csrx: csrx ? csrx : null,
        totalrx: totalrx ? totalrx : null,
        CSP: toPercent(csp),
        CSCash: toPercent(csCash),
        Discipline: p.Discipline,
        Miles: '_____'
      };
      drRecords.push(drRecord);
    }

    this.record = drRecords;
  }

  // We need to wait on the actual build until after common has been built (depedencies)
  async superbuild() {
    for (const dea of Base.deaMiles) {
      const r = this.record?.find(d => d.DEA === dea);
      if (r) {
        r.Miles = 'Over _ miles';
      }
    }

    this.data = this.getDataObject();
    await super.build();
  }

  getDataObject() {
    const data: unknown[][] = []
    if (this.record) {
      for (const r of this.record) {
        const d = [];
        for (const i of this.headers) {
          d.push(r[i as keyof topdrRecord])
        }
        data.push(d);
      }
      return data;
    } else {
      return [data];
    }
  }
}
