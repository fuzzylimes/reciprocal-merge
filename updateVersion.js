/**
 * Script to help automatically update all of the versions inside of the project files.
 */
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Get the equivalent of __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const newVersion = process.argv[2];
if (!newVersion) {
  console.error('Please provide a version number');
  process.exit(1);
}

// Get the package name from Cargo.toml for later use
const cargoPath = join(__dirname, 'src-tauri', 'Cargo.toml');
const cargoToml = readFileSync(cargoPath, 'utf8');
const packageNameMatch = cargoToml.match(/name\s*=\s*"([^"]+)"/);
const packageName = packageNameMatch ? packageNameMatch[1] : null;

// Update version using npm (handles package.json and package-lock.json)
console.log(`Updating npm packages to version ${newVersion}...`);
execSync(`npm version ${newVersion} --no-git-tag-version`);

// Update Cargo.toml
console.log(`Updating Cargo.toml to version ${newVersion}...`);
let updatedCargoToml = cargoToml.replace(/version\s*=\s*"[^"]+"/, `version = "${newVersion}"`);
writeFileSync(cargoPath, updatedCargoToml);

// Update tauri.conf.json
console.log(`Updating tauri.conf.json to version ${newVersion}...`);
const tauriConfigPath = join(__dirname, 'src-tauri', 'tauri.conf.json');
const tauriConfigData = readFileSync(tauriConfigPath, 'utf8');
const tauriConfig = JSON.parse(tauriConfigData);
tauriConfig.version = newVersion;
writeFileSync(tauriConfigPath, JSON.stringify(tauriConfig, null, 2) + '\n');

// Update Cargo.lock
if (packageName) {
  console.log(`Updating Cargo.lock...`);
  try {
    execSync(`cd src-tauri && cargo update -p ${packageName}`);
  } catch (error) {
    console.warn(`Warning: Failed to update Cargo.lock: ${error.message}`);
    console.warn('You may need to run "cd src-tauri && cargo update -p <package-name>" manually');
  }
}

console.log(`✅ Version updated to ${newVersion} in all files`);
