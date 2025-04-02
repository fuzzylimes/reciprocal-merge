import { WorkBook } from "xlsx";
import { Base } from "./Base";
import { cscashRecord, headers, ReportSheets as rs } from "../sheets";
import { getCellValue } from "../excel";
import { toPercent } from "../format";

export class cscash extends Base {
  record: cscashRecord[] | undefined;
  constructor(outData: WorkBook) {
    super(outData, 'cscash', headers.cscash);
  }

  async build() {
    // only do this if csRX >= 20
    const cscash = getCellValue(Base.report, rs.summary, 'C14');

    if (Number(cscash) * 100 < 20) {
      // check values in rows 16-26 to see if Col C >= 20, include A and C if so
      const vals = [];
      for (let i = 16; i <= 26; i++) {
        const v = Number(getCellValue(Base.report, rs.summary, `C${i}`)) * 100;
        if (v < 20) continue;

        const rawLabel = (getCellValue(Base.report, rs.summary, `A${i}`));
        const label = rawLabel?.replace('$ Pay ', '').replace('Rx', '');
        vals.push([label, toPercent(v)]);
      }

      this.data = this.getDataObject();
    }

    await super.build();
  }

  getDataObject() {
    const data: unknown[][] = []
    if (this.record) {
      for (const r of this.record) {
        const d = [];
        for (const i of this.headers) {
          d.push(r[i as keyof cscashRecord])
        }
        data.push(d);
      }
      return data;
    } else {
      return [data];
    }
  }
}
