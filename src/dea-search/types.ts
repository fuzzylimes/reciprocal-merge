export interface PrescriberDetails {
  NameRaw: string;
  FirstFacility: string;
  Middle?: string;
  Last?: string;
  Suffix?: string;
  Designation?: string;
  SlnSpecialty: string;
  BestSpecialty?: string;
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

