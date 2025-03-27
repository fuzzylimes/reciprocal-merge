import { WorkBook, utils } from 'xlsx';
import { TableData, getCellValue as getWordCellValue } from '../word';
import { getCellValue, sumColumn } from '../excel';
import { Base } from './Base';
import { commonRecord, ReportSheets as rs } from '../sheets';
import * as c from '../constants';
import { headers } from "../sheets";

export type row = Record<string, unknown>;

export class common extends Base {
  filteredHighMedRows: row[] = [];
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
    const rows = utils.sheet_to_json<row>(sheet, { header: "A" })?.slice(1);
    if (!rows) {
      return;
    }

    const mapping: Record<string, Record<number, boolean>> = {};

    for (const row of rows) {
      const family = (row.L as string).toLowerCase();
      const patientId = row.K as number;

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
    const rows = utils.sheet_to_json<row>(sheet, { header: "A", blankrows: true })?.slice(1);
    if (!rows) {
      return;
    }

    // Check to see if patientId is associated with more than one unique drug name
    // If it is, it needs to be counted and added to the generated value
    const mapping: Record<number, Record<string, boolean>> = {};
    const patientsList: number[] = [];
    for (const row of rows) {
      if (!row.H) continue;

      const drugName = (row.H as string).toLowerCase();
      const patientId = row.K as number;

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
    const rows = utils.sheet_to_json<row>(sheet, { header: "A" })?.slice(1);
    if (!rows) {
      return;
    }

    const mapping: Record<number, boolean> = {};

    for (const row of rows) {
      const patientId = row.K as number;
      mapping[patientId] = true;
    }

    const patientIds = Object.keys(mapping);
    this.record.multipracnum = patientIds.length;

    this.record.multiprac = `${this.record.multipracnum} patients (${patientIds.join(', ')})`;
  }

  async highmed() {
    const sheet = this.report.Sheets[rs.medWatch];
    const rows = utils.sheet_to_json<row>(sheet, { header: "A", blankrows: true })?.slice(1);
    if (!rows) {
      return;
    }

    this.filteredHighMedRows = rows.filter(row => row.F && Number(row.F) >= 120)
    const perscriptionCount = this.filteredHighMedRows.length;
    const uniquePatients = new Set(this.filteredHighMedRows.map(row => row.H));
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
      const perscriber = row.K as string;
      const patientId = row.H as number;

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
    this.data[0].push(value);
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
    this.record.alprazfam = 'Alprazolam Family';
    this.record.alprazfamdumonth = getWordCellValue(this.calculations, 'B19');
    this.record.alprazfamtimes = getWordCellValue(this.calculations, 'B21');
    this.record.alprazfamhighdose = `${((this.aigPcts['aig1'] || 0) * 100).toFixed(0)}%`;

    // Alprazolam 2mg
    this.record.alpraz2 = 'Alprazolam 2mg';
    this.record.alpraz2dumonth = getWordCellValue(this.calculations, 'B29');
    this.record.alpraz2times = getWordCellValue(this.calculations, 'B31');
    this.record.alpraz2high = `${((this.aigPcts['aig2'] || 0) * 100).toFixed(0)}%`;

    // Amphetamine
    this.record.amphetamine = 'Amphetamine';
    this.record.amphetdumonth = getWordCellValue(this.calculations, 'B34');
    this.record.amphettimes = getWordCellValue(this.calculations, 'B36');
    this.record.amphethigh = `${((this.aigPcts['aig3'] || 0) * 100).toFixed(0)}%`;

    // Buprenorphine 8mg
    this.record.bupe = 'Buprenorphine 8mg';
    this.record.bupedumonth = getWordCellValue(this.calculations, 'B39');
    this.record.bupetimes = getWordCellValue(this.calculations, 'B41');
    this.record.bupehigh = `${((this.aigPcts['aig4'] || 0) * 100).toFixed(0)}%`;

    // Carisoprodol
    this.record.carisoprodol = 'Carisoprodol';
    this.record.carisodumonth = getWordCellValue(this.calculations, 'B44');
    this.record.carisotimes = getWordCellValue(this.calculations, 'B46');
    this.record.carisohigh = `${((this.aigPcts['aig5'] || 0) * 100).toFixed(0)}%`;

    // Fentanyl
    this.record.fentanyl = 'Fentanyl';
    this.record.fentdumonth = getWordCellValue(this.calculations, 'B49');
    this.record.fenttimes = getWordCellValue(this.calculations, 'B51');
    this.record.fenthigh = `${((this.aigPcts['aig6'] || 0) * 100).toFixed(0)}%`;

    // Hydrocodone Family
    this.record.hydrocofam = 'Hydrocodone Family';
    this.record.hydrocodumonth = getWordCellValue(this.calculations, 'B54');
    this.record.hydrocotimes = getWordCellValue(this.calculations, 'B56');
    this.record.hydrocohigh = `${((this.aigPcts['aig7'] || 0) * 100).toFixed(0)}%`;

    // Hydrocodone 10/325mg
    this.record['hydroco10/325'] = 'Hydrocodone 10/325mg';
    this.record.hydroco10dumonth = getWordCellValue(this.calculations, 'B64');
    this.record.hydroco10times = getWordCellValue(this.calculations, 'B66');
    this.record.hydroco10high = `${((this.aigPcts['aig8'] || 0) * 100).toFixed(0)}%`;

    // Hydromorphone
    this.record.hydromorph = 'Hydromorphone';
    this.record.hydromorphdumonth = getWordCellValue(this.calculations, 'B69');
    this.record.hydromorphtimes = getWordCellValue(this.calculations, 'B71');
    this.record.hydromorphhigh = `${((this.aigPcts['aig9'] || 0) * 100).toFixed(0)}%`;

    // Hydromorphone 8mg
    this.record.hydromorph8 = 'Hydromorphone 8mg';
    this.record.hydromorph8dumonth = getWordCellValue(this.calculations, 'B79');
    this.record.hydromorph8times = getWordCellValue(this.calculations, 'B81');
    this.record.hydromorph8high = `${((this.aigPcts['aig10'] || 0) * 100).toFixed(0)}%`;

    // Lisdexamfetamine
    this.record.lisdex = 'Lisdexamfetamine';
    this.record.lisdexdumonth = getWordCellValue(this.calculations, 'B84');
    this.record.lisdextimes = getWordCellValue(this.calculations, 'B86');
    this.record.lisdexhigh = `${((this.aigPcts['aig11'] || 0) * 100).toFixed(0)}%`;

    // Methadone
    this.record.methadone = 'Methadone';
    this.record.methadumonth = getWordCellValue(this.calculations, 'B89');
    this.record.methatimes = getWordCellValue(this.calculations, 'B91');
    this.record.methahigh = `${((this.aigPcts['aig12'] || 0) * 100).toFixed(0)}%`;

    // Methylphenidate
    this.record.methylphen = 'Methylphenidate';
    this.record.methyldumonth = getWordCellValue(this.calculations, 'B94');
    this.record.methyltimes = getWordCellValue(this.calculations, 'B96');
    this.record.methylhigh = `${((this.aigPcts['aig13'] || 0) * 100).toFixed(0)}%`;

    // Morphine
    this.record.morphine = 'Morphine';
    this.record.morphdumonth = getWordCellValue(this.calculations, 'B99');
    this.record.morphtimes = getWordCellValue(this.calculations, 'B101');
    this.record.morphhigh = `${((this.aigPcts['aig14'] || 0) * 100).toFixed(0)}%`;

    // Oxycodone Family
    this.record.oxycodone = 'Oxycodone Family';
    this.record.oxydumonth = getWordCellValue(this.calculations, 'B104');
    this.record.oxytimes = getWordCellValue(this.calculations, 'B106');
    this.record.oxyhigh = `${((this.aigPcts['aig15'] || 0) * 100).toFixed(0)}%`;

    // Oxycodone 15mg
    this.record.oxy15 = 'Oxycodone 15mg';
    this.record.oxy15dumonth = getWordCellValue(this.calculations, 'B114');
    this.record.oxy15times = getWordCellValue(this.calculations, 'B116');
    this.record.oxy15high = `${((this.aigPcts['aig16'] || 0) * 100).toFixed(0)}%`;

    // Oxycodone 30mg
    this.record.oxy30 = 'Oxycodone 30mg';
    this.record.oxy30dumonth = getWordCellValue(this.calculations, 'B119');
    this.record.oxy30times = getWordCellValue(this.calculations, 'B121');
    this.record.oxy30high = `${((this.aigPcts['aig17'] || 0) * 100).toFixed(0)}%`;

    // Oxycodone 10/325mg
    this.record['oxy10/325'] = 'Oxycodone 10/325mg';
    this.record.oxy10dumonth = getWordCellValue(this.calculations, 'B125');
    this.record.oxy10times = getWordCellValue(this.calculations, 'B127');
    this.record.oxy10high = `${((this.aigPcts['aig18'] || 0) * 100).toFixed(0)}%`;

    // Oxymorphone
    this.record.oxymorph = 'Oxymorphone';
    this.record.oxymorphdumonth = getWordCellValue(this.calculations, 'B131');
    this.record.oxymorphtimes = getWordCellValue(this.calculations, 'B133');
    this.record.oxymorphhigh = `${((this.aigPcts['aig19'] || 0) * 100).toFixed(0)}%`;

    // Tramadol
    this.record.tramadol = 'Tramadol';
    this.record.tramdumonth = getWordCellValue(this.calculations, 'B137');
    this.record.tramtimes = getWordCellValue(this.calculations, 'B139');
    this.record.tramhigh = `${((this.aigPcts['aig20'] || 0) * 100).toFixed(0)}%`;
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
