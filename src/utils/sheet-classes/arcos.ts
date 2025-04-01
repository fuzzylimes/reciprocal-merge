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
    // For now, this is a copy/paste effort. May revist at another time.

    await super.build();
  }

}
