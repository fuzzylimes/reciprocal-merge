import { WorkBook, utils } from 'xlsx';
import { TableData, getCellValue as getWordCellValue } from '../word';
import { getCellValue, sumColumn } from '../excel';
import { Base } from './Base';
import { commonRecord, ReportSheets as rs } from '../sheets';
import * as c from '../constants';
import { headers } from "../sheets";

export type row = Record<string, unknown>;

export class common extends Base {
  trinityNum: number = 0;
  immNum: number = 0;
  multipracNum: number = 0;
  highmedNum: number = 0;
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

  async account() {
    this.record.account = getWordCellValue(this.calculations, 'B1');
  }

  async dea() {
    try {
      const cellValue = getCellValue(this.report, rs.summary, 'A3');
      this.record.dea = cellValue?.split('#: ')[1].trim();
    } catch (error) {
      console.error(error);
    }
  }

  async address() {
    const address = getCellValue(this.report, rs.summary, 'A8');
    const cityStateZip = getCellValue(this.report, rs.summary, 'A9');
    const value = `${address}\n${cityStateZip}`;
    this.record.address = value;
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

  async rxday() {
    this.record.rxday = getWordCellValue(this.calculations, 'B15');
  }

  async rxmonth() {
    this.record.rxmonth = getWordCellValue(this.calculations, 'B14');
  }

  async csrxvol() {
    this.record.csrxvol = getWordCellValue(this.calculations, 'B11');
  }

  async csdu() {
    this.record.csdu = getWordCellValue(this.calculations, 'B10');
  }

  async purchase() {
    this.record.purchase = getWordCellValue(this.calculations, 'B8');
  }

  async cspurchase() {
    this.record.cspurchase = getWordCellValue(this.calculations, 'B9');
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

    this.trinityNum = carisoprodolCount + amphetamineCount;

    this.record.trinity = `${carisoprodolCount} ${c.carisoprodol} patients (${carisoprodolKeys.join(', ')})\n${amphetamineCount} ${c.amphetamine} patients (${amphetamineKeys.join(', ')})`;
  }

  async trinitynum() {
    this.record.trinitynum = this.trinityNum;
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
      this.immNum = patientsList.length;
      value = `${this.immNum} patients (${patientsList.join(', ')})`;
    }
    this.record.imm = value;
  }

  async immednum() {
    this.record.immednum = this.immNum;
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
    this.multipracNum = patientIds.length;

    this.record.multiprac = `${this.multipracNum} patients (${patientIds.join(', ')})`;
  }

  async multipracnum() {
    this.record.multipracnum = this.multipracNum;
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

    this.highmedNum = perscriptionCount;
    let value = '';
    if (perscriptionCount) {
      value = `There are ${perscriptionCount} perscriptions between ${patientCount} patients with an MED of 120 or higher`;
    }
    this.record.highmed = value;
  }

  async highmednum() {
    this.record.highmednum = this.highmedNum;
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

  async alprazfam() {
    this.record.alprazfam = 'Alprazolam Family';
  }

  async alprazfamdumonth() {
    this.record.alprazfamdumonth = getWordCellValue(this.calculations, 'B19');
  }

  async alprazfamtimes() {
    this.record.alprazfamtimes = getWordCellValue(this.calculations, 'B21');
  }

  async alprazfamhighdose() {
    const value = this.aigPcts['aig1'] || 0;
    this.record.alprazfamhighdose = `${(value * 100).toFixed(0)}%`;
  }

  async alpraz2() {
  }

  async alpraz2dumonth() {
  }

  async alpraz2times() {
  }

  async alpraz2high() {
  }

  async amphetamine() {
  }

  async amphetdumonth() {
  }

  async amphettimes() {
  }

  async amphethigh() {
  }

  async bupe() {
  }

  async bupedumonth() {
  }

  async bupetimes() {
  }

  async bupehigh() {
  }

  async bupefamper() {
  }

  async carisoprodol() {
  }

  async carisodumonth() {
  }

  async carisotimes() {
  }

  async carisohigh() {
  }

  async fentanyl() {
  }

  async fentdumonth() {
  }

  async fenttimes() {
  }

  async fenthigh() {
  }

  async hydrocofam() {
  }

  async hydrocodumonth() {
  }

  async hydrocotimes() {
  }

  async hydrocohigh() {
  }

  async hydroco10_325() {
  }

  async hydroco10dumonth() {
  }

  async hydroco10times() {
  }

  async hydroco10high() {
  }

  async hydroco10perc() {
  }

  async hydromorph() {
  }

  async hydromorphdumonth() {
  }

  async hydromorphtimes() {
  }

  async hydromorphhigh() {
  }

  async hydromorph8() {
  }

  async hydromorph8dumonth() {
  }

  async hydromorph8times() {
  }

  async hydromorph8high() {
  }

  async lisdex() {
  }

  async lisdexdumonth() {
  }

  async lisdextimes() {
  }

  async lisdexhigh() {
  }

  async methadone() {
  }

  async methadumonth() {
  }

  async methatimes() {
  }

  async methahigh() {
  }

  async methylphen() {
  }

  async methyldumonth() {
  }

  async methyltimes() {
  }

  async methylhigh() {
  }

  async morphine() {
  }

  async morphdumonth() {
  }

  async morphtimes() {
  }

  async morphhigh() {
  }

  async oxycodone() {
  }

  async oxydumonth() {
  }

  async oxytimes() {
  }

  async oxyhigh() {
  }

  async oxy15() {
  }

  async oxy15dumonth() {
  }

  async oxy15times() {
  }

  async oxy15high() {
  }

  async oxy30() {
  }

  async oxy30dumonth() {
  }

  async oxy30times() {
  }

  async oxy30high() {
  }

  async oxy10_325() {
  }

  async oxy10dumonth() {
  }

  async oxy10times() {
  }

  async oxy10high() {
  }

  async oxymorph() {
  }

  async oxymorphdumonth() {
  }

  async oxymorphtimes() {
  }

  async oxymorphhigh() {
  }

  async tramadol() {
  }

  async tramdumonth() {
  }

  async tramtimes() {
  }

  async tramhigh() {
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
    await this.account();
    await this.dea();
    await this.address();
    await this.daterange();
    await this.rxday();
    await this.rxmonth();
    await this.csrxvol();
    await this.csdu();
    await this.purchase();
    await this.cspurchase();
    await this.cashnoncs();
    await this.cashcs();
    await this.top10csnum();
    await this.trinity();
    await this.trinitynum();
    await this.imm();
    await this.immednum();
    await this.multiprac();
    await this.multipracnum();
    await this.highmed();
    await this.highmednum();
    await this.highmedpres();
    await this.spatial();
    await this.csphyphys();
    await this.phyphys();
    await this.csphypt();
    await this.phypt();
    await this.csphyspt();
    await this.physpt();
    await this.alprazfam();
    await this.alprazfamdumonth();
    await this.alprazfamtimes();
    await this.alprazfamhighdose();
    await this.alpraz2();
    await this.alpraz2dumonth();
    await this.alpraz2times();
    await this.alpraz2high();
    await this.amphetamine();
    await this.amphetdumonth();
    await this.amphettimes();
    await this.amphethigh();
    await this.bupe();
    await this.bupedumonth();
    await this.bupetimes();
    await this.bupehigh();
    await this.bupefamper();
    await this.carisoprodol();
    await this.carisodumonth();
    await this.carisotimes();
    await this.carisohigh();
    await this.fentanyl();
    await this.fentdumonth();
    await this.fenttimes();
    await this.fenthigh();
    await this.hydrocofam();
    await this.hydrocodumonth();
    await this.hydrocotimes();
    await this.hydrocohigh();
    await this.hydroco10_325();
    await this.hydroco10dumonth();
    await this.hydroco10times();
    await this.hydroco10high();
    await this.hydroco10perc();
    await this.hydromorph();
    await this.hydromorphdumonth();
    await this.hydromorphtimes();
    await this.hydromorphhigh();
    await this.hydromorph8();
    await this.hydromorph8dumonth();
    await this.hydromorph8times();
    await this.hydromorph8high();
    await this.lisdex();
    await this.lisdexdumonth();
    await this.lisdextimes();
    await this.lisdexhigh();
    await this.methadone();
    await this.methadumonth();
    await this.methatimes();
    await this.methahigh();
    await this.methylphen();
    await this.methyldumonth();
    await this.methyltimes();
    await this.methylhigh();
    await this.morphine();
    await this.morphdumonth();
    await this.morphtimes();
    await this.morphhigh();
    await this.oxycodone();
    await this.oxydumonth();
    await this.oxytimes();
    await this.oxyhigh();
    await this.oxy15();
    await this.oxy15dumonth();
    await this.oxy15times();
    await this.oxy15high();
    await this.oxy30();
    await this.oxy30dumonth();
    await this.oxy30times();
    await this.oxy30high();
    await this.oxy10_325();
    await this.oxy10dumonth();
    await this.oxy10times();
    await this.oxy10high();
    await this.oxymorph();
    await this.oxymorphdumonth();
    await this.oxymorphtimes();
    await this.oxymorphhigh();
    await this.tramadol();
    await this.tramdumonth();
    await this.tramtimes();
    await this.tramhigh();
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
