import PizZip from 'pizzip';

/**
 * Get the xml from a docx word file
 * @param content loaded file content
 * @returns loaded xlm Document
 */
export const GetDocContent = (content: Uint8Array) => {
  // Unzip the docx file
  const zip = new PizZip(content);

  // Get the main document content
  const contentXml = zip.files['word/document.xml']?.asText();
  if (!contentXml) {
    throw new Error('Could not find word/document.xml in the docx file');
  }

  // Create a DOM parser to parse the XML
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(contentXml, 'text/xml');

  return xmlDoc;
}
