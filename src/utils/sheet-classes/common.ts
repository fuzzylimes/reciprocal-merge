import { WorkBook, utils } from 'xlsx';
import { TableData, getCellValue as getWordCellValue } from '../word';
import { getCellValue, sumColumn } from '../excel';
import { Base } from './Base';
import { commonRecord, irSheet, medSheet, multipracSheet, ReportSheets as rs, trinitySheet } from '../sheets';
import * as c from '../constants';
import { headers } from "../sheets";

export type row = Record<string, unknown>;

export class common extends Base {
  filteredHighMedRows: medSheet[] = [];
  record: commonRecord = {};

  constructor(outData: WorkBook, report: WorkBook, calculations: TableData, practitioners: WorkBook) {
    super(outData, report, calculations, practitioners, 'common', headers.common);
  }

  async name() {
    try {
      const cellValue = getWordCellValue(this.calculations, 'A1');
      this.record.name = cellValue?.split(/(\w{2}\d{7})/g)[0].trim();
    } catch (error) {
      console.error(error);
    }
  }

  async dea() {
    try {
      const cellValue = getCellValue(this.report, rs.summary, 'A3');
      this.record.dea = cellValue?.split('#: ')[1].trim();
    } catch (error) {
      console.error(error);
    }
  }

  async daterange() {
    const regex = /Data Range: (\d{4}-\d{2}-\d{2}) thru (\d{4}-\d{2}-\d{2})/;
    const cellValue = getCellValue(this.report, rs.summary, 'A1');
    const match = cellValue?.match(regex);

    let value = null;

    if (match) {
      const startDate = new Date(match[1]);
      const endDate = new Date(match[2]);

      // Format the dates
      const startFormatted = startDate.toLocaleString('en-US', { month: 'short', year: 'numeric' });
      const endFormatted = endDate.toLocaleString('en-US', { month: 'short', year: 'numeric' });

      value = `${startFormatted} - ${endFormatted}`;
    }

    this.record.daterange = value;
  }

  async cashnoncs() {
    const cellValue = getCellValue(this.report, rs.summary, 'C15');
    // this is returned as a decimal, so we need to convert it to a percentage
    this.record.cashnoncs = cellValue ? `${(Number(cellValue) * 100).toFixed(0)}%` : '';
  }

  async cashcs() {
    const cellValue = getCellValue(this.report, rs.summary, 'C14');
    // this is returned as a decimal, so we need to convert it to a percentage
    this.record.cashcs = cellValue ? `${(Number(cellValue) * 100).toFixed(0)}%` : '';
  }

  async top10csnum() {
    this.record.top10csnum = 'TODO';
  }

  async trinity() {
    const sheet = this.report.Sheets[rs.trinityConcerns];
    const rows = utils.sheet_to_json<trinitySheet>(sheet);
    if (!rows) {
      return;
    }

    const mapping: Record<string, Record<number, boolean>> = {};

    for (const row of rows) {
      const family = row.Family.toLowerCase();
      const patientId = row['Patient ID'];

      if (mapping[family]) {
        if (!mapping[family][patientId]) {
          mapping[family][patientId] = true;
        }
      } else {
        mapping[family] = { [patientId]: true };
      }
    }

    const carisoprodolItems = mapping[c.carisoprodol] || {};
    const amphetamineItems = mapping[c.amphetamine] || {};
    const carisoprodolKeys = Object.keys(carisoprodolItems);
    const carisoprodolCount = carisoprodolKeys.length;
    const amphetamineKeys = Object.keys(amphetamineItems);
    const amphetamineCount = amphetamineKeys.length;

    this.record.trinitynum = carisoprodolCount + amphetamineCount;

    this.record.trinity = `${carisoprodolCount} ${c.carisoprodol} patients (${carisoprodolKeys.join(', ')})\n${amphetamineCount} ${c.amphetamine} patients (${amphetamineKeys.join(', ')})`;
  }

  async imm() {
    const sheet = this.report.Sheets[rs.immediateRelease];
    const rows = utils.sheet_to_json<irSheet>(sheet, { blankrows: true });
    if (!rows) {
      return;
    }

    // Check to see if patientId is associated with more than one unique drug name
    // If it is, it needs to be counted and added to the generated value
    const mapping: Record<number, Record<string, boolean>> = {};
    const patientsList: number[] = [];
    for (const row of rows) {
      if (!row['Drug Name']) continue;

      const drugName = row['Drug Name'].toLowerCase();
      const patientId = row['Patient ID'];

      if (mapping[patientId]) {
        mapping[patientId][drugName] = true;
      } else {
        mapping[patientId] = { [drugName]: true };
      }
    }

    // Step through each of the patients and see if they have more than one drug name
    Object.entries(mapping).forEach(([id, drugs]) => {
      if (Object.keys(drugs).length > 1) {
        patientsList.push(Number(id));
      }
    })

    let value = '';
    if (patientsList.length) {
      this.record.immednum = patientsList.length;
      value = `${this.record.immednum} patients (${patientsList.join(', ')})`;
    }
    this.record.imm = value;
  }

  async multiprac() {
    const sheet = this.report.Sheets[rs.multiPractioner];
    const rows = utils.sheet_to_json<multipracSheet>(sheet);
    if (!rows) {
      return;
    }

    const mapping: Record<number, boolean> = {};

    for (const row of rows) {
      const patientId = row['Patient ID'];
      mapping[patientId] = true;
    }

    const patientIds = Object.keys(mapping);
    this.record.multipracnum = patientIds.length;

    this.record.multiprac = `${this.record.multipracnum} patients (${patientIds.join(', ')})`;
  }

  async highmed() {
    const sheet = this.report.Sheets[rs.medWatch];
    const rows = utils.sheet_to_json<medSheet>(sheet, { blankrows: true });
    if (!rows) {
      return;
    }

    this.filteredHighMedRows = rows.filter(row => row['Daily M.E.D per Prescription'] && Number(row['Daily M.E.D per Prescription']) >= 120)
    const perscriptionCount = this.filteredHighMedRows.length;
    const uniquePatients = new Set(this.filteredHighMedRows.map(row => row['Patient ID']));
    const patientCount = uniquePatients.size;

    this.record.highmednum = perscriptionCount;
    let value = '';
    if (perscriptionCount) {
      value = `There are ${perscriptionCount} perscriptions between ${patientCount} patients with an MED of 120 or higher`;
    }
    this.record.highmed = value;
  }

  async highmedpres() {
    if (!this.filteredHighMedRows.length) {
      return;
    }

    // Need to find the perscriber with the most perscriptions, then get the count and Id of the patients
    const mapping: Record<string, Record<number, boolean>> = {};
    for (const row of this.filteredHighMedRows) {
      const perscriber = row['DEA#'];
      const patientId = row['Patient ID'];

      if (mapping[perscriber]) {
        if (!mapping[perscriber][patientId]) {
          mapping[perscriber][patientId] = true;
        }
      } else {
        mapping[perscriber] = { [patientId]: true };
      }
    }

    let maxPerscriber = '';
    let maxCount = 0;
    let maxPatients: number[] = [];
    Object.entries(mapping).forEach(([perscriber, patients]) => {
      const patientIds = Object.keys(patients);
      if (patientIds.length > maxCount) {
        maxCount = patientIds.length;
        maxPerscriber = perscriber;
        maxPatients = [...new Set(patientIds.map(id => Number(id)))];
      }
    });

    const value = `The most prolific prescriber is ${maxPerscriber} with ${maxCount} perscriptions between ${maxPatients.length} patients`;
    this.record.highmedpres = value;
  }

  async spatial() {
    const sheet = this.report.Sheets[rs.spatial];
    const rows = utils.sheet_to_json<row>(sheet, { header: "A", blankrows: true })?.slice(6, 9);
    if (!rows) {
      return;
    }

    // look against the specific distances (C - L)
    let count = 0;
    for (const row of rows) {
      for (const col of ['C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']) {
        if (row[col]) count++;
      }
    }

    this.record.spatial = count;
  }

  async csphyphys() {
    const sheet = this.report.Sheets[rs.spatial];
    const sum = sumColumn(sheet, 38, 41, 'E');

    this.record.csphyphys = sum ? `${(Number(sum) * 100).toFixed(0)}%` : '0%';
  }

  async phyphys() {
    const sheet = this.report.Sheets[rs.spatial];
    const sum = sumColumn(sheet, 38, 41, 'G');


    this.record.phyphys = sum ? `${(Number(sum) * 100).toFixed(0)}%` : '0%';
  }

  async csphypt() {
    const sheet = this.report.Sheets[rs.spatial];
    const sum = sumColumn(sheet, 51, 54, 'E');

    this.record.csphypt = sum ? `${(Number(sum) * 100).toFixed(0)}%` : '0%';
  }

  async phypt() {
    const sheet = this.report.Sheets[rs.spatial];
    const sum = sumColumn(sheet, 51, 54, 'G');

    this.record.phypt = sum ? `${(Number(sum) * 100).toFixed(0)}%` : '0%';
  }

  async csphyspt() {
    const sheet = this.report.Sheets[rs.spatial];
    const sum = sumColumn(sheet, 64, 67, 'E');

    this.record.csphyspt = sum ? `${(Number(sum) * 100).toFixed(0)}%` : '0%';
  }

  async physpt() {
    const sheet = this.report.Sheets[rs.spatial];
    const sum = sumColumn(sheet, 64, 67, 'G');

    this.record.physpt = sum ? `${(Number(sum) * 100).toFixed(0)}%` : '0%';
  }

  setStaticValues() {
    this.record.account = getWordCellValue(this.calculations, 'B1');

    const address = getCellValue(this.report, rs.summary, 'A8');
    const cityStateZip = getCellValue(this.report, rs.summary, 'A9');
    this.record.address = `${address}\n${cityStateZip}`;

    this.record.rxday = getWordCellValue(this.calculations, 'B15');
    this.record.rxmonth = getWordCellValue(this.calculations, 'B14');
    this.record.csrxvol = getWordCellValue(this.calculations, 'B11');
    this.record.csdu = getWordCellValue(this.calculations, 'B10');
    this.record.purchase = getWordCellValue(this.calculations, 'B8');
    this.record.cspurchase = getWordCellValue(this.calculations, 'B9');


    // Alprazolam Family
    const { alpraz } = Base.aigData;
    this.record.alprazfam = 'Alprazolam Family';
    this.record.alprazfamdumonth = getWordCellValue(this.calculations, 'B19');
    this.record.alprazfamtimes = getWordCellValue(this.calculations, 'B21');
    this.record.alprazfamhighdose = `${((alpraz.highpct || 0)).toFixed(0)}%`;
    alpraz.month = Number(this.record.alprazfamdumonth);
    alpraz.times = Number(this.record.alprazfamtimes);

    // Alprazolam 2mg
    const { alpraz2 } = Base.aigData;
    this.record.alpraz2 = 'Alprazolam 2mg';
    this.record.alpraz2dumonth = getWordCellValue(this.calculations, 'B29');
    this.record.alpraz2times = getWordCellValue(this.calculations, 'B31');
    this.record.alpraz2high = `${((alpraz2.highpct || 0)).toFixed(0)}%`;
    alpraz2.month = Number(this.record.alpraz2dumonth);
    alpraz2.times = Number(this.record.alpraz2high);

    // Amphetamine
    const { amphet } = Base.aigData;
    this.record.amphetamine = 'Amphetamine';
    this.record.amphetdumonth = getWordCellValue(this.calculations, 'B34');
    this.record.amphettimes = getWordCellValue(this.calculations, 'B36');
    this.record.amphethigh = `${((amphet.highpct || 0)).toFixed(0)}%`;
    amphet.month = Number(this.record.amphetdumonth);
    amphet.times = Number(this.record.amphettimes);

    // Buprenorphine 8mg
    const { bupe } = Base.aigData;
    this.record.bupe = 'Buprenorphine 8mg';
    this.record.bupedumonth = getWordCellValue(this.calculations, 'B39');
    this.record.bupetimes = getWordCellValue(this.calculations, 'B41');
    this.record.bupehigh = `${((bupe.highpct || 0)).toFixed(0)}%`;
    this.record.bupefamper = `${(bupe.per || 0).toFixed(2)}%`
    bupe.month = Number(this.record.bupedumonth);
    bupe.times = Number(this.record.bupetimes);

    // Carisoprodol
    const { cariso } = Base.aigData;
    this.record.carisoprodol = 'Carisoprodol';
    this.record.carisodumonth = getWordCellValue(this.calculations, 'B44');
    this.record.carisotimes = getWordCellValue(this.calculations, 'B46');
    this.record.carisohigh = `${((cariso.highpct || 0)).toFixed(0)}%`;
    cariso.month = Number(this.record.carisodumonth);
    cariso.times = Number(this.record.carisotimes);

    // Fentanyl
    const { fent } = Base.aigData;
    this.record.fentanyl = 'Fentanyl';
    this.record.fentdumonth = getWordCellValue(this.calculations, 'B49');
    this.record.fenttimes = getWordCellValue(this.calculations, 'B51');
    this.record.fenthigh = `${((fent.highpct || 0)).toFixed(0)}%`;
    this.record.fentmedhigh = fent.highmed;
    this.record.fentmedlow = fent.lowmed;
    fent.month = Number(this.record.fentdumonth);
    fent.times = Number(this.record.fenttimes);

    // Hydrocodone Family
    const { hydroco } = Base.aigData;
    this.record.hydrocofam = 'Hydrocodone Family';
    this.record.hydrocodumonth = getWordCellValue(this.calculations, 'B54');
    this.record.hydrocotimes = getWordCellValue(this.calculations, 'B56');
    this.record.hydrocohigh = `${((hydroco.highpct || 0)).toFixed(0)}%`;
    this.record.hydrocomedhigh = hydroco.highmed;
    this.record.hydrocomedlow = hydroco.lowmed;
    hydroco.month = Number(this.record.hydrocodumonth);
    hydroco.times = Number(this.record.hydrocotimes);

    // Hydrocodone 10/325mg
    const { hydroco10 } = Base.aigData;
    this.record['hydroco10/325'] = 'Hydrocodone 10/325mg';
    this.record.hydroco10dumonth = getWordCellValue(this.calculations, 'B64');
    this.record.hydroco10times = getWordCellValue(this.calculations, 'B66');
    this.record.hydroco10high = `${((hydroco10.highpct || 0)).toFixed(0)}%`;
    this.record.hydroco10perc = `${(hydroco10.per || 0).toFixed(2)}%`
    this.record.hydroco10medhigh = hydroco10.highmed;
    this.record.hydroco10medlow = hydroco10.lowmed;
    hydroco10.month = Number(this.record.hydroco10dumonth);
    hydroco10.times = Number(this.record.hydroco10times);

    // Hydromorphone
    const { hydromorph } = Base.aigData;
    this.record.hydromorph = 'Hydromorphone';
    this.record.hydromorphdumonth = getWordCellValue(this.calculations, 'B69');
    this.record.hydromorphtimes = getWordCellValue(this.calculations, 'B71');
    this.record.hydromorphhigh = `${((hydromorph.highpct || 0)).toFixed(0)}%`;
    this.record.hydromorphmedhigh = hydromorph.highmed;
    this.record.hydromorphmedlow = hydromorph.lowmed;
    hydromorph.month = Number(this.record.hydromorphdumonth);
    hydromorph.times = Number(this.record.hydromorphtimes);

    // Hydromorphone 8mg
    const { hydromorph8 } = Base.aigData;
    this.record.hydromorph8 = 'Hydromorphone 8mg';
    this.record.hydromorph8dumonth = getWordCellValue(this.calculations, 'B79');
    this.record.hydromorph8times = getWordCellValue(this.calculations, 'B81');
    this.record.hydromorph8high = `${((hydromorph8.highpct || 0)).toFixed(0)}%`;
    this.record.hydromorph8medhigh = hydromorph8.highmed;
    this.record.hydromorph8medlow = hydromorph8.lowmed;
    hydromorph8.month = Number(this.record.hydromorph8dumonth);
    hydromorph8.times = Number(this.record.hydromorph8times);

    // Lisdexamfetamine
    const { lisdex } = Base.aigData;
    this.record.lisdex = 'Lisdexamfetamine';
    this.record.lisdexdumonth = getWordCellValue(this.calculations, 'B84');
    this.record.lisdextimes = getWordCellValue(this.calculations, 'B86');
    this.record.lisdexhigh = `${((lisdex.highpct || 0)).toFixed(0)}%`;
    lisdex.month = Number(this.record.lisdexdumonth);
    lisdex.times = Number(this.record.lisdextimes);

    // Methadone
    const { metha } = Base.aigData;
    this.record.methadone = 'Methadone';
    this.record.methadumonth = getWordCellValue(this.calculations, 'B89');
    this.record.methatimes = getWordCellValue(this.calculations, 'B91');
    this.record.methahigh = `${((metha.highpct || 0)).toFixed(0)}%`;
    this.record.methamedhigh = metha.highmed;
    this.record.methamedlow = metha.lowmed;
    metha.month = Number(this.record.methadumonth);
    metha.times = Number(this.record.methatimes);

    // Methylphenidate
    const { methyl } = Base.aigData;
    this.record.methylphen = 'Methylphenidate';
    this.record.methyldumonth = getWordCellValue(this.calculations, 'B94');
    this.record.methyltimes = getWordCellValue(this.calculations, 'B96');
    this.record.methylhigh = `${((methyl.highpct || 0)).toFixed(0)}%`;
    methyl.month = Number(this.record.methyldumonth);
    methyl.times = Number(this.record.methyltimes);

    // Morphine
    const { morph } = Base.aigData;
    this.record.morphine = 'Morphine';
    this.record.morphdumonth = getWordCellValue(this.calculations, 'B99');
    this.record.morphtimes = getWordCellValue(this.calculations, 'B101');
    this.record.morphhigh = `${((morph.highpct || 0)).toFixed(0)}%`;
    this.record.morphmedhigh = morph.highmed;
    this.record.morphmedlow = morph.lowmed;
    morph.month = Number(this.record.morphdumonth);
    morph.times = Number(this.record.morphtimes);

    // Oxycodone Family
    const { oxy } = Base.aigData;
    this.record.oxycodone = 'Oxycodone Family';
    this.record.oxydumonth = getWordCellValue(this.calculations, 'B104');
    this.record.oxytimes = getWordCellValue(this.calculations, 'B106');
    this.record.oxyhigh = `${((oxy.highpct || 0)).toFixed(0)}%`;
    this.record.oxymedhigh = oxy.highmed;
    this.record.oxymedlow = oxy.lowmed;
    oxy.month = Number(this.record.oxydumonth);
    oxy.times = Number(this.record.oxytimes);

    // Oxycodone 15mg
    const { oxy15 } = Base.aigData;
    this.record.oxy15 = 'Oxycodone 15mg';
    this.record.oxy15dumonth = getWordCellValue(this.calculations, 'B114');
    this.record.oxy15times = getWordCellValue(this.calculations, 'B116');
    this.record.oxy15high = `${((oxy15.highpct || 0)).toFixed(0)}%`;
    this.record.oxy15medhigh = oxy15.highmed;
    this.record.oxy15medlow = oxy15.lowmed;
    oxy15.month = Number(this.record.oxy15dumonth);
    oxy15.times = Number(this.record.oxy15times);

    // Oxycodone 30mg
    const { oxy30 } = Base.aigData;
    this.record.oxy30 = 'Oxycodone 30mg';
    this.record.oxy30dumonth = getWordCellValue(this.calculations, 'B119');
    this.record.oxy30times = getWordCellValue(this.calculations, 'B121');
    this.record.oxy30high = `${((oxy30.highpct || 0)).toFixed(0)}%`;
    this.record.oxy30medhigh = oxy30.highmed;
    this.record.oxy30medlow = oxy30.lowmed;
    oxy30.month = Number(this.record.oxy30dumonth);
    oxy30.times = Number(this.record.oxy30times);

    // Oxycodone 10/325mg
    const { oxy10 } = Base.aigData;
    this.record['oxy10/325'] = 'Oxycodone 10/325mg';
    this.record.oxy10dumonth = getWordCellValue(this.calculations, 'B125');
    this.record.oxy10times = getWordCellValue(this.calculations, 'B127');
    this.record.oxy10high = `${((oxy10.highpct || 0)).toFixed(0)}%`;
    this.record.oxy10medhigh = oxy10.highmed;
    this.record.oxy10medlow = oxy10.lowmed;
    oxy10.month = Number(this.record.oxy10dumonth);
    oxy10.times = Number(this.record.oxy10times);

    // Oxymorphone
    const { oxymorph } = Base.aigData;
    this.record.oxymorph = 'Oxymorphone';
    this.record.oxymorphdumonth = getWordCellValue(this.calculations, 'B131');
    this.record.oxymorphtimes = getWordCellValue(this.calculations, 'B133');
    this.record.oxymorphhigh = `${((oxymorph.highpct || 0)).toFixed(0)}%`;
    this.record.oxymorphmedhigh = oxymorph.highmed;
    this.record.oxymorphmedlow = oxymorph.lowmed;
    oxymorph.month = Number(this.record.oxymorphdumonth);
    oxymorph.times = Number(this.record.oxymorphtimes);

    // Tramadol
    const { tram } = Base.aigData;
    this.record.tramadol = 'Tramadol';
    this.record.tramdumonth = getWordCellValue(this.calculations, 'B137');
    this.record.tramtimes = getWordCellValue(this.calculations, 'B139');
    this.record.tramhigh = `${((tram.highpct || 0)).toFixed(0)}%`;
    this.record.trammedhigh = tram.highmed;
    this.record.trammedlow = tram.lowmed;
    tram.month = Number(this.record.tramdumonth);
    tram.times = Number(this.record.tramhigh);
  }

  async prevdate() {
  }

  async currentdate() {
  }

  async soms() {
  }

  async arcosmonth() {
  }

  async arcossupnum() {
  }


  async build() {
    await this.name();
    await this.dea();
    await this.daterange();
    await this.cashnoncs();
    await this.cashcs();
    await this.top10csnum();
    await this.trinity();
    await this.imm();
    await this.multiprac();
    await this.highmed();
    await this.highmedpres();
    await this.spatial();
    await this.csphyphys();
    await this.phyphys();
    await this.csphypt();
    await this.phypt();
    await this.csphyspt();
    await this.physpt();

    this.setStaticValues();

    await this.prevdate();
    await this.currentdate();
    await this.soms();
    await this.arcosmonth();
    await this.arcossupnum();

    this.data = this.getDataObject();
    await super.build();
  }

  getDataObject() {
    const data: unknown[] = []
    if (this.record) {
      for (const i of this.headers) {
        data.push(this.record[i as keyof commonRecord])
      }
    }
    return [data];
  }
}
