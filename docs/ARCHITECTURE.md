# Jana Vani architecture

## Scope

Jana Vani is a single-origin web application for fictional, non-binding community-poll demonstrations. The app has a React/Vite frontend and an Express/Node.js API. In production, Express serves the built frontend and API together. The security controls below are implementation details, not an election certification.

## Request path

1. The browser loads the React application and calls same-origin `/api` routes.
2. Express applies request-size, security-header, origin, and cookie policies; in PostgreSQL mode, a middleware loads and locks shared state for the request.
3. Route handlers validate the session, TOTP, poll status, option and duplicate marker as applicable.
4. An accepted vote updates the option tally, a ballot marker, and the global commitment chain, then persists the state.
5. The browser receives a private receipt containing the choice and nonce. Receipt lookup checks chain membership and integrity.

## Authentication and keys

Demo codes must match `DEMO` plus six alphanumeric characters. On first enrollment the server creates a random TOTP seed and an `otpauth://` QR compatible with Google Authenticator. TOTP uses HMAC-SHA-1, six digits and a 30-second step; verification permits a narrow adjacent-step window and records the consumed step to reject reuse. Five failed codes within the configured window cause a ten-minute lockout. Setup, local reset and poll-creation actions have separate rate limits.

Sessions use random bearer tokens in `HttpOnly`, `SameSite=Strict` cookies, marked `Secure` by default in production. The server stores a digest of each session token, and sessions expire after eight hours. Session and throttling state persists through restart, encrypted in file mode and included in the shared encrypted runtime envelope in database mode.

The server requires a 32-byte key represented as 64 hexadecimal characters. It creates `.ballot-key` in local file mode when no `BALLOT_KEY` is supplied. Labeled SHA-256 derivations create separate AES keys for authenticator accounts and runtime state. AES-256-GCM uses a random 12-byte IV and authentication tag. Poll definitions, option tallies, ballot markers and chain blocks are not encrypted by this envelope; they remain available to the app in its state store.

## Ballot and commitment model

For a poll identifier `E` and demo account identifier `U`, the duplicate-vote marker is:

`N = HMAC-SHA-256(BALLOT_KEY, E || ":" || U)`

For selected option `O` and fresh 32-byte random nonce `R`, the commitment is:

`C = SHA-256(E || "|" || O || "|" || R)`

The stored ballot record contains the poll identifier, keyed marker, commitment, receipt identifier and timestamp. The poll store separately contains per-option tallies. The private response includes the selected option and `R`. Consequently, the commitment can be recomputed by the receipt holder, but the receipt also reveals the vote. The construction does not encrypt the ballot from the application server.

Each chain block stores its sequential index, timestamp, poll identifier, commitment and previous block hash. The block hash is SHA-256 over the serialized block fields. Integrity checking verifies the block count against ballot count, unique `(poll, commitment)` pairs, ballot-to-block representation, sequential indices, previous hashes and recomputed block hashes. This is a centralized hash chain. There are no peer validators, consensus protocol, or external checkpoint.

## Persistence modes

### File mode

Local development persists polls in `community-polls.json`; authenticator accounts and runtime security state use encrypted JSON envelopes under `DATA_DIR`. A mode-600 exclusive instance lock prevents two file-mode servers from writing the same local data directory. After an abnormal shutdown, inspect that no server process is using the directory before removing a stale lock.

### PostgreSQL mode

When `DATABASE_URL` or `PGHOST` is set, the app stores the complete logical poll state in a singleton JSONB row. Authenticator account and runtime-state sections are encrypted before serialization; the poll store remains structured JSON in the database. A transaction-scoped PostgreSQL advisory lock and row lock serialize requests across app instances. This is appropriate only for low-volume demonstrations; it is a throughput bottleneck and the database remains a trust and availability dependency.

On first initialization, local data imports only when `IMPORT_FILE_DATA=true`. A metadata marker prevents silent re-import if an initialized database later loses its state row. The importer should be disabled again after successful initialization.

## Web and operational controls

The server limits JSON requests to 16 KiB and sets browser security headers, including a production content-security policy. Production can restrict cross-origin requests through `FRONTEND_ORIGIN`; cookies are secure by default. Behind a reverse proxy, configure `TRUST_PROXY_HOPS` to the actual trusted proxy count and terminate HTTPS at a trusted proxy before external access. Docker Compose runs the app as non-root with a read-only root filesystem, drops Linux capabilities, and uses a persistent PostgreSQL volume and health check.

## Deliberate boundaries

The app has no official identity integration, phone/SMS provider, Aadhaar authentication, voter registry, election-authority connection, ballot secrecy from the server, independent tally proof, organizational consensus, or public-election authorization. The API currently serializes live option vote counts in election list and detail responses; this is a known issue for any use case requiring hidden interim totals.
