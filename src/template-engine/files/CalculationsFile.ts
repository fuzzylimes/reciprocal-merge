import { drugNames } from "../../utils/constants";
import { Ifile } from "../../utils/file-system-service";
import { GetDocContent } from "../../utils/word";

enum SectionIdentifiers {
  total = 'total control',
  percent = '% dosage units purchased',
  rxs = "of rx's",
  alprazfam = 'Alprazolam',
  alpraz2 = 'Alprazolam 2mg',
  amphet = 'Amphetamine',
  bupe = 'Buprenorphine 8mg',
  cariso = 'Carisoprodol',
  fent = 'Fentanyl',
  hydroco = 'Hydrocodone',
  hydroco10 = 'Hydrocodone 10/325mg',
  hydromorph = 'Hydromorphone',
  hydromorph8 = 'Hydromorphone 8mg',
  lisdex = 'Lisdexamfetamine',
  metha = 'Methadone',
  methyl = 'Methylphenidate',
  morph = 'Morphine',
  oxy = 'Oxycodone',
  oxy15 = 'Oxycodone 15mg',
  oxy30 = 'Oxycodone 30mg',
  oxy10 = 'Oxycodone 10/325mg',
  oxymorph = 'Oxymorphone',
  tram = 'Tramadol'
}

interface Pharmacy {
  name: string;
  date: string;
  id: string;
  location: string;
}

interface Totals {
  totalCUDispensed: number;
  totallAUDispensed: number;
  totalACUPurchased: number;
  totalAPurchased: number;
}

interface Percents {
  perPurchasedFrom: number;
  perCUPurchasedFrom: number;
  cPerDisByDU: number;
  cPerDisByRx: number;
}

interface Rxs {
  totalRx: number;
  rxPerMonth: number;
  rxDaily: number;
  multiple: number;
}

interface Drug {
  total: number;
  duMonth: number;
  expDuMonth: number;
  multiple: number;
}

export class CalculationsFile {
  private rawDoc: Document;
  private table!: Element;
  pharmacy: Partial<Pharmacy> = {};
  totals: Partial<Totals> = {};
  percents: Partial<Percents> = {};
  rxs: Partial<Rxs> = {};
  drugs: Map<string, Drug> = new Map();

  constructor(file: Ifile) {
    this.rawDoc = GetDocContent(file.content!);
    this.initializeTable();
    this.initializeData();
  }

  initializeTable() {
    // Find all tables in the document
    const tables = this.rawDoc.getElementsByTagName('w:tbl');

    if (tables.length === 0) {
      throw new Error('No tables found in the document');
    }

    // Get the requested table
    this.table = tables[0];
  }

  initializeData() {
    const rows = this.table.getElementsByTagName('w:tr');

    // Map identifiers to handler functions
    const sectionHandlers = new Map([
      [SectionIdentifiers.total, (idx: number) => this.collectTotalValues(rows, idx)],
      [SectionIdentifiers.percent, (idx: number) => this.collectPercentValues(rows, idx)],
      [SectionIdentifiers.rxs, (idx: number) => this.collectRxValues(rows, idx)],
      [SectionIdentifiers.alprazfam, (idx: number) => this.collectDrugValues(rows, idx, drugNames.alprazfam)],
      [SectionIdentifiers.alpraz2, (idx: number) => this.collectDrugValues(rows, idx, drugNames.alpraz2)],
      [SectionIdentifiers.amphet, (idx: number) => this.collectDrugValues(rows, idx, drugNames.amphet)],
      [SectionIdentifiers.bupe, (idx: number) => this.collectDrugValues(rows, idx, drugNames.bupe)],
      [SectionIdentifiers.cariso, (idx: number) => this.collectDrugValues(rows, idx, drugNames.cariso)],
      [SectionIdentifiers.fent, (idx: number) => this.collectDrugValues(rows, idx, drugNames.fent)],
      [SectionIdentifiers.hydroco, (idx: number) => this.collectDrugValues(rows, idx, drugNames.hydroco)],
      [SectionIdentifiers.hydroco10, (idx: number) => this.collectDrugValues(rows, idx, drugNames.hydroco10)],
      [SectionIdentifiers.hydromorph, (idx: number) => this.collectDrugValues(rows, idx, drugNames.hydromorph)],
      [SectionIdentifiers.hydromorph8, (idx: number) => this.collectDrugValues(rows, idx, drugNames.hydromorph8)],
      [SectionIdentifiers.lisdex, (idx: number) => this.collectDrugValues(rows, idx, drugNames.lisdex)],
      [SectionIdentifiers.metha, (idx: number) => this.collectDrugValues(rows, idx, drugNames.metha)],
      [SectionIdentifiers.methyl, (idx: number) => this.collectDrugValues(rows, idx, drugNames.methyl)],
      [SectionIdentifiers.morph, (idx: number) => this.collectDrugValues(rows, idx, drugNames.morph)],
      [SectionIdentifiers.oxy, (idx: number) => this.collectDrugValues(rows, idx, drugNames.oxy)],
      [SectionIdentifiers.oxy15, (idx: number) => this.collectDrugValues(rows, idx, drugNames.oxy15)],
      [SectionIdentifiers.oxy30, (idx: number) => this.collectDrugValues(rows, idx, drugNames.oxy30)],
      [SectionIdentifiers.oxy10, (idx: number) => this.collectDrugValues(rows, idx, drugNames.oxy10)],
      [SectionIdentifiers.oxymorph, (idx: number) => this.collectDrugValues(rows, idx, drugNames.oxymorph)],
      [SectionIdentifiers.tram, (idx: number) => this.collectDrugValues(rows, idx, drugNames.tram)],
    ]);

    const remainingHandlers = new Map(sectionHandlers);

    // process each row
    for (let ri = 0; ri < rows.length; ri++) {
      const row = rows[ri];
      const [label, value] = this.getLabelAndValue(row);

      // skip blank or padded cells
      if (!label || label.includes('****')) continue;

      // Handle the fixed cells at the top
      if (ri === 0) {
        this.pharmacy.name = this.getPharmacyName(label);
        this.pharmacy.date = this.getReportDate(label);
        this.pharmacy.id = value;
        continue;
      } else if (ri === 1) {
        this.pharmacy.location = label;
        continue;
      }

      // Find and process matching section
      for (const [identifier, handler] of remainingHandlers.entries()) {
        if (label.toLowerCase().includes(identifier.toLowerCase())) {
          ri = handler(ri);
          remainingHandlers.delete(identifier);
          break;
        }
      }

      // Early exit if we've found all sections
      if (remainingHandlers.size === 0) {
        break;
      }
    }
  }
  collectDrugValues(rows: HTMLCollectionOf<Element>, ri: number, drugName: string) {
    this.drugs.set(drugName, {
      total: this.getRowValueAsNumber(rows[ri]),
      duMonth: this.getRowValueAsNumber(rows[++ri]),
      expDuMonth: this.getRowValueAsNumber(rows[++ri]),
      multiple: this.getRowValueAsNumber(rows[++ri])
    });
    return ri;
  }

  collectTotalValues(rows: HTMLCollectionOf<Element>, ri: number) {
    this.totals = {
      totalCUDispensed: this.getRowValueAsNumber(rows[ri]),
      totallAUDispensed: this.getRowValueAsNumber(rows[++ri]),
      totalACUPurchased: this.getRowValueAsNumber(rows[++ri]),
      totalAPurchased: this.getRowValueAsNumber(rows[++ri])
    }
    return ri;
  }

  collectPercentValues(rows: HTMLCollectionOf<Element>, ri: number) {
    this.percents = {
      perPurchasedFrom: this.getRowValueAsPercent(rows[ri]),
      perCUPurchasedFrom: this.getRowValueAsPercent(rows[++ri]),
      cPerDisByDU: this.getRowValueAsPercent(rows[++ri]),
      cPerDisByRx: this.getRowValueAsPercent(rows[++ri])
    }
    return ri;
  }

  collectRxValues(rows: HTMLCollectionOf<Element>, ri: number) {
    this.rxs = {
      totalRx: this.getRowValueAsNumber(rows[ri]),
      rxPerMonth: this.getRowValueAsNumber(rows[++ri]),
      rxDaily: this.getRowValueAsNumber(rows[++ri]),
      multiple: this.getRowValueAsNumber(rows[++ri]),
    }
    return ri;
  }

  getLabelAndValue(row: Element) {
    const cells = row.getElementsByTagName('w:tc');
    const rowData: string[] = [];
    // Process each cell in the row
    for (let cellIndex = 0; cellIndex < cells.length; cellIndex++) {
      const cell = cells[cellIndex];
      // Extract text content from paragraphs in the cell
      const paragraphs = cell.getElementsByTagName('w:p');
      let cellText = '';

      for (let p = 0; p < paragraphs.length; p++) {
        const textElements = paragraphs[p].getElementsByTagName('w:t');
        for (let t = 0; t < textElements.length; t++) {
          cellText += textElements[t].textContent || '';
        }
        // Add paragraph break if there are multiple paragraphs
        if (p < paragraphs.length - 1) {
          cellText += '\n';
        }
      }
      rowData.push(cellText);
    }
    return rowData;
  }

  getRowValueAsNumber(row: Element) {
    try {
      const [, value] = this.getLabelAndValue(row);
      if (!value) return 0;

      const cleanedValue = value.replace(/[^\d.-]/g, '');
      const parsedValue = parseFloat(cleanedValue);
      return isNaN(parsedValue) ? 0 : parsedValue;
    } catch (error) {
      console.warn('Error parsing row value:', error);
      return 0;
    }
  }

  getRowValueAsPercent(row: Element) {
    const num = this.getRowValueAsNumber(row);
    return num ? num / 100 : num;
  }

  getPharmacyName(value: string | undefined) {
    return value?.split(/(\w{2}\d{7})/g)[0].trim();
  }

  getReportDate(value: string) {
    const [, date] = value.split(' Calculations ');
    return date;
  }

}
