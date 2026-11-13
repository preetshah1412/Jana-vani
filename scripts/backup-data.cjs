const crypto = require('node:crypto');
const fsConstants = require('node:fs').constants;
const fs = require('node:fs/promises');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const backendRoot = path.join(root, 'backend');

function isWithin(parent, child) {
  const relative = path.relative(parent, child);
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
}

async function listDataFiles(directory) {
  const files = [];
  for (const name of ['.ballot-key', 'authenticator-accounts.enc.json', 'community-polls.json', 'runtime-state.enc.json']) {
    try {
      const stat = await fs.lstat(path.join(directory, name));
      if (stat.isSymbolicLink() || !stat.isFile()) throw new Error(`Backup refuses unsupported data file: ${name}`);
      files.push(name);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
  return files;
}

async function digestFile(filePath) {
  const contents = await fs.readFile(filePath);
  return { bytes: contents.length, sha256: crypto.createHash('sha256').update(contents).digest('hex') };
}

async function createBackup(destinationRoot, sourceArgument) {
  if (process.env.DATABASE_URL || process.env.PGHOST) {
    throw new Error('This command backs up file-based local data only. Use `npm run backup:database` for PostgreSQL deployments.');
  }
  const source = path.resolve(sourceArgument || backendRoot, sourceArgument ? '' : (process.env.DATA_DIR || '.'));
  const destination = path.resolve(destinationRoot);
  if (isWithin(source, destination) || isWithin(destination, source)) {
    throw new Error('Choose a backup destination outside the data directory and its parent folders.');
  }
  const sourceStat = await fs.stat(source);
  if (!sourceStat.isDirectory()) throw new Error('The data source must be a directory.');
  await fs.mkdir(destination, { recursive: true, mode: 0o700 });

  const files = await listDataFiles(source);
  if (!files.includes('.ballot-key')) throw new Error('The data directory has no .ballot-key. Start the app once or choose the correct DATA_DIR.');
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const finalPath = path.join(destination, `jana-vani-backup-${stamp}-${crypto.randomBytes(3).toString('hex')}`);
  const temporaryPath = await fs.mkdtemp(path.join(destination, '.jana-vani-backup-'));

  const manifestFiles = [];
  for (const relativePath of files) {
    const sourcePath = path.join(source, relativePath);
    const backupPath = path.join(temporaryPath, relativePath);
    await fs.mkdir(path.dirname(backupPath), { recursive: true, mode: 0o700 });
    await fs.copyFile(sourcePath, backupPath, fsConstants.COPYFILE_EXCL);
    await fs.chmod(backupPath, 0o600);
    manifestFiles.push({ path: relativePath.split(path.sep).join('/'), ...await digestFile(backupPath) });
  }

  const manifest = {
    format: 'jana-vani-data-backup',
    version: 1,
    createdAt: new Date().toISOString(),
    files: manifestFiles,
  };
  const manifestPath = path.join(temporaryPath, 'backup-manifest.json');
  await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, { mode: 0o600, flag: 'wx' });
  await fs.rename(temporaryPath, finalPath);
  console.log(`Backup created: ${finalPath}`);
  console.log(`Files copied: ${manifestFiles.length}. Keep this folder private; it contains the ballot key.`);
}

async function verifyBackup(backupArgument) {
  const backupPath = path.resolve(backupArgument);
  const manifestPath = path.join(backupPath, 'backup-manifest.json');
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  if (manifest.format !== 'jana-vani-data-backup' || manifest.version !== 1 || !Array.isArray(manifest.files)) {
    throw new Error('This folder does not contain a supported Jana Vani backup manifest.');
  }
  if (!manifest.files.some((file) => file.path === '.ballot-key')) throw new Error('Backup is missing the ballot key.');

  for (const file of manifest.files) {
    if (typeof file.path !== 'string' || path.isAbsolute(file.path) || file.path.split(/[\\/]/).includes('..')) {
      throw new Error('Backup manifest contains an unsafe file path.');
    }
    const resolvedPath = path.resolve(backupPath, file.path);
    if (!isWithin(backupPath, resolvedPath) || resolvedPath === manifestPath) throw new Error('Backup manifest contains an unsafe file path.');
    const stat = await fs.lstat(resolvedPath);
    if (!stat.isFile() || stat.isSymbolicLink()) throw new Error(`Backup file is missing or not a regular file: ${file.path}`);
    const actual = await digestFile(resolvedPath);
    if (actual.bytes !== file.bytes || actual.sha256 !== file.sha256) throw new Error(`Backup checksum failed: ${file.path}`);
  }
  console.log(`Backup verified: ${backupPath}`);
  console.log(`Files checked: ${manifest.files.length}.`);
}

async function main() {
  const [action, firstArgument, secondArgument] = process.argv.slice(2);
  if (action === 'create' && firstArgument) return createBackup(firstArgument, secondArgument);
  if (action === 'verify' && firstArgument) return verifyBackup(firstArgument);
  throw new Error('Usage: node scripts/backup-data.cjs create <backup-folder> [data-folder]\n   or: node scripts/backup-data.cjs verify <backup-folder-created-by-this-tool>');
}

main().catch((error) => {
  console.error(`Backup operation failed: ${error.message}`);
  process.exitCode = 1;
});
