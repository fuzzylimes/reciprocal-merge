import { PrescriberDetails } from "./types"

export const parsePrescriberResponse = (html: string): PrescriberDetails => {
  const prescriber: Partial<PrescriberDetails> = {};

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  parseSlnTable(doc, prescriber);
  parseDeaTable(doc, prescriber);
  parseBestTable(doc, prescriber);
  parseName(prescriber);

  return prescriber as PrescriberDetails;
}

const parseSlnTable = (doc: Document, details: Partial<PrescriberDetails>) => {
  const slnItems = doc.querySelectorAll('#SlnDetailTable .HdLeftWebId');

  if (!slnItems || !slnItems.length) {
    return;
  }

  // step through each of the found items and fill out what we can
  for (const slnItem of slnItems) {
    const label = slnItem.textContent?.split(':')?.[0]?.trim()

    switch (label) {
      case 'Name':
        details.NameRaw = slnItem.nextElementSibling?.textContent?.trim() || '';
        break;

      case 'Address': {
        const nextElement = slnItem.nextElementSibling;
        details.SlnPracticeLocation = nextElement?.querySelector('spSlnAddrLine1')?.textContent?.trim() || '';
        break;
      }

      case 'License Expires':
        details.LicenseExpires = slnItem.nextElementSibling?.textContent?.trim() || '';
        break;

      case 'Status':
        details.LicenseStatus = slnItem.nextElementSibling?.textContent?.trim() || '';
        break;

      case '- Certification Code':
        details.Discipline = slnItem.nextElementSibling?.textContent?.trim() || '';
        break;

      case '- Specialty':
        details.SlnSpecialty = slnItem.nextElementSibling?.textContent?.trim() || '';
        break;

      case 'Disciplinary Action':
        details.Discipline = slnItem.nextElementSibling?.textContent?.trim() || '';
        break;

      default:
        break;
    }
  }
}

const parseDeaTable = (doc: Document, details: Partial<PrescriberDetails>) => {
  const deaItems = doc.querySelectorAll('#DispDeaDetail .Detail .HdLeftWebId');

  if (!deaItems || !deaItems.length) {
    return;
  }

  // step through each of the found items and fill out what we can
  for (const deaItem of deaItems) {
    const label = deaItem.textContent?.split(':')?.[0]?.trim()

    switch (label) {
      case 'Address': {
        const nextElement = deaItem.nextElementSibling;
        details.DeaPracticeLocation = nextElement?.querySelector('spDeaAddrLine1')?.textContent?.trim() || '';
        break;
      }

      default:
        break;
    }
  }
}

const parseBestTable = (doc: Document, details: Partial<PrescriberDetails>) => {
  const bestItems = doc.querySelectorAll('#DispBestInfo .Detail .HdLeftWebId');

  if (!bestItems || !bestItems.length) {
    return;
  }

  // step through each of the found items and fill out what we can
  for (const bestItem of bestItems) {
    const label = bestItem.textContent?.split(':')?.[0]?.trim()

    switch (label) {
      case 'Address':
        details.Address = bestItem.nextElementSibling?.textContent?.trim() || '';
        break;

      case 'City/State/Zip':
        details.CityStateZip = bestItem.nextElementSibling?.textContent?.trim() || '';
        break;

      case 'Geocode': {
        const geocodeChildren = bestItem.nextElementSibling?.childNodes || [];
        details.AddressGeo = {
          Lat: Number(geocodeChildren?.[1]?.textContent?.trim() || 0),
          Long: Number(geocodeChildren?.[3]?.textContent?.trim() || 0),
        }
        break;
      }

      case 'Primary': {
        details.BestSpecialty = bestItem.nextElementSibling?.textContent?.trim() || '';
        break;
      }

      default:
        break;
    }
  }
}

/**
 * Parses a name into its component parts
 * @param name Raw name string to parse
 * @param details PrescriberDetails object to populate
 */
const parseName = (details: Partial<PrescriberDetails>) => {
  // Set the raw name
  const name = details.NameRaw!;

  // Check if this is a facility (no designation)
  if (!details.Designation) {
    details.FirstFacility = name;
    return;
  }

  // Clean up name string
  let cleanName = name.trim();

  // Check for known suffixes
  const suffixRegex = /\s+(II|III|IV|V|Jr\.?|Sr\.?)$/i;
  const suffixMatch = cleanName.match(suffixRegex);

  if (suffixMatch) {
    details.Suffix = suffixMatch[1];
    cleanName = cleanName.replace(suffixMatch[0], '').trim();
  }

  // Split the remaining name into parts
  const parts = cleanName.split(/\s+/);

  // Handle name parts based on count
  if (parts.length === 0) {
    return; // Empty name
  } else if (parts.length === 1) {
    // Only one part - assume it's a first name
    details.FirstFacility = parts[0];
  } else {
    // First name is the first part
    details.FirstFacility = parts[0];

    // Last name is the last part
    details.Last = parts[parts.length - 1];

    // Middle name(s) are everything in between
    if (parts.length > 2) {
      details.Middle = parts.slice(1, parts.length - 1).join(' ');
    }
  }
};
