import { utils, WorkBook } from "xlsx";
import { Base } from "./Base";
import { headers, topdrRecord, ReportSheets as rs, PractitionerSheets as ps } from "../sheets";
import { row } from "./common";
import * as c from '../constants';
import { findPractitionerByDea, getCellValue } from "../excel";

export class topdr extends Base {
  record: topdrRecord[] | undefined;
  constructor(outData: WorkBook) {
    super(outData, 'topdr', headers.topdr);
  }

  async build() {
    const sheet = Base.report.Sheets[rs.spatial];
    const rows = utils.sheet_to_json<row>(sheet, { header: "A", blankrows: true })?.slice(6, 9);
    if (!rows) {
      return;
    }

    // collect the DEA numbers for top 10
    const top10: string[] = [];
    for (const col of c.cthrul) {
      top10.push(rows[1][col] as string);
    }

    // build out details for each dea number
    for (const [i, dr] of top10.entries()) {
      // pull in practitioner details like AIG
      const pracWorkSheet = Base.practitioners.Sheets[ps.ref];
      // TODO: Go back and remove this?
      let p;
      try {
        p = findPractitionerByDea(pracWorkSheet, dr);
      } catch {
        p = {};
      }

      // get csrx and totalrx from analysis page (K & L)
      const csrx = Number(getCellValue(Base.report, rs.analysis, `K${7 + i}`));
      const totalrx = Number(getCellValue(Base.report, rs.analysis, `L${7 + i}`));
      let csp, csCash;
      if (csrx && totalrx) {
        // CSP = ratio csrx / totalrx - only include if >= 20%
        const cspCalc = csrx / totalrx * 100;
        if (cspCalc >= 20) {
          csp = cspCalc;
          // CS Cash = O, 7-16, in Analysis - only if CSP >= 20% and Cash >= 20%
          const cashCell = Number(getCellValue(Base.report, rs.analysis, `O${7 + i}`));
          if (cashCell && cashCell >= .2) {
            csCash = cashCell * 100;
          }
        }
      }

      const drRecord: topdrRecord = {
        DEA: dr,
        Name: p.Practitioner,
        PracticeLocation: p.PracticeLocation,
        Specialty: p.Specialty,
        State: p.State,
        csrx: csrx ? csrx : null,
        totalrx: totalrx ? totalrx : null,
        CSP: csp ? `${csp.toFixed(0)}%` : null,
        CSCash: csCash ? `${csCash.toFixed(0)}%` : null,
        Discipline: p.Discipline,
        Miles: 'Over _ miles'
      };

      this.record?.push(drRecord);
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
