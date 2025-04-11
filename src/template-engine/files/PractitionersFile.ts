import { utils } from "xlsx";
import { loadExcelFile } from "../../utils/excel";
import { Ifile } from "../../utils/file-system-service";

export enum PractitionerSheets {
  ref = 'Reference'
}

export type practitionerSheet = {
  'Last Name First': string;
  Practitioner: string;
  Specialty: string;
  PracticeLocation: string;
  DEA: string;
  State: string;
  Discipline: string;
  'PC Note - Pharm': string;
  'PC Notes Date': Date;
};

export type Practitioner = {
  Practitioner: string;
  Specialty: string;
  PracticeLocation: string;
  DEA: string;
  State: string;
  Discipline: string | undefined;
  Note: string | undefined;
  Date: Date | undefined;
}

export class PractitionersFile {
  private pracSheet: practitionerSheet[];

  constructor(file: Ifile) {
    const workbook = loadExcelFile(file.content!);
    this.pracSheet = utils.sheet_to_json<practitionerSheet>(workbook.Sheets[PractitionerSheets.ref], { blankrows: true });
  }

  findPractionersByDea = (...dea: string[]): Practitioner[] => {
    if (!this.pracSheet || !this.pracSheet.length) {
      throw Error(`Practitioner DB is empty.`)
    }

    const practitioners: Practitioner[] = [];
    for (const p of this.pracSheet) {
      if (dea.includes(p.DEA)) {
        practitioners.push({
          Practitioner: String(p.Practitioner.split(' (')[0] ?? ''),
          Specialty: String(p.Specialty ?? ''),
          PracticeLocation: String(p.PracticeLocation ?? ''),
          DEA: p.DEA,
          State: String(p.State ?? ''),
          Discipline: p.Discipline ? String(p.Discipline) : undefined,
          Note: p['PC Note - Pharm'] ? String(p['PC Note - Pharm']) : undefined,
          Date: p['PC Notes Date'] ? p['PC Notes Date'] : undefined
        });
      }
    }

    return practitioners;
  }

  findPractitionerByDea = (dea: string): Practitioner => {
    const practitioners = this.findPractionersByDea(dea);
    return practitioners[0];
  }

}
