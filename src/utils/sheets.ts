export enum ReportSheets {
  summary = 'Summary',
  analysis = 'Analysis',
  trinityConcerns = 'Trinity Concerns',
  immediateRelease = 'Immediate Release',
  multiPractioner = 'Multi-Practitioner',
  medWatch = 'M.E.D Watch',
  spatial = 'Spatial Analysis',
  csrx = 'CS Rx\'s',
  allrx = 'All Rx\'s'
}

export type trinitySheet = {
  'Patient ID': number;
  'Family': string;
}

export type irSheet = {
  'Drug Name': string;
  'Patient ID': number;
}

export type multipracSheet = {
  'Patient ID': number;
}

export type medSheet = {
  'Daily M.E.D per Prescription': string;
  'Patient ID': number;
  'DEA#': string;
  'Physician Name': string;
}

// Spatial will continue to use dirrect cell references due to the way the page is setup

export type csrxSheet = {
  'Drug Name': string;
  Family: string;
  'mg/day': number;
  'DEA#': string;
  Qty: number;
  'DEA Sched': string;
}

export type allrxSheet = {
  'DEA#': string;
  'DEA Sched': string;
  'Days Supply': number;
  'Patient ID': number;
  'Pay Type': string;
}

export const headers = {
  common: ['name', 'account', 'dea', 'address', 'daterange', 'rxday', 'rxmonth', 'csrxvol', 'csdu', 'purchase', 'cspurchase', 'cashnoncs', 'cashcs', 'top10csnum', 'trinitynum', 'trinity', 'immednum', 'imm', 'multipracnum', 'multiprac', 'highmednum', 'highmed', 'highmedpres', 'spatial', 'csphyphys', 'phyphys', 'csphypt', 'phypt', 'csphyspt', 'physpt', 'alprazfam', 'alprazfamdumonth', 'alprazfamtimes', 'alprazfamhigh', 'alpraz2', 'alpraz2dumonth', 'alpraz2times', 'alpraz2high', 'amphetamine', 'amphetdumonth', 'amphettimes', 'amphethigh', 'bupe', 'bupedumonth', 'bupetimes', 'bupehigh', 'bupeper', 'carisoprodol', 'carisodumonth', 'carisotimes', 'carisohigh', 'fentanyl', 'fentdumonth', 'fenttimes', 'fenthigh', 'fentmedhigh', 'fentmedlow', 'hydrocofam', 'hydrocodumonth', 'hydrocotimes', 'hydrocohigh', 'hydrocomedhigh', 'hydrocomedlow', 'hydroco10/325', 'hydroco10dumonth', 'hydroco10times', 'hydroco10high', 'hydroco10per', 'hydroco10medhigh', 'hydroco10medlow', 'hydromorph', 'hydromorphdumonth', 'hydromorphtimes', 'hydromorphhigh', 'hydromorphmedhigh', 'hydromorphmedlow', 'hydromorph8', 'hydromorph8dumonth', 'hydromorph8times', 'hydromorph8high', 'hydromorph8medhigh', 'hydromorph8medlow', 'lisdex', 'lisdexdumonth', 'lisdextimes', 'lisdexhigh', 'methadone', 'methadumonth', 'methatimes', 'methahigh', 'methamedhigh', 'methamedlow', 'methylphen', 'methyldumonth', 'methyltimes', 'methylhigh', 'morphine', 'morphdumonth', 'morphtimes', 'morphhigh', 'morphmedhigh', 'morphmedlow', 'oxycodone', 'oxydumonth', 'oxytimes', 'oxyhigh', 'oxymedhigh', 'oxymedlow', 'oxy15', 'oxy15dumonth', 'oxy15times', 'oxy15high', 'oxy15medhigh', 'oxy15medlow', 'oxy30', 'oxy30dumonth', 'oxy30times', 'oxy30high', 'oxy30medhigh', 'oxy30medlow', 'oxy10/325', 'oxy10dumonth', 'oxy10times', 'oxy10high', 'oxy10medhigh', 'oxy10medlow', 'oxymorph', 'oxymorphdumonth', 'oxymorphtimes', 'oxymorphhigh', 'oxymorphmedhigh', 'oxymorphmedlow', 'tramadol', 'tramdumonth', 'tramtimes', 'tramhigh', 'trammedhigh', 'trammedlow', 'prevdate', 'currentdate', 'soms', 'arcosmonth', 'arcossupnum'],
  aig: ['AIG', 'Name', 'isTop10', 'Specialty', 'PracticeLocation', 'DEA', 'State', 'numCS', 'totalRx', 'CSP', 'CSCash', 'Discipline', 'Miles', 'numpt'],
  deaconcern: ['DEAnumber', 'Name', 'Problem'],
  cscash: ['drug', 'percent'],
  arcos: ['drug', 'Mutual', 'supplier2', 'supplier3'],
  top10cs: ['drug', 'number', 'csdoseperc', 'totaldoseperc', 'csdosenum', 'totalcsnum', 'totaldosenum'],
  topdr: ['Number', 'Name', 'Specialty', 'PracticeLocation', 'DEA', 'State', 'csrx', 'totalrx', 'CSP', 'CSCash', 'Discipline', 'Miles'],
  aigTable: ['AIG', 'Prevdate', 'Prevdoses', 'currentdate', 'currentdoses', 'Change', 'Changedose']
};

export enum csrxCols {
  'Script Date' = 'Script Date',
  'Fill Date' = 'Fill Date',
  'RX Num' = 'RX Num',
  'Qty' = 'Qty',
  'Days Supply' = 'Days Supply',
  'mg/day' = 'mg/day',
  'Pay Type' = 'Pay Type',
  'NDC' = 'NDC',
  'Drug Name' = 'Drug Name',
  'strength' = 'strength',
  'DEA#' = 'DEA#',
  'Physician Name' = 'Physician Name',
  'Patient ID' = 'Patient ID',
  'Family' = 'Family',
  'DEA Sched' = 'DEA Sched',
  'Pharmacy to Physician' = 'Pharmacy to Physician',
  'Pharmacy to Patient' = 'Pharmacy to Patient',
  'Physician to Patient' = 'Physician to Patient',
}

export type commonRecord = {
  name?: unknown;
  account?: unknown;
  dea?: unknown;
  address?: unknown;
  daterange?: unknown;
  rxday?: unknown;
  rxmonth?: unknown;
  csrxvol?: unknown;
  csdu?: unknown;
  purchase?: unknown;
  cspurchase?: unknown;
  cashnoncs?: unknown;
  cashcs?: unknown;
  top10csnum?: unknown;
  trinitynum?: unknown;
  trinity?: unknown;
  immednum?: unknown;
  imm?: unknown;
  multipracnum?: unknown;
  multiprac?: unknown;
  highmednum?: unknown;
  highmed?: unknown;
  highmedpres?: unknown;
  spatial?: unknown;
  csphyphys?: unknown;
  phyphys?: unknown;
  csphypt?: unknown;
  phypt?: unknown;
  csphyspt?: unknown;
  physpt?: unknown;
  alprazfam?: unknown;
  alprazfamdumonth?: unknown;
  alprazfamtimes?: unknown;
  alprazfamhigh?: unknown;
  alpraz2?: unknown;
  alpraz2dumonth?: unknown;
  alpraz2times?: unknown;
  alpraz2high?: unknown;
  amphetamine?: unknown;
  amphetdumonth?: unknown;
  amphettimes?: unknown;
  amphethigh?: unknown;
  bupe?: unknown;
  bupedumonth?: unknown;
  bupetimes?: unknown;
  bupehigh?: unknown;
  bupeper?: unknown;
  carisoprodol?: unknown;
  carisodumonth?: unknown;
  carisotimes?: unknown;
  carisohigh?: unknown;
  fentanyl?: unknown;
  fentdumonth?: unknown;
  fenttimes?: unknown;
  fenthigh?: unknown;
  fentmedhigh?: unknown;
  fentmedlow?: unknown;
  hydrocofam?: unknown;
  hydrocodumonth?: unknown;
  hydrocotimes?: unknown;
  hydrocohigh?: unknown;
  hydrocomedhigh?: unknown;
  hydrocomedlow?: unknown;
  'hydroco10/325'?: unknown;
  hydroco10dumonth?: unknown;
  hydroco10times?: unknown;
  hydroco10high?: unknown;
  hydroco10per?: unknown;
  hydroco10medhigh?: unknown;
  hydroco10medlow?: unknown;
  hydromorph?: unknown;
  hydromorphdumonth?: unknown;
  hydromorphtimes?: unknown;
  hydromorphhigh?: unknown;
  hydromorphmedhigh?: unknown;
  hydromorphmedlow?: unknown;
  hydromorph8?: unknown;
  hydromorph8dumonth?: unknown;
  hydromorph8times?: unknown;
  hydromorph8high?: unknown;
  hydromorph8medhigh?: unknown;
  hydromorph8medlow?: unknown;
  lisdex?: unknown;
  lisdexdumonth?: unknown;
  lisdextimes?: unknown;
  lisdexhigh?: unknown;
  methadone?: unknown;
  methadumonth?: unknown;
  methatimes?: unknown;
  methahigh?: unknown;
  methamedhigh?: unknown;
  methamedlow?: unknown;
  methylphen?: unknown;
  methyldumonth?: unknown;
  methyltimes?: unknown;
  methylhigh?: unknown;
  morphine?: unknown;
  morphdumonth?: unknown;
  morphtimes?: unknown;
  morphhigh?: unknown;
  morphmedhigh?: unknown;
  morphmedlow?: unknown;
  oxycodone?: unknown;
  oxydumonth?: unknown;
  oxytimes?: unknown;
  oxyhigh?: unknown;
  oxymedhigh?: unknown;
  oxymedlow?: unknown;
  oxy15?: unknown;
  oxy15dumonth?: unknown;
  oxy15times?: unknown;
  oxy15high?: unknown;
  oxy15medhigh?: unknown;
  oxy15medlow?: unknown;
  oxy30?: unknown;
  oxy30dumonth?: unknown;
  oxy30times?: unknown;
  oxy30high?: unknown;
  oxy30medhigh?: unknown;
  oxy30medlow?: unknown;
  'oxy10/325'?: unknown;
  oxy10dumonth?: unknown;
  oxy10times?: unknown;
  oxy10high?: unknown;
  oxy10medhigh?: unknown;
  oxy10medlow?: unknown;
  oxymorph?: unknown;
  oxymorphdumonth?: unknown;
  oxymorphtimes?: unknown;
  oxymorphhigh?: unknown;
  oxymorphmedhigh?: unknown;
  oxymorphmedlow?: unknown;
  tramadol?: unknown;
  tramdumonth?: unknown;
  tramtimes?: unknown;
  tramhigh?: unknown;
  trammedhigh?: unknown;
  trammedlow?: unknown;
  prevdate?: unknown;
  currentdate?: unknown;
  soms?: unknown;
  arcosmonth?: unknown;
  arcossupnum?: unknown;
}

export type aigRecord = {
  AIG: string;
  Name: string;
  isTop10: boolean
  Specialty: string;
  PracticeLocation: string;
  DEA: string;
  State?: string;
  Discipline?: string;
  numCS?: number;
  totalRx?: number;
  CSP?: number;
  CSCash?: number;
  numpt?: number;
  Miles?: unknown;
}

export type deaconcernRecord = {
  DEAnumber?: unknown;
  Name?: unknown;
  Problem?: unknown;
}

export type cscashRecord = {
  drug?: unknown;
  percent?: unknown;
}

export type arcosRecord = {
  drug?: unknown;
  Mutual?: unknown;
  supplier2?: unknown;
  supplier3?: unknown;
}

// Top 10 Rx's on Analysys
export type top10csRecord = {
  drug?: string;
  number?: number;
  csdoseperc?: number;
  totaldoseperc?: number;
  csdosenum?: number;
  totalcsnum?: number;
  totaldosenum?: number;
}

export type topdrRecord = {
  Number?: unknown;
  Name?: unknown;
  Specialty?: unknown;
  PracticeLocation?: unknown;
  DEA?: unknown;
  State?: unknown;
  csrx?: unknown;
  totalrx?: unknown;
  CSP?: unknown;
  CSCash?: unknown;
  Discipline?: unknown;
  Miles?: unknown;
}

export type aigTableRecord = {
  AIG: string,
  Prevdate?: number,
  Prevdoses?: number,
  currentdate: number,
  currentdoses: number,
  Change: unknown,
  Changedose: unknown
}

export const CalcKeys = {
  account: ' calculations ',
  rxday: " rx's daily",
  rxmonth: " rx's per month",
  csrxvol: 'dispensed by rx',
  csdu: 'dispensed by dosage',
  purchase: '% dosage units purchased',
  cspurchase: '% control dosage units purchased',
}

export const sheetOrder = [
  'common',
  'deaconcern',
  'cscash',
  'arcos',
  'top10cs',
  'topdr',
  'aig1', 'aig2', 'aig3', 'aig4', 'aig5',
  'aig6', 'aig7', 'aig8', 'aig9', 'aig10',
  'aig11', 'aig12', 'aig13', 'aig14', 'aig15',
  'aig16', 'aig17', 'aig18', 'aig19', 'aig20',
  'aigtable'
];
