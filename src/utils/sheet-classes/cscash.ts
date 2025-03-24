import { WorkBook } from "xlsx";
import { TableData } from "../word";
import { Base } from "./Base";

export class cscash extends Base {
  constructor(outData: WorkBook, report: WorkBook, calculations: TableData, practitioners: WorkBook) {
    super(outData, report, calculations, practitioners, 'cscash');
  }

  async drug() {
    this.headers.push('drug');
  }

  async percent() {
    this.headers.push('percent');
  }

  async build() {
    await this.drug();
    await this.percent();

    await super.build();
  }
}
