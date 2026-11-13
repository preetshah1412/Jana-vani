# API reference

The production app serves the frontend and API from one origin. JSON request bodies are limited to 16 KiB. Authentication uses the `jana_vani_session` cookie created after successful demo authenticator verification. The identifiers below are fictional app IDs, not voter identifiers.

| Method and path | Session | Purpose and main inputs |
| --- | --- | --- |
| `GET /api/health` | No | Liveness status. |
| `GET /api/health/ready` | No | Readiness, persistent-state access and hash-chain integrity. |
| `POST /api/auth/setup` | No | Body `{ "demoCode": "DEMO000001" }`; creates or returns an authenticator QR/manual setup secret for a new self-claimed demo account. An already enrolled account does not receive a replacement QR. |
| `POST /api/auth/verify` | No | Body `{ "demoCode": "DEMO000001", "code": "123456" }`; confirms TOTP, enables enrollment and creates the session. |
| `GET /api/auth/session` | Optional | Returns whether the current cookie has an active session. |
| `POST /api/auth/logout` | Optional | Removes the current session and expires the cookie. |
| `POST /api/auth/reset` | No; local development only | Body `{ "demoCode": "DEMO000001" }`; replaces an enrolled demo secret. Returns not found in production; rate-limited in development. This is not real identity recovery. |
| `GET /api/elections` | Optional | Lists polls. Current implementation includes per-option counts before closure. |
| `POST /api/elections` | Yes | Creates a community poll. Body fields: `title`, optional `description`, `pollType`, `candidates` (array of `{ "name", "description" }`), `startDate`, and `endDate` as date strings. |
| `POST /api/demo-elections/:template` | Yes | Creates a fictional practice election from the `parliament`, `assembly`, or `panchayat` template. These do not represent active or official elections. |
| `GET /api/elections/:id` | Optional | Gets one poll; current implementation includes per-option counts before closure. |
| `POST /api/elections/:id/close` | Yes | Closes the poll early. Only its creator may do so. |
| `POST /api/votes` | Yes | Body `{ "electionId": "…", "candidateId": "…", "code": "123456" }`; records one ballot per demo account and returns a private receipt. |
| `GET /api/receipts/:commitment` | No | Checks commitment inclusion and current local chain integrity. Does not verify selection or tally correctness. |
| `GET /api/ledger/export` | No | Exports poll labels, blocks and chain head if the chain passes integrity checks. |
| `GET /api/elections/:id/results` | No | Returns results after poll completion, subject to chain integrity. The tally is not independently verifiable. |

## Common response statuses

- `200`: successful read, session check, sign-out, close, or result.
- `201`: poll or ballot created.
- `400`: malformed or invalid input (including invalid TOTP).
- `401`: route requires an active demo session.
- `403`: results requested before closure or caller cannot close the poll.
- `404`: unknown route, poll, option, template, or receipt.
- `409`: poll not active, duplicate account vote, or receipt record inconsistency.
- `413`: request body exceeds the size limit.
- `429`: authentication or creation limit reached; a `Retry-After` header may be included.
- `503`: unavailable shared state or failed ledger integrity check.

All routes are demonstration interfaces. Never submit Aadhaar, EPIC/Voter ID, real mobile numbers, or other personal records.
