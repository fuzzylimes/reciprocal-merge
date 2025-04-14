import { TemplateGenerator } from "../../TemplateGenerator";
import { SheetManagerController } from "../SheetManagerController";
import { SheetManager } from "./SheetManager";

type arcosRecord = {
  drug?: unknown;
  Mutual?: unknown;
  supplier2?: unknown;
  supplier3?: unknown;
}
const colHeaders = ['drug', 'Mutual', 'supplier2', 'supplier3'];

export class ArcosSheetManager extends SheetManager {
  private data: arcosRecord[] = [];

  constructor(generator: TemplateGenerator, controller: SheetManagerController) {
    super(generator, controller, 'arcos', colHeaders);
  }

  async collect(): Promise<void> {
    // For now, this is a copy/paste effort. May revist at another time.
  }

  async generate(): Promise<void> {
    // Logic to generate the sheet using collected data
    this.generator.addSheet(this.sheetName, this.headers, [this.data]);
  }
}
