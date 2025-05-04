# Reciprocal Merge

This project has a very specific use case - if you don't know what it is, then it isn't intended for you.

However, if you're looking for an example of a Tauri + React app that happens to work with xlsx and docx files, feel free to take a look around for inspiration.

## Overview
This is an extension of the [excelTemplateMerger](https://github.com/fuzzylimes/excelTemplateMerger) project I created in 2024. That project is a generic word doc template engine which can pull from a supplied excel input file. Essentially a more user friendly abstraction to the base `docxtemplater` library. It was created to solve a problem that my wife was having with a workflow at work, and since then, we've discovered additional areas where automation can be beneficial.

The intention of this project is to tackle those specific areas. In other words, this project is highly specialized and will be of use to no one else.

### Is it actually useful?
For the person that uses it, absolutely. I asked her about how much time this is saving her, and it's in the ballpark of 20-25 hours per report she has to do, times however many that is a month. Assuming 4 per month, that's a tim savings of 80-100 hours. Nearly 2 full work weeks.

### Features
The tool has the following feature set:

#### Template Generation
This feature automates the building of the input file that is then fed into Doc Merge. This is an incredibly tedious process that is prone to errors and a complex set of rules and calculations. A large percentage of time is spent building out these template files by hand, much of which can be simplified.

The initial release of this tool will automate roughly 90% of the construction of this input file, while the remaining pieces will require manual intervention. Source files are fed into the tool which then handles all of the required calculations and filtering to build out the input values.

#### Doc Merge
This is the same functionality as [excelTemplateMerger](https://github.com/fuzzylimes/excelTemplateMerger): give an input excel file and a template file, get a merged output.

### Commands
- Web app, dev mode - `npm run dev`
- Full app, dev mode - `npm run tauri dev`

---
## Stuff for me
### Dev Notes
- Handling all data manipulation in front end for now (don't feel like learning new libraries/Rust to get basic features working, can revisit later)
- While the original intention was to provide this as a binary that could be installed, it has been updated to support both a Tauri build as well as a standalone webapp build. The webapp is currently deployed to github pages for simplicity.
- Both versions of the app run completely offline. There is no network connectivity needed. All processing happens locally on device (either in the app or browser).

### Tauri Setup Notes
1. Bootstrap new Tauri app using `npm create tauri-app@latest reciprocal-merge -- --template react-ts` command
2. Add additional tauri "[plugins](https://v2.tauri.app/plugin/)"
    1. `npm run tauri add dialog`
    2. `npm run tauri add fs`
3. Add eslint + typescript-eslint
    1. `npm install --save-dev eslint @eslint/js typescript-eslint `
    2. Create `eslint.config.js` file per [docs](https://typescript-eslint.io/getting-started).
4. Install MUI for component library
    1. `npm install @mui/material @emotion/react @emotion/styled @mui/icons-material`
5. Install Office libraries for file manipulation
    1. `npm install docxtemplater angular-expressions pizzip https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz`
