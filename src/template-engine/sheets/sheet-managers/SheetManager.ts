import { TemplateGenerator } from "../../TemplateGenerator";
import { SheetManagerController } from "../SheetManagerController";

export abstract class SheetManager {
  constructor(
    protected generator: TemplateGenerator,
    protected controller: SheetManagerController,
    readonly sheetName: string,
    readonly headers: string[]
  ) { }

  abstract collect(): void;
  abstract generate(): void;
}
