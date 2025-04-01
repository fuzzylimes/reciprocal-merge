import { WorkBook } from "xlsx";
import { TableData } from "../word";
import { Base } from "./Base";
import { headers, topdrRecord } from "../sheets";

export class topdr extends Base {
  record: topdrRecord[] | undefined;
  constructor(outData: WorkBook, report: WorkBook, calculations: TableData, practitioners: WorkBook) {
    super(outData, report, calculations, practitioners, 'topdr', headers.topdr);
  }

  async build() {
    // spaitial page, row 2, cols C - L = DEA nums
    // pull in practitioner details like AIG
    // other two cols are K & L, 7-16, in Analysis
    // CSP = ratio csrx / totalrx - only include if >= 20%
    // CS Cash = O, 7-16, in Analysis - only if CSP >= 20% and Cash >= 20%
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
