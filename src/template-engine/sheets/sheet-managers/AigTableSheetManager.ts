import { aigLookup } from "../utils/aig-helper";
import { TemplateGenerator } from "../../TemplateGenerator";
import { SheetManagerController } from "../SheetManagerController";
import { headers, sheetNames } from "../utils/constants";
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
    super(generator, controller, sheetNames.aigTable, headers.aigTable);
  }

  collect(): void {
    const calcFile = this.generator.calculations;
    const prevCalcFile = this.generator.prevCalculations;

    for (const key of Object.keys(aigLookup)) {
      const drugKey = aigLookup[Number(key)].duMonthCell;
      const { duMonth: currentdoses, multiple: currentdate } = (calcFile.drugs.get(drugKey) || {});

      // If the multiplier is less than 2, we don't need to add the drug to the table
      if (!currentdate || currentdate < 2.0) continue;

      // We always need to get the next row. So in the case of an empty data, we'd want B2, for length 1 then B3.
      const rowNumber = this.data.length + 2;
      const { duMonth: Prevdoses, multiple: Prevdate } = (prevCalcFile.drugs.get(drugKey) || {});
      const tableRecord: aigTableRecord = {
        AIG: drugKey,
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

  generate(): void {
    // Build out the full data array, in header order
    const rowData = this.controller.buildDataArray(this.data, this.headers);
    // Create a new sheet on the base generator
    this.generator.addSheet(this.sheetName, this.headers, rowData);
  }
}
