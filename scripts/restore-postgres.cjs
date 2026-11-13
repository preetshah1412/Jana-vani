const { spawn } = require('node:child_process');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

function runDocker(args, inputFile, output = 'inherit') {
  return new Promise((resolve, reject) => {
    const child = spawn('docker', args, { stdio: [inputFile ? 'pipe' : 'ignore', output, 'inherit'] });
    let settled = false;
    const fail = (error) => {
      if (settled) return;
      settled = true;
      child.kill();
      reject(error);
    };
    child.once('error', fail);
    child.once('close', (code) => {
      if (settled) return;
      settled = true;
      if (code === 0) resolve();
      else reject(new Error(`docker compose command exited with code ${code}.`));
    });
    if (inputFile) {
      const input = fs.createReadStream(inputFile);
      input.once('error', fail);
      child.stdin.once('error', (error) => {
        if (error.code !== 'EPIPE') fail(error);
      });
      input.pipe(child.stdin);
    }
  });
}

async function digestFile(filePath) {
  const hash = crypto.createHash('sha256');
  let bytes = 0;
  for await (const chunk of fs.createReadStream(filePath)) {
    bytes += chunk.length;
    hash.update(chunk);
  }
  return { bytes, sha256: hash.digest('hex') };
}

async function main() {
  const inputFile = process.argv[2];
  if (!inputFile) throw new Error('Usage: npm run restore:database -- <verified-dump-file>');
  const resolvedFile = path.resolve(inputFile);
  const manifest = JSON.parse(fs.readFileSync(`${resolvedFile}.manifest.json`, 'utf8'));
  if (manifest.format !== 'jana-vani-postgres-backup' || manifest.version !== 1 || manifest.file !== path.basename(resolvedFile)) {
    throw new Error('The dump does not have a matching Jana Vani backup manifest.');
  }
  const digest = await digestFile(resolvedFile);
  if (digest.bytes !== manifest.bytes || digest.sha256 !== manifest.sha256) {
    throw new Error('Backup checksum verification failed; the dump was not restored.');
  }

  await runDocker(['compose', 'exec', '-T', 'database', 'pg_restore', '--list'], resolvedFile, 'ignore');
  const databaseName = `jana_vani_restore_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
  await runDocker([
    'compose', 'exec', '-T', 'database', 'sh', '-c',
    'createdb -U "$POSTGRES_USER" "$1"', 'jana-vani-restore', databaseName,
  ]);

  try {
    await runDocker([
      'compose', 'exec', '-T', 'database', 'sh', '-c',
      'pg_restore --exit-on-error --no-owner --no-privileges -U "$POSTGRES_USER" -d "$1"', 'jana-vani-restore', databaseName,
    ], resolvedFile);
  } catch (error) {
    try {
      await runDocker([
        'compose', 'exec', '-T', 'database', 'sh', '-c',
        'dropdb -U "$POSTGRES_USER" "$1"', 'jana-vani-restore', databaseName,
      ]);
    } catch (cleanupError) {
      console.error(`Could not remove the incomplete restore database ${databaseName}: ${cleanupError.message}`);
    }
    throw error;
  }

  console.log(`Backup restored into a separate database: ${databaseName}`);
  console.log('The active database was not changed. Review the restored data, then set POSTGRES_DB to this name and restart the app when ready.');
  console.log('Keep the same BALLOT_KEY used when the backup was created.');
}

main().catch((error) => {
  console.error(`Database restore failed: ${error.message}`);
  process.exitCode = 1;
});
