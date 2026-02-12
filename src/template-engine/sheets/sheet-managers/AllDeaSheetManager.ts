import { TemplateGenerator } from "../../TemplateGenerator";
import { SheetManagerController } from "../SheetManagerController";
import { headers, sheetNames } from "../utils/constants";
import { SheetManager } from "./SheetManager";

type deaRecord = {
  Practitioner: string,
  DEA: string,
  PracticeLocation?: string,
  Pharmacy?: string,
}

export class AllDeaSheetManager extends SheetManager {
  private data: deaRecord[] = [];

  constructor(generator: TemplateGenerator, controller: SheetManagerController) {
    super(generator, controller, sheetNames.alldea, headers.alldea);
  }

  collect(): void {
    const alldea = this.generator.practitioners.getAllDea();
    for (const [dea, r] of alldea) {
      const record: deaRecord = {
        DEA: dea,
        Practitioner: r.Practitioner,
        Pharmacy: String(r['PC Note - Pharm'] || ''),
        PracticeLocation: String(r.PracticeLocation ?? '')
      }

      this.data.push(record);
    }
  }

  generate(): void {
    // Build out the full data array, in header order
    const rowData = this.controller.buildDataArray(this.data, this.headers);
    // Create a new sheet on the base generator
    this.generator.addSheet(this.sheetName, this.headers, rowData);
  }
}
