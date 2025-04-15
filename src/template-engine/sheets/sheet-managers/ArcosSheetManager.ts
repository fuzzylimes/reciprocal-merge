import { TemplateGenerator } from "../../TemplateGenerator";
import { SheetManagerController } from "../SheetManagerController";
import { headers, sheetNames } from "./constants";
import { SheetManager } from "./SheetManager";

type arcosRecord = {
  drug?: unknown;
  Mutual?: unknown;
  supplier2?: unknown;
  supplier3?: unknown;
}

export class ArcosSheetManager extends SheetManager {
  private data: arcosRecord[] = [];

  constructor(generator: TemplateGenerator, controller: SheetManagerController) {
    super(generator, controller, sheetNames.arcos, headers.arcos);
  }

  async collect(): Promise<void> {
    // For now, this is a copy/paste effort. May revist at another time.
  }

  async generate(): Promise<void> {
    // Logic to generate the sheet using collected data
    this.generator.addSheet(this.sheetName, this.headers, [this.data]);
  }
}
