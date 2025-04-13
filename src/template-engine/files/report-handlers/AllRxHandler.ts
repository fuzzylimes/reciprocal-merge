import { WorkBook } from "xlsx";
import { ReportSheets } from "../ReportFile";
import { BaseReportHandler } from "./BaseHandler";
import { allrxSheet } from "../../../utils/sheets";

export class AllRxHandler extends BaseReportHandler<allrxSheet> {
  constructor(_workbook: WorkBook) {
    super(_workbook, ReportSheets.allrx);
  }

  get allRxRows(): allrxSheet[] {
    return this.getAllRows() || [];
  }

}
