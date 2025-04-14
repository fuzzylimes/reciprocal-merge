import { TemplateGenerator } from "../../TemplateGenerator";
import { SheetManagerController } from "../SheetManagerController";

export abstract class SheetManager {
  constructor(
    protected generator: TemplateGenerator,
    protected controller: SheetManagerController,
    readonly sheetName: string,
    readonly headers: string[]
  ) { }

  abstract collect(): Promise<void>;
  abstract generate(): Promise<void>;
}
