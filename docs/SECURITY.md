# Security model and limitations

## Security statement

Jana Vani is an educational community-poll prototype. Its controls reduce some routine demo risks and can expose accidental data changes, but they do not make the app suitable for official, binding, confidential, or public elections. ECI/SEC election systems use legal, physical, procedural and audit controls that this prototype does not implement.

## Protected assets and assumptions

Assets include demo authenticator seeds, session tokens, poll definitions, tallies, ballot markers, commitments, receipts and backups. At-rest encryption assumes `BALLOT_KEY` remains secret and available. HTTPS assumes correct proxy configuration and valid TLS. The application server and database are trusted to process and persist requests honestly; the design cannot protect a voter against a malicious or compromised operator.

## Implemented protections

| Control | Intended effect | Boundary |
| --- | --- | --- |
| TOTP (six digits, 30-second step) | Confirms access to a demo authenticator seed; accepted time steps cannot be reused | Not proof of identity, eligibility, or a unique person |
| Rate limits and temporary lockout | Slows repeated guesses and setup/reset/poll-creation abuse | Local limits do not replace edge-level abuse protection |
| HttpOnly, SameSite, production Secure session cookie | Reduces script access to token and cross-site cookie submission | A stolen active browser/session or compromised host remains a risk |
| AES-256-GCM at rest | Protects authenticator accounts and runtime state while key stays secret | Poll data and tallies are not encrypted; key loss prevents decryption |
| HMAC-SHA-256 marker | Detects repeat votes from the same demo account in one poll without placing its code in the marker | A user can create multiple demo accounts; server can correlate its state |
| SHA-256 commitment with random nonce | Binds a receipt to a poll and option and lets its holder recompute the commitment | Not encryption, tally proof, anonymity, or coercion resistance |
| Local previous-hash chain | Detects inconsistent edits when compared with the stored chain | An operator can rewrite the complete local chain without an external checkpoint |
| Readiness check | Withholds voting, export and results when chain integrity check fails | Cannot detect a coordinated rewrite or prove correctness of a valid-looking tally |
| Container hardening | Limits some container filesystem and privilege exposure | Does not replace host security, patching, network policy, or backup controls |

## Known privacy and correctness risks

1. **Live tallies are returned early.** The election list and detail endpoints serialize each option's `votes` field, even though the dedicated results endpoint waits until a poll completes. Treat interim totals as public in the current implementation.
2. **The server sees the selection.** It validates the option and updates a plaintext logical tally. AES-GCM is used for authenticator and runtime envelopes, not to conceal ballots from the server.
3. **Receipts reveal choices.** A receipt contains candidate/option and nonce. Anyone to whom it is shown can learn the recorded selection. The commitment alone cannot recover that choice.
4. **The one-vote rule is per demo account.** Self-claimed codes can be created repeatedly and do not provide person-level uniqueness or eligibility.
5. **The tally is not independently proven.** Chain consistency proves only the internal links and expected local representation. It does not prove that all accepted votes were published or counted correctly.
6. **One server/database remains trusted.** No distributed consensus, independent observers, external timestamp, immutable public checkpoint, or failover is implemented.
7. **No SMS or government identity service is integrated.** The application neither sends SMS nor collects/authenticates Aadhaar or EPIC/Voter ID.

## Operational handling

- Use fictional demo identifiers and choices; do not import personal or voter data.
- Keep `BALLOT_KEY`, authenticator setup secrets, receipt files and backup dumps restricted. A database dump does not contain the key; preserve it separately in a protected secret store.
- Use HTTPS for remote access. Keep `COOKIE_SECURE=true` outside local HTTP previews and configure only the known trusted proxy chain.
- Back up before upgrades and verify restores into a separate database or directory. Keep protected off-site copies according to the operator's retention policy.
- Monitor `/api/health/ready`; a readiness failure due to a chain check means stop relying on that poll's results and investigate the source data.
- Do not represent the app as an official Indian election platform or use it to decide legally binding outcomes.

## Security review status

The available project record includes successful build/startup and route-level checks. No independent penetration test, cryptographic review, formal verification, public-election certification, privacy impact assessment, or external operational audit is claimed. Report suspected vulnerabilities to the project maintainer privately and include reproducible steps without real voter data.
