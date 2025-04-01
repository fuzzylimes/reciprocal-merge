import { WorkBook } from "xlsx";
import { Base } from "./Base";
import { headers, top10csRecord } from "../sheets";

export class top10cs extends Base {
  record: top10csRecord[] | undefined;
  constructor(outData: WorkBook) {
    super(outData, 'top10cs', headers.top10cs);
  }

  async build() {
    // See notes on top10csRecord
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
