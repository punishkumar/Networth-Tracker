const asar = require('@electron/asar');
const fs = require('fs');
const path = require('path');

async function pack() {
  const rootDir = path.resolve(__dirname, '..');
  const stagingDir = path.resolve(rootDir, 'dist-staging');
  const targetAsar = path.resolve(rootDir, 'dist-electron', 'win-unpacked', 'resources', 'app.asar');

  // Clean staging dir if exists
  if (fs.existsSync(stagingDir)) {
    fs.rmSync(stagingDir, { recursive: true, force: true });
  }
  fs.mkdirSync(stagingDir, { recursive: true });

  // Copy dist
  fs.cpSync(path.resolve(rootDir, 'dist'), path.resolve(stagingDir, 'dist'), { recursive: true });
  // Copy electron
  fs.cpSync(path.resolve(rootDir, 'electron'), path.resolve(stagingDir, 'electron'), { recursive: true });
  // Copy package.json
  fs.copyFileSync(path.resolve(rootDir, 'package.json'), path.resolve(stagingDir, 'package.json'));

  console.log('Staging files copied. Creating app.asar at:', targetAsar);
  await asar.createPackage(stagingDir, targetAsar);

  // Clean up staging
  fs.rmSync(stagingDir, { recursive: true, force: true });
  console.log('Successfully updated app.asar!');
}

pack().catch(console.error);
