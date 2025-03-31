import { WorkBook, utils } from 'xlsx';
import { TableData } from '../word';
import { getCellValue, sumColumn } from '../excel';
import { Base } from './Base';
import { CalcKeys, commonRecord, irSheet, medSheet, multipracSheet, ReportSheets as rs, trinitySheet } from '../sheets';
import * as c from '../constants';
import { headers } from "../sheets";
import { aigReference, getAigByReference } from '../aig-helper';

export type row = Record<string, unknown>;

export class common extends Base {
  filteredHighMedRows: medSheet[] = [];
  record: commonRecord = {};

  constructor(outData: WorkBook, report: WorkBook, calculations: TableData, practitioners: WorkBook) {
    super(outData, report, calculations, practitioners, 'common', headers.common);
  }

  async name() {
    try {
      const cellValue = this.calculations.getCellValue('A1');
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

  processAigData(
    reference: aigReference,
    recordPrefix: string,
  ) {
    const data = Base.aigData[reference];
    const aig = getAigByReference(reference);

    this.record[recordPrefix as keyof commonRecord] = aig.label;
    const [du, times] = this.calculations.getDuAndTimesByRowLabel(aig.duMonthCell);
    this.record[`${recordPrefix}.dumonth` as keyof commonRecord] = data.month = du;
    this.record[`${recordPrefix}.times` as keyof commonRecord] = data.times = times;
    this.record[`${recordPrefix}.highdose` as keyof commonRecord] = `${((data.highpct || 0)).toFixed(0)}%`;

    if (data.per) this.record[`${recordPrefix}medlow` as keyof commonRecord] = `${(data.per || 0).toFixed(2)}%`
    if (data.highmed) this.record[`${recordPrefix}medhigh` as keyof commonRecord] = data.highmed;
    if (data.lowmed) this.record[`${recordPrefix}medlow` as keyof commonRecord] = data.lowmed;
  }

  setStaticValues() {
    const address = getCellValue(this.report, rs.summary, 'A8');
    const cityStateZip = getCellValue(this.report, rs.summary, 'A9');
    this.record.address = `${address}\n${cityStateZip}`;

    this.record.account = this.calculations.getCellByRowLabel(CalcKeys.account);
    this.record.rxday = this.calculations.getCellByRowLabel(CalcKeys.rxday);
    this.record.rxmonth = this.calculations.getCellByRowLabel(CalcKeys.rxmonth);
    this.record.csrxvol = this.calculations.getCellByRowLabel(CalcKeys.csrxvol);
    this.record.csdu = this.calculations.getCellByRowLabel(CalcKeys.csdu);
    this.record.purchase = this.calculations.getCellByRowLabel(CalcKeys.purchase);
    this.record.cspurchase = this.calculations.getCellByRowLabel(CalcKeys.cspurchase);

    // Alprazolam Family
    const { alpraz } = Base.aigData;
    let aig = getAigByReference(aigReference.alpraz);
    this.record.alprazfam = aig.label;
    let [du, times] = this.calculations.getDuAndTimesByRowLabel(aig.duMonthCell);
    this.record.alprazfamdumonth = alpraz.month = du;
    this.record.alprazfamtimes = alpraz.times = times;
    this.record.alprazfamhighdose = `${((alpraz.highpct || 0)).toFixed(0)}%`;

    // Alprazolam 2mg
    const { alpraz2 } = Base.aigData;
    aig = getAigByReference(aigReference.alpraz2);
    this.record.alpraz2 = aig.label;
    [du, times] = this.calculations.getDuAndTimesByRowLabel(aig.duMonthCell);
    this.record.alpraz2dumonth = alpraz2.month = du;
    this.record.alpraz2times = alpraz2.times = times;
    this.record.alpraz2high = `${((alpraz2.highpct || 0)).toFixed(0)}%`;

    // Amphetamine
    const { amphet } = Base.aigData;
    aig = getAigByReference(aigReference.amphet);
    this.record.amphetamine = aig.label;
    [du, times] = this.calculations.getDuAndTimesByRowLabel(aig.duMonthCell);
    this.record.amphetdumonth = amphet.month = du;
    this.record.amphettimes = amphet.times = times;
    this.record.amphethigh = `${((amphet.highpct || 0)).toFixed(0)}%`;

    // Buprenorphine 8mg
    const { bupe } = Base.aigData;
    aig = getAigByReference(aigReference.bupe);
    this.record.bupe = aig.label;
    [du, times] = this.calculations.getDuAndTimesByRowLabel(aig.duMonthCell);
    this.record.bupedumonth = bupe.month = du;
    this.record.bupetimes = bupe.times = times;
    this.record.bupehigh = `${((bupe.highpct || 0)).toFixed(0)}%`;
    this.record.bupefamper = `${(bupe.per || 0).toFixed(2)}%`

    // Carisoprodol
    const { cariso } = Base.aigData;
    aig = getAigByReference(aigReference.cariso);
    this.record.carisoprodol = aig.label;
    [du, times] = this.calculations.getDuAndTimesByRowLabel(aig.duMonthCell);
    this.record.carisodumonth = cariso.month = du;
    this.record.carisotimes = cariso.times = times;
    this.record.carisohigh = `${((cariso.highpct || 0)).toFixed(0)}%`;

    // Fentanyl
    const { fent } = Base.aigData;
    aig = getAigByReference(aigReference.fent);
    this.record.fentanyl = aig.label;
    [du, times] = this.calculations.getDuAndTimesByRowLabel(aig.duMonthCell);
    this.record.fentdumonth = fent.month = du;
    this.record.fenttimes = fent.times = times;
    this.record.fenthigh = `${((fent.highpct || 0)).toFixed(0)}%`;
    this.record.fentmedhigh = fent.highmed;
    this.record.fentmedlow = fent.lowmed;

    // Hydrocodone Family
    const { hydroco } = Base.aigData;
    aig = getAigByReference(aigReference.hydroco);
    this.record.hydrocofam = aig.label;
    [du, times] = this.calculations.getDuAndTimesByRowLabel(aig.duMonthCell);
    this.record.hydrocodumonth = hydroco.month = du;
    this.record.hydrocotimes = hydroco.times = times;
    this.record.hydrocohigh = `${((hydroco.highpct || 0)).toFixed(0)}%`;
    this.record.hydrocomedhigh = hydroco.highmed;
    this.record.hydrocomedlow = hydroco.lowmed;

    // Hydrocodone 10/325mg
    const { hydroco10 } = Base.aigData;
    aig = getAigByReference(aigReference.hydroco10);
    this.record['hydroco10/325'] = aig.label;
    [du, times] = this.calculations.getDuAndTimesByRowLabel(aig.duMonthCell);
    this.record.hydroco10dumonth = hydroco10.month = du;
    this.record.hydroco10times = hydroco10.times = times;
    this.record.hydroco10high = `${((hydroco10.highpct || 0)).toFixed(0)}%`;
    this.record.hydroco10perc = `${(hydroco10.per || 0).toFixed(2)}%`
    this.record.hydroco10medhigh = hydroco10.highmed;
    this.record.hydroco10medlow = hydroco10.lowmed;

    // Hydromorphone
    const { hydromorph } = Base.aigData;
    aig = getAigByReference(aigReference.hydromorph);
    this.record.hydromorph = aig.label;
    [du, times] = this.calculations.getDuAndTimesByRowLabel(aig.duMonthCell);
    this.record.hydromorphdumonth = hydromorph.month = du;
    this.record.hydromorphtimes = hydromorph.times = times;
    this.record.hydromorphhigh = `${((hydromorph.highpct || 0)).toFixed(0)}%`;
    this.record.hydromorphmedhigh = hydromorph.highmed;
    this.record.hydromorphmedlow = hydromorph.lowmed;

    // Hydromorphone 8mg
    const { hydromorph8 } = Base.aigData;
    aig = getAigByReference(aigReference.hydromorph8);
    this.record.hydromorph8 = aig.label;
    [du, times] = this.calculations.getDuAndTimesByRowLabel(aig.duMonthCell);
    this.record.hydromorph8dumonth = hydromorph8.month = du;
    this.record.hydromorph8times = hydromorph8.times = times;
    this.record.hydromorph8high = `${((hydromorph8.highpct || 0)).toFixed(0)}%`;
    this.record.hydromorph8medhigh = hydromorph8.highmed;
    this.record.hydromorph8medlow = hydromorph8.lowmed;

    // Lisdexamfetamine
    const { lisdex } = Base.aigData;
    aig = getAigByReference(aigReference.lisdex);
    this.record.lisdex = aig.label;
    [du, times] = this.calculations.getDuAndTimesByRowLabel(aig.duMonthCell);
    this.record.lisdexdumonth = lisdex.month = du;
    this.record.lisdextimes = lisdex.times = times;
    this.record.lisdexhigh = `${((lisdex.highpct || 0)).toFixed(0)}%`;

    // Methadone
    const { metha } = Base.aigData;
    aig = getAigByReference(aigReference.metha);
    this.record.methadone = aig.label;
    [du, times] = this.calculations.getDuAndTimesByRowLabel(aig.duMonthCell);
    this.record.methadumonth = metha.month = du;
    this.record.methatimes = metha.times = times;
    this.record.methahigh = `${((metha.highpct || 0)).toFixed(0)}%`;
    this.record.methamedhigh = metha.highmed;
    this.record.methamedlow = metha.lowmed;

    // Methylphenidate
    const { methyl } = Base.aigData;
    aig = getAigByReference(aigReference.methyl);
    this.record.methylphen = aig.label;
    [du, times] = this.calculations.getDuAndTimesByRowLabel(aig.duMonthCell);
    this.record.methyldumonth = methyl.month = du;
    this.record.methyltimes = methyl.times = times;
    this.record.methylhigh = `${((methyl.highpct || 0)).toFixed(0)}%`;

    // Morphine
    const { morph } = Base.aigData;
    aig = getAigByReference(aigReference.morph);
    this.record.morphine = aig.label;
    [du, times] = this.calculations.getDuAndTimesByRowLabel(aig.duMonthCell);
    this.record.morphdumonth = morph.month = du;
    this.record.morphtimes = morph.times = times;
    this.record.morphhigh = `${((morph.highpct || 0)).toFixed(0)}%`;
    this.record.morphmedhigh = morph.highmed;
    this.record.morphmedlow = morph.lowmed;

    // Oxycodone Family
    const { oxy } = Base.aigData;
    aig = getAigByReference(aigReference.oxy);
    this.record.oxycodone = aig.label;
    [du, times] = this.calculations.getDuAndTimesByRowLabel(aig.duMonthCell);
    this.record.oxydumonth = oxy.month = du;
    this.record.oxytimes = oxy.times = times;
    this.record.oxyhigh = `${((oxy.highpct || 0)).toFixed(0)}%`;
    this.record.oxymedhigh = oxy.highmed;
    this.record.oxymedlow = oxy.lowmed;

    // Oxycodone 15mg
    const { oxy15 } = Base.aigData;
    aig = getAigByReference(aigReference.oxy15);
    this.record.oxy15 = aig.label;
    [du, times] = this.calculations.getDuAndTimesByRowLabel(aig.duMonthCell);
    this.record.oxy15dumonth = oxy15.month = du;
    this.record.oxy15times = oxy15.times = times;
    this.record.oxy15high = `${((oxy15.highpct || 0)).toFixed(0)}%`;
    this.record.oxy15medhigh = oxy15.highmed;
    this.record.oxy15medlow = oxy15.lowmed;

    // Oxycodone 30mg
    const { oxy30 } = Base.aigData;
    aig = getAigByReference(aigReference.oxy30);
    this.record.oxy30 = aig.label;
    [du, times] = this.calculations.getDuAndTimesByRowLabel(aig.duMonthCell);
    this.record.oxy30dumonth = oxy30.month = du;
    this.record.oxy30times = oxy30.times = times;
    this.record.oxy30high = `${((oxy30.highpct || 0)).toFixed(0)}%`;
    this.record.oxy30medhigh = oxy30.highmed;
    this.record.oxy30medlow = oxy30.lowmed;

    // Oxycodone 10/325mg
    const { oxy10 } = Base.aigData;
    aig = getAigByReference(aigReference.oxy10);
    this.record['oxy10/325'] = aig.label;
    [du, times] = this.calculations.getDuAndTimesByRowLabel(aig.duMonthCell);
    this.record.oxy10dumonth = oxy10.month = du;
    this.record.oxy10times = oxy10.times = times;
    this.record.oxy10high = `${((oxy10.highpct || 0)).toFixed(0)}%`;
    this.record.oxy10medhigh = oxy10.highmed;
    this.record.oxy10medlow = oxy10.lowmed;

    // Oxymorphone
    const { oxymorph } = Base.aigData;
    aig = getAigByReference(aigReference.oxymorph);
    this.record.oxymorph = aig.label;
    [du, times] = this.calculations.getDuAndTimesByRowLabel(aig.duMonthCell);
    this.record.oxymorphdumonth = oxymorph.month = du;
    this.record.oxymorphtimes = oxymorph.times = times;
    this.record.oxymorphhigh = `${((oxymorph.highpct || 0)).toFixed(0)}%`;
    this.record.oxymorphmedhigh = oxymorph.highmed;
    this.record.oxymorphmedlow = oxymorph.lowmed;

    // Tramadol
    const { tram } = Base.aigData;
    aig = getAigByReference(aigReference.tram);
    this.record.tramadol = aig.label;
    [du, times] = this.calculations.getDuAndTimesByRowLabel(aig.duMonthCell);
    this.record.tramdumonth = tram.month = du;
    this.record.tramtimes = tram.times = times;
    this.record.tramhigh = `${((tram.highpct || 0)).toFixed(0)}%`;
    this.record.trammedhigh = tram.highmed;
    this.record.trammedlow = tram.lowmed;
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
