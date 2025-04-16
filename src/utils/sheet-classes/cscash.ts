import { WorkBook } from "xlsx";
import { Base } from "./Base";
import { cscashRecord, headers, ReportSheets as rs } from "../sheets";
import { getCellNumericValue, getCellValue } from "../excel";
import { toDecimalPercent } from "../format";

export class cscash extends Base {
  record: cscashRecord[] = [];
  constructor(outData: WorkBook) {
    super(outData, 'cscash', headers.cscash);
  }

  async build() {
    // only do this if csRX >= 20
    const cscash = getCellNumericValue(Base.report, rs.summary, 'C14');

    if (cscash && cscash >= .2) {
      // check values in rows 16-28 to see if Col C >= 20, include A and C if so
      for (let i = 16; i <= 28; i++) {
        const v = getCellNumericValue(Base.report, rs.summary, `C${i}`);
        if (v && v < .2) continue;

        const rawLabel = (getCellValue(Base.report, rs.summary, `A${i}`));
        const label = rawLabel?.replace('$ Pay ', '').replace('Rx', '');
        this.record.push({ drug: label, percent: toDecimalPercent(v) });
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
