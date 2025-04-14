import { toDecimalPercent } from "../../../utils/format";
import { TemplateGenerator } from "../../TemplateGenerator";
import { SheetManagerController } from "../SheetManagerController";
import { SheetManager } from "./SheetManager";

type topdrRecord = {
  Number?: unknown;
  Name?: unknown;
  Specialty?: unknown;
  PracticeLocation?: unknown;
  DEA?: unknown;
  State?: unknown;
  csrx?: unknown;
  totalrx?: unknown;
  CSP?: unknown;
  CSCash?: unknown;
  Discipline?: unknown;
  Miles?: unknown;
}
const colHeaders = ['Number', 'Name', 'Specialty', 'PracticeLocation', 'DEA', 'State', 'csrx', 'totalrx', 'CSP', 'CSCash', 'Discipline', 'Miles'];

export class TopDrSheetManager extends SheetManager {
  private data: topdrRecord[] = [];

  constructor(generator: TemplateGenerator, controller: SheetManagerController) {
    super(generator, controller, 'topdr', colHeaders);
  }

  async collect(): Promise<void> {
    const top10DeaIds = this.generator.report.spatial.top10Dea;
    const spatialDeas = this.generator.report.spatial.spatialDea;
    const top10CsValues = this.generator.report.analysis.top10cs;
    const practitionerDetails = this.generator.practitioners.findPractionersByDeaList(...top10DeaIds);

    // Using the top 10 dea Ids, and their corresponding CS values, we need to build out the top dr object
    // for each of them.

    // Iterate over each of the ids. Their index will align with the order in top10CsValues
    for (const [i, d] of top10DeaIds.entries()) {
      const p = practitionerDetails[d];
      const { percentCsPaid: cashCell, totalCsRx: csrx, totalRx: totalrx } = top10CsValues[i];

      let csp, csCash;
      if (csrx && totalrx) {
        // CSP = ratio csrx / totalrx - only include if >= 20%
        const cspCalc = csrx / totalrx;
        if (cspCalc >= .2) {
          csp = cspCalc;
          // CS Cash = O, 7-16, in Analysis - only if CSP >= 20% and Cash >= 20%
          if (cashCell && cashCell >= .2) {
            csCash = cashCell;
          }
        }

        const drRecord: topdrRecord = {
          Number: i + 1,
          DEA: d,
          Name: p.Practitioner,
          PracticeLocation: p.PracticeLocation,
          Specialty: p.Specialty,
          State: p.State,
          csrx: csrx ? csrx : null,
          totalrx: totalrx ? totalrx : null,
          CSP: toDecimalPercent(csp),
          CSCash: toDecimalPercent(csCash),
          Discipline: p.Discipline,
          Miles: spatialDeas.includes(d) ? 'Over _ miles' : '_____'
        };
        this.data.push(drRecord);
      }
    }
  }

  async generate(): Promise<void> {
    // Build out the full data array, in header order
    const rowData = this.controller.buildDataArray(this.data, this.headers);
    // Create a new sheet on the base generator
    this.generator.addSheet(this.sheetName, this.headers, rowData);
  }
}
