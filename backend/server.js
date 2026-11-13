const express = require('express');
const cors = require('cors');
const crypto = require('node:crypto');
const QRCode = require('qrcode');
const { Pool } = require('pg');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const isProduction = process.env.NODE_ENV === 'production';
const databaseEnabled = Boolean(process.env.DATABASE_URL || process.env.PGHOST);
if (process.env.IMPORT_FILE_DATA !== undefined && !['true', 'false'].includes(process.env.IMPORT_FILE_DATA)) {
  throw new Error('IMPORT_FILE_DATA must be set to true or false.');
}
const importFileData = process.env.IMPORT_FILE_DATA === 'true';
const databasePool = databaseEnabled ? new Pool({ connectionString: process.env.DATABASE_URL || undefined, max: 10, connectionTimeoutMillis: 5000 }) : null;
if (databasePool) databasePool.on('error', (error) => {
  databaseStateHealthy = false;
  console.error('Shared PostgreSQL connection error:', error.message);
});
if (process.env.COOKIE_SECURE !== undefined && !['true', 'false'].includes(process.env.COOKIE_SECURE)) {
  throw new Error('COOKIE_SECURE must be set to true or false.');
}
const secureCookies = process.env.COOKIE_SECURE === undefined ? isProduction : process.env.COOKIE_SECURE === 'true';
const allowedOrigins = new Set((process.env.FRONTEND_ORIGIN || (isProduction ? '' : 'http://localhost:8080'))
  .split(',').map((origin) => origin.trim()).filter(Boolean));
for (const origin of allowedOrigins) {
  let parsedOrigin;
  try { parsedOrigin = new URL(origin); }
  catch { throw new Error(`FRONTEND_ORIGIN contains an invalid origin: ${origin}`); }
  const localHttp = parsedOrigin.protocol === 'http:' && ['localhost', '127.0.0.1', '::1'].includes(parsedOrigin.hostname);
  if (parsedOrigin.origin !== origin || (isProduction && parsedOrigin.protocol !== 'https:' && !localHttp)) {
    throw new Error('FRONTEND_ORIGIN entries must be bare origins; production origins must use HTTPS except for localhost.');
  }
}
const dataDir = path.resolve(__dirname, process.env.DATA_DIR || '.');
const trustProxyHops = Number(process.env.TRUST_PROXY_HOPS || 0);
if (isProduction && !process.env.DATA_DIR) {
  throw new Error('DATA_DIR must point to persistent storage when NODE_ENV=production.');
}
if (isProduction && !databaseEnabled) {
  throw new Error('DATABASE_URL or PGHOST must configure the shared PostgreSQL database when NODE_ENV=production.');
}
if (isProduction && databaseEnabled && !process.env.BALLOT_KEY) {
  throw new Error('BALLOT_KEY must be set to the same 32-byte key on every production app instance.');
}
if (!Number.isInteger(trustProxyHops) || trustProxyHops < 0 || trustProxyHops > 5) {
  throw new Error('TRUST_PROXY_HOPS must be an integer between 0 and 5.');
}
fs.mkdirSync(dataDir, { recursive: true });
app.disable('x-powered-by');
app.set('trust proxy', trustProxyHops);
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  if (isProduction) {
    res.setHeader('Strict-Transport-Security', 'max-age=15552000');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'");
  }
  next();
});
app.use(cors({
  origin(origin, callback) { callback(null, !origin || allowedOrigins.has(origin)); },
  credentials: true,
}));
app.use('/api', (_req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});
app.use(express.json({ limit: '16kb' }));
if (databaseEnabled) app.use('/api', sharedStateMiddleware);

const sessions = new Map();
const authAttempts = new Map();
const setupAttempts = new Map();
const authResetAttempts = new Map();
const pollCreationAttempts = new Map();
let runtimeStateWritable = true;
const pollTypes = new Set(['housing-society', 'student-council', 'club-association', 'ngo-community', 'local-issue']);
const demoElectionTemplates = Object.freeze({
  parliament: {
    title: 'Practice poll · Fictional Lok Sabha-style seat',
    description: 'A made-up example for exploring the demo. The place and choices are fictional and do not represent an active election, real candidates or political parties.',
    options: ['Sample choice A', 'Sample choice B', 'Sample choice C'],
  },
  assembly: {
    title: 'Practice poll · Fictional Assembly-style seat',
    description: 'A made-up example for exploring the demo. The state, place and choices are fictional and do not represent an active election, real candidates or political parties.',
    options: ['Sample choice A', 'Sample choice B', 'Sample choice C'],
  },
  panchayat: {
    title: 'Practice poll · Fictional Gram Panchayat ward',
    description: 'A made-up village ward for exploring the demo. This is not a State Election Commission poll and does not represent a real candidate or election.',
    options: ['Sample choice A', 'Sample choice B', 'Sample choice C'],
  },
});
const dataFile = path.join(dataDir, 'community-polls.json');
const ballotKeyFile = path.join(dataDir, '.ballot-key');
const accountsFile = path.join(dataDir, 'authenticator-accounts.enc.json');
const runtimeStateFile = path.join(dataDir, 'runtime-state.enc.json');
const instanceLockFile = path.join(dataDir, '.jana-vani.instance.lock');
const ballotKey = process.env.BALLOT_KEY || (() => {
  try { return fs.readFileSync(ballotKeyFile, 'utf8').trim(); }
  catch {
    const key = crypto.randomBytes(32).toString('hex');
    fs.writeFileSync(ballotKeyFile, key, { mode: 0o600, flag: 'wx' });
    return key;
  }
})();
if (!/^[a-f0-9]{64}$/i.test(ballotKey)) throw new Error('BALLOT_KEY must be 32 random bytes encoded as 64 hexadecimal characters.');
const accountEncryptionKey = crypto.createHash('sha256').update('jana-vani/authenticator-account-encryption/v1:').update(ballotKey).digest();
const runtimeEncryptionKey = crypto.createHash('sha256').update('jana-vani/runtime-state-encryption/v1:').update(ballotKey).digest();
const authenticatorAccounts = new Map();
const instanceLockId = crypto.randomBytes(16).toString('hex');
let ownsInstanceLock = false;
let databaseStateHealthy = true;

function encryptEnvelope(key, value) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(JSON.stringify(value), 'utf8'), cipher.final()]);
  return { version: 1, iv: iv.toString('base64'), tag: cipher.getAuthTag().toString('base64'), ciphertext: ciphertext.toString('base64') };
}

function decryptEnvelope(key, encrypted) {
  if (encrypted.version !== 1) throw new Error('Unsupported encrypted data version.');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(encrypted.iv, 'base64'));
  decipher.setAuthTag(Buffer.from(encrypted.tag, 'base64'));
  const plaintext = Buffer.concat([decipher.update(Buffer.from(encrypted.ciphertext, 'base64')), decipher.final()]).toString('utf8');
  return JSON.parse(plaintext);
}

function acquireInstanceLock() {
  const lock = JSON.stringify({ pid: process.pid, host: os.hostname(), startedAt: new Date().toISOString(), instanceId: instanceLockId });
  let descriptor;
  try {
    descriptor = fs.openSync(instanceLockFile, 'wx', 0o600);
    fs.writeFileSync(descriptor, lock);
    fs.fsyncSync(descriptor);
    ownsInstanceLock = true;
  } catch (error) {
    if (descriptor !== undefined) {
      try { fs.closeSync(descriptor); } catch {}
      try { fs.unlinkSync(instanceLockFile); } catch {}
    }
    if (error.code === 'EEXIST') {
      throw new Error(`Another Jana Vani process may already be using DATA_DIR (${instanceLockFile}). Stop it before starting a second instance. If it crashed, confirm it is stopped before removing the stale lock file.`);
    }
    throw error;
  }
  fs.closeSync(descriptor);
}

function releaseInstanceLock() {
  if (!ownsInstanceLock) return;
  try {
    const current = JSON.parse(fs.readFileSync(instanceLockFile, 'utf8'));
    if (current.instanceId === instanceLockId) fs.unlinkSync(instanceLockFile);
  } catch (error) {
    if (error.code !== 'ENOENT') console.error('Could not remove the app instance lock:', error.message);
  } finally {
    ownsInstanceLock = false;
  }
}

const sessionDigest = (token) => crypto.createHash('sha256').update(token).digest('hex');

function saveRuntimeState() {
  if (databaseEnabled) return;
  const state = {
    version: 1,
    sessions: [...sessions],
    authAttempts: [...authAttempts],
    setupAttempts: [...setupAttempts],
    authResetAttempts: [...authResetAttempts],
    pollCreationAttempts: [...pollCreationAttempts],
  };
  const contents = JSON.stringify(encryptEnvelope(runtimeEncryptionKey, state));
  const tempFile = `${runtimeStateFile}.tmp`;
  try {
    fs.writeFileSync(tempFile, contents, { mode: 0o600 });
    fs.renameSync(tempFile, runtimeStateFile);
    runtimeStateWritable = true;
  } catch (error) {
    runtimeStateWritable = false;
    throw error;
  }
}

function restoreRuntimeState(state) {
  if (state.version !== 1) throw new Error('Unsupported runtime state version.');
  for (const map of [sessions, authAttempts, setupAttempts, authResetAttempts, pollCreationAttempts]) map.clear();
  const restoreMap = (target, entries, validate, label) => {
    if (!Array.isArray(entries)) throw new Error(`Invalid ${label} state.`);
    for (const entry of entries) {
      if (!Array.isArray(entry) || entry.length !== 2 || typeof entry[0] !== 'string' || !validate(entry[1])) {
        throw new Error(`Invalid ${label} entry.`);
      }
      target.set(entry[0], entry[1]);
    }
  };
  restoreMap(sessions, state.sessions, (value) => typeof value?.voterId === 'string' && Number.isFinite(value.expiresAt), 'session');
  restoreMap(authAttempts, state.authAttempts, (value) => Number.isInteger(value?.count) && Number.isFinite(value.windowStartedAt) && Number.isFinite(value.blockedUntil), 'sign-in rate limit');
  const validateTimestamps = (value) => Array.isArray(value) && value.every(Number.isFinite);
  restoreMap(setupAttempts, state.setupAttempts, validateTimestamps, 'setup rate limit');
  restoreMap(authResetAttempts, state.authResetAttempts, validateTimestamps, 'reset rate limit');
  restoreMap(pollCreationAttempts, state.pollCreationAttempts, validateTimestamps, 'poll creation rate limit');
}

function loadRuntimeState() {
  try {
    const state = decryptEnvelope(runtimeEncryptionKey, JSON.parse(fs.readFileSync(runtimeStateFile, 'utf8')));
    restoreRuntimeState(state);
  } catch (error) {
    if (error.code !== 'ENOENT') throw new Error(`Could not decrypt runtime state: ${error.message}`);
  }
}

function saveAuthenticatorAccounts() {
  if (databaseEnabled) return;
  const contents = JSON.stringify(encryptEnvelope(accountEncryptionKey, [...authenticatorAccounts]));
  const tempFile = `${accountsFile}.tmp`;
  fs.writeFileSync(tempFile, contents, { mode: 0o600 });
  fs.renameSync(tempFile, accountsFile);
}

function loadAuthenticatorAccounts() {
  try {
    const encrypted = JSON.parse(fs.readFileSync(accountsFile, 'utf8'));
    const accounts = decryptEnvelope(accountEncryptionKey, encrypted);
    if (!Array.isArray(accounts)) throw new Error('Invalid authenticator account store format.');
    restoreAuthenticatorAccounts(accounts);
  } catch (error) {
    if (error.code !== 'ENOENT') throw new Error(`Could not decrypt authenticator account store: ${error.message}`);
  }
}

function restoreAuthenticatorAccounts(accounts) {
  if (!Array.isArray(accounts)) throw new Error('Invalid authenticator account store format.');
  authenticatorAccounts.clear();
  for (const [voterId, account] of accounts) authenticatorAccounts.set(voterId, account);
}

loadAuthenticatorAccounts();
loadRuntimeState();
const maintenanceTimer = setInterval(() => {
  const now = Date.now();
  let changed = false;
  for (const [token, session] of sessions) {
    if (session.expiresAt <= now) {
      sessions.delete(token);
      changed = true;
    }
  }
  for (const [key, attempt] of authAttempts) {
    if (attempt.blockedUntil <= now && attempt.windowStartedAt <= now - 10 * 60 * 1000) {
      authAttempts.delete(key);
      changed = true;
    }
  }
  for (const [ip, timestamps] of setupAttempts) {
    const recent = timestamps.filter((timestamp) => timestamp > now - 10 * 60 * 1000);
    if (recent.length !== timestamps.length) {
      if (recent.length) setupAttempts.set(ip, recent);
      else setupAttempts.delete(ip);
      changed = true;
    }
  }
  for (const [ip, timestamps] of authResetAttempts) {
    const recent = timestamps.filter((timestamp) => timestamp > now - 10 * 60 * 1000);
    if (recent.length !== timestamps.length) {
      if (recent.length) authResetAttempts.set(ip, recent);
      else authResetAttempts.delete(ip);
      changed = true;
    }
  }
  for (const [key, timestamps] of pollCreationAttempts) {
    const recent = timestamps.filter((timestamp) => timestamp > now - 60 * 60 * 1000);
    if (recent.length !== timestamps.length) {
      if (recent.length) pollCreationAttempts.set(key, recent);
      else pollCreationAttempts.delete(key);
      changed = true;
    }
  }
  if (changed) {
    try { saveRuntimeState(); }
    catch (error) { console.error('Could not persist runtime security state:', error.message); }
  }
}, 60 * 1000);
maintenanceTimer.unref();
let pollStore = { elections: [], ballots: [], blocks: [] };
try {
  const loadedPollStore = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  if (!Array.isArray(loadedPollStore.elections) || !Array.isArray(loadedPollStore.ballots) || !Array.isArray(loadedPollStore.blocks)) {
    throw new Error('Invalid poll data format.');
  }
  pollStore = loadedPollStore;
} catch (error) {
  if (error.code !== 'ENOENT') throw new Error(`Could not load community poll data: ${error.message}`);
}

function savePollStore() {
  if (databaseEnabled) return;
  const tempFile = `${dataFile}.tmp`;
  fs.writeFileSync(tempFile, JSON.stringify(pollStore, null, 2), { mode: 0o600 });
  fs.renameSync(tempFile, dataFile);
}

function snapshotSharedState() {
  const runtimeState = {
    version: 1,
    sessions: [...sessions],
    authAttempts: [...authAttempts],
    setupAttempts: [...setupAttempts],
    authResetAttempts: [...authResetAttempts],
    pollCreationAttempts: [...pollCreationAttempts],
  };
  return {
    version: 1,
    pollStore,
    authenticatorAccounts: encryptEnvelope(accountEncryptionKey, [...authenticatorAccounts]),
    runtimeState: encryptEnvelope(runtimeEncryptionKey, runtimeState),
  };
}

function restoreSharedState(state) {
  if (state?.version !== 1 || !state.pollStore
    || !Array.isArray(state.pollStore.elections) || !Array.isArray(state.pollStore.ballots) || !Array.isArray(state.pollStore.blocks)) {
    throw new Error('Shared database contains an invalid Jana Vani state document.');
  }
  pollStore = state.pollStore;
  restoreAuthenticatorAccounts(decryptEnvelope(accountEncryptionKey, state.authenticatorAccounts));
  restoreRuntimeState(decryptEnvelope(runtimeEncryptionKey, state.runtimeState));
}

async function initializeSharedDatabase() {
  await databasePool.query(`CREATE TABLE IF NOT EXISTS jana_vani_state (
    id smallint PRIMARY KEY CHECK (id = 1),
    state jsonb NOT NULL,
    updated_at timestamptz NOT NULL DEFAULT now()
  )`);
  await databasePool.query(`CREATE TABLE IF NOT EXISTS jana_vani_metadata (
    key text PRIMARY KEY,
    value jsonb NOT NULL
  )`);
  const client = await databasePool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock(824263501125::bigint)');
    const marker = await client.query("SELECT value FROM jana_vani_metadata WHERE key = 'state_initialized' FOR UPDATE");
    let result = await client.query('SELECT state FROM jana_vani_state WHERE id = 1 FOR UPDATE');
    if (!result.rows[0]) {
      if (marker.rows[0]) {
        throw new Error('The database state is missing but its initialization marker exists. Restore a PostgreSQL backup before restarting; old local files will not be imported automatically.');
      }
      const hasLocalData = pollStore.elections.length > 0 || pollStore.ballots.length > 0 || pollStore.blocks.length > 0
        || authenticatorAccounts.size > 0 || sessions.size > 0 || authAttempts.size > 0 || setupAttempts.size > 0
        || authResetAttempts.size > 0 || pollCreationAttempts.size > 0;
      if (hasLocalData && !importFileData) {
        throw new Error('Existing file-based Jana Vani data was found. Set IMPORT_FILE_DATA=true for the one-time import, then turn it off after the first successful start.');
      }
      await client.query('INSERT INTO jana_vani_state (id, state) VALUES (1, $1::jsonb)', [JSON.stringify(snapshotSharedState())]);
      result = await client.query('SELECT state FROM jana_vani_state WHERE id = 1 FOR UPDATE');
    }
    if (!result.rows[0]) throw new Error('Shared database state row is missing.');
    if (!marker.rows[0]) {
      await client.query("INSERT INTO jana_vani_metadata (key, value) VALUES ('state_initialized', $1::jsonb)", [JSON.stringify({ version: 1, initializedAt: new Date().toISOString() })]);
    }
    restoreSharedState(result.rows[0].state);
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

async function sharedStateMiddleware(req, res, next) {
  if (req.path.startsWith('/health')) return next();
  let client;
  try {
    client = await databasePool.connect();
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock(824263501125::bigint)');
    const result = await client.query('SELECT state FROM jana_vani_state WHERE id = 1 FOR UPDATE');
    if (!result.rows[0]) throw new Error('Shared database state row is missing.');
    restoreSharedState(result.rows[0].state);
  } catch (error) {
    if (client) {
      await client.query('ROLLBACK').catch(() => {});
      client.release();
    }
    databaseStateHealthy = false;
    return next(error);
  }

  let finalized = false;
  const sendJson = res.json.bind(res);
  res.json = (body) => {
    if (finalized) return res;
    let stateJson;
    try { stateJson = JSON.stringify(snapshotSharedState()); }
    catch (error) {
      finalized = true;
      client.query('ROLLBACK').catch(() => {}).finally(() => client.release());
      databaseStateHealthy = false;
      res.statusCode = 503;
      sendJson({ message: 'The shared poll database could not save this request. Please try again.' });
      console.error('Could not serialize shared app state:', error.message);
      return res;
    }
    finalized = true;
    client.query('UPDATE jana_vani_state SET state = $1::jsonb, updated_at = now() WHERE id = 1', [stateJson])
      .then(() => client.query('COMMIT'))
      .then(() => {
        databaseStateHealthy = true;
        client.release();
        sendJson(body);
      })
      .catch(async (error) => {
        await client.query('ROLLBACK').catch(() => {});
        client.release();
        databaseStateHealthy = false;
        console.error('Could not commit shared app state:', error.message);
        if (!res.headersSent) {
          res.statusCode = 503;
          sendJson({ message: 'The shared poll database could not save this request. Please try again.' });
        } else res.destroy(error);
      });
    return res;
  };

  res.on('close', () => {
    if (finalized) return;
    finalized = true;
    client.query('ROLLBACK').catch(() => {}).finally(() => client.release());
  });
  next();
}

function pollStatus(election) {
  if (election.closed) return 'completed';
  const now = Date.now();
  if (now < new Date(election.startDate).getTime()) return 'upcoming';
  if (now > new Date(election.endDate).getTime()) return 'completed';
  return 'active';
}

function presentElection(election, voterId) {
  return {
    id: election.id,
    title: election.title,
    description: election.description,
    pollType: pollTypes.has(election.pollType) ? election.pollType : 'local-issue',
    isDemoElection: Boolean(election.isDemoElection),
    startDate: election.startDate,
    endDate: election.endDate,
    status: pollStatus(election),
    totalVotes: election.candidates.reduce((sum, option) => sum + (election.tallies[option.id] || 0), 0),
    candidates: election.candidates.map(({ id, name, party, description }) => ({
      id, name, party, description, votes: election.tallies[id] || 0,
    })),
    hasVoted: pollStore.ballots.some((ballot) => ballot.electionId === election.id && ballot.nullifier === voterNullifier(election.id, voterId)),
    canManage: Boolean(voterId && election.createdBy === voterNullifier('organizer', voterId)),
  };
}

const voterNullifier = (electionId, voterId) => crypto.createHmac('sha256', ballotKey)
  .update(`${electionId}:${voterId}`).digest('hex');

function appendCommitment(electionId, commitment) {
  const previousHash = pollStore.blocks.at(-1)?.hash || '0'.repeat(64);
  const block = {
    index: pollStore.blocks.length,
    timestamp: new Date().toISOString(),
    electionId,
    commitment,
    previousHash,
  };
  block.hash = hashCommitmentBlock(block);
  pollStore.blocks.push(block);
  return block;
}

function hashCommitmentBlock(block) {
  const payload = {
    index: block.index,
    timestamp: block.timestamp,
    electionId: block.electionId,
    commitment: block.commitment,
    previousHash: block.previousHash,
  };
  return crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
}

function isHashChainIntact() {
  if (pollStore.blocks.length !== pollStore.ballots.length) return false;
  const ledgerEntries = new Set(pollStore.blocks.map((block) => JSON.stringify([block.electionId, block.commitment])));
  if (ledgerEntries.size !== pollStore.blocks.length) return false;
  if (!pollStore.ballots.every((ballot) => ledgerEntries.has(JSON.stringify([ballot.electionId, ballot.commitment])))) return false;
  return pollStore.blocks.every((item, index, blocks) => {
    const expectedPreviousHash = index === 0 ? '0'.repeat(64) : blocks[index - 1].hash;
    return item.index === index && item.previousHash === expectedPreviousHash
      && hashCommitmentBlock(item) === item.hash;
  });
}
const SESSION_COOKIE = 'jana_vani_session';
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function makeBase32Secret(bytes = crypto.randomBytes(20)) {
  let bits = '';
  for (const byte of bytes) bits += byte.toString(2).padStart(8, '0');
  let secret = '';
  for (let index = 0; index < bits.length; index += 5) {
    secret += BASE32_ALPHABET[parseInt(bits.slice(index, index + 5).padEnd(5, '0'), 2)];
  }
  return secret;
}

function decodeBase32(secret) {
  const normalized = secret.toUpperCase().replace(/=+$/, '');
  let bits = '';
  for (const character of normalized) {
    const value = BASE32_ALPHABET.indexOf(character);
    if (value < 0) throw new Error('Invalid authenticator secret');
    bits += value.toString(2).padStart(5, '0');
  }
  const bytes = [];
  for (let index = 0; index + 8 <= bits.length; index += 8) {
    bytes.push(parseInt(bits.slice(index, index + 8), 2));
  }
  return Buffer.from(bytes);
}

function makeTotp(secret, time = Date.now()) {
  const counter = BigInt(Math.floor(time / 30000));
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigUInt64BE(counter);
  const digest = crypto.createHmac('sha1', decodeBase32(secret)).update(counterBuffer).digest();
  const offset = digest[digest.length - 1] & 0x0f;
  const binary = ((digest[offset] & 0x7f) << 24)
    | ((digest[offset + 1] & 0xff) << 16)
    | ((digest[offset + 2] & 0xff) << 8)
    | (digest[offset + 3] & 0xff);
  return String(binary % 1000000).padStart(6, '0');
}

function matchingTotpStep(secret, code) {
  if (!/^\d{6}$/.test(code)) return null;
  const submitted = Buffer.from(code);
  const currentStep = Math.floor(Date.now() / 30000);
  for (const offset of [-1, 0, 1]) {
    const step = currentStep + offset;
    const expected = Buffer.from(makeTotp(secret, step * 30000));
    if (crypto.timingSafeEqual(submitted, expected)) return step;
  }
  return null;
}

function consumeTotpCode(account, code) {
  const step = matchingTotpStep(account.secret, code);
  if (step === null || step <= (account.lastTotpStep ?? -1)) return false;
  account.lastTotpStep = step;
  return true;
}

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', uptimeSeconds: Math.floor(process.uptime()) });
});

app.get('/api/health/ready', async (_req, res) => {
  try {
    if (databaseEnabled) await databasePool.query('SELECT 1');
    else fs.accessSync(dataDir, fs.constants.R_OK | fs.constants.W_OK);
    if (!databaseStateHealthy) return res.status(503).json({ status: 'not-ready', reason: 'shared-database-unavailable' });
    if (!runtimeStateWritable) return res.status(503).json({ status: 'not-ready', reason: 'runtime-security-state-unavailable' });
    if (!isHashChainIntact()) return res.status(503).json({ status: 'not-ready', reason: 'ledger-integrity-check-failed' });
    return res.json({ status: 'ready' });
  } catch {
    return res.status(503).json({ status: 'not-ready' });
  }
});

function getSession(req) {
  const cookieHeader = req.headers.cookie || '';
  const cookie = cookieHeader.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${SESSION_COOKIE}=`));
  if (!cookie) return null;
  const token = decodeURIComponent(cookie.slice(SESSION_COOKIE.length + 1));
  const tokenHash = sessionDigest(token);
  const session = sessions.get(tokenHash);
  if (!session || session.expiresAt <= Date.now()) {
    if (session) {
      sessions.delete(tokenHash);
      saveRuntimeState();
    }
    return null;
  }
  return session;
}

function createSession(res, voterId) {
  const token = crypto.randomBytes(32).toString('base64url');
  const expiresAt = Date.now() + SESSION_TTL_MS;
  sessions.set(sessionDigest(token), { voterId, expiresAt });
  saveRuntimeState();
  const secure = secureCookies ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=${encodeURIComponent(token)}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${SESSION_TTL_MS / 1000}${secure}`);
}

function limitAuthAttempts(req, res, next) {
  const demoCode = String(req.body?.demoCode || '').trim().toUpperCase();
  const key = `${req.ip}:${demoCode}`;
  const now = Date.now();
  const attempts = authAttempts.get(key);
  if (attempts?.blockedUntil > now) {
    const retryAfter = Math.ceil((attempts.blockedUntil - now) / 1000);
    res.setHeader('Retry-After', String(retryAfter));
    return res.status(429).json({ success: false, message: 'Too many incorrect codes. Wait a few minutes and try again.' });
  }
  req.authAttemptKey = key;
  next();
}

// Demo TOTP enrollment and sign-in. Authenticator secrets are encrypted at rest;
// enrollment is still self-claimed and is not tied to a verified voter registry.
app.post('/api/auth/setup', async (req, res) => {
  try {
    const now = Date.now();
    const recentSetups = (setupAttempts.get(req.ip) || []).filter((timestamp) => timestamp > now - 10 * 60 * 1000);
    if (recentSetups.length >= 10) {
      res.setHeader('Retry-After', '600');
      return res.status(429).json({ success: false, message: 'Too many setup requests. Wait a few minutes and try again.' });
    }
    recentSetups.push(now);
    setupAttempts.set(req.ip, recentSetups);
    saveRuntimeState();

    const voterId = String(req.body?.demoCode || '').trim().toUpperCase();
    if (!/^DEMO[A-Z0-9]{6}$/.test(voterId)) {
      return res.status(400).json({ success: false, message: 'Start the made-up demo code with DEMO and add six characters. Do not use an EPIC or Aadhaar number.' });
    }

    const account = authenticatorAccounts.get(voterId);
    if (account?.enabled) {
      return res.json({ success: true, enrolled: true });
    }

    const secret = account?.secret || makeBase32Secret();
    authenticatorAccounts.set(voterId, { secret, enabled: false });
    saveAuthenticatorAccounts();
    const issuer = encodeURIComponent('Jana Vani');
    // Keep the issuer prefix in the account label identical to the issuer
    // query parameter. Authenticator apps expect this standard otpauth format.
    const label = encodeURIComponent(`Jana Vani:${voterId}`);
    const otpauthUrl = `otpauth://totp/${label}?secret=${secret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`;
    const qrCode = await QRCode.toDataURL(otpauthUrl, { margin: 2, width: 240 });

    return res.json({ success: true, enrolled: false, qrCode, manualKey: secret });
  } catch (err) {
    console.error('Authenticator setup failed:', err);
    return res.status(500).json({ success: false, message: 'We couldn’t set up your authenticator. Please try again.' });
  }
});

// Credential recovery is intentionally available only in the local demo. Demo
// IDs are self-claimed and must never be treated as real voter identities.
app.post('/api/auth/reset', async (req, res) => {
  if (isProduction) return res.status(404).json({ success: false, message: 'Authenticator reset is only available in the local demo.' });
  const voterId = String(req.body?.demoCode || '').trim().toUpperCase();
  if (!/^DEMO[A-Z0-9]{6}$/.test(voterId)) {
    return res.status(400).json({ success: false, message: 'Enter the made-up code for the demo account you want to reset.' });
  }
  const account = authenticatorAccounts.get(voterId);
  if (!account?.enabled) return res.status(409).json({ success: false, message: 'This account hasn’t been set up yet. Start again with this code to get a QR code.' });

  const now = Date.now();
  const recentResets = (authResetAttempts.get(req.ip) || []).filter((timestamp) => timestamp > now - 10 * 60 * 1000);
  if (recentResets.length >= 3) {
    res.setHeader('Retry-After', '600');
    return res.status(429).json({ success: false, message: 'Too many authenticator resets. Wait a few minutes and try again.' });
  }
  authResetAttempts.set(req.ip, [...recentResets, now]);
  saveRuntimeState();

  try {
    const secret = makeBase32Secret();
    authenticatorAccounts.set(voterId, { secret, enabled: false });
    saveAuthenticatorAccounts();
    authAttempts.delete(`${req.ip}:${voterId}`);
    saveRuntimeState();
    const issuer = encodeURIComponent('Jana Vani');
    const label = encodeURIComponent(`Jana Vani:${voterId}`);
    const otpauthUrl = `otpauth://totp/${label}?secret=${secret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`;
    const qrCode = await QRCode.toDataURL(otpauthUrl, { margin: 2, width: 240 });
    return res.json({ success: true, enrolled: false, qrCode, manualKey: secret });
  } catch (err) {
    console.error('Demo authenticator reset failed:', err);
    return res.status(500).json({ success: false, message: 'We couldn’t reset the demo authenticator. Please try again.' });
  }
});

app.post('/api/auth/verify', limitAuthAttempts, (req, res) => {
  const voterId = String(req.body?.demoCode || '').trim().toUpperCase();
  const code = String(req.body?.code || '').trim();
  const account = authenticatorAccounts.get(voterId);

  if (!/^DEMO[A-Z0-9]{6}$/.test(voterId) || !account) {
    recordFailedAttempt(req.authAttemptKey);
    return res.status(400).json({ success: false, message: 'Start authenticator setup with your demo code first.' });
  }
  if (!consumeTotpCode(account, code)) {
    recordFailedAttempt(req.authAttemptKey);
    return res.status(400).json({ success: false, message: 'That code is invalid or expired. Check the current code in your authenticator app.' });
  }

  account.enabled = true;
  authenticatorAccounts.set(voterId, account);
  saveAuthenticatorAccounts();
  authAttempts.delete(req.authAttemptKey);
  createSession(res, voterId);
  return res.json({ success: true, message: 'Authenticator code verified.' });
});

function recordFailedAttempt(key) {
  const now = Date.now();
  const attempts = authAttempts.get(key);
  const count = attempts?.windowStartedAt > now - 10 * 60 * 1000 ? attempts.count + 1 : 1;
  authAttempts.set(key, {
    count,
    windowStartedAt: attempts?.windowStartedAt > now - 10 * 60 * 1000 ? attempts.windowStartedAt : now,
    blockedUntil: count >= 5 ? now + 10 * 60 * 1000 : 0,
  });
  saveRuntimeState();
}

app.get('/api/auth/session', (req, res) => {
  const session = getSession(req);
  res.json({ authenticated: Boolean(session) });
});

app.post('/api/auth/logout', (req, res) => {
  const cookieHeader = req.headers.cookie || '';
  const cookie = cookieHeader.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${SESSION_COOKIE}=`));
  if (cookie) {
    sessions.delete(sessionDigest(decodeURIComponent(cookie.slice(SESSION_COOKIE.length + 1))));
    saveRuntimeState();
  }
  const secure = secureCookies ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${secure}`);
  res.json({ success: true });
});

// Community polls are a local prototype feature. They are not official elections.
app.get('/api/elections', (req, res) => {
  const session = getSession(req);
  res.json({ elections: pollStore.elections.map((election) => presentElection(election, session?.voterId)) });
});

app.post('/api/demo-elections/:template', (req, res) => {
  const session = getSession(req);
  if (!session) return res.status(401).json({ message: 'Sign in with a made-up demo code to start a practice poll.' });
  if (!Object.hasOwn(demoElectionTemplates, req.params.template)) return res.status(404).json({ message: 'We couldn’t find that practice poll.' });
  const template = demoElectionTemplates[req.params.template];

  const creationKey = `${req.ip}:${session.voterId}`;
  const now = Date.now();
  const recentCreations = (pollCreationAttempts.get(creationKey) || []).filter((timestamp) => timestamp > now - 60 * 60 * 1000);
  if (recentCreations.length >= 10) {
    res.setHeader('Retry-After', String(Math.max(1, Math.ceil((recentCreations[0] + 60 * 60 * 1000 - now) / 1000))));
    return res.status(429).json({ message: 'You have started several polls recently. Try again later.' });
  }

  const startDate = new Date(now - 60 * 1000);
  const endDate = new Date(now + 24 * 60 * 60 * 1000);
  const election = {
    id: crypto.randomUUID(),
    title: template.title,
    description: template.description,
    pollType: 'local-issue',
    isDemoElection: true,
    demoTemplate: req.params.template,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    closed: false,
    createdAt: new Date().toISOString(),
    createdBy: voterNullifier('organizer', session.voterId),
    candidates: template.options.map((name) => ({ id: crypto.randomUUID(), name, party: 'Fictional sample choice', description: 'Made up for this practice poll.' })),
    tallies: {},
  };
  pollCreationAttempts.set(creationKey, [...recentCreations, now]);
  saveRuntimeState();
  pollStore.elections.unshift(election);
  savePollStore();
  return res.status(201).json({ election: presentElection(election, session.voterId) });
});

app.get('/api/elections/:id', (req, res) => {
  const election = pollStore.elections.find((item) => item.id === req.params.id);
  if (!election) return res.status(404).json({ message: 'We couldn’t find that community poll.' });
  return res.json({ election: presentElection(election, getSession(req)?.voterId) });
});

app.post('/api/elections', (req, res) => {
  const session = getSession(req);
  if (!session) return res.status(401).json({ message: 'Sign in to create a community poll.' });
  const creationKey = `${req.ip}:${session.voterId}`;
  const now = Date.now();
  const recentCreations = (pollCreationAttempts.get(creationKey) || []).filter((timestamp) => timestamp > now - 60 * 60 * 1000);
  if (recentCreations.length >= 10) {
    res.setHeader('Retry-After', String(Math.max(1, Math.ceil((recentCreations[0] + 60 * 60 * 1000 - now) / 1000))));
    return res.status(429).json({ message: 'You have created several polls recently. Try again later.' });
  }
  const title = String(req.body?.title || '').trim();
  const description = String(req.body?.description || '').trim();
  const pollType = String(req.body?.pollType || 'local-issue');
  const candidatesInput = Array.isArray(req.body?.candidates) ? req.body.candidates : [];
  const startDate = new Date(req.body?.startDate);
  const endDate = new Date(req.body?.endDate);
  const names = candidatesInput.map((candidate) => String(candidate?.name || '').trim()).filter(Boolean);
  if (!pollTypes.has(pollType) || title.length < 3 || title.length > 100 || description.length > 500 || names.length < 2 || names.length > 20
    || names.some((name) => name.length > 80) || Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())
    || endDate <= startDate || endDate <= new Date()) {
    return res.status(400).json({ message: 'Add a title, at least two choices and a closing date in the future.' });
  }
  const election = {
    id: crypto.randomUUID(), title, description, pollType, startDate: startDate.toISOString(), endDate: endDate.toISOString(), closed: false,
    createdAt: new Date().toISOString(), createdBy: voterNullifier('organizer', getSession(req).voterId),
    candidates: names.map((name, index) => ({ id: crypto.randomUUID(), name, party: 'Community option', description: String(candidatesInput[index]?.description || '').trim() })),
    tallies: {},
  };
  pollCreationAttempts.set(creationKey, [...recentCreations, now]);
  saveRuntimeState();
  pollStore.elections.unshift(election);
  savePollStore();
  return res.status(201).json({ election: presentElection(election, session.voterId) });
});

app.post('/api/elections/:id/close', (req, res) => {
  if (!getSession(req)) return res.status(401).json({ message: 'Sign in to close a community poll.' });
  const election = pollStore.elections.find((item) => item.id === req.params.id);
  if (!election) return res.status(404).json({ message: 'We couldn’t find that community poll.' });
  if (election.createdBy !== voterNullifier('organizer', getSession(req).voterId)) return res.status(403).json({ message: 'Only the person who created this poll can close it.' });
  election.closed = true;
  savePollStore();
  return res.json({ election: presentElection(election, getSession(req).voterId) });
});

app.post('/api/votes', (req, res) => {
  if (!isHashChainIntact()) return res.status(503).json({ message: 'The demo ledger integrity check failed. Voting is paused; do not rely on this poll’s results.' });
  const session = getSession(req);
  if (!session) return res.status(401).json({ message: 'Please sign in before responding to this poll.' });
  req.authAttemptKey = `${req.ip}:${session.voterId}`;
  const voteAttempts = authAttempts.get(req.authAttemptKey);
  if (voteAttempts?.blockedUntil > Date.now()) {
    res.setHeader('Retry-After', String(Math.ceil((voteAttempts.blockedUntil - Date.now()) / 1000)));
    return res.status(429).json({ message: 'Too many incorrect codes. Wait a few minutes and try again.' });
  }
  const election = pollStore.elections.find((item) => item.id === req.body?.electionId);
  const option = election?.candidates.find((candidate) => candidate.id === req.body?.candidateId);
  const code = String(req.body?.code || '').trim();
  if (!election || !option) return res.status(404).json({ message: 'We couldn’t find that poll or choice.' });
  if (pollStatus(election) !== 'active') return res.status(409).json({ message: 'This poll isn’t open for responses right now.' });
  const nullifier = voterNullifier(election.id, session.voterId);
  if (pollStore.ballots.some((ballot) => ballot.electionId === election.id && ballot.nullifier === nullifier)) {
    return res.status(409).json({ message: 'You’ve already responded to this poll with this demo account.' });
  }
  const account = authenticatorAccounts.get(session.voterId);
  if (!account?.enabled || !consumeTotpCode(account, code)) {
    recordFailedAttempt(req.authAttemptKey);
    return res.status(400).json({ message: 'Enter the current six-digit Google Authenticator code to confirm your response.' });
  }
  const nonce = crypto.randomBytes(32).toString('hex');
  const commitment = crypto.createHash('sha256').update(`${election.id}|${option.id}|${nonce}`).digest('hex');
  const receiptId = crypto.randomUUID();
  const block = appendCommitment(election.id, commitment);
  // The public ledger stores only a salted commitment. The selected option and nonce stay in this response.
  pollStore.ballots.push({ electionId: election.id, nullifier, commitment, receiptId, createdAt: block.timestamp });
  election.tallies[option.id] = (election.tallies[option.id] || 0) + 1;
  saveAuthenticatorAccounts();
  savePollStore();
  authAttempts.delete(req.authAttemptKey);
  saveRuntimeState();
  return res.status(201).json({ receipt: { receiptId, electionId: election.id, electionTitle: election.title, candidateId: option.id, candidate: option.name, nonce, commitment, blockIndex: block.index, blockHash: block.hash, recordedAt: block.timestamp } });
});

app.get('/api/receipts/:commitment', (req, res) => {
  const ballot = pollStore.ballots.find((item) => item.commitment === req.params.commitment);
  if (!ballot) return res.status(404).json({ verified: false, message: 'We couldn’t find this receipt code in the demo ledger.' });
  const block = pollStore.blocks.find((item) => item.commitment === ballot.commitment);
  if (!block) return res.status(409).json({ verified: false, message: 'This receipt is missing from the demo ledger.' });
  const valid = isHashChainIntact();
  return res.json({ verified: valid, commitment: ballot.commitment, blockIndex: block.index, blockHash: block.hash, message: valid ? 'Receipt code found. The links in the demo ledger check out.' : 'We found a problem with the links in the demo ledger.' });
});

app.get('/api/ledger/export', (_req, res) => {
  if (!isHashChainIntact()) return res.status(503).json({ message: 'The demo ledger integrity check failed. An export is not available.' });
  return res.json({
    format: 'jana-vani-ledger-export',
    version: 1,
    exportedAt: new Date().toISOString(),
    chainHead: pollStore.blocks.at(-1)?.hash || null,
    elections: pollStore.elections.map((election) => ({
      id: election.id,
      title: election.title,
      status: pollStatus(election),
    })),
    blocks: pollStore.blocks,
    limitations: [
      'This export can validate internal hash-chain links but does not prove the server published the complete ledger.',
      'It does not independently verify voter eligibility, ballot secrecy, or the reported tally.',
    ],
  });
});

app.get('/api/elections/:id/results', (req, res) => {
  if (!isHashChainIntact()) return res.status(503).json({ message: 'The demo ledger integrity check failed. These results are not available as verified results.' });
  const election = pollStore.elections.find((item) => item.id === req.params.id);
  if (!election) return res.status(404).json({ message: 'Community poll not found.' });
  if (pollStatus(election) !== 'completed') return res.status(403).json({ message: 'Results are available after this poll closes.' });
  return res.json({ election: presentElection(election, null), ledgerCount: pollStore.blocks.filter((block) => block.electionId === election.id).length, ledgerHead: [...pollStore.blocks].reverse().find((block) => block.electionId === election.id)?.hash || null });
});

app.use('/api', (_req, res) => res.status(404).json({ message: 'API endpoint not found.' }));

const webRoot = path.join(__dirname, '..', 'dist');
const indexFile = path.join(webRoot, 'index.html');
if (isProduction && !fs.existsSync(indexFile)) {
  throw new Error('Production frontend build is missing. Run `npm run build` before starting the server.');
}
if (fs.existsSync(indexFile)) {
  app.use(express.static(webRoot, {
    index: false,
    maxAge: '1h',
    setHeaders(res, filePath) {
      if (path.basename(filePath) === 'index.html') res.setHeader('Cache-Control', 'no-cache');
      else if (filePath.includes(`${path.sep}assets${path.sep}`)) res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    },
  }));
  app.get(/.*/, (req, res, next) => {
    if (!req.accepts('html')) return next();
    return res.sendFile(indexFile);
  });
}

app.use((err, _req, res, _next) => {
  if (err?.type === 'entity.too.large') return res.status(413).json({ message: 'Request body is too large.' });
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ message: 'Request body must be valid JSON.' });
  }
  console.error('Request failed:', err?.message || err);
  return res.status(500).json({ message: 'The server could not complete this request.' });
});

const PORT = Number(process.env.PORT || (isProduction ? 8080 : 4000));
if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) throw new Error('PORT must be a valid TCP port number.');
const HOST = process.env.HOST || '0.0.0.0';
let server;

async function startServer() {
  if (databaseEnabled) await initializeSharedDatabase();
  else acquireInstanceLock();
  process.on('exit', releaseInstanceLock);
  server = app.listen(PORT, HOST, () => {
    console.log(`Jana Vani server listening on ${HOST}:${PORT}${databaseEnabled ? ' with shared PostgreSQL state' : ''}`);
  });
  server.on('error', (error) => {
    releaseInstanceLock();
    console.error('Jana Vani server could not start:', error.message);
    if (databasePool) databasePool.end().catch(() => {});
    process.exitCode = 1;
  });
}

startServer().catch((error) => {
  releaseInstanceLock();
  console.error('Jana Vani could not initialize its shared database:', error.message);
  if (databasePool) databasePool.end().catch(() => {});
  process.exitCode = 1;
});

function shutdown(signal) {
  console.log(`${signal} received; closing server.`);
  if (!server) {
    releaseInstanceLock();
    if (databasePool) databasePool.end().catch(() => {});
    process.exitCode = 0;
    return;
  }
  server.close(async (error) => {
    if (error) {
      console.error('Server shutdown failed:', error);
      process.exitCode = 1;
    } else {
      releaseInstanceLock();
    }
    if (databasePool) await databasePool.end().catch((poolError) => console.error('PostgreSQL pool shutdown failed:', poolError.message));
  });
  setTimeout(() => {
    console.error('Graceful shutdown timed out.');
    process.exit(1);
  }, 10000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
