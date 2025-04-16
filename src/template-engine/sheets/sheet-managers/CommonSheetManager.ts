import { utils } from "xlsx";
import { TemplateGenerator } from "../../TemplateGenerator";
import { SheetManagerController } from "../SheetManagerController";
import { headers, sheetNames } from "./constants";
import { SheetManager } from "./SheetManager";
import * as c from '../../../utils/constants'
import { aigLookup } from "../../../utils/aig-helper";
import { AigSheetManager } from "./AigSheetManager";

type commonRecord = {
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

export class CommonSheetManager extends SheetManager {
  private data: commonRecord = {};

  constructor(generator: TemplateGenerator, controller: SheetManagerController) {
    super(generator, controller, sheetNames.common, headers.common);
  }

  async collect(): Promise<void> {
    const reportFile = this.generator.report;
    const calcFile = this.generator.calculations;
    const prevCalcFile = this.generator.prevCalculations;

    this.data.name = calcFile.pharmacy.name;
    this.data.account = calcFile.pharmacy.id;
    this.data.dea = reportFile.summary.dea;
    this.data.address = reportFile.summary.address;
    this.data.daterange = reportFile.summary.dateRange;
    this.data.rxday = calcFile.rxs.rxDaily;
    this.data.rxmonth = calcFile.rxs.rxPerMonth;
    this.data.csrxvol = calcFile.percents.cPerDisByRx;
    this.data.csdu = calcFile.percents.cPerDisByDU;
    this.data.purchase = calcFile.percents.perPurchasedFrom;
    this.data.cspurchase = calcFile.percents.perCUPurchasedFrom;
    this.data.cashnoncs = reportFile.summary.cashNonCs;
    this.data.cashcs = reportFile.summary.cashCs;
    this.data.top10csnum = reportFile.analysis.top10rx.length;
    this.collectTrinity();
    this.collectIR();
    this.generateMultiPrac();
    this.collectHighMed();
    this.collectHighMedPres();
    this.collectSpatial();
    this.collectAig();
    this.data.prevdate = prevCalcFile.pharmacy.date;
    this.data.currentdate = reportFile.summary.endDate;
    // Not currently being set
    // this.data.soms
    // this.data.arcosmonth
    // this.data.arcossupnum
  }

  private collectTrinity() {
    const trinityMapping = this.generator.report.trinity.trinityMapping;
    if (Object.keys(trinityMapping).length === 0) {
      this.data.trinitynum = 0;
      this.data.trinity = 'None';
      return;
    }

    const carisoprodolItems = trinityMapping[c.carisoprodol] || {};
    const amphetamineItems = trinityMapping[c.amphetamine] || {};
    const carisoprodolKeys = Object.keys(carisoprodolItems);
    const carisoprodolCount = carisoprodolKeys.length;
    const amphetamineKeys = Object.keys(amphetamineItems);
    const amphetamineCount = amphetamineKeys.length;

    this.data.trinitynum = carisoprodolCount + amphetamineCount;

    let trinityString = '';
    if (carisoprodolCount) {
      trinityString += `${carisoprodolCount} ${c.carisoprodol} ${this.plural('patient', carisoprodolCount)} ${this.patientNumbers(carisoprodolKeys)}`;
    }
    if (amphetamineCount) {
      if (trinityString) trinityString += ` and `;
      trinityString += `${amphetamineCount} ${c.amphetamine} ${this.plural('patient', amphetamineCount)} ${this.patientNumbers(amphetamineKeys)}`;
    }

    this.data.trinity = trinityString || 'None';
  }

  private collectIR() {
    const mapping = this.generator.report.ir.patToDrugMapping;
    // Step through each of the patients and see if they have more than one drug name
    const patientsList: number[] = [];
    Object.entries(mapping).forEach(([id, drugs]) => {
      if (drugs.size > 1) {
        patientsList.push(Number(id));
      }
    })

    const patNum = patientsList.length;
    this.data.immednum = patNum;
    let value = 'None';
    if (patNum) {
      value = `${this.data.immednum} ${this.plural('patient', patNum)} ${this.patientNumbers(patientsList)}`;
    }
    this.data.imm = value;
  }

  private generateMultiPrac() {
    const uniquePatientSet = this.generator.report.multiPrac.uniquePats;
    const uniqueCount = uniquePatientSet.size;
    this.data.multipracnum = uniqueCount;
    let multipracString = 'None';
    if (uniqueCount) {
      multipracString = `${uniqueCount} ${this.plural('patient', uniqueCount)} ${this.patientNumbers([...uniquePatientSet])}`;
    }
    this.data.multiprac = multipracString;
  }

  private collectHighMed() {
    const highMed = this.generator.report.med.highMedData;
    if (!highMed.length) return;

    const prescriptionCount = highMed.length;
    const uniquePatients = new Set(highMed.map(row => row['Patient ID']));
    const patientCount = uniquePatients.size;

    this.data.highmednum = prescriptionCount;
    let value = '';
    if (prescriptionCount) {
      value = `There are ${prescriptionCount} ${this.plural('prescription', prescriptionCount)} between ${patientCount} patient${patientCount > 1 ? 's' : ''} with an MED of 120 or higher`;
    }
    this.data.highmed = value;
  }

  private collectHighMedPres() {
    const highMed = this.generator.report.med.highMedData;
    if (!highMed.length) return;

    // Need to find the prescriber with the most prescriptions, then get the count and Id of the patients
    const mapping: Record<string, Record<number, string>> = {};
    for (const row of highMed) {
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

    const value = `The most prolific prescriber is ${maxPrescriber} with ${maxCount} ${this.plural('prescription', maxCount)} between ${maxPatients.length} ${this.plural('patient', maxPatients.length)}`;
    this.data.highmedpres = value;
  }

  private collectSpatial() {
    const spatialData = this.generator.report.spatial;
    this.data.spatial = spatialData.spatialCount;

    // pharm to phys
    this.data.csphyphys = spatialData.pharmToPhysCsSum;
    this.data.phyphys = spatialData.pharmToPhysSum;

    // pharm to pat
    this.data.csphypt = spatialData.pharmToPatCsSum;
    this.data.phypt = spatialData.pharmToPatSum;

    // phys to pat
    this.data.csphyspt = spatialData.physToPatCsSum;
    this.data.physpt = spatialData.physToPatSum;
  }

  private collectAig() {
    const drugData = this.generator.calculations.drugs;
    for (let i = 1; i <= Object.keys(aigLookup).length; i++) {
      const ref = aigLookup[i];
      const referenceName = ref.aigReference;
      const { highmed, highpct, lowmed, per } = (this.generator.sheetManager.getSheet(`${sheetNames.aig}${i}`) as AigSheetManager).commonData;
      const { duMonth, multiple } = (drugData.get(ref.duMonthCell) || {});

      this.data[(ref.base ? ref.base : referenceName) as keyof commonRecord] = ref.label;
      this.data[`${referenceName}dumonth` as keyof commonRecord] = duMonth;
      this.data[`${referenceName}times` as keyof commonRecord] = multiple;
      this.data[`${referenceName}high` as keyof commonRecord] = highpct;

      if (per || per === 0) this.data[`${referenceName}per` as keyof commonRecord] = per;
      if (highmed || highmed === 0) this.data[`${referenceName}medhigh` as keyof commonRecord] = highmed;
      if (lowmed || lowmed === 0) this.data[`${referenceName}medlow` as keyof commonRecord] = lowmed;
    }
  }

  private plural(base: string, count: number): string {
    return `${base}${count > 1 ? 's' : ''}`;
  }

  private patientNumbers(keys: unknown[]): string {
    return `(${keys.map(k => `#${k}`).join(', ')})`;
  }

  async generate(): Promise<void> {
    // Build out the full data array, in header order
    const rowData = this.controller.buildDataArray([this.data], this.headers);
    // Create a new sheet on the base generator
    this.generator.addSheet(this.sheetName, this.headers, rowData);

    // Need to specially format the address cell so that it will wrap around and not get lost
    const cellAddress = utils.encode_cell({ r: 1, c: this.headers.indexOf('address') });
    const worksheet = this.generator.outputWorkbook.Sheets[this.sheetName];
    for (const cell of [cellAddress]) {
      if (!worksheet[cell].s) worksheet[cell].s = {};
      worksheet[cell].s.alignment = { wrapText: true };
    }
  }
}
