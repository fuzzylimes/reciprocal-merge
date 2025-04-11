import { WorkBook } from "xlsx";
import { ReportSheets } from "../ReportFile";
import { BaseReportHandler } from "./BaseHandler";
import { toPercent } from "../../../utils/format";

// Interface for strongly-typed summary data
interface SummaryValues {
  dea: string;
  startDate: string;
  endDate: string;
  dateRange: string;
  addressLine1: string;
  addressLine2: string;
  address: string;
  cashNonCs: number;
  cashCs: number;
  cashOver20: Over20[];
}

interface Over20 {
  drug: string;
  percent: number;
}

/**
 * Handler for all data from the Summary sheet
 */
export class SummaryHandler extends BaseReportHandler {
  private _summaryCalculated = false;
  private _over20Calculated = false;
  private _summaryValues: Partial<SummaryValues> = {};

  constructor(_workbook: WorkBook) {
    super(_workbook, ReportSheets.summary);
  }

  // Calculate all summary values at once when first needed
  private calculateSummaryValues(): void {
    if (this._summaryCalculated) return;

    // Extract DEA number
    const deaRaw = this.getCellValue('A3') || '';
    this._summaryValues.dea = deaRaw.split('#: ')[1]?.trim() || '';

    // Extract date range
    const dateRegex = /Data Range: (\d{4}-\d{2}-\d{2}) thru (\d{4}-\d{2}-\d{2})/;
    const dateRaw = this.getCellValue('A1') || '';
    const dateMatch = dateRaw.match(dateRegex);

    if (dateMatch) {
      const startDate = new Date(dateMatch[1]);
      const endDate = new Date(dateMatch[2]);

      this._summaryValues.startDate = startDate.toLocaleString('en-US', { month: 'short', year: 'numeric' });
      this._summaryValues.endDate = endDate.toLocaleString('en-US', { month: 'short', year: 'numeric' });
      this._summaryValues.dateRange = `${this._summaryValues.startDate} - ${this._summaryValues.endDate}`;
    }

    // Extract address
    const rawAddress = this.getCellValue('A8') || '';
    let rawCityStateZip = this.getCellValue('A9') || '';

    if (rawAddress) {
      const split = rawAddress.split('#1:');
      this._summaryValues.addressLine1 = split[1] ? split[1].trim() : '';
    }

    // Handle possible second address line
    if (rawCityStateZip && !rawCityStateZip.toLowerCase().includes('zip:')) {
      this._summaryValues.addressLine1 += ` ${rawCityStateZip}`;
      rawCityStateZip = this.getCellValue('A10') || '';
    }

    if (rawCityStateZip) {
      const split = rawCityStateZip.split(':');
      this._summaryValues.addressLine2 = split[1] ? split[1].trim() : '';
    }

    this._summaryValues.address = `${this._summaryValues.addressLine1}\n${this._summaryValues.addressLine2}`;

    // Extract cash percentages
    this._summaryValues.cashNonCs = this.getCellPercent('C15');
    this._summaryValues.cashCs = this.getCellPercent('C14');

    this._summaryCalculated = true;
  }

  private calculateCashOver20(): void {
    if (this._over20Calculated) return;

    const res: Over20[] = [];
    if (this._summaryValues.cashCs && this._summaryValues.cashCs >= .2) {
      for (let i = 16; i <= 28; i++) {
        const v = this.getCellPercent(`C${i}`);
        if (v && v < .2) continue;

        const rawLabel = this.getCellValue(`A${i}`) ?? '';
        const label = rawLabel.replace('$ Pay ', '').replace('Rx', '');
        res.push({ drug: label, percent: toPercent(v) });
      }

    }
    this._summaryValues.cashOver20 = res;
    this._over20Calculated = true;
  }

  // Public getters for summary properties
  get dea(): string {
    this.calculateSummaryValues();
    return this._summaryValues.dea || '';
  }

  get dateRange(): string {
    this.calculateSummaryValues();
    return this._summaryValues.dateRange || '';
  }

  get startDate(): string {
    this.calculateSummaryValues();
    return this._summaryValues.startDate || '';
  }

  get endDate(): string {
    this.calculateSummaryValues();
    return this._summaryValues.endDate || '';
  }

  get address(): string {
    this.calculateSummaryValues();
    return this._summaryValues.address || '';
  }

  get cashNonCs(): number {
    this.calculateSummaryValues();
    return this._summaryValues.cashNonCs || 0;
  }

  get cashCs(): number {
    this.calculateSummaryValues();
    return this._summaryValues.cashCs || 0;
  }

  get cashOver20(): Over20[] {
    this.calculateCashOver20()
    return this._summaryValues.cashOver20 || [];
  }
}
