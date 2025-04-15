import { aigLookup } from "../../../utils/aig-helper";
import { TemplateGenerator } from "../../TemplateGenerator";
import { SheetManagerController } from "../SheetManagerController";
import { headers, sheetNames } from "./constants";
import { SheetManager } from "./SheetManager";

type aigTableRecord = {
  AIG: string,
  Prevdate?: number,
  Prevdoses?: number,
  currentdate: number,
  currentdoses: number,
  Change: unknown,
  Changedose: unknown
}

export class AigTableSheetManager extends SheetManager {
  private data: aigTableRecord[] = [];

  constructor(generator: TemplateGenerator, controller: SheetManagerController) {
    super(generator, controller, sheetNames.aigTable, headers.aig);
  }

  async collect(): Promise<void> {
    const calcFile = this.generator.calculations;
    const prevCalcFile = this.generator.prevCalculations;

    for (let i = 0; i < Object.keys(aigLookup).length; i++) {
      const key = aigLookup[i + 1].duMonthCell;
      const { duMonth: currentdoses, multiple: currentdate } = (calcFile.drugs.get(key) || {});

      if (currentdate && currentdate < 2.0) continue;

      const rowNumber = this.data.length + 2;
      const { duMonth: Prevdoses, multiple: Prevdate } = (prevCalcFile.drugs.get(key) || {});
      const tableRecord: aigTableRecord = {
        AIG: key,
        Prevdate,
        Prevdoses,
        currentdate: currentdate ?? 0.0,
        currentdoses: currentdoses ?? 0,
        Change: { t: 'f', f: `IFS(B${rowNumber}>D${rowNumber},"LOWER",B${rowNumber}<D${rowNumber},"HIGHER",B${rowNumber}=D${rowNumber},"NO CHANGE")` },
        Changedose: { t: 'f', f: `IFS(C${rowNumber}>E${rowNumber},"LOWER",C${rowNumber}<E${rowNumber},"HIGHER",C${rowNumber}=E${rowNumber},"NO CHANGE")` },
      }

      this.data.push(tableRecord);
    }
  }

  async generate(): Promise<void> {
    // Build out the full data array, in header order
    const rowData = this.controller.buildDataArray(this.data, this.headers);
    // Create a new sheet on the base generator
    this.generator.addSheet(this.sheetName, this.headers, rowData);
  }
}
