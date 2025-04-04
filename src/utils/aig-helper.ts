
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
  base?: string;
}

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

export const aigLookup: Record<number, IaigDef> = {
  1: {
    label: 'Alprazolam Family',
    names: ['alprazolam', 'xanax'],
    operation: '>',
    high: 4,
    duMonthCell: 'Alprazolam',
    aigSheetNum: 1,
    aigReference: aigReference.alprazfam
  },
  2: {
    label: 'Alprazolam 2mg',
    names: ['alprazolam*2 mg', 'xanax*2 mg'],
    operation: '>',
    high: 4,
    duMonthCell: 'Alprazolam 2mg',
    aigSheetNum: 2,
    aigReference: aigReference.alpraz2
  },
  3: {
    label: 'Amphetamine',
    family: 'amphetamine',
    operation: '>',
    high: 40,
    duMonthCell: 'Amphetamine',
    aigSheetNum: 3,
    aigReference: aigReference.amphet,
    base: 'amphetamine'
  },
  4: {
    label: 'Buprenorphine 8mg',
    family: 'buprenorphine',
    names: ['8 mg'],
    operation: '>=',
    high: 32,
    per: true,
    duMonthCell: 'Buprenorphine 8mg',
    aigSheetNum: 4,
    aigReference: aigReference.bupe
  },
  5: {
    label: 'Carisoprodol',
    family: 'carisoprodol',
    operation: '>=',
    high: 1400,
    duMonthCell: 'Carisoprodol',
    aigSheetNum: 5,
    aigReference: aigReference.cariso,
    base: 'carisoprodol'
  },
  6: {
    label: 'Fentanyl',
    family: 'fentanyl',
    operation: '>',
    high: 37.5,
    med: 2.4,
    duMonthCell: 'Fentanyl',
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
    duMonthCell: 'Hydrocodone',
    aigSheetNum: 7,
    aigReference: aigReference.hydroco,
    base: 'hydrocofam'
  },
  8: {
    label: 'Hydrocodone 10/325mg',
    family: 'hydrocodone',
    names: ['10-325 mg'],
    operation: '>=',
    high: 90,
    per: true,
    med: 1,
    duMonthCell: 'Hydrocodone 10/325mg',
    aigSheetNum: 8,
    aigReference: aigReference.hydroco10,
    base: 'hydroco10/325'
  },
  9: {
    label: 'Hydromorphone',
    family: 'hydromorphone',
    operation: '>=',
    high: 22.5,
    med: 4,
    duMonthCell: 'Hydromorphone',
    aigSheetNum: 9,
    aigReference: aigReference.hydromorph
  },
  10: {
    label: 'Hydromorphone 8mg',
    family: 'hydromorphone',
    names: ['8 mg'],
    operation: '>=',
    high: 22.5,
    med: 1,
    duMonthCell: 'Hydromorphone 8mg',
    aigSheetNum: 10,
    aigReference: aigReference.hydromorph8
  },
  11: {
    label: 'Lisdexamfetamine',
    family: 'lisdexamfetamine',
    operation: '>',
    high: 70,
    duMonthCell: 'Lisdexamfetamine',
    aigSheetNum: 11,
    aigReference: aigReference.lisdex
  },
  12: {
    label: 'Methadone',
    family: 'methadone',
    operation: '>=',
    high: 20,
    med: 4,
    duMonthCell: 'Methadone',
    aigSheetNum: 12,
    aigReference: aigReference.metha,
    base: 'methadone'
  },
  13: {
    label: 'Methylphenidate',
    family: 'methylphenidate',
    operation: '>=',
    high: 60,
    duMonthCell: 'Methylphenidate',
    aigSheetNum: 13,
    aigReference: aigReference.methyl,
    base: 'methylphen'
  },
  14: {
    label: 'Morphine',
    family: 'morphine',
    operation: '>=',
    high: 90,
    med: 1,
    duMonthCell: 'Morphine',
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
    duMonthCell: 'Oxycodone',
    aigSheetNum: 15,
    aigReference: aigReference.oxy,
    base: 'oxycodone'
  },
  16: {
    label: 'Oxycodone 15mg',
    family: 'oxycodone',
    names: ['15 mg'],
    operation: '>=',
    high: 60,
    med: 1.5,
    duMonthCell: 'Oxycodone 15mg',
    aigSheetNum: 16,
    aigReference: aigReference.oxy15
  },
  17: {
    label: 'Oxycodone 30mg',
    family: 'oxycodone',
    names: ['30 mg'],
    operation: '>=',
    high: 60,
    med: 1.5,
    duMonthCell: 'Oxycodone 30mg',
    aigSheetNum: 17,
    aigReference: aigReference.oxy30
  },
  18: {
    label: 'Oxycodone 10/325mg',
    family: 'oxycodone',
    names: ['10-325 mg'],
    operation: '>=',
    high: 60,
    med: 1.5,
    duMonthCell: 'Oxycodone 10/325mg',
    aigSheetNum: 18,
    aigReference: aigReference.oxy10,
    base: 'oxy10/325'
  },
  19: {
    label: 'Oxymorphone',
    family: 'oxymorphone',
    operation: '>=',
    high: 30,
    med: 3,
    duMonthCell: 'Oxymorphone',
    aigSheetNum: 19,
    aigReference: aigReference.oxymorph
  },
  20: {
    label: 'Tramadol',
    family: 'tramadol',
    operation: '>',
    high: 900,
    med: 0.2,
    duMonthCell: 'Tramadol',
    aigSheetNum: 20,
    aigReference: aigReference.tram,
    base: 'tramadol'
  },
}

export const getAigByReference = (aig: aigReference): IaigDef => {
  switch (aig) {
    case aigReference.alprazfam: return aigLookup[1];
    case aigReference.alpraz2: return aigLookup[2];
    case aigReference.amphet: return aigLookup[3];
    case aigReference.bupe: return aigLookup[4];
    case aigReference.cariso: return aigLookup[5];
    case aigReference.fent: return aigLookup[6];
    case aigReference.hydroco: return aigLookup[7];
    case aigReference.hydroco10: return aigLookup[8];
    case aigReference.hydromorph: return aigLookup[9];
    case aigReference.hydromorph8: return aigLookup[10];
    case aigReference.lisdex: return aigLookup[11];
    case aigReference.metha: return aigLookup[12];
    case aigReference.methyl: return aigLookup[13];
    case aigReference.morph: return aigLookup[14];
    case aigReference.oxy: return aigLookup[15];
    case aigReference.oxy15: return aigLookup[16];
    case aigReference.oxy30: return aigLookup[17];
    case aigReference.oxy10: return aigLookup[18];
    case aigReference.oxymorph: return aigLookup[19];
    case aigReference.tram: return aigLookup[20];
    default: throw Error('Unsupported reference');
  }
}

export type aigTracking = {
  highpct: number;
  highmed: number;
  lowmed: number;
  per: number;
  month: number;
  times: number;
}
