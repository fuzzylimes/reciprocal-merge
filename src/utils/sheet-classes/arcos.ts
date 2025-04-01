import { WorkBook } from "xlsx";
import { Base } from "./Base";
import { arcosRecord, headers } from "../sheets";

export class arcos extends Base {
  record: arcosRecord[] | undefined;

  constructor(outData: WorkBook) {
    super(outData, 'arcos', headers.arcos);
  }

  async build() {
    // For now, this is a copy/paste effort. May revist at another time.

    await super.build();
  }

}
