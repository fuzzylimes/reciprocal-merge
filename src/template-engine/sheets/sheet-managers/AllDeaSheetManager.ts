import { TemplateGenerator } from "../../TemplateGenerator";
import { SheetManagerController } from "../SheetManagerController";
import { headers, sheetNames } from "../utils/constants";
import { SheetManager } from "./SheetManager";
import { TopDrSheetManager } from "./TopDrSheetmanager";

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

  private createRecord(dea: string, name?: unknown, specialty?: unknown, practiceLocation?: unknown, pharmacy?: string, pharmId?: string): deaRecord {
    const nameStr = String(name || '');
    const specialtyStr = String(specialty || '');
    const practitioner = nameStr && specialtyStr ? `${nameStr} (${specialtyStr})` : nameStr ?? '';

    return {
      DEA: dea,
      Practitioner: practitioner,
      Pharmacy: pharmacy ? `${pharmacy} ${pharmId ?? ''}` : '',
      PracticeLocation: practiceLocation ? String(practiceLocation) : undefined
    };
  }

  collect(): void {
    const unique = new Set<string>();

    // Collect all DEA references from the AIG pages
    for (let i = 1; i <= Object.keys(this.generator.aigValues).length; i++) {
      const aigRef = this.generator.sheetManager.getAigSheet(i)?.aigData || [];
      for (const ref of aigRef) {
        if (unique.has(ref.DEA)) {
          continue;
        }
        unique.add(ref.DEA);
        this.data.push(this.createRecord(ref.DEA, ref.Name, ref.Specialty, ref.PracticeLocation, ref.Note as string, ref.PharmId));
      }
    }

    // Add top10dr values that aren't already in the AIG pages
    const topDrSheet = this.generator.sheetManager.getSheet<TopDrSheetManager>(sheetNames.topdr);
    for (const dr of topDrSheet.top10drData) {
      const deaStr = String(dr.DEA || '');
      if (!deaStr || unique.has(deaStr)) {
        continue;
      }
      unique.add(deaStr);
      this.data.push(this.createRecord(deaStr, dr.Name, dr.Specialty, dr.PracticeLocation, dr.Note as string, dr.PharmId));
    }
  }

  generate(): void {
    // Build out the full data array, in header order
    const rowData = this.controller.buildDataArray(this.data, this.headers);
    // Create a new sheet on the base generator
    this.generator.addSheet(this.sheetName, this.headers, rowData);
  }
}
