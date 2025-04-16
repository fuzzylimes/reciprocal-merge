import { aigRecord, aigTableRecord, arcosRecord, commonRecord, cscashRecord, deaconcernRecord, top10csRecord, topdrRecord } from "../../utils/sheets";

// Central data structure to organize all collected data
export interface TemplateData {
  commonData: commonRecord;
  top10Records: top10csRecord[];
  aigRecords: Record<number, aigRecord[]>;
  topDrRecords: topdrRecord[];
  deaConcernRecords: deaconcernRecord[];
  cscashRecords: cscashRecord[];
  arcosRecords: arcosRecord[];
  aigTableRecords: aigTableRecord[];
}
