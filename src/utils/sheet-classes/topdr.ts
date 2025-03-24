import { WorkBook } from "xlsx";
import { TableData } from "../word";
import { Base } from "./Base";

export class topdr extends Base {
  constructor(outData: WorkBook, report: WorkBook, calculations: TableData, practitioners: WorkBook) {
    super(outData, report, calculations, practitioners, 'topdr');
  }

  async number() {
    this.headers.push('Number');
  }

  async name() {
    this.headers.push('Name');
  }

  async specialty() {
    this.headers.push('Specialty');
  }

  async practiceLocation() {
    this.headers.push('PracticeLocation');
  }

  async dea() {
    this.headers.push('DEA');
  }

  async state() {
    this.headers.push('State');
  }

  async csrx() {
    this.headers.push('csrx');
  }

  async totalrx() {
    this.headers.push('totalrx');
  }

  async csp() {
    this.headers.push('CSP');
  }

  async csCash() {
    this.headers.push('CSCash');
  }

  async discipline() {
    this.headers.push('Discipline');
  }

  async miles() {
    this.headers.push('Miles');
  }

  async build() {
    await this.number();
    await this.name();
    await this.specialty();
    await this.practiceLocation();
    await this.dea();
    await this.state();
    await this.csrx();
    await this.totalrx();
    await this.csp();
    await this.csCash();
    await this.discipline();
    await this.miles();

    await super.build();
  }
}
