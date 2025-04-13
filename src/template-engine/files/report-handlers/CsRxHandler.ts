import { WorkBook } from "xlsx";
import { ReportSheets } from "../ReportFile";
import { BaseReportHandler } from "./BaseHandler";
import { csrxSheet } from "../../../utils/sheets";

export class CsRxHandler extends BaseReportHandler<csrxSheet> {

  constructor(_workbook: WorkBook) {
    super(_workbook, ReportSheets.csrx);
  }

  get csrxRows(): csrxSheet[] {
    return this.getAllRows() || [];
  }

}
