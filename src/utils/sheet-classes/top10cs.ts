import { WorkBook } from "xlsx";
import { TableData } from "../word";
import { Base } from "./Base";
import { headers, top10csRecord } from "../sheets";

export class top10cs extends Base {
  record: top10csRecord[] | undefined;
  constructor(outData: WorkBook, report: WorkBook, calculations: TableData, practitioners: WorkBook) {
    super(outData, report, calculations, practitioners, 'top10cs', headers.top10cs);
  }

  async build() {
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
