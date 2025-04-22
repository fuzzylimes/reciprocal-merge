import { WorkBook } from "xlsx";
import { ReportSheets } from "../ReportFile";
import { BaseReportHandler } from "./BaseHandler";

type allrxSheet = {
  'DEA#': string;
  'DEA Sched': string;
  'Days Supply': number;
  'Patient ID': number;
  'Pay Type': string;
}

export class AllRxHandler extends BaseReportHandler<allrxSheet> {
  constructor(_workbook: WorkBook) {
    super(_workbook, ReportSheets.allrx);
  }

  get allRxRows(): allrxSheet[] {
    return this.getAllRows() || [];
  }

}
