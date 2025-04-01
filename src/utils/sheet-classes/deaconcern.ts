import { WorkBook } from "xlsx";
import { Base } from "./Base";
import { deaconcernRecord, headers } from "../sheets";


export class deaconcern extends Base {
  record: deaconcernRecord[] | undefined;
  constructor(outData: WorkBook) {
    super(outData, 'deaconcern', headers.deaconcern);
  }

  async build() {
    // For now, this is a copy/paste effort. May revist at another time.

    await super.build();
  }

}
