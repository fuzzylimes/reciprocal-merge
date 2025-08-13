import { drugNames } from "../../../utils/drugNames";

// Model of the AIG details
export interface IaigDef {
  label: string;
  names?: string[];
  family?: string;
  duMonthCell: string;
  operation: string;
  high: number;
  per?: boolean;
  med?: number;
  aigSheetNum: number;
  aigReference: aigReference;
  base?: string; // Used when the aigReference doesn't match what's used as the base for the common page values
}

// abbreviations for aig medications. Used when building out the common values (i.e. bupehigh)
export enum aigReference {
  alprazfam = 'alprazfam',
  alpraz2 = 'alpraz2',
  amphet = 'amphet',
  bupe = 'bupe',
  cariso = 'cariso',
  fent = 'fent',
  hydroco = 'hydroco',
  hydroco10 = 'hydroco10',
  hydromorph = 'hydromorph',
  hydromorph8 = 'hydromorph8',
  lisdex = 'lisdex',
  metha = 'metha',
  methyl = 'methyl',
  morph = 'morph',
  oxy = 'oxy',
  oxy15 = 'oxy15',
  oxy30 = 'oxy30',
  oxy10 = 'oxy10',
  oxymorph = 'oxymorph',
  tram = 'tram'
}


/**
 * This is the full mapping information for each of the AIG medications. It's used in order to calculate
 * both the data on the AIG pages as well as the AIG related common data.
 * 
 * The number key corresponds with sheet number for the specific AIG sheet.
 * Either names or family must be included. If both are provided, both filters will be applied.
 * per and med values depend on magic. Not all drugs have it.
 * base is used in the situation where the sheet prefix doesn't match the aigReference
*/
export type AIGLookup = Record<number, IaigDef>;
export const aigLookup: AIGLookup = {
  1: {
    label: 'Alprazolam Family',
    names: ['alprazolam', 'xanax'],
    operation: '>',
    high: 4,
    duMonthCell: drugNames.alprazfam,
    aigSheetNum: 1,
    aigReference: aigReference.alprazfam
  },
  2: {
    label: drugNames.alpraz2,
    names: ['alprazolam*2 mg', 'xanax*2 mg'],
    operation: '>',
    high: 4,
    duMonthCell: drugNames.alpraz2,
    aigSheetNum: 2,
    aigReference: aigReference.alpraz2
  },
  3: {
    label: drugNames.amphet,
    family: 'amphetamine',
    operation: '>',
    high: 40,
    duMonthCell: drugNames.amphet,
    aigSheetNum: 3,
    aigReference: aigReference.amphet,
    base: 'amphetamine'
  },
  4: {
    label: drugNames.bupe,
    family: 'buprenorphine',
    names: ['8 mg'],
    operation: '>=',
    high: 32,
    per: true,
    duMonthCell: drugNames.bupe,
    aigSheetNum: 4,
    aigReference: aigReference.bupe
  },
  5: {
    label: drugNames.cariso,
    family: 'carisoprodol',
    operation: '>=',
    high: 1400,
    duMonthCell: drugNames.cariso,
    aigSheetNum: 5,
    aigReference: aigReference.cariso,
    base: 'carisoprodol'
  },
  6: {
    label: drugNames.fent,
    family: 'fentanyl',
    operation: '>=',
    high: 0.9,
    med: 100,
    duMonthCell: drugNames.fent,
    aigSheetNum: 6,
    aigReference: aigReference.fent,
    base: 'fentanyl'
  },
  7: {
    label: 'Hydrocodone Family',
    family: 'hydrocodone',
    operation: '>=',
    high: 90,
    med: 1,
    duMonthCell: drugNames.hydroco,
    aigSheetNum: 7,
    aigReference: aigReference.hydroco,
    base: 'hydrocofam'
  },
  8: {
    label: drugNames.hydroco10,
    family: 'hydrocodone',
    names: ['10-325 mg'],
    operation: '>=',
    high: 90,
    per: true,
    med: 1,
    duMonthCell: drugNames.hydroco10,
    aigSheetNum: 8,
    aigReference: aigReference.hydroco10,
    base: 'hydroco10/325'
  },
  9: {
    label: drugNames.hydromorph,
    family: 'hydromorphone',
    operation: '>=',
    high: 22.5,
    med: 4,
    duMonthCell: drugNames.hydromorph,
    aigSheetNum: 9,
    aigReference: aigReference.hydromorph
  },
  10: {
    label: drugNames.hydromorph8,
    family: 'hydromorphone',
    names: ['8 mg'],
    operation: '>=',
    high: 22.5,
    med: 4,
    duMonthCell: drugNames.hydromorph8,
    aigSheetNum: 10,
    aigReference: aigReference.hydromorph8
  },
  11: {
    label: drugNames.lisdex,
    family: 'lisdexamfetamine',
    operation: '>',
    high: 70,
    duMonthCell: drugNames.lisdex,
    aigSheetNum: 11,
    aigReference: aigReference.lisdex
  },
  12: {
    label: drugNames.metha,
    family: 'methadone',
    operation: '>=',
    high: 20,
    med: 4,
    duMonthCell: drugNames.metha,
    aigSheetNum: 12,
    aigReference: aigReference.metha,
    base: 'methadone'
  },
  13: {
    label: drugNames.methyl,
    family: 'methylphenidate',
    operation: '>=',
    high: 60,
    duMonthCell: drugNames.methyl,
    aigSheetNum: 13,
    aigReference: aigReference.methyl,
    base: 'methylphen'
  },
  14: {
    label: drugNames.morph,
    family: 'morphine',
    operation: '>=',
    high: 90,
    med: 1,
    duMonthCell: drugNames.morph,
    aigSheetNum: 14,
    aigReference: aigReference.morph,
    base: 'morphine'
  },
  15: {
    label: 'Oxycodone Family',
    family: 'oxycodone',
    operation: '>=',
    high: 60,
    med: 1.5,
    duMonthCell: drugNames.oxy,
    aigSheetNum: 15,
    aigReference: aigReference.oxy,
    base: 'oxycodone'
  },
  16: {
    label: drugNames.oxy15,
    family: 'oxycodone',
    names: ['15 mg'],
    operation: '>=',
    high: 60,
    med: 1.5,
    duMonthCell: drugNames.oxy15,
    aigSheetNum: 16,
    aigReference: aigReference.oxy15
  },
  17: {
    label: drugNames.oxy30,
    family: 'oxycodone',
    names: ['30 mg'],
    operation: '>=',
    high: 60,
    med: 1.5,
    duMonthCell: drugNames.oxy30,
    aigSheetNum: 17,
    aigReference: aigReference.oxy30
  },
  18: {
    label: drugNames.oxy10,
    family: 'oxycodone',
    names: ['10-325 mg'],
    operation: '>=',
    high: 60,
    med: 1.5,
    duMonthCell: drugNames.oxy10,
    aigSheetNum: 18,
    aigReference: aigReference.oxy10,
    base: 'oxy10/325'
  },
  19: {
    label: drugNames.oxymorph,
    family: 'oxymorphone',
    operation: '>=',
    high: 30,
    med: 3,
    duMonthCell: drugNames.oxymorph,
    aigSheetNum: 19,
    aigReference: aigReference.oxymorph
  },
  20: {
    label: drugNames.tram,
    family: 'tramadol',
    operation: '>=',
    high: 450,
    med: 0.2,
    duMonthCell: drugNames.tram,
    aigSheetNum: 20,
    aigReference: aigReference.tram,
    base: 'tramadol'
  },
}
