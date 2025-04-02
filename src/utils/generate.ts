import { loadExcelFile } from "./excel"
import { aig } from "./sheet-classes/aig";
import { aigtable } from "./sheet-classes/aigtable";
import { arcos } from "./sheet-classes/arcos";
import { Base } from "./sheet-classes/Base";
import { common } from "./sheet-classes/common";
import { cscash } from "./sheet-classes/cscash";
import { deaconcern } from "./sheet-classes/deaconcern";
import { top10cs } from "./sheet-classes/top10cs";
import { topdr } from "./sheet-classes/topdr";
import { sheetOrder } from "./sheets";
import { TableData } from "./word";
import { utils } from 'xlsx';

export const generateInputFile = async (
  reportFilePath: string,
  calculationsFilePath: string,
  prevCalculationsFilePath: string,
  practitionersFilePath: string
) => {
  Base.report = await loadExcelFile(reportFilePath);
  Base.calculations = await TableData.fromDocx(calculationsFilePath);
  Base.prevCalculations = await TableData.fromDocx(prevCalculationsFilePath);
  Base.practitioners = await loadExcelFile(practitionersFilePath);

  const outData = utils.book_new();

  const sheets: Base[] = [
    new topdr(outData),
    ...aig.buildAll(outData),
    new top10cs(outData),
    new common(outData),
    new deaconcern(outData),
    new cscash(outData),
    new arcos(outData),
    new aigtable(outData),
  ];

  for (const sheet of sheets) {
    await sheet.build();
  }

  const updatedOrder = sheetOrder.filter(name => outData.SheetNames.includes(name));
  outData.SheetNames = [...updatedOrder];

  return outData;
}
