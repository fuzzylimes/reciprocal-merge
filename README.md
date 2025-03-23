# Reciprocal Merge

> This is a WIP

This project has a very specific use case - if you don't know what it is, then it isn't for you.

However, if you're looking for an example of a Tauri + React app that happens to work with xlsx and docx files, feel free to take a look around for inspiration.

## Overview
This is an extension of the [excelTemplateMerger](https://github.com/fuzzylimes/excelTemplateMerger) project I created in 2024. That project was a generic template app that could be used for any use case, and will remain that way. It was created to solve a problem that my wife was having with her workflow at work, and since then, we've discovered some additional updates are needed. The intention of this project is to handle her specific work flows, rather than attempting to stay generic.

### Features
The tool has the following feature set:

#### Template Generation (Under Development)
Merging to a template is only useful if you have input to feed it. Unfortunately for my wife, the inputs have grown to 100's of fields across multiple documents, some requiring manipulation, others just needing values. This feature aims to reduce this days-long process down to an order of seconds.

By providing access to these sources, the app will do it's best to construct a valid input file that can then be fed into the Doc Merge. The process is intentionally split to allow for any additional validation or manual changes that may be needed that cannot be handled by this tool (i.e. knowledge that I don't have).

#### Doc Merge
This is the same functionality as [excelTemplateMerger](https://github.com/fuzzylimes/excelTemplateMerger): give an input excel file and a template file, get a merged output.

### Commands
- Front end, dev mode - `npm run dev`
- Full app, dev mode - `npm run tauri dev`

### Dev Notes
- Handling all data manipulation in front end for now (don't feel like learning new libraries/Rust to get basic features working, can revisit later)
- 

### Setup Notes
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
