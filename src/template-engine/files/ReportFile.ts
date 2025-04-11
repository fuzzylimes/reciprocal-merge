import { utils, WorkBook, WorkSheet } from "xlsx";
import { Ifile } from "../../utils/file-system-service";
import { loadExcelFile } from "../../utils/excel";
import { SummaryHandler } from "./report-handlers/SummaryHandler";
import { AnalysisHandler } from "./report-handlers/AnalysisHandler";

export enum ReportSheets {
  summary = 'Summary',
  analysis = 'Analysis',
  trinityConcerns = 'Trinity Concerns',
  immediateRelease = 'Immediate Release',
  multiPractioner = 'Multi-Practitioner',
  medWatch = 'M.E.D Watch',
  spatial = 'Spatial Analysis',
  csrx = 'CS Rx\'s',
  allrx = 'All Rx\'s'
}

type trinitySheet = {
  'Patient ID': number;
  'Family': string;
}

type irSheet = {
  'Drug Name': string;
  'Patient ID': number;
}

type multipracSheet = {
  'Patient ID': number;
}

type medSheet = {
  'Daily M.E.D per Prescription': string;
  'Patient ID': number;
  'DEA#': string;
  'Physician Name': string;
}

type csrxSheet = {
  'Drug Name': string;
  Family: string;
  'mg/day': number;
  'DEA#': string;
  Qty: number;
  'DEA Sched': string;
}

type allrxSheet = {
  'DEA#': string;
  'DEA Sched': string;
  'Days Supply': number;
  'Patient ID': number;
  'Pay Type': string;
}


export class ReportFile {
  private _workbook: WorkBook;
  private summarySheet: WorkSheet;
  private analysisSheet: WorkSheet;
  private spatialSheet: WorkSheet;
  private trinitySheet: trinitySheet[];
  private immRelSheet: irSheet[];
  private multiPracSheet: multipracSheet[];
  private medSheet: medSheet[];
  private csrxSheet: csrxSheet[];
  private allrxSheet: allrxSheet[];

  readonly summary: SummaryHandler;
  readonly analysis: AnalysisHandler;

  constructor(file: Ifile) {
    this._workbook = loadExcelFile(file.content!);
    this.summarySheet = this._workbook.Sheets[ReportSheets.summary];
    this.analysisSheet = this._workbook.Sheets[ReportSheets.analysis];
    this.spatialSheet = this._workbook.Sheets[ReportSheets.spatial];
    const trinity = this._workbook.Sheets[ReportSheets.trinityConcerns];
    this.trinitySheet = utils.sheet_to_json<trinitySheet>(trinity)
    const imm = this._workbook.Sheets[ReportSheets.immediateRelease];
    this.immRelSheet = utils.sheet_to_json<irSheet>(imm);
    const multi = this._workbook.Sheets[ReportSheets.multiPractioner];
    this.multiPracSheet = utils.sheet_to_json<multipracSheet>(multi);
    const med = this._workbook.Sheets[ReportSheets.medWatch];
    this.medSheet = utils.sheet_to_json<medSheet>(med);
    const csrx = this._workbook.Sheets[ReportSheets.csrx];
    this.csrxSheet = utils.sheet_to_json<csrxSheet>(csrx);
    const allrx = this._workbook.Sheets[ReportSheets.allrx];
    this.allrxSheet = utils.sheet_to_json<allrxSheet>(allrx);

    this.summary = new SummaryHandler(this._workbook);
    this.analysis = new AnalysisHandler(this._workbook);
  }


}
