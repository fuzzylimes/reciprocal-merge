/**
 * Script to help automatically update all of the versions inside of the project files.
 */
import { execSync } from 'child_process';

const newVersion = process.argv[2];
if (!newVersion) {
  console.error('Please provide a version number');
  process.exit(1);
}

// Update version using npm (handles package.json and package-lock.json)
console.log(`Updating npm packages to version ${newVersion}...`);
execSync(`npm version ${newVersion} --no-git-tag-version`);

console.log(`✅ Version updated to ${newVersion}`);
