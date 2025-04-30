export interface PrescriberDetails {
  NameRaw: string;
  FirstFacility: string;
  Middle?: string;
  Last?: string;
  Suffix?: string;
  Designation?: string;
  SlnSpecialty: string;
  BestSpecialty?: string;
  SlnPracticeLocation?: string;
  DeaPracticeLocation?: string;
  Address: string;
  CityStateZip: string;
  AddressGeo: {
    Lat: number;
    Long: number;
  }
  DEA: string;
  State?: string;
  LicenseStatus?: string;
  LicenseExpires?: string;
  Discipline?: string;
}

export type PractitionerRecord = {
  'First/Facility': string;
  Middle?: string;
  Last?: string;
  Suffix?: string;
  Designation?: string;
  Specialty: string;
  PracticeLocation: string;
  DEA: string;
  State?: string;
  Discipline?: string;
  'PC Note - Pharm'?: string;
  'PC Notes Date'?: string;
  Placeholder: string;
};
