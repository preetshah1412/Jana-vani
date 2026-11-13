# Jana Vani community voting prototype

Jana Vani is an independent local prototype for non-binding polls in housing societies/RWAs, student councils, clubs, associations, NGOs and community groups. It is not an official Indian election platform, is not authorised by the Election Commission of India or any State Election Commission, and is not suitable for public elections, legally binding decisions, real voter identity checks or sensitive votes.

## Run for local development

Install the frontend and backend dependencies, then start both services:

```sh
npm ci
cd backend && npm ci && cd ..
npm run dev:all
```

Open `http://localhost:8080`. The frontend listens on port 8080 and the backend on port 4000. Stop both with Ctrl+C.

## Build and run as a single service

With Node.js 22 installed and dependencies available:

```sh
npm ci
cd backend && npm ci --omit=dev && cd ..
npm run build
```

Set `NODE_ENV=production`, `PORT=8080`, `DATA_DIR`, PostgreSQL connection settings (`DATABASE_URL` or `PGHOST`/`PGPORT`/`PGDATABASE`/`PGUSER`/`PGPASSWORD`), and a `BALLOT_KEY` shared by all app instances, then run `npm start`. The backend serves the built frontend and API from one origin. Put it behind HTTPS before exposing it beyond a trusted local network; production cookies require HTTPS.

## Run with Docker Compose

With Docker installed, copy `.env.example` to `.env`, then set a strong `POSTGRES_PASSWORD` and a 64-character hexadecimal `BALLOT_KEY`. Generate a key with `node -p "require('crypto').randomBytes(32).toString('hex')"`; keep it in a protected secret store and use the same key for every app instance. For an existing file-based deployment, set `BALLOT_KEY` to its current `.ballot-key` value and set `IMPORT_FILE_DATA=true` for the first successful startup only; then set it back to `false`. New installations should leave it `false`.

```sh
cp .env.example .env
docker compose up --build -d
```

Open `http://localhost:8080` for a local preview. Cookies are `Secure` by default in the production container; for local HTTP only, change `COOKIE_SECURE=false` in `.env` before starting Compose. Do not use that setting on a public deployment. Compose runs a persistent PostgreSQL service and the app container as a non-root user with a read-only filesystem and health checks. On first database setup, the app imports existing local data only when `IMPORT_FILE_DATA=true`; it refuses to silently re-import old files if an initialized database later loses its state row. In PostgreSQL mode, app instances coordinate through a transaction-locked shared state row; all API requests are serialized, so this is intended for low-volume community demonstrations and is not a high-throughput election platform. For a public deployment, terminate HTTPS at a trusted reverse proxy. If the app is behind exactly one trusted proxy, set `TRUST_PROXY_HOPS=1`; only set this to match your actual proxy chain.

## Back up and verify demo data

The local file backup command copies poll data, encrypted authenticator accounts and runtime security state, and the ballot key into one timestamped folder. Stop the app before creating this file snapshot so its files represent one consistent point in time. The PostgreSQL backup uses `pg_dump` and can run while the app is online. Protect backups and `BALLOT_KEY` like credentials, store copies away from the server, and periodically verify them.

For a local file-based development run, stop the development server with Ctrl+C, then run:

```powershell
$backupRoot = Join-Path $PWD "jana-vani-backups"
New-Item -ItemType Directory -Force $backupRoot | Out-Null
npm run backup:data -- create $backupRoot .\backend
```

Use the folder path printed by the command to verify the backup:

```powershell
npm run backup:data -- verify "<printed-backup-folder>"
```

If the server uses a custom `DATA_DIR`, pass that exact data directory instead of `backend`.

For the Docker Compose PostgreSQL deployment, make an online database snapshot with:

```powershell
npm run backup:database -- create .\jana-vani-backups
```

Verify it with the dump-file path printed by the command:

```powershell
npm run backup:database -- verify "<printed-dump-file>"
```

Restore a verified dump into a newly named database without replacing the active one:

```powershell
npm run restore:database -- "<printed-dump-file>"
```

After reviewing the restored database, copy the printed database name into `POSTGRES_DB` in `.env` and run `docker compose up -d` to switch the app. Keep the same `BALLOT_KEY` used for the backup; the restore tool never changes the active database automatically.

The local file backup tool and PostgreSQL backup tool are separate. A PostgreSQL dump does not contain `BALLOT_KEY`; store that key separately in an access-controlled secret manager. A checksum can detect accidental backup damage but does not replace a restore procedure or an off-site copy.

The app removes its instance lock during a normal file-based shutdown. After a forced kill or machine crash, `.jana-vani.instance.lock` may remain in `DATA_DIR` and block startup. Remove that file only after confirming that no Jana Vani process is using the data directory.

## Sign in with Google Authenticator

1. Enter `DEMO000001` or create a made-up code beginning with `DEMO` followed by six characters. Do not enter an EPIC/Voter ID, Aadhaar number, or phone number.
2. On first use, scan the setup QR code with Google Authenticator.
3. Enter the current six-digit code to complete enrollment and sign in.
4. Each vote submission also asks for the current six-digit code.

Authenticator secrets and runtime security state are encrypted at rest with AES-256-GCM. Runtime state includes hashed session tokens, session expiry times, and rate-limit counters. Sessions can remain valid across an app restart until logout or their eight-hour expiry. A random key is created in `DATA_DIR` on first start unless `BALLOT_KEY` is supplied. Keep the key with protected backups; changing or losing the key prevents decryption. Demo codes are not linked to a person or checked against an official electoral roll.

## Community polls and receipts

- Signed-in users can create a group poll (housing society/RWA, student council, club/association, NGO/community group or local issue) with up to 20 options and an opening and closing date. All dates use India Standard Time.
- A signed-in demo account can cast one vote per poll. The server verifies a single-use TOTP code before recording it.
- In local development, poll data is saved in `community-polls.json`; authenticator accounts and runtime state are encrypted in files under `DATA_DIR`.
- Docker Compose stores poll data, authenticator accounts, sessions, and rate limits in PostgreSQL. A one-time import from existing local files requires `IMPORT_FILE_DATA=true` on initial database creation.
- Each ballot gets a random secret and a SHA-256 commitment to the poll ID, option ID, and secret. The choice and secret are returned in a private receipt that can be saved locally.
- Only the commitment is written to the local hash chain. The voter can recompute their commitment from the private receipt; other people cannot infer the selected option from the commitment alone.
- `/api/receipts/:commitment` checks that the commitment is in the ledger and that the local chain links are intact. This is a centralized local hash-chain demonstration, not a decentralized blockchain or independent proof of a real election.
- `GET /api/ledger/export` returns public commitment blocks and poll labels without voter nullifiers or receipt secrets. Save the JSON and run `npm run verify:ledger -- <export-file>` to recompute its internal chain hashes offline.
- Aggregate poll results are available after the poll closes.

The offline verifier detects broken links, changed block contents, duplicate commitments, and an inconsistent exported head hash. It cannot tell whether the server omitted later blocks before export, prove that totals were counted correctly, or verify voter eligibility. Share a ledger head hash through a separate trusted channel if you want other reviewers to compare snapshots over time.

The confirmation screen now hides the choice until the voter asks to reveal it. This only reduces accidental disclosure on screen: the full receipt still contains the choice and its random secret, and anyone who gets it can see the recorded selection. The hash does not let a voter recover their selection; the private receipt carries that information. This is not a coercion-resistant receipt system.

## Phone, SMS, and Aadhaar

This prototype does not send SMS and does not collect or authenticate Aadhaar or EPIC/Voter ID numbers. Official voter services are available through the [Election Commission of India Voters’ Service Portal](https://voters.eci.gov.in/). Aadhaar authentication is provided only through UIDAI’s requesting-entity framework; do not add Aadhaar numbers or real phone numbers to this demo.

For public elections, use the responsible election authority: the ECI administers Parliament and State Legislature elections; the Constitution assigns Panchayat and Municipal election processes to State Election Commissions. This prototype does not administer or certify any such election. See the [ECI portal](https://voters.eci.gov.in/) and the [Constitution of India, Articles 243K and 243ZA](https://www.legislative.gov.in/static/uploads/2025/07/88cca69e868e50b217f855be2fb8bdba.pdf).

## Prototype limitations

- There are no organizer roles; any signed-in demo user may create or close a poll.
- TOTP secrets and runtime security state are encrypted at rest, but there is no lost-device recovery or key-rotation workflow. Runtime state persists across restarts but remains a local file that multiple app instances do not share or coordinate.
- Ballots are centrally processed by this server. The duplicate-vote marker and aggregate tally are not a cryptographically anonymous, independently audited voting system.
- The demo ledger is a local file-backed hash chain with no distributed consensus or external witnesses. Server or file compromise can alter the data. The app now pauses new votes and withholds results when it detects a broken chain or a mismatch between ballot records and commitments, but this check cannot detect a coordinated rewrite of the server data or validate the tally independently.
- Local file mode uses an exclusive single-instance lock. Compose mode stores shared app state in one PostgreSQL JSONB row and serializes API requests; it supports coordination across app processes for small demonstrations, but the single database remains a point of failure and throughput bottleneck.
- Deployment has no automatic off-site backup, database replication, or failover. A dump can be restored into a separate database, but the operator must review it and switch the app manually; protect the PostgreSQL dump and `BALLOT_KEY` separately.
- There is no official voter registry, legally approved election process, independent security audit, or election-grade operational control.

The election list and detail APIs currently include per-option vote counts before a poll closes, even though the dedicated results page is intended for completed polls. Live totals should therefore be treated as visible. Do not use this prototype where interim tally confidentiality matters.

## Project documentation

- [User guide](docs/USER_GUIDE.md): sign-in, poll creation, voting, receipts, and results.
- [Architecture](docs/ARCHITECTURE.md): request flow, storage, TOTP, commitments, and the local hash chain.
- [Security model](docs/SECURITY.md): implemented controls, assumptions, operational handling, and limitations.
- [API reference](docs/API.md): routes, authentication, request fields, and response statuses.
- [Deployment and operations](docs/DEPLOYMENT.md): local/Compose setup, environment settings, backups, and restore.
- [Expanded IEEE-style research paper](Jana_Vani_IEEE_Research_Paper_Expanded.docx): implementation study and related work (2025–2026).

## API overview

- `GET /api/health` — liveness status.
- `GET /api/health/ready` — readiness status, including access to the persistent data directory.
- `POST /api/auth/setup` and `POST /api/auth/verify` accept a made-up `demoCode`; never send a real Indian identity number. `GET /api/auth/session` and `POST /api/auth/logout` manage the demo session.
- `GET /api/elections`, `POST /api/elections`, `GET /api/elections/:id`, `POST /api/elections/:id/close` — community poll management.
- `POST /api/votes` — submit a choice with the current authenticator code.
- `GET /api/receipts/:commitment` — verify a commitment’s presence and local hash-chain integrity.
- `GET /api/elections/:id/results` — poll totals and latest commitment block hash.
