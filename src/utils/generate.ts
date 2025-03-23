import { loadExcelFile } from "./excel"
import { common } from "./generate-classes/common";
import { extractTableFromDocx } from "./word";
import { WorkBook, utils } from 'xlsx';

export interface IGenerate {
  outData: WorkBook;
  build(): Promise<void>;
}

export const generateInputFile = async (
  reportFilePath: string,
  calculationsFilePath: string,
  practitionersFilePath: string
) => {
  const reportData = await loadExcelFile(reportFilePath);
  const calculationsData = await extractTableFromDocx(calculationsFilePath);
  const practitionersData = await loadExcelFile(practitionersFilePath);

  const outData = utils.book_new();

  const sheets: IGenerate[] = [
    new common(outData, reportData, calculationsData, practitionersData),
  ];

  for (const sheet of sheets) {
    await sheet.build();
  }

  return outData;
}
