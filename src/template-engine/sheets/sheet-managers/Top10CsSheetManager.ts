import { toDecimalPercent } from "../../../utils/format";
import { TemplateGenerator } from "../../TemplateGenerator";
import { SheetManagerController } from "../SheetManagerController";
import { headers, sheetNames } from "../utils/constants";
import { SheetManager } from "./SheetManager";

// Top 10 Rx's on Analysys
type top10csRecord = {
  drug?: string;
  number?: number;
  csdoseperc?: number;
  totaldoseperc?: number;
  csdosenum?: number;
  totalcsnum?: number;
  totaldosenum?: number;
}

export class Top10CsSheetManager extends SheetManager {
  private data: top10csRecord[] = [];

  constructor(generator: TemplateGenerator, controller: SheetManagerController) {
    super(generator, controller, sheetNames.top10cs, headers.top10cs);
  }

  collect(): void {
    const analysisData = this.generator.report.analysis;
    const totalcsnum = analysisData.totalCsNum;
    const totaldosenum = this.generator.calculations.totals.totallAUDispensed;
    const rxInTop10 = analysisData.top10rx;

    for (const rx of rxInTop10) {
      const csdoesper = (rx.doses && totalcsnum) ? toDecimalPercent(rx.doses / totalcsnum) : 0;
      const totaldoseperc = (rx.doses && totaldosenum) ? toDecimalPercent(rx.doses / totaldosenum) : 0;

      const topRecord: top10csRecord = {
        drug: rx.drug,
        number: rx.number,
        csdoseperc: csdoesper,
        totaldoseperc: totaldoseperc,
        csdosenum: rx.doses,
        totalcsnum,
        totaldosenum
      }

      this.data.push(topRecord);
    }
  }

  generate(): void {
    // Build out the full data array, in header order
    const rowData = this.controller.buildDataArray(this.data, this.headers);
    // Create a new sheet on the base generator
    this.generator.addSheet(this.sheetName, this.headers, rowData);
  }
}
