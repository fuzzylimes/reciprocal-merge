import { WorkBook } from "xlsx";
import { ReportSheets } from "../ReportFile";
import { BaseReportHandler } from "./BaseHandler";

export type csrxSheet = {
  'Drug Name': string;
  Family: string;
  'mg/day'?: number;
  'mg per day'?: number;
  'DEA#': string;
  Qty: number;
  'DEA Sched': string;
}

export class CsRxHandler extends BaseReportHandler<csrxSheet> {

  constructor(_workbook: WorkBook) {
    super(_workbook, ReportSheets.csrx);
  }

  get csrxRows(): csrxSheet[] {
    return this.getAllRows() || [];
  }

}
