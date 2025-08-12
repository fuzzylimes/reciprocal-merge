import { utils, WorkBook } from "xlsx";
import { ReportFile } from "./files/ReportFile";
import { CalculationsFile } from "./files/CalculationsFile";
import { PractitionersFile } from "./files/PractitionersFile";
import { SheetManagerController } from "./sheets/SheetManagerController";
import { sheetOrder } from "./sheets/utils/constants";
import { AIGLookup } from "./sheets/utils/aig-helper";

// Main generator class that orchestrates the process
export class TemplateGenerator {
  // Input files
  report: ReportFile;
  calculations: CalculationsFile;
  prevCalculations: CalculationsFile;
  practitioners: PractitionersFile;
  sheetManager: SheetManagerController;
  aigValues: AIGLookup;

  // Output workbook
  outputWorkbook: WorkBook;

  constructor(
    report: ReportFile,
    calculations: CalculationsFile,
    prevCalculations: CalculationsFile,
    practitioners: PractitionersFile,
    aigValues: AIGLookup,
  ) {
    this.report = report;
    this.calculations = calculations;
    this.prevCalculations = prevCalculations;
    this.practitioners = practitioners;
    this.outputWorkbook = utils.book_new();
    this.sheetManager = new SheetManagerController(this);
    this.aigValues = aigValues;
  }

  // Main generation method
  generate(): WorkBook {
    // 1. Collect all data using collector classes
    this.sheetManager.collectAll();

    // 2. Generate all sheets using generator classes
    this.sheetManager.generateAll();

    // 3. Reorder sheets
    this.reorderSheets();

    return this.outputWorkbook;
  }

  // Utility method to add a sheet to the workbook
  addSheet(name: string, headers: string[], data: unknown[][]): void {
    const worksheet = utils.aoa_to_sheet([headers, ...data]);
    utils.book_append_sheet(this.outputWorkbook, worksheet, name);
  }

  // Reorder the sheets in the workbook
  private reorderSheets(): void {
    const updatedOrder = sheetOrder.filter(name =>
      this.outputWorkbook.SheetNames.includes(name)
    );
    this.outputWorkbook.SheetNames = [...updatedOrder];
  }
}
