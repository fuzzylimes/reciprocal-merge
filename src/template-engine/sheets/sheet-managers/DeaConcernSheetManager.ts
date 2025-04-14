import { TemplateGenerator } from "../../TemplateGenerator";
import { SheetManagerController } from "../SheetManagerController";
import { SheetManager } from "./SheetManager";

type deaconcernRecord = {
  DEAnumber?: unknown;
  Name?: unknown;
  Problem?: unknown;
}
const colHeaders = ['DEAnumber', 'Name', 'Problem'];

export class DeaConcernSheetManager extends SheetManager {
  private data: deaconcernRecord[] = [];

  constructor(generator: TemplateGenerator, controller: SheetManagerController) {
    super(generator, controller, 'deaconcern', colHeaders);
  }

  async collect(): Promise<void> {
    // For now, this is a copy/paste effort. May revist at another time.
  }

  async generate(): Promise<void> {
    // Logic to generate the sheet using collected data
    this.generator.addSheet(this.sheetName, this.headers, [this.data]);
  }
}
