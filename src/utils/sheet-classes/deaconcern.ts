import { WorkBook } from "xlsx";
import { TableData } from "../word";
import { Base } from "./Base";


export class deaconcern extends Base {
  constructor(outData: WorkBook, report: WorkBook, calculations: TableData, practitioners: WorkBook) {
    super(outData, report, calculations, practitioners, 'deaconcern');
  }

  async deaNumber() {
    this.headers.push('DEAnumber');
  }

  async name() {
    this.headers.push('Name');
  }

  async problem() {
    this.headers.push('Problem');
  }

  async build() {
    await this.deaNumber();
    await this.name();
    await this.problem();

    await super.build();
  }
}
