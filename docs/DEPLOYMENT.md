# Deployment and operations

## Local development

Install the root and backend dependencies and run both services:

```sh
npm ci
cd backend && npm ci && cd ..
npm run dev:all
```

Open `http://localhost:8080`. The Vite development server proxies API requests to Express on port 4000. Stop both processes with Ctrl+C. For a built single-service run, use Node.js 22, build the frontend, configure the production environment, then start the backend:

```sh
npm ci
cd backend && npm ci --omit=dev && cd ..
npm run build
npm start
```

## Docker Compose preview

1. Copy `.env.example` to `.env`.
2. Set a strong PostgreSQL password and a cryptographically random 64-hex-character `BALLOT_KEY`. Keep both in a protected secret store. Use the same ballot key for all app instances and restores of the same data.
3. Leave `IMPORT_FILE_DATA=false` for a new installation. If migrating existing file-mode state, use `true` only for the first successful database initialization, then set it back to `false`.
4. Run `docker compose up --build -d` and open `http://localhost:8080` for a local demonstration.

Compose enables secure cookies by default. `COOKIE_SECURE=false` is only for local HTTP previews and must not be used on an exposed deployment. Before remote access, put the app behind HTTPS. Set `TRUST_PROXY_HOPS` to the actual number of trusted reverse proxies; do not trust arbitrary forwarded headers.

## Vercel multi-service deployment

The repository includes a `vercel.json` that routes the Vite website to the `web` service and `/api/*` requests to the Express `api` service. Vercel Services is in beta, so this deployment path depends on Services being enabled for the Vercel account. Import the repository as a multi-service project; do not import only the `web` or `api` subproject.

Before the first deployment, attach a PostgreSQL database with a pooled connection URL and configure these production environment variables for the API service:

| Variable | Value |
| --- | --- |
| `DATABASE_URL` | Pooled PostgreSQL connection URL from the database provider. |
| `BALLOT_KEY` | 32 random bytes encoded as exactly 64 hexadecimal characters. Generate it once and keep it secret and backed up. |
| `DATA_DIR` | `/tmp/jana-vani`; in database mode, application data is persisted in PostgreSQL. |
| `TRUST_PROXY_HOPS` | `1` for the Vercel edge proxy. |

Keep secure cookies enabled; Vercel supplies HTTPS. The API intentionally fails to start without `DATABASE_URL` and `BALLOT_KEY`. Do not use file storage for deployment because serverless instance files are not durable or shared. After deployment, verify `/api/health/ready`, sign-in, poll creation, and the API routing before sharing the preview URL. This remains a low-volume demonstration, not an official or binding election service.

## Environment settings

| Setting | Required use |
| --- | --- |
| `NODE_ENV` | Set to `production` in deployment. |
| `PORT`, `HOST` | Listening port and interface; Compose uses `8080` and `0.0.0.0`. |
| `DATA_DIR` | Persistent state path. |
| `BALLOT_KEY` | Exactly 32 random bytes encoded as 64 hex characters; keep stable and secret. |
| `DATABASE_URL` or `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, and `PGPASSWORD` | Enables shared PostgreSQL mode. Production refuses to start without a database. |
| `POSTGRES_PASSWORD` | Compose database credential; set through a secret mechanism. |
| `IMPORT_FILE_DATA` | One-time import flag for existing file-mode data; reset to `false` after initial successful import. |
| `COOKIE_SECURE` | Defaults to secure cookies in production. Only disable for local plain-HTTP testing. |
| `FRONTEND_ORIGIN` | Optional production origin allowlist. |
| `TRUST_PROXY_HOPS` | Trusted proxy count when TLS is terminated upstream. |

## Backups and restoration

For file mode, stop the app before taking a consistent snapshot:

```powershell
$backupRoot = Join-Path $PWD "jana-vani-backups"
New-Item -ItemType Directory -Force $backupRoot | Out-Null
npm run backup:data -- create $backupRoot .\backend
npm run backup:data -- verify "<printed-backup-folder>"
```

For PostgreSQL mode, create and verify a database dump:

```powershell
npm run backup:database -- create .\jana-vani-backups
npm run backup:database -- verify "<printed-dump-file>"
npm run restore:database -- "<verified-dump-file>"
```

The restore command creates a newly named database. Review it, then switch `POSTGRES_DB` and restart Compose deliberately. A PostgreSQL dump does not contain `BALLOT_KEY`; preserve the same key separately. A checksum can detect damage to a backup but is not a substitute for a restore rehearsal.

## Operational boundary

Compose provides persistent storage and a health check; it does not configure off-site backups, database replication, automatic failover, service monitoring, an incident-response process or a production-grade election operations team. The shared JSONB row is locked for every API request and intentionally supports low-volume demonstrations only. Do not expose the service as a public election platform.
