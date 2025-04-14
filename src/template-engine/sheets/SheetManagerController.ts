import { TemplateGenerator } from "../TemplateGenerator";
import { ArcosSheetManager } from "./sheet-managers/ArcosSheetManager";
import { DeaConcernSheetManager } from "./sheet-managers/DeaConcernSheetManager";
import { SheetManager } from "./sheet-managers/SheetManager";
import { TopDrSheetManager } from "./sheet-managers/TopDrSheetmanager";

export class SheetManagerController {
  private sheets: Map<string, SheetManager> = new Map();

  // Shared data that sheets might need to access

  constructor(private generator: TemplateGenerator) {
    this.initializeSheets();
  }

  private initializeSheets(): void {
    // Create and register all sheet managers
    this.registerSheet(new ArcosSheetManager(this.generator, this));
    this.registerSheet(new DeaConcernSheetManager(this.generator, this));
    // this.registerSheet(new CommonSheetManager(this.generator, this));
    this.registerSheet(new TopDrSheetManager(this.generator, this));
    // this.registerSheet(new Top10CsSheetManager(this.generator, this));

    // Create AIG sheets (1-20)
    for (let i = 1; i <= 20; i++) {
      // this.registerSheet(new AigSheetManager(this.generator, this, i));
    }

    // this.registerSheet(new AigTableSheetManager(this.generator, this));
    // Register other sheets...
  }

  private registerSheet(manager: SheetManager): void {
    this.sheets.set(manager.sheetName, manager);
  }

  // Get a specific sheet manager (for direct access if needed)
  getSheet<T extends SheetManager>(name: string): T {
    return this.sheets.get(name) as T;
  }


  // Utility method to build array of data array to be used when adding a sheet
  buildDataArray<T>(record: T[], headers: string[]) {
    const data: unknown[][] = []
    if (record.length) {
      for (const r of record) {
        const d = [];
        for (const i of headers) {
          d.push(r[i as keyof T])
        }
        data.push(d);
      }
      return data;
    } else {
      return [data];
    }
  }

  // Execute collection phase for all sheets
  async collectAll(): Promise<void> {
    for (const manager of this.sheets.values()) {
      await manager.collect();
    }
  }

  // Execute generation phase for all sheets
  async generateAll(): Promise<void> {
    for (const manager of this.sheets.values()) {
      await manager.generate();
    }
  }

  // Other shared methods...
}
