const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

function fail(message) {
  console.error(`Ledger check failed: ${message}`);
  process.exitCode = 1;
}

function hashBlock(block) {
  const payload = {
    index: block.index,
    timestamp: block.timestamp,
    electionId: block.electionId,
    commitment: block.commitment,
    previousHash: block.previousHash,
  };
  return crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
}

function main() {
  const input = process.argv[2];
  if (!input) throw new Error('Usage: npm run verify:ledger -- <ledger-export.json>');
  const exportPath = path.resolve(input);
  const ledger = JSON.parse(fs.readFileSync(exportPath, 'utf8'));
  if (ledger.format !== 'jana-vani-ledger-export' || ledger.version !== 1
    || !Array.isArray(ledger.elections) || !Array.isArray(ledger.blocks)) {
    throw new Error('Unsupported or malformed Jana Vani ledger export.');
  }

  const electionIds = new Set(ledger.elections.map((election) => election.id));
  if (electionIds.size !== ledger.elections.length || [...electionIds].some((id) => typeof id !== 'string')) {
    throw new Error('Election list contains missing or duplicate identifiers.');
  }
  const commitments = new Set();
  let previousHash = '0'.repeat(64);
  for (let index = 0; index < ledger.blocks.length; index += 1) {
    const block = ledger.blocks[index];
    if (block.index !== index) throw new Error(`Block index ${index} is missing or out of order.`);
    if (!electionIds.has(block.electionId)) throw new Error(`Block ${index} refers to an unknown poll.`);
    if (!/^[a-f0-9]{64}$/i.test(block.commitment || '') || commitments.has(block.commitment)) {
      throw new Error(`Block ${index} has an invalid or repeated commitment.`);
    }
    if (block.previousHash !== previousHash) throw new Error(`Block ${index} does not link to the preceding block.`);
    if (!/^[a-f0-9]{64}$/i.test(block.hash || '') || hashBlock(block) !== block.hash) {
      throw new Error(`Block ${index} hash does not match its contents.`);
    }
    commitments.add(block.commitment);
    previousHash = block.hash;
  }

  const expectedHead = ledger.blocks.at(-1)?.hash || null;
  if (ledger.chainHead !== expectedHead) throw new Error('Exported chain head does not match the last block.');
  console.log(`Ledger links verified: ${ledger.blocks.length} blocks across ${ledger.elections.length} polls.`);
  console.log(`Chain head: ${expectedHead || 'no ballots recorded'}`);
  console.log(`Export: ${exportPath}`);
  console.log('This verifies only the included export’s internal links; it does not verify the tally or prove the export is complete.');
}

try { main(); }
catch (error) {
  fail(error.message);
}
