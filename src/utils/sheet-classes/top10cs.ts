import { WorkBook } from "xlsx";
import { Base } from "./Base";
import { headers, top10csRecord, ReportSheets as rs } from "../sheets";
import { getCellNumericValue, getCellValue } from "../excel";
import { toDecimalPercent } from "../format";

export class top10cs extends Base {
  record: top10csRecord[] | undefined;
  constructor(outData: WorkBook) {
    super(outData, 'top10cs', headers.top10cs);
  }

  async build() {
    const totalcsnum = getCellNumericValue(Base.report, rs.analysis, `J62`);
    const totaldosenum = Base.calculations.getNumericValue('B4');
    const top10 = [];
    for (let i = 0; i < 10; i++) {
      const row = 19 + i;
      // If there's in indicator in the column to the left, then we know we need to handle it.
      if (getCellValue(Base.report, rs.analysis, `A${row}`)) {
        const drug = getCellValue(Base.report, rs.analysis, `B${row}`);
        const number = i + 1;
        const csdosenum = getCellNumericValue(Base.report, rs.analysis, `C${row}`);
        const csdoseper = (csdosenum && totalcsnum) ? csdosenum / totalcsnum : 0;
        const totaldoseperc = (csdosenum && totaldosenum) ? csdosenum / totaldosenum : 0;

        const topRecord: top10csRecord = {
          drug,
          number,
          csdoseperc: toDecimalPercent(csdoseper),
          totaldoseperc: toDecimalPercent(totaldoseperc),
          csdosenum,
          totalcsnum,
          totaldosenum
        }

        top10.push(topRecord);
      }
    }
    this.record = top10;
    Base.top10Count = this.record?.length ?? 0;
    this.data = this.getDataObject();

    await super.build();
  }

  getDataObject() {
    const data: unknown[][] = []
    if (this.record) {
      for (const r of this.record) {
        const d = [];
        for (const i of this.headers) {
          d.push(r[i as keyof top10csRecord])
        }
        data.push(d);
      }
      return data;
    } else {
      return [data];
    }
  }
}
