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

export enum PractitionerSheets {
  ref = 'Reference'
}

export const headers = {
  common: ['name', 'account', 'dea', 'address', 'daterange', 'rxday', 'rxmonth', 'csrxvol', 'csdu', 'purchase', 'cspurchase', 'cashnoncs', 'cashcs', 'top10csnum', 'trinitynum', 'trinity', 'immednum', 'imm', 'multipracnum', 'multiprac', 'highmednum', 'highmed', 'highmedpres', 'spatial', 'csphyphys', 'phyphys', 'csphypt', 'phypt', 'csphyspt', 'physpt', 'alprazfam', 'alprazfamdumonth', 'alprazfamtimes', 'alprazfamhighdose', 'alpraz2', 'alpraz2dumonth', 'alpraz2times', 'alpraz2high', 'amphetamine', 'amphetdumonth', 'amphettimes', 'amphethigh', 'bupe', 'bupedumonth', 'bupetimes', 'bupehigh', 'bupefamper', 'carisoprodol', 'carisodumonth', 'carisotimes', 'carisohigh', 'fentanyl', 'fentdumonth', 'fenttimes', 'fenthigh', 'hydrocofam', 'hydrocodumonth', 'hydrocotimes', 'hydrocohigh', 'hydroco10/325', 'hydroco10dumonth', 'hydroco10times', 'hydroco10high', 'hydroco10perc', 'hydromorph', 'hydromorphdumonth', 'hydromorphtimes', 'hydromorphhigh', 'hydromorph8', 'hydromorph8dumonth', 'hydromorph8times', 'hydromorph8high', 'lisdex', 'lisdexdumonth', 'lisdextimes', 'lisdexhigh', 'methadone', 'methadumonth', 'methatimes', 'methahigh', 'methylphen', 'methyldumonth', 'methyltimes', 'methylhigh', 'morphine', 'morphdumonth', 'morphtimes', 'morphhigh', 'oxycodone', 'oxydumonth', 'oxytimes', 'oxyhigh', 'oxy15', 'oxy15dumonth', 'oxy15times', 'oxy15high', 'oxy30', 'oxy30dumonth', 'oxy30times', 'oxy30high', 'oxy10/325', 'oxy10dumonth', 'oxy10times', 'oxy10high', 'oxymorph', 'oxymorphdumonth', 'oxymorphtimes', 'oxymorphhigh', 'tramadol', 'tramdumonth', 'tramtimes', 'tramhigh', 'prevdate', 'currentdate', 'soms', 'arcosmonth', 'arcossupnum'],
  aig: ['Name', 'Specialty', 'PracticeLocation', 'DEA', 'State', 'numCS', 'totalRx', 'CSP', 'CSCash', 'Discipline', 'Miles', 'numpt'],
  deaconcern: ['DEAnumber', 'Name', 'Problem'],
  cscash: ['drug', 'percent'],
  arcos: ['drug', 'Mutual', 'supplier2', 'supplier3'],
  top10cs: ['drug', 'number', 'csdoseperc', 'totaldoseperc', 'csdosenum', 'totalcsnum', 'totaldosenum'],
  topdr: ['Number', 'Name', 'Specialty', 'PracticeLocation', 'DEA', 'State', 'csrx', 'totalrx', 'CSP', 'CSCash', 'Discipline', 'Miles']
};

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
  alprazfamhighdose?: unknown;
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
  bupefamper?: unknown;
  carisoprodol?: unknown;
  carisodumonth?: unknown;
  carisotimes?: unknown;
  carisohigh?: unknown;
  fentanyl?: unknown;
  fentdumonth?: unknown;
  fenttimes?: unknown;
  fenthigh?: unknown;
  hydrocofam?: unknown;
  hydrocodumonth?: unknown;
  hydrocotimes?: unknown;
  hydrocohigh?: unknown;
  'hydroco10/325'?: unknown;
  hydroco10dumonth?: unknown;
  hydroco10times?: unknown;
  hydroco10high?: unknown;
  hydroco10perc?: unknown;
  hydromorph?: unknown;
  hydromorphdumonth?: unknown;
  hydromorphtimes?: unknown;
  hydromorphhigh?: unknown;
  hydromorph8?: unknown;
  hydromorph8dumonth?: unknown;
  hydromorph8times?: unknown;
  hydromorph8high?: unknown;
  lisdex?: unknown;
  lisdexdumonth?: unknown;
  lisdextimes?: unknown;
  lisdexhigh?: unknown;
  methadone?: unknown;
  methadumonth?: unknown;
  methatimes?: unknown;
  methahigh?: unknown;
  methylphen?: unknown;
  methyldumonth?: unknown;
  methyltimes?: unknown;
  methylhigh?: unknown;
  morphine?: unknown;
  morphdumonth?: unknown;
  morphtimes?: unknown;
  morphhigh?: unknown;
  oxycodone?: unknown;
  oxydumonth?: unknown;
  oxytimes?: unknown;
  oxyhigh?: unknown;
  oxy15?: unknown;
  oxy15dumonth?: unknown;
  oxy15times?: unknown;
  oxy15high?: unknown;
  oxy30?: unknown;
  oxy30dumonth?: unknown;
  oxy30times?: unknown;
  oxy30high?: unknown;
  'oxy10/325'?: unknown;
  oxy10dumonth?: unknown;
  oxy10times?: unknown;
  oxy10high?: unknown;
  oxymorph?: unknown;
  oxymorphdumonth?: unknown;
  oxymorphtimes?: unknown;
  oxymorphhigh?: unknown;
  tramadol?: unknown;
  tramdumonth?: unknown;
  tramtimes?: unknown;
  tramhigh?: unknown;
  prevdate?: unknown;
  currentdate?: unknown;
  soms?: unknown;
  arcosmonth?: unknown;
  arcossupnum?: unknown;
}

export type aigRecord = {
  Name: string;
  Specialty: string;
  PracticeLocation: string;
  DEA: string;
  State: string;
  Discipline: string | null;
  numCS: number | null;
  totalRx: number | null;
  CSP: string | null;
  CSCash: number | null;
  numpt: number | null;
  Miles?: string;
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

export type top10csRecord = {
  drug?: unknown;
  number?: unknown;
  csdoseperc?: unknown;
  totaldoseperc?: unknown;
  csdosenum?: unknown;
  totalcsnum?: unknown;
  totaldosenum?: unknown;
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
