import { loadExcelFile } from "./excel"
import { aig } from "./sheet-classes/aig";
import { arcos } from "./sheet-classes/arcos";
import { Base } from "./sheet-classes/Base";
import { common } from "./sheet-classes/common";
import { cscash } from "./sheet-classes/cscash";
import { deaconcern } from "./sheet-classes/deaconcern";
import { top10cs } from "./sheet-classes/top10cs";
import { TableData } from "./word";
import { utils, WorkBook } from 'xlsx';

export const generateInputFile = async (
  reportFilePath: string,
  calculationsFilePath: string,
  practitionersFilePath: string
) => {
  const reportData = await loadExcelFile(reportFilePath);
  const calculationsData = await TableData.fromDocx(calculationsFilePath);
  const practitionersData = await loadExcelFile(practitionersFilePath);

  const outData = utils.book_new();

  type input = [WorkBook, WorkBook, TableData, WorkBook];
  const params: input = [outData, reportData, calculationsData, practitionersData];


  const sheets: Base[] = [
    ...aig.buildAll(...params),
    new common(...params),
    new deaconcern(...params),
    new cscash(...params),
    new arcos(...params),
    new top10cs(...params),
  ];

  for (const sheet of sheets) {
    await sheet.build();
  }

  return outData;
}
