import { TemplateGenerator } from "../TemplateGenerator";
import { AigSheetManager } from "./sheet-managers/AigSheetManager";
import { AigTableSheetManager } from "./sheet-managers/AigTableSheetManager";
import { ArcosSheetManager } from "./sheet-managers/ArcosSheetManager";
import { CommonSheetManager } from "./sheet-managers/CommonSheetManager";
import { CsCashSheetManager } from "./sheet-managers/CsCashSheetManager";
import { DeaConcernSheetManager } from "./sheet-managers/DeaConcernSheetManager";
import { SheetManager } from "./sheet-managers/SheetManager";
import { Top10CsSheetManager } from "./sheet-managers/Top10CsSheetManager";
import { TopDrSheetManager } from "./sheet-managers/TopDrSheetmanager";

export class SheetManagerController {
  private _sheets: Map<string, SheetManager> = new Map();
  private _missingDea: Set<string> = new Set();

  // Shared data that sheets might need to access

  constructor(private generator: TemplateGenerator) {
    this.initializeSheets();
  }

  private initializeSheets(): void {
    // Create and register all sheet managers
    this.registerSheet(new ArcosSheetManager(this.generator, this));
    this.registerSheet(new DeaConcernSheetManager(this.generator, this));
    // Create AIG sheets (1-20) - MUST go before common
    for (let i = 1; i <= 20; i++) {
      this.registerSheet(new AigSheetManager(this.generator, this, i));
    }
    this.registerSheet(new CommonSheetManager(this.generator, this));
    this.registerSheet(new CsCashSheetManager(this.generator, this));
    this.registerSheet(new TopDrSheetManager(this.generator, this));
    this.registerSheet(new Top10CsSheetManager(this.generator, this));


    this.registerSheet(new AigTableSheetManager(this.generator, this));
  }

  private registerSheet(manager: SheetManager): void {
    this._sheets.set(manager.sheetName, manager);
  }

  // Get a specific sheet manager (for direct access if needed)
  getSheet<T extends SheetManager>(name: string): T {
    return this._sheets.get(name) as T;
  }

  addMissingDea(dea: string) {
    this._missingDea.add(dea);
  }

  get missingDea(): string[] {
    return Array.from(this._missingDea || []);
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
    for (const manager of this._sheets.values()) {
      await manager.collect();
    }
  }

  // Execute generation phase for all sheets
  async generateAll(): Promise<void> {
    for (const manager of this._sheets.values()) {
      await manager.generate();
    }
  }
}
