const { spawn } = require('node:child_process');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

async function main() {
  const [action, argument] = process.argv.slice(2);
  if (action === 'verify' && argument) return verifyBackup(argument);
  if (action !== 'create' || !argument) throw new Error('Usage: npm run backup:database -- create <backup-folder>\n   or: npm run backup:database -- verify <dump-file>');
  const destinationRoot = argument;
  const backupRoot = path.resolve(destinationRoot);
  fs.mkdirSync(backupRoot, { recursive: true, mode: 0o700 });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputFile = path.join(backupRoot, `jana-vani-postgres-${stamp}-${crypto.randomBytes(3).toString('hex')}.dump`);
  const partialFile = `${outputFile}.partial`;
  const output = fs.createWriteStream(partialFile, { flags: 'wx', mode: 0o600 });
  const hash = crypto.createHash('sha256');
  const processHandle = spawn('docker', [
    'compose', 'exec', '-T', 'database', 'sh', '-c',
    'pg_dump --format=custom -U "$POSTGRES_USER" -d "$POSTGRES_DB"',
  ], { stdio: ['ignore', 'pipe', 'inherit'] });
  processHandle.stdout.on('data', (chunk) => hash.update(chunk));
  processHandle.stdout.pipe(output);

  const processDone = new Promise((resolve, reject) => {
    processHandle.once('error', reject);
    processHandle.once('close', resolve);
  });
  const outputDone = new Promise((resolve, reject) => {
    output.once('error', reject);
    output.once('finish', resolve);
  });
  const [code] = await Promise.all([processDone, outputDone]);
  if (code !== 0) throw new Error(`docker compose pg_dump exited with code ${code}. The partial file was kept at ${partialFile}.`);
  fs.renameSync(partialFile, outputFile);
  const manifest = {
    format: 'jana-vani-postgres-backup',
    version: 1,
    createdAt: new Date().toISOString(),
    file: path.basename(outputFile),
    bytes: fs.statSync(outputFile).size,
    sha256: hash.digest('hex'),
  };
  fs.writeFileSync(`${outputFile}.manifest.json`, `${JSON.stringify(manifest, null, 2)}\n`, { mode: 0o600, flag: 'wx' });
  console.log(`PostgreSQL backup created: ${outputFile}`);
  console.log(`SHA-256: ${manifest.sha256}`);
  console.log('Keep the same BALLOT_KEY separately in a protected secret store; the database backup does not contain it.');
}

async function verifyBackup(fileArgument) {
  const filePath = path.resolve(fileArgument);
  const manifest = JSON.parse(fs.readFileSync(`${filePath}.manifest.json`, 'utf8'));
  if (manifest.format !== 'jana-vani-postgres-backup' || manifest.version !== 1 || manifest.file !== path.basename(filePath)) {
    throw new Error('The dump does not have a matching Jana Vani backup manifest.');
  }
  const hash = crypto.createHash('sha256');
  let bytes = 0;
  for await (const chunk of fs.createReadStream(filePath)) {
    bytes += chunk.length;
    hash.update(chunk);
  }
  const actualHash = hash.digest('hex');
  if (bytes !== manifest.bytes || actualHash !== manifest.sha256) throw new Error('Database backup checksum verification failed.');
  console.log(`PostgreSQL backup verified: ${filePath}`);
  console.log(`SHA-256: ${actualHash}`);
}

main().catch((error) => {
  console.error(`Database backup failed: ${error.message}`);
  process.exitCode = 1;
});
