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
    // We need to get all of the DEA references from the AIG pages.
    // No need to grab from top10dr page as they're already on the AIG pages.
    const unique = new Set<string>();
    for (let i = 1; i <= Object.keys(this.generator.aigValues).length; i++) {
      const aigRef = this.generator.sheetManager.getAigSheet(i)?.aigData || [];
      for (const ref of aigRef) {
        if (unique.has(ref.DEA)) {
          continue;
        }
        unique.add(ref.DEA);
        const record: deaRecord = {
          DEA: ref.DEA,
          Practitioner: ref.Name ? `${ref.Name} (${ref.Specialty})` : '',
          Pharmacy: ref.Note || '',
          PracticeLocation: ref.PracticeLocation
        }

        this.data.push(record);
      }

    }
  }

  generate(): void {
    // Build out the full data array, in header order
    const rowData = this.controller.buildDataArray(this.data, this.headers);
    // Create a new sheet on the base generator
    this.generator.addSheet(this.sheetName, this.headers, rowData);
  }
}
