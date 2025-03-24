import { WorkBook } from "xlsx";
import { TableData } from "../word";
import { Base } from "./Base";

export class top10cs extends Base {
  constructor(outData: WorkBook, report: WorkBook, calculations: TableData, practitioners: WorkBook) {
    super(outData, report, calculations, practitioners, 'top10cs');
  }

  async drug() {
    this.headers.push('drug');
  }
  async number() {
    this.headers.push('number');
  }
  async csdoseperc() {
    this.headers.push('csdoseperc');
  }
  async totaldoseperc() {
    this.headers.push('totaldoseperc');
  }
  async csdosenum() {
    this.headers.push('csdosenum');
  }
  async totalcsnum() {
    this.headers.push('totalcsnum');
  }
  async totaldosenum() {
    this.headers.push('totaldosenum');
  }

  async build() {
    await this.drug();
    await this.number();
    await this.csdoseperc();
    await this.totaldoseperc();
    await this.csdosenum();
    await this.totalcsnum();
    await this.totaldosenum();

    await super.build();
  }
}
