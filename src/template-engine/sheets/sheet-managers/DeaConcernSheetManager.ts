import { TemplateGenerator } from "../../TemplateGenerator";
import { SheetManagerController } from "../SheetManagerController";
import { headers, sheetNames } from "./constants";
import { SheetManager } from "./SheetManager";

type deaconcernRecord = {
  DEAnumber?: unknown;
  Name?: unknown;
  Problem?: unknown;
}

export class DeaConcernSheetManager extends SheetManager {
  private data: deaconcernRecord[] = [];

  constructor(generator: TemplateGenerator, controller: SheetManagerController) {
    super(generator, controller, sheetNames.deaconcern, headers.deaconcern);
  }

  async collect(): Promise<void> {
    // For now, this is a copy/paste effort. May revist at another time.
  }

  async generate(): Promise<void> {
    // Logic to generate the sheet using collected data
    this.generator.addSheet(this.sheetName, this.headers, [this.data]);
  }
}
