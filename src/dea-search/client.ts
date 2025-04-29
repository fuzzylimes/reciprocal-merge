import { parsePrescriberResponse } from "./parser";
import { PrescriberDetails } from "./types";
import testHtml from './SampleResponse.html?raw';

const URL = 'https://www.medproid.com/WebID.asp?action=DeaQuery&advquery=inline&Database=Practitioner&resetQS=N';

export class Client {
  private _cookie: string;
  private _testing: boolean;

  constructor(cookie: string, testing: boolean = false) {
    this._cookie = cookie;
    this._testing = testing;
  }

  async getDeaHtml(dea: string) {
    if (this._testing) {
      console.info('Running in Test mode');
      return testHtml;
    }

    const payload = this.queryPayload(dea);
    const response = await fetch(URL, payload);
    console.log(response.status, response.statusText);
    return await response.text();
  }

  parseHtml(html: string): PrescriberDetails {
    return parsePrescriberResponse(html);
  }

  private queryPayload(dea: string) {
    return {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'Cookie': this._cookie
      },
      body: `helpmode=off&Database=Practitioner&quickSearch=&postHsiId=&postSourceId=&postSourceType=&singleSearch=&postSearchKey=&sUniverseSource=HCP-SLN&license=${dea}&licdea_criteria=EM&last_name=&lastname_criteria=SW&first_name=&firstname_criteria=SW&middle_name=&middlename_criteria=SW&selState=States&hdnState=States&hdnSelBac=&hdnProfDesigAma=&hdnSelTaxonomyDescr=&hdnSelProfDesig=&hdnSelBestStatus=&sActiveLicense=&street_address=&street_address_criteria=SW&city=&city_criteria=SW&sAddressState=&license_zip=&hdnSelSanctionSource=&medproid=&medpromasterid=&hospital_name=&hospital_name_criteria=SW&group_practice=&group_practice_criteria=SW&customerid=&selSearchType=&SearchText2=&sSpecialty=&txtExpiresAfter=&sSamp=&sCertType=&sPrimSecSpecialty=&sTaxonomyCodeDescr=&sTaxonomyCode=&sSubset=&sRecordType=&sClassOfTradeDescr=&sClassOfTradeCode=&advsearch=inline&txtDetailCopy=`
    }
  }

}
