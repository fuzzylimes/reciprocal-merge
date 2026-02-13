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
  private deaMap: Map<string, practitionerSheet>;

  constructor(file: Ifile) {
    const workbook = loadExcelFile(file.content!);
    this.pracSheet = utils.sheet_to_json<practitionerSheet>(workbook.Sheets[PractitionerSheets.ref], { blankrows: true });

    this.deaMap = new Map<string, practitionerSheet>();
    for (const practitioner of this.pracSheet) {
      if (practitioner.DEA) {
        this.deaMap.set(practitioner.DEA, practitioner);
      }
    }
  }

  /**
   * Steps through the entire DB and pulls out the practitioner information for the provided Ids
   * @param dea takes in a list of dea ids
   * @returns a mapping of dea ids to the practitioner information out of the DB
   */
  findPractionersByDeaList = (...dea: string[]): Record<string, Practitioner> => {
    if (!this.pracSheet || !this.pracSheet.length) {
      throw Error(`Practitioner DB is empty.`)
    }

    const practitioners: Record<string, Practitioner> = {};
    for (const deaId of dea) {
      const p = this.deaMap.get(deaId);
      if (p) {
        practitioners[p.DEA] = {
          Practitioner: String(p.Practitioner.split(' (')[0] ?? ''),
          Specialty: String(p.Specialty ?? ''),
          PracticeLocation: String(p.PracticeLocation ?? ''),
          DEA: p.DEA,
          State: String(p.State ?? ''),
          Discipline: p.Discipline ? String(p.Discipline) : undefined,
          Note: p['PC Note - Pharm'] ? String(p['PC Note - Pharm']) : undefined,
          Date: p['PC Notes Date'] ? p['PC Notes Date'] : undefined
        };
      }
    }

    return practitioners;
  }

  findPractitionerByDea = (dea: string): Practitioner => {
    const practitioners = this.findPractionersByDeaList(dea);
    return practitioners[0];
  }

}
