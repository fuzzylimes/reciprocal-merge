import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';
import { parsePrescriberResponse } from './parser';

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.DOMParser = dom.window.DOMParser;
global.Document = dom.window.Document;

// Function to test the parser with a given HTML file
function testParser(filePath: string) {
  try {
    console.log(`Reading HTML file: ${filePath}`);
    // Read the HTML file
    const htmlContent = fs.readFileSync(path.resolve(filePath), 'utf8');

    console.log('Parsing HTML content...');
    // Parse the HTML using your function
    const result = parsePrescriberResponse(htmlContent);

    // Output the result
    console.log('\nParsing Result:');
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error during parsing:', error);
  }
}

// Get file path from command line argument or use default
const filePath = process.argv[2];

if (!filePath) {
  console.error('Please provide a path to an HTML file. Usage: ts-node test-parser.ts ./path/to/html/file.html');
  process.exit(1);
}

testParser(filePath);
