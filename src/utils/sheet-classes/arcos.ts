import { WorkBook } from "xlsx";
import { TableData } from "../word";
import { Base } from "./Base";
import { arcosRecord, headers } from "../sheets";

export class arcos extends Base {
  record: arcosRecord[] | undefined;

  constructor(outData: WorkBook, report: WorkBook, calculations: TableData, practitioners: WorkBook) {
    super(outData, report, calculations, practitioners, 'arcos', headers.arcos);
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
          d.push(r[i as keyof arcosRecord])
        }
        data.push(d);
      }
      return data;
    } else {
      return [data];
    }
  }
}
