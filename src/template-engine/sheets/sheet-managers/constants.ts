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

export const sheetNames = {
  common: 'common',
  aig: 'aig',
  deaconcern: 'deaconcern',
  cscash: 'cscash',
  arcos: 'arcos',
  top10cs: 'top10cs',
  topdr: 'topdr',
  aigTable: 'aigtable',
}
