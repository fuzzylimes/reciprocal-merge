import { TemplateGenerator } from "../../TemplateGenerator";
import { SheetManagerController } from "../SheetManagerController";
import { SheetManager } from "./SheetManager";

type cscashRecord = {
  drug?: unknown;
  percent?: unknown;
}
const colHeaders = ['drug', 'percent'];

export class CsCashSheetManager extends SheetManager {
  private data: cscashRecord[] = [];

  constructor(generator: TemplateGenerator, controller: SheetManagerController) {
    super(generator, controller, 'cscash', colHeaders);
  }

  async collect(): Promise<void> {
    const summaryData = this.generator.report.summary;
    const cscash = summaryData.cashCs;

    if (!cscash || cscash < .2) return;

    const rxData = summaryData.cashOver20;
    for (const rx of rxData) {
      const label = rx.drug?.replace('$ Pay ', '')?.replace('Rx', '') || '';
      this.data.push({ drug: label, percent: rx.percent });
    }
  }

  async generate(): Promise<void> {
    // Build out the full data array, in header order
    const rowData = this.controller.buildDataArray(this.data, this.headers);
    // Create a new sheet on the base generator
    this.generator.addSheet(this.sheetName, this.headers, rowData);
  }
}
