import { WorkBook } from "xlsx";
import { TableData } from "../word";
import { Base } from "./Base";

export class arcos extends Base {
  constructor(outData: WorkBook, report: WorkBook, calculations: TableData, practitioners: WorkBook) {
    super(outData, report, calculations, practitioners, 'arcos');
  }

  async drug() {
    this.headers.push('drug');
  }

  async mutual() {
    this.headers.push('Mutual');
  }

  async supplier2() {
    this.headers.push('supplier2');
  }

  async supplier3() {
    this.headers.push('supplier3');
  }

  async build() {
    await this.drug();
    await this.mutual();
    await this.supplier2();
    await this.supplier3();

    await super.build();
  }
}
