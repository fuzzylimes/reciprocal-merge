import { WorkBook, utils } from 'xlsx';
import { TableData, getCellValue as getWordCellValue } from '../word';
import { getCellValue } from '../excel';
import { Base } from './Base';
import { ReportSheets as rs } from '../sheets';
import * as c from '../constants';

type row = Record<string, unknown>;

export class common extends Base {
  trinityNum: number = 0;
  immNum: number = 0;
  multipracNum: number = 0;
  highmedNum: number = 0;

  constructor(outData: WorkBook, report: WorkBook, calculations: TableData, practitioners: WorkBook) {
    super(outData, report, calculations, practitioners, 'common');
  }

  async name() {
    this.headers.push('name');
    try {
      const cellValue = getWordCellValue(this.calculations, 'A1');
      const value = cellValue?.split(/(\w{2}\d{7})/g)[0].trim();
      this.data[0].push(value || '');
    } catch (error) {
      console.error(error);
      this.data[0].push('');
    }
  }

  async account() {
    this.headers.push('account');
    const cellValue = getWordCellValue(this.calculations, 'A2');
    this.data[0].push(cellValue || '');
  }

  async dea() {
    this.headers.push('dea');
    try {
      const cellValue = getCellValue(this.report, rs.summary, 'A3');
      const value = cellValue?.split('#')[1].trim();
      this.data[0].push(value || '');
    } catch (error) {
      console.error(error);
      this.data[0].push('');
    }
  }

  async address() {
    this.headers.push('account');
    const address = getCellValue(this.report, rs.summary, 'A8')?.toUpperCase();
    const cityStateZip = getCellValue(this.report, rs.summary, 'A9')?.toUpperCase();
    const value = `Address #1: ${address}\nCity, State, Zip: ${cityStateZip}`;
    this.data[0].push(value);
  }

  async daterange() {
    this.headers.push('daterange');
    const regex = /Data Range: (\d{4}-\d{2}-\d{2}) thru (\d{4}-\d{2}-\d{2})/;
    const cellValue = getCellValue(this.report, rs.summary, 'A1');
    const match = cellValue?.match(regex);

    let value = '';

    if (match) {
      const startDate = new Date(match[1]);
      const endDate = new Date(match[2]);

      // Format the dates
      const startFormatted = startDate.toLocaleString('en-US', { month: 'short', year: 'numeric' });
      const endFormatted = endDate.toLocaleString('en-US', { month: 'short', year: 'numeric' });

      value = `${startFormatted} - ${endFormatted}`;
    }

    this.data[0].push(value);
  }

  async rxday() {
    this.headers.push('rxday');
    const cellValue = getWordCellValue(this.calculations, 'B15');
    this.data[0].push(cellValue || '');
  }

  async rxmonth() {
    this.headers.push('rxmonth');
    const cellValue = getWordCellValue(this.calculations, 'B14');
    this.data[0].push(cellValue || '');
  }

  async csrxvol() {
    this.headers.push('csrxvol');
    const cellValue = getWordCellValue(this.calculations, 'B11');
    this.data[0].push(cellValue || '');
  }

  async csdu() {
    this.headers.push('csdu');
    const cellValue = getWordCellValue(this.calculations, 'B10');
    this.data[0].push(cellValue || '');
  }

  async purchase() {
    this.headers.push('purchase');
    const cellValue = getWordCellValue(this.calculations, 'B8');
    this.data[0].push(cellValue || '');
  }

  async cspurchase() {
    this.headers.push('cspurchase');
    this.headers.push('purchase');
    const cellValue = getWordCellValue(this.calculations, 'B9');
    this.data[0].push(cellValue || '');
  }

  async cashnoncs() {
    this.headers.push('cashnoncs');
    const cellValue = getCellValue(this.report, rs.summary, 'C15');
    this.data[0].push(cellValue || '');
  }

  async cashcs() {
    this.headers.push('cashcs');
    const cellValue = getCellValue(this.report, rs.summary, 'C14');
    this.data[0].push(cellValue || '');
  }

  async top10csnum() {
    this.headers.push('top10csnum');
  }

  async trinity() {
    this.headers.push('trinity');
    const sheet = this.report.Sheets[rs.trinityConcerns];
    const rows = utils.sheet_to_json<row>(sheet, { header: "A" })?.slice(1);
    if (!rows) {
      this.data[0].push('');
      return;
    }

    const mapping: Record<string, Record<number, number>> = {};

    for (const row of rows) {
      const family = (row.L as string).toLowerCase();
      const patientId = row.K as number;

      if (family in mapping) {
        if (patientId in mapping[family]) {
          mapping[family][patientId]++;
        } else {
          mapping[family][patientId] = 1;
        }
      } else {
        mapping[family] = { [patientId]: 1 };
      }
    }

    const carisoprodolItems = mapping[c.carisoprodol];
    const amphetamineItems = mapping[c.amphetamine];
    const carisoprodolKeys = Object.keys(carisoprodolItems);
    const carisoprodolCount = carisoprodolKeys.length;
    const amphetamineKeys = Object.keys(amphetamineItems);
    const amphetamineCount = amphetamineKeys.length;

    this.trinityNum = carisoprodolCount + amphetamineCount;

    const value = `${carisoprodolCount} ${c.carisoprodol} patients (${carisoprodolKeys.join(', ')})\n${amphetamineCount} ${c.amphetamine} patients (${amphetamineKeys.join(', ')})`;
    this.data[0].push(value);
  }

  async trinitynum() {
    this.headers.push('trinitynum');
    this.data[0].push(this.trinityNum);
  }

  async imm() {
    this.headers.push('imm');
  }

  async immednum() {
    this.headers.push('immednum');
  }

  async multiprac() {
    this.headers.push('multiprac');
    const sheet = this.report.Sheets[rs.trinityConcerns];
    const rows = utils.sheet_to_json<row>(sheet, { header: "A" })?.slice(1);
    if (!rows) {
      this.data[0].push('');
      return;
    }

    const mapping: Record<number, boolean> = {};

    for (const row of rows) {
      const patientId = row.K as number;
      mapping[patientId] = true;
    }

    const patientIds = Object.keys(mapping);
    this.multipracNum = patientIds.length;

    const value = `${this.multipracNum} patients (${patientIds.join(', ')})`;
    this.data[0].push(value);
  }

  async multipracnum() {
    this.headers.push('multipracnum');
    this.data[0].push(this.multipracNum);
  }

  async highmed() {
    this.headers.push('highmed');
  }

  async highmednum() {
    this.headers.push('highmednum');
  }

  async highmedpres() {
    this.headers.push('highmedpres');
  }

  async spatial() {
    this.headers.push('spatial');
  }

  async csphyphys() {
    this.headers.push('csphyphys');
  }

  async phyphys() {
    this.headers.push('phyphys');
  }

  async csphypt() {
    this.headers.push('csphypt');
  }

  async phypt() {
    this.headers.push('phypt');
  }

  async csphyspt() {
    this.headers.push('csphyspt');
  }

  async physpt() {
    this.headers.push('physpt');
  }

  async alprazfam() {
    this.headers.push('alprazfam');
  }

  async alprazfamdumonth() {
    this.headers.push('alprazfamdumonth');
  }

  async alprazfamtimes() {
    this.headers.push('alprazfamtimes');
  }

  async alprazfamhighdose() {
    this.headers.push('alprazfamhighdose');
  }

  async alpraz2() {
    this.headers.push('alpraz2');
  }

  async alpraz2dumonth() {
    this.headers.push('alpraz2dumonth');
  }

  async alpraz2times() {
    this.headers.push('alpraz2times');
  }

  async alpraz2high() {
    this.headers.push('alpraz2high');
  }

  async amphetamine() {
    this.headers.push('amphetamine');
  }

  async amphetdumonth() {
    this.headers.push('amphetdumonth');
  }

  async amphettimes() {
    this.headers.push('amphettimes');
  }

  async amphethigh() {
    this.headers.push('amphethigh');
  }

  async bupe() {
    this.headers.push('bupe');
  }

  async bupedumonth() {
    this.headers.push('bupedumonth');
  }

  async bupetimes() {
    this.headers.push('bupetimes');
  }

  async bupehigh() {
    this.headers.push('bupehigh');
  }

  async bupefamper() {
    this.headers.push('bupefamper');
  }

  async carisoprodol() {
    this.headers.push('carisoprodol');
  }

  async carisodumonth() {
    this.headers.push('carisodumonth');
  }

  async carisotimes() {
    this.headers.push('carisotimes');
  }

  async carisohigh() {
    this.headers.push('carisohigh');
  }

  async fentanyl() {
    this.headers.push('fentanyl');
  }

  async fentdumonth() {
    this.headers.push('fentdumonth');
  }

  async fenttimes() {
    this.headers.push('fenttimes');
  }

  async fenthigh() {
    this.headers.push('fenthigh');
  }

  async hydrocofam() {
    this.headers.push('hydrocofam');
  }

  async hydrocodumonth() {
    this.headers.push('hydrocodumonth');
  }

  async hydrocotimes() {
    this.headers.push('hydrocotimes');
  }

  async hydrocohigh() {
    this.headers.push('hydrocohigh');
  }

  async hydroco10_325() {
    this.headers.push('hydroco10/325');
  }

  async hydroco10dumonth() {
    this.headers.push('hydroco10dumonth');
  }

  async hydroco10times() {
    this.headers.push('hydroco10times');
  }

  async hydroco10high() {
    this.headers.push('hydroco10high');
  }

  async hydroco10perc() {
    this.headers.push('hydroco10perc');
  }

  async hydromorph() {
    this.headers.push('hydromorph');
  }

  async hydromorphdumonth() {
    this.headers.push('hydromorphdumonth');
  }

  async hydromorphtimes() {
    this.headers.push('hydromorphtimes');
  }

  async hydromorphhigh() {
    this.headers.push('hydromorphhigh');
  }

  async hydromorph8() {
    this.headers.push('hydromorph8');
  }

  async hydromorph8dumonth() {
    this.headers.push('hydromorph8dumonth');
  }

  async hydromorph8times() {
    this.headers.push('hydromorph8times');
  }

  async hydromorph8high() {
    this.headers.push('hydromorph8high');
  }

  async lisdex() {
    this.headers.push('lisdex');
  }

  async lisdexdumonth() {
    this.headers.push('lisdexdumonth');
  }

  async lisdextimes() {
    this.headers.push('lisdextimes');
  }

  async lisdexhigh() {
    this.headers.push('lisdexhigh');
  }

  async methadone() {
    this.headers.push('methadone');
  }

  async methadumonth() {
    this.headers.push('methadumonth');
  }

  async methatimes() {
    this.headers.push('methatimes');
  }

  async methahigh() {
    this.headers.push('methahigh');
  }

  async methylphen() {
    this.headers.push('methylphen');
  }

  async methyldumonth() {
    this.headers.push('methyldumonth');
  }

  async methyltimes() {
    this.headers.push('methyltimes');
  }

  async methylhigh() {
    this.headers.push('methylhigh');
  }

  async morphine() {
    this.headers.push('morphine');
  }

  async morphdumonth() {
    this.headers.push('morphdumonth');
  }

  async morphtimes() {
    this.headers.push('morphtimes');
  }

  async morphhigh() {
    this.headers.push('morphhigh');
  }

  async oxycodone() {
    this.headers.push('oxycodone');
  }

  async oxydumonth() {
    this.headers.push('oxydumonth');
  }

  async oxytimes() {
    this.headers.push('oxytimes');
  }

  async oxyhigh() {
    this.headers.push('oxyhigh');
  }

  async oxy15() {
    this.headers.push('oxy15');
  }

  async oxy15dumonth() {
    this.headers.push('oxy15dumonth');
  }

  async oxy15times() {
    this.headers.push('oxy15times');
  }

  async oxy15high() {
    this.headers.push('oxy15high');
  }

  async oxy30() {
    this.headers.push('oxy30');
  }

  async oxy30dumonth() {
    this.headers.push('oxy30dumonth');
  }

  async oxy30times() {
    this.headers.push('oxy30times');
  }

  async oxy30high() {
    this.headers.push('oxy30high');
  }

  async oxy10_325() {
    this.headers.push('oxy10/325');
  }

  async oxy10dumonth() {
    this.headers.push('oxy10dumonth');
  }

  async oxy10times() {
    this.headers.push('oxy10times');
  }

  async oxy10high() {
    this.headers.push('oxy10high');
  }

  async oxymorph() {
    this.headers.push('oxymorph');
  }

  async oxymorphdumonth() {
    this.headers.push('oxymorphdumonth');
  }

  async oxymorphtimes() {
    this.headers.push('oxymorphtimes');
  }

  async oxymorphhigh() {
    this.headers.push('oxymorphhigh');
  }

  async tramadol() {
    this.headers.push('tramadol');
  }

  async tramdumonth() {
    this.headers.push('tramdumonth');
  }

  async tramtimes() {
    this.headers.push('tramtimes');
  }

  async tramhigh() {
    this.headers.push('tramhigh');
  }

  async prevdate() {
    this.headers.push('prevdate');
  }

  async currentdate() {
    this.headers.push('currentdate');
  }

  async soms() {
    this.headers.push('soms');
  }

  async arcosmonth() {
    this.headers.push('arcosmonth');
  }

  async arcossupnum() {
    this.headers.push('arcossupnum');
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

    await super.build();
  }
}
