import { WorkBook } from "xlsx";
import { Ifile } from "../../utils/file-system-service";
import { loadExcelFile } from "../../utils/excel";
import { SummaryHandler } from "./report-handlers/SummaryHandler";
import { AnalysisHandler } from "./report-handlers/AnalysisHandler";
import { SpatialHandler } from "./report-handlers/SpatialHandler";
import { TrinityHandler } from "./report-handlers/TrinityHandler";
import { ImmediateReleaseHandler } from "./report-handlers/ImmediateReleaseHandler";
import { MultiPracHandler } from "./report-handlers/MultiPracHandler";
import { MedHandler } from "./report-handlers/MedHandler";
import { CsRxHandler } from "./report-handlers/CsRxHandler";
import { AllRxHandler } from "./report-handlers/AllRxHandler";

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

export class ReportFile {
  private _workbook: WorkBook;

  readonly summary: SummaryHandler;
  readonly analysis: AnalysisHandler;
  readonly spatial: SpatialHandler;
  readonly trinity: TrinityHandler;
  readonly ir: ImmediateReleaseHandler;
  readonly multiPrac: MultiPracHandler;
  readonly med: MedHandler;
  readonly csrx: CsRxHandler;
  readonly allrx: AllRxHandler;

  constructor(file: Ifile) {
    this._workbook = loadExcelFile(file.content!);

    this.summary = new SummaryHandler(this._workbook);
    this.analysis = new AnalysisHandler(this._workbook);
    this.spatial = new SpatialHandler(this._workbook);
    this.trinity = new TrinityHandler(this._workbook);
    this.ir = new ImmediateReleaseHandler(this._workbook);
    this.multiPrac = new MultiPracHandler(this._workbook);
    this.med = new MedHandler(this._workbook);
    this.csrx = new CsRxHandler(this._workbook);
    this.allrx = new AllRxHandler(this._workbook);
  }

}
