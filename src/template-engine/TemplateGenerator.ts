import { utils, WorkBook } from "xlsx";
import { TemplateData } from "./models/TemplateData";
import { aigReference, aigTracking } from "../utils/aig-helper";
import { ReportFile } from "./files/ReportFile";
import { CalculationsFile } from "./files/CalculationsFile";
import { PractitionersFile } from "./files/PractitionersFile";
import { sheetOrder } from "../utils/sheets";

// Main generator class that orchestrates the process
export class TemplateGenerator {
  // Input files
  report: ReportFile;
  calculations: CalculationsFile;
  prevCalculations: CalculationsFile;
  practitioners: PractitionersFile;

  // Output workbook
  outputWorkbook: WorkBook;

  // Structured container for all collected data
  data: TemplateData = {
    commonData: {},
    top10Records: [],
    aigRecords: {},
    topDrRecords: [],
    deaConcernRecords: [],
    cscashRecords: [],
    arcosRecords: [],
    aigTableRecords: []
  };

  // Utility data (currently in Base static properties)
  top10Count: number = 0;
  top10dea: string[] = [];
  deaMiles: string[] = [];
  missingDea: string[] = [];
  aigData: Record<aigReference, Partial<aigTracking>> = Object.fromEntries(
    Object.values(aigReference).map(key => [key, {}])
  ) as Record<aigReference, Partial<aigTracking>>;

  constructor(
    report: ReportFile,
    calculations: CalculationsFile,
    prevCalculations: CalculationsFile,
    practitioners: PractitionersFile,
  ) {
    this.report = report;
    this.calculations = calculations;
    this.prevCalculations = prevCalculations;
    this.practitioners = practitioners;
    this.outputWorkbook = utils.book_new();
  }

  // Main generation method
  async generate(): Promise<WorkBook> {
    // 1. Collect all data using collector classes
    await this.collectAllData();

    // 2. Generate all sheets using generator classes
    await this.generateAllSheets();

    // 3. Reorder sheets
    this.reorderSheets();

    return this.outputWorkbook;
  }

  private async collectAllData(): Promise<void> {
    // etc.
  }

  private async generateAllSheets(): Promise<void> {
    // etc.
  }

  // Utility method to add a sheet to the workbook
  addSheet(name: string, headers: string[], data: unknown[][]): void {
    const worksheet = utils.aoa_to_sheet([headers, ...data]);
    utils.book_append_sheet(this.outputWorkbook, worksheet, name);
  }

  private reorderSheets(): void {
    const updatedOrder = sheetOrder.filter(name =>
      this.outputWorkbook.SheetNames.includes(name)
    );
    this.outputWorkbook.SheetNames = [...updatedOrder];
  }
}
