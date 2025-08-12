import { Ifile } from "../utils/file-system-service";
import { CalculationsFile } from "./files/CalculationsFile";
import { PractitionersFile } from "./files/PractitionersFile";
import { ReportFile } from "./files/ReportFile";
import { AIGLookup } from "./sheets/utils/aig-helper";
import { TemplateGenerator } from "./TemplateGenerator";

export const generateInputFile = (
  reportFile: Ifile,
  calculationsFile: Ifile,
  prevCalculationsFile: Ifile,
  practitionersFile: Ifile,
  aigOverrides: AIGLookup
) => {
  // Load input files
  const report = new ReportFile(reportFile);
  const calculations = new CalculationsFile(calculationsFile);
  const prevCalculations = new CalculationsFile(prevCalculationsFile);
  const practitioners = new PractitionersFile(practitionersFile);

  // Create generator
  return new TemplateGenerator(
    report, calculations, prevCalculations, practitioners, aigOverrides
  );
};
