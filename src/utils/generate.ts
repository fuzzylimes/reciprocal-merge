import { loadExcelFile } from "./excel"
import { Ifile } from "./file-system-service";
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
  reportFile: Ifile,
  calculationsFile: Ifile,
  prevCalculationsFile: Ifile,
  practitionersFile: Ifile
) => {
  Base.report = await loadExcelFile(reportFile.content!);
  Base.calculations = await TableData.fromDocx(calculationsFile.content!);
  Base.prevCalculations = await TableData.fromDocx(prevCalculationsFile.content!);
  Base.practitioners = await loadExcelFile(practitionersFile.content!);

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

  // We need values on Base to be set before we can finally build this
  await (sheets[0] as topdr).superbuild();

  const updatedOrder = sheetOrder.filter(name => outData.SheetNames.includes(name));
  outData.SheetNames = [...updatedOrder];

  return outData;
}
