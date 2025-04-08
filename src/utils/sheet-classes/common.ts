import { WorkBook, utils } from 'xlsx';
import { getCellValue, sumColumn } from '../excel';
import { Base } from './Base';
import { CalcKeys, commonRecord, irSheet, medSheet, multipracSheet, ReportSheets as rs, trinitySheet } from '../sheets';
import * as c from '../constants';
import { headers } from "../sheets";
import { aigLookup, IaigDef } from '../aig-helper';
import { toPercent } from '../format';

export type row = Record<string, unknown>;

export class common extends Base {
  filteredHighMedRows: medSheet[] = [];
  record: commonRecord = {};

  constructor(outData: WorkBook) {
    super(outData, 'common', headers.common);
  }

  async name() {
    try {
      const cellValue = Base.calculations.getCellValue('A1');
      this.record.name = cellValue?.split(/(\w{2}\d{7})/g)[0].trim();
    } catch (error) {
      console.error(error);
    }
  }

  async dea() {
    try {
      const cellValue = getCellValue(Base.report, rs.summary, 'A3');
      this.record.dea = cellValue?.split('#: ')[1].trim();
    } catch (error) {
      console.error(error);
    }
  }

  async daterange() {
    const regex = /Data Range: (\d{4}-\d{2}-\d{2}) thru (\d{4}-\d{2}-\d{2})/;
    const cellValue = getCellValue(Base.report, rs.summary, 'A1');
    const match = cellValue?.match(regex);

    let value = null;

    if (match) {
      const startDate = new Date(match[1]);
      const endDate = new Date(match[2]);

      // Format the dates
      const startFormatted = startDate.toLocaleString('en-US', { month: 'short', year: 'numeric' });
      const endFormatted = endDate.toLocaleString('en-US', { month: 'short', year: 'numeric' });

      this.record.currentdate = endFormatted;

      value = `${startFormatted} - ${endFormatted}`;
    }

    this.record.daterange = value;
  }

  prevDate() {
    const cell = Base.calculations.getCellByIndex(0, 0) ?? '';
    const [, prevDate] = cell.split(' Calculations ');
    this.record.prevdate = prevDate;
  }

  async cashnoncs() {
    const cellValue = getCellValue(Base.report, rs.summary, 'C15');
    // this is returned as a decimal, so we need to convert it to a percentage
    this.record.cashnoncs = cellValue ? `${(Number(cellValue) * 100).toFixed(0)}%` : '';
  }

  async cashcs() {
    const cellValue = getCellValue(Base.report, rs.summary, 'C14');
    // this is returned as a decimal, so we need to convert it to a percentage
    this.record.cashcs = cellValue ? `${(Number(cellValue) * 100).toFixed(0)}%` : '';
  }

  async top10csnum() {
    this.record.top10csnum = Base.top10Count;
  }

  async trinity() {
    const sheet = Base.report.Sheets[rs.trinityConcerns];
    const rows = utils.sheet_to_json<trinitySheet>(sheet);
    if (!rows) {
      this.record.trinitynum = 0;
      this.record.trinity = 'None';
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

    let trinityString = '';
    if (carisoprodolCount) {
      trinityString += `${carisoprodolCount} ${c.carisoprodol} patient${carisoprodolCount > 1 ? 's' : ''} (${carisoprodolKeys.map(k => `#${k}`).join(', ')})`;
    }
    if (amphetamineCount) {
      if (trinityString) trinityString += ` and `;
      trinityString += `${amphetamineCount} ${c.amphetamine} patient${amphetamineCount > 1 ? 's' : ''} (${amphetamineKeys.map(k => `#${k}`).join(', ')})`;
    }

    this.record.trinity = trinityString || 'None';
  }

  async imm() {
    const sheet = Base.report.Sheets[rs.immediateRelease];
    const rows = utils.sheet_to_json<irSheet>(sheet, { blankrows: true });
    if (!rows) {
      this.record.immednum = 0;
      this.record.imm = 'None';
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

    this.record.immednum = patientsList.length;
    let value = 'None';
    if (patientsList.length) {
      value = `${this.record.immednum} patient${patientsList.length > 1 ? 's' : ''} (${patientsList.map(p => `#${p}`).join(', ')})`;
    }
    this.record.imm = value;
  }

  async multiprac() {
    const sheet = Base.report.Sheets[rs.multiPractioner];
    const rows = utils.sheet_to_json<multipracSheet>(sheet);
    if (!rows) {
      this.record.multipracnum = 0;
      this.record.multiprac = 'None';
      return;
    }

    const mapping: Record<number, boolean> = {};

    for (const row of rows) {
      const patientId = row['Patient ID'];
      mapping[patientId] = true;
    }

    const patientIds = Object.keys(mapping);
    this.record.multipracnum = patientIds.length;
    let multipracString = 'None';
    if (patientIds.length) {
      multipracString = `${this.record.multipracnum} patient${Number(this.record.multipracnum) > 1 ? 's' : ''} (${patientIds.map(p => `#${p}`).join(', ')})`;
    }
    this.record.multiprac = multipracString;
  }

  async highmed() {
    const sheet = Base.report.Sheets[rs.medWatch];
    const rows = utils.sheet_to_json<medSheet>(sheet, { blankrows: true });
    if (!rows) {
      return;
    }

    this.filteredHighMedRows = rows.filter(row => row['Daily M.E.D per Prescription'] && Number(row['Daily M.E.D per Prescription']) >= 120)
    const prescriptionCount = this.filteredHighMedRows.length;
    const uniquePatients = new Set(this.filteredHighMedRows.map(row => row['Patient ID']));
    const patientCount = uniquePatients.size;

    this.record.highmednum = prescriptionCount;
    let value = '';
    if (prescriptionCount) {
      value = `There are ${prescriptionCount} prescription${prescriptionCount > 1 ? 's' : ''} between ${patientCount} patient${patientCount > 1 ? 's' : ''} with an MED of 120 or higher`;
    }
    this.record.highmed = value;
  }

  async highmedpres() {
    if (!this.filteredHighMedRows.length) {
      return;
    }

    // Need to find the prescriber with the most prescriptions, then get the count and Id of the patients
    const mapping: Record<string, Record<number, string>> = {};
    for (const row of this.filteredHighMedRows) {
      const prescriber = row['DEA#'];
      const prescriberName = row['Physician Name'];
      const patientId = row['Patient ID'];

      if (mapping[prescriber]) {
        if (!mapping[prescriber][patientId]) {
          mapping[prescriber][patientId] = prescriberName;
        }
      } else {
        mapping[prescriber] = { [patientId]: prescriberName };
      }
    }

    let maxPrescriber = '';
    let maxCount = 0;
    let maxPatients: number[] = [];
    Object.entries(mapping).forEach(([, patients]) => {
      const patientIds = Object.keys(patients);
      if (patientIds.length > maxCount) {
        maxCount = patientIds.length;
        maxPrescriber = patients[Number(patientIds[0])];
        maxPatients = [...new Set(patientIds.map(id => Number(id)))];
      }
    });

    const value = `The most prolific prescriber is ${maxPrescriber} with ${maxCount} prescription${maxCount > 1 ? 's' : ''} between ${maxPatients.length} patient${maxPatients.length > 1 ? 's' : ''}`;
    this.record.highmedpres = value;
  }

  // Handles all values from the spatial sheet
  // Uses direct cell references because multiple tables on the page
  async spatial() {
    const sheet = Base.report.Sheets[rs.spatial];
    const deas = utils.sheet_to_json<row>(sheet, { header: "A" })?.slice(1, 2)?.[0] ?? [];
    const rows = utils.sheet_to_json<row>(sheet, { header: "A", blankrows: true })?.slice(6, 9) ?? [];

    // look against the specific distances (C - L)
    let count = 0;
    for (const row of rows) {
      for (const col of c.cthrul) {
        if (row[col]) {
          count++;
          Base.deaMiles.push(String(deas[col]));
        }
      }
    }

    this.record.spatial = count;

    // csphyphys
    let sum = sumColumn(sheet, 38, 41, 'E');
    this.record.csphyphys = toPercent(sum);
    // phyphys
    sum = sumColumn(sheet, 38, 41, 'G');
    this.record.phyphys = toPercent(sum);
    //csphypt
    sum = sumColumn(sheet, 51, 54, 'E');
    this.record.csphypt = toPercent(sum);
    //phypt
    sum = sumColumn(sheet, 51, 54, 'G');
    this.record.phypt = toPercent(sum);
    // csphyspt
    sum = sumColumn(sheet, 64, 67, 'E');
    this.record.csphyspt = toPercent(sum);
    // physpt
    sum = sumColumn(sheet, 64, 67, 'G');
    this.record.physpt = toPercent(sum);
  }

  processAigData(
    aig: IaigDef,
  ) {
    const reference = aig.aigReference;
    const data = Base.aigData[reference];

    this.record[(aig.base ? aig.base : reference) as keyof commonRecord] = aig.label;
    const [du, times] = Base.calculations.getDuAndTimesByRowLabel(aig.duMonthCell);
    this.record[`${reference}dumonth` as keyof commonRecord] = data.month = du;
    this.record[`${reference}times` as keyof commonRecord] = data.times = times;
    this.record[`${reference}high` as keyof commonRecord] = `${((data.highpct || 0)).toFixed(0)}%`;

    if (data.per || data.per === 0) this.record[`${reference}per` as keyof commonRecord] = `${(data.per || 0).toFixed(2)}%`
    if (data.highmed || data.highmed === 0) this.record[`${reference}medhigh` as keyof commonRecord] = data.highmed;
    if (data.lowmed || data.lowmed === 0) this.record[`${reference}medlow` as keyof commonRecord] = data.lowmed;
  }

  setStaticValues() {
    const rawAddress = getCellValue(Base.report, rs.summary, 'A8') ?? '';
    let rawCityStateZip = getCellValue(Base.report, rs.summary, 'A9') ?? '';
    let address, cityStateZip;
    if (rawAddress) {
      const split = rawAddress.split('#1:');
      address = split[1] ? split[1].trim() : '';
    }
    // It's possible that there will be a second address line. If so, it needs to be added to the address and
    // we need to grab the city/state/zip from the next line
    if (rawCityStateZip && !rawCityStateZip.toLowerCase().includes('zip:')) {
      address += ` ${rawCityStateZip}`;
      rawCityStateZip = getCellValue(Base.report, rs.summary, 'A10') ?? '';
    }
    if (rawCityStateZip) {
      const split = rawCityStateZip.split(':');
      cityStateZip = split[1] ? split[1].trim() : '';
    }
    this.record.address = `${address}\n${cityStateZip}`;

    this.record.account = Base.calculations.getCellByRowLabel(CalcKeys.account);
    this.record.rxday = Base.calculations.getCellByRowLabel(CalcKeys.rxday, 1, false, true);
    this.record.rxmonth = Base.calculations.getCellByRowLabel(CalcKeys.rxmonth, 1, false, true);
    this.record.csrxvol = Base.calculations.getCellByRowLabel(CalcKeys.csrxvol);
    this.record.csdu = Base.calculations.getCellByRowLabel(CalcKeys.csdu);
    this.record.purchase = Base.calculations.getCellByRowLabel(CalcKeys.purchase);
    this.record.cspurchase = Base.calculations.getCellByRowLabel(CalcKeys.cspurchase);

    // Handle all AIG values
    for (let i = 1; i <= Object.keys(aigLookup).length; i++) {
      this.processAigData(aigLookup[i]);
    }
  }

  async build() {
    await this.name();
    await this.dea();
    await this.daterange();
    this.prevDate();
    await this.cashnoncs();
    await this.cashcs();
    await this.top10csnum();
    await this.trinity();
    await this.imm();
    await this.multiprac();
    await this.highmed();
    await this.highmedpres();
    await this.spatial();

    this.setStaticValues();

    this.data = this.getDataObject();
    await super.build();

    const cellAddress = utils.encode_cell({ r: 1, c: this.headers.indexOf('address') });
    const worksheet = this.outData.Sheets[this.sheet];
    for (const cell of [cellAddress]) {
      if (!worksheet[cell].s) worksheet[cell].s = {};
      worksheet[cell].s.alignment = { wrapText: true };
    }
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
