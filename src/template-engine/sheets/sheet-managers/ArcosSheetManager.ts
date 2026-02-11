import { drugNames } from "../../../utils/drugNames";
import { TemplateGenerator } from "../../TemplateGenerator";
import { SheetManagerController } from "../SheetManagerController";
import { headers, sheetNames } from "../utils/constants";
import { SheetManager } from "./SheetManager";

type arcosRecord = {
  drug?: string;
  Mutual?: unknown;
  supplier2?: unknown;
  supplier3?: unknown;
  SumOfDU?: unknown;
  ARCOStotal?: unknown;
  Dispensing?: number;
}

export class ArcosSheetManager extends SheetManager {
  private data: arcosRecord[] = [];

  constructor(generator: TemplateGenerator, controller: SheetManagerController) {
    super(generator, controller, sheetNames.arcos, headers.arcos);
  }

  collect(): void {
    const calculationData = this.generator.calculations.drugs;

    const drugReport = [
      drugNames.amphet,
      drugNames.bupe,
      drugNames.code,
      drugNames.fent,
      drugNames.hydroco,
      drugNames.hydromorph,
      drugNames.lisdex,
      drugNames.mep,
      drugNames.metha,
      drugNames.methyl + 'Total',
      drugNames.morph,
      drugNames.oxy,
      drugNames.oxymorph,
      drugNames.tap    
    ]

    for (let i = 0; i < drugReport.length; i++) {
      const rx = drugReport[i];
      const dn = rx?.replace('Total', '') || rx;
      const row = i + 2; // Row 2 is first data row (row 1 is headers)
      this.data.push({
        drug: dn,
        Mutual: '',
        supplier2: '',
        supplier3: '',
        SumOfDU: '',
        ARCOStotal: { t: 'n', f: `E${row}/2` },
        Dispensing: calculationData.get(dn)?.total || 0
      })
    }

    // For now, this is a copy/paste effort. May revist at another time.
  }

  generate(): void {
    const rowData = this.controller.buildDataArray(this.data, this.headers);
    this.generator.addSheet(this.sheetName, this.headers, rowData);
  }
}
