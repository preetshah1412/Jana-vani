from docx import Document
from docx.shared import Inches, Pt
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK
from docx.enum.section import WD_SECTION_START
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.enum.style import WD_STYLE_TYPE
from docx.enum.text import WD_LINE_SPACING
from pathlib import Path

OUT = Path(r'E:\Janvani\Jana-vani-main\Jana_Vani_IEEE_Research_Paper_Expanded.docx')
doc = Document()

# Page and base typography
sec = doc.sections[0]
sec.top_margin = Inches(.62); sec.bottom_margin = Inches(.62)
sec.left_margin = Inches(.68); sec.right_margin = Inches(.68)
sec.header_distance = Inches(.28); sec.footer_distance = Inches(.28)
styles = doc.styles
normal = styles['Normal']
normal.font.name = 'Times New Roman'; normal.font.size = Pt(10)
normal._element.rPr.rFonts.set(qn('w:eastAsia'), 'Times New Roman')
normal.paragraph_format.space_after = Pt(2)
normal.paragraph_format.line_spacing = 1.0
title_style=styles['Title']
title_style.font.name='Times New Roman'; title_style.font.size=Pt(20); title_style.font.bold=True; title_style.font.color.rgb=__import__('docx').shared.RGBColor(0,0,0)
title_style._element.rPr.rFonts.set(qn('w:eastAsia'), 'Times New Roman')
title_style.paragraph_format.alignment=WD_ALIGN_PARAGRAPH.CENTER
title_style.paragraph_format.space_after=Pt(5)
for border in title_style._element.xpath('./w:pPr/w:pBdr'):
    border.getparent().remove(border)
for name, size in [('Heading 1', 10), ('Heading 2', 9.5)]:
    s = styles[name]
    s.font.name = 'Times New Roman'; s.font.size = Pt(size); s.font.bold = True; s.font.color.rgb = __import__('docx').shared.RGBColor(0,0,0)
    s._element.rPr.rFonts.set(qn('w:eastAsia'), 'Times New Roman')
    s.paragraph_format.keep_with_next = True
    s.paragraph_format.space_before = Pt(7 if name == 'Heading 1' else 4)
    s.paragraph_format.space_after = Pt(2)
    s.paragraph_format.line_spacing = 1.0

# Page-number field
footer = sec.footer.paragraphs[0]
footer.alignment = WD_ALIGN_PARAGRAPH.CENTER
footer.paragraph_format.space_before = Pt(0); footer.paragraph_format.space_after = Pt(0)
r = footer.add_run('Jana Vani Prototype Research Paper  •  '); r.font.name='Times New Roman'; r.font.size=Pt(8); r.font.color.rgb=__import__('docx').shared.RGBColor(80,80,80)
fld = OxmlElement('w:fldSimple'); fld.set(qn('w:instr'), 'PAGE'); footer._p.append(fld)

# One-column title and abstract block
p = doc.add_paragraph(style='Title'); p.alignment = WD_ALIGN_PARAGRAPH.CENTER
p.paragraph_format.space_before = Pt(2); p.paragraph_format.space_after = Pt(4)
r = p.add_run('Jana Vani A TOTP Enabled Community Voting Prototype\nWith Commitment Receipts and a Local Hash Chain')
r.bold = True; r.font.name='Times New Roman'; r.font.size=Pt(20)
p = doc.add_paragraph(); p.alignment = WD_ALIGN_PARAGRAPH.CENTER; p.paragraph_format.space_after=Pt(1)
r=p.add_run('[Author Name]'); r.font.name='Times New Roman'; r.font.size=Pt(10.5); r.bold=True
p = doc.add_paragraph(); p.alignment = WD_ALIGN_PARAGRAPH.CENTER; p.paragraph_format.space_after=Pt(1)
r=p.add_run('[Department / Institution]  •  [City, India]'); r.font.name='Times New Roman'; r.font.size=Pt(9)
p = doc.add_paragraph(); p.alignment = WD_ALIGN_PARAGRAPH.CENTER; p.paragraph_format.space_after=Pt(6)
r=p.add_run('[Email Address]'); r.font.name='Times New Roman'; r.font.size=Pt(9)

p=doc.add_paragraph(); p.paragraph_format.space_after=Pt(3)
r=p.add_run('Abstract—'); r.bold=True; r.italic=True
p.add_run('We present Jana Vani, a web prototype for non-binding community polls and fictional practice elections. We trace the user journey from demo-account enrollment and time-based one-time password (TOTP) confirmation through ballot submission, receipt checking, and result release. The implementation uses a poll-specific HMAC marker to reject repeat demo-account votes, a random nonce and SHA-256 commitment for each accepted choice, and a centralized hash chain. Authenticator seeds and runtime state are encrypted at rest with AES-256-GCM. Our code-guided review finds that these mechanisms demonstrate account confirmation and tamper evidence, but they do not verify a person’s identity or eligibility, conceal choices from the server, distribute trust across independent nodes, or prove tally correctness. We compare the design with six e-voting papers published in 2025–2026 and a recent systematic review. Available build and route checks are described, but no user study, performance benchmark, penetration test, or independent election audit was conducted. Jana Vani is an educational community-poll prototype and is not an official Indian election platform.')
p=doc.add_paragraph(); p.paragraph_format.space_after=Pt(7)
r=p.add_run('Index Terms—'); r.bold=True; r.italic=True
p.add_run('Community voting, electronic voting, TOTP, ballot commitment, hash chain, prototype, India.')

# Continuous two-column body
bodysec = doc.add_section(WD_SECTION_START.CONTINUOUS)
bodysec.top_margin=Inches(.62); bodysec.bottom_margin=Inches(.62)
bodysec.left_margin=Inches(.68); bodysec.right_margin=Inches(.68)
bodysec.header_distance=Inches(.28); bodysec.footer_distance=Inches(.28)
cols = bodysec._sectPr.xpath('./w:cols')[0]
cols.set(qn('w:num'), '2'); cols.set(qn('w:space'), '360'); cols.set(qn('w:sep'), '0')


def heading(text):
    p=doc.add_paragraph(style='Heading 1'); p.alignment=WD_ALIGN_PARAGRAPH.CENTER; p.add_run(text); return p

def para(text, indent=True):
    p=doc.add_paragraph()
    if indent: p.paragraph_format.first_line_indent=Inches(.15)
    p.add_run(text)
    return p

def sub(text):
    p=doc.add_paragraph(style='Heading 2'); p.alignment=WD_ALIGN_PARAGRAPH.LEFT; p.add_run(text); return p

heading('I. INTRODUCTION')
para('Housing societies, student councils, clubs, and neighborhood groups regularly make decisions that matter to their members but are not public elections. Jana Vani grew from that modest use case: give a group a clear ballot page, require an authenticator code at submission, and show the participant a receipt. Its India-themed screens and Lok Sabha-style, Assembly-style, and Panchayat-style examples are fictional practice material; they contain no real candidates and cannot record official votes.')
para('The project also raises a useful engineering question: what does each security feature actually guarantee? A short-lived code confirms access to an authenticator seed, not voter eligibility. A digest can reveal a changed record when checked against trusted history, but it cannot show that the server counted the choice correctly. Likewise, linking records with hashes does not create the independent nodes or consensus expected of a distributed blockchain [9].')
para('We answer that question by following the code from enrollment to results, then comparing its guarantees with recent e-voting research. This is an implementation study of a working prototype, not a claim that Jana Vani is ready for binding or public elections.')

heading('II. CONTEXT AND RELATED WORK')
sub('A. Indian election context')
para('India’s public elections are administered through the legally designated election authorities. The Election Commission of India (ECI) conducts elections to Parliament and State Legislatures. Articles 243K and 243ZA of the Constitution provide for State Election Commissions in Panchayat and Municipal elections, respectively [10]. The ECI describes the official polling-station process in terms of Electronic Voting Machines (EVMs) and Voter Verifiable Paper Audit Trail (VVPAT) [11]. Jana Vani does not connect to an electoral roll, voter-service portal, EVM, VVPAT, ECI, or State Election Commission, and it has no authority to accept an official ballot.')
sub('B. Recent e-voting research (2025–2026)')
para('Recent proposals explore stronger properties than this prototype implements. Sarier presents a blockchain-based scheme using encrypted attribute-based credentials and biometric-derived, non-transferable credentials, with analysis focused on anonymity, auditability, verifiability, double-voting prevention, and coercion resistance [1]. Zheng et al. propose ballot modification using chameleon hashes with ephemeral trapdoors, a modified Paillier cryptosystem, and blind signatures; their evaluation simulates the design on Fabric 2.2 [2]. These mechanisms address privacy and coercion in protocol designs; Jana Vani uses neither anonymous credentials nor Paillier encryption, blind signatures, or editable ballots.')
para('Chaira, Cherroun, and Aouag describe an e-voting design combining blockchain, homomorphic encryption, and zero-knowledge proofs [3]. Kraavi and Willemson study vote-correctness proofs for Estonia’s IVXV system, including a concrete Bulletproof-based implementation and benchmarks [4]. Solanki and Meva propose a hybrid Hyperledger Fabric framework with Paillier encryption, AES, ECDSA, and zero-knowledge proofs [5]. Alsuwat presents a permissioned-chain design combining post-quantum Dilithium signatures, zero-knowledge proofs, nullifiers, encrypted ballots, smart contracts, and Byzantine fault tolerance [6]. These papers pursue protocol properties that this single-server app does not provide. Their reported measurements belong to their own prototypes and cannot be attributed to Jana Vani.')
para('A 2026 systematic review of blockchain voting literature from 2022–2025 observes that many evaluated systems remain laboratory or proof-of-concept implementations, with limited exposure to sustained attacks and real population-scale operational conditions [7]. That observation supports a cautious treatment of prototypes: a successful build or an internally consistent ledger is not evidence of public-election security. NIST describes a blockchain in terms of a distributed ledger replicated across participants and maintained by consensus [9]. Jana Vani instead maintains one local sequence of linked hashes.')
para('The comparison is informative because each property requires a mechanism and an assurance argument. Homomorphic encryption can permit aggregation without exposing each encrypted ballot, but it requires sound key generation, proofs of well-formed ballots, and controlled decryption. Zero-knowledge proofs can establish ballot validity without disclosing a choice, but the proof relation, implementation, and verifier must be reviewed. Distributed ledgers can give independent parties a shared ordering only when validator governance and consensus are meaningfully independent. A chain of hashes in one application process is useful for teaching tamper evidence, yet it does not inherit these system-level guarantees. This paper therefore compares mechanisms by the property they target, not by a general “blockchain” label.')
sub('C. Study approach')
para('We treated the application as a software artifact and traced its interface, API handlers, stored records, deployment configuration, and project documentation through enrollment, poll setup, voting, receipt lookup, export, and results. We compared those flows with six peer-reviewed papers published in 2025–2026 and one 2026 systematic review, selected for direct relevance to ballot privacy, correctness proofs, coercion, ledger governance, and implementation evidence [1]–[7]. This targeted review is not systematic and does not claim exhaustive coverage. We did not collect participant data or conduct a controlled security or performance experiment. The implementation analysis records what code paths do; it is not a formal verification or independent security audit.')
sub('D. Requirements and trust assumptions')
para('The prototype translates a small-group poll into six functional requirements: a participant can enroll a demo authenticator, enter a poll, submit one option while it is open, receive a confirmation, check a commitment, and view the result after completion. Operational requirements include persistent state, stable session behavior, input bounds, abuse throttles, and a recovery path for the poll data. The code implements a subset of these requirements, with explicit boundaries: the identity is self-asserted, the account is not unique to a person, the server can inspect the selection, and list/detail routes expose live option totals.')
para('The security objective is therefore narrower than election security. The app aims to reduce accidental OTP replay, repeated submissions under one demo code, and unnoticed edits to a single stored chain. It assumes a correctly configured server, a secret ballot key, functioning system time, a private authenticator seed, and honest application/database operators. It does not assume that client devices are trusted or that the server is an impartial election authority; instead, it has no mechanism that could make a dishonest authority unable to alter results. This distinction informs every claim and residual risk reported below.')

heading('III. SYSTEM DESIGN')
sub('A. Architecture and enrollment')
para('The application uses a React/Vite browser client and an Express/Node.js API. In file mode, poll definitions, tallies, ballot markers, and local hash-chain blocks are stored in a JSON file; authenticator accounts and runtime security state are stored in encrypted envelopes. In PostgreSQL mode, the logical poll store resides in a singleton JSONB row while authenticator accounts and runtime state are encrypted before serialization. PostgreSQL advisory and row locks serialize requests across instances. The demo identity is a made-up code beginning with “DEMO”; the server does not validate it against a person, Aadhaar, EPIC/Voter ID, phone number, or official register. The interface warns users not to enter such identifiers.')
para('On first enrollment, the server generates a random TOTP secret and an otpauth QR code compatible with apps such as Google Authenticator. The user scans the QR code and submits a six-digit value. The calculation follows TOTP = DT(HMAC-SHA-1(K, floor((t - T0)/30))) mod 10^6, where K is the shared seed and t is Unix time. Jana Vani accepts the current 30-second step and one step on either side, records the last accepted step, and rate-limits failures. A used or older step is rejected. TOTP proves possession of the seed, not civil identity or eligibility; compromise of the seed, device, or enrollment flow undermines it [8].')
sub('B. Storage and service boundaries')
para('The browser communicates with the API over the same-origin application. The API owns session validation, poll-state checks, TOTP verification, duplicate-vote prevention, commitment generation, tally updates, and receipt lookup. A 32-byte key is supplied through BALLOT_KEY or generated in file mode and kept in the data directory. Labeled SHA-256 derivations separate the AES keys used for authenticator accounts and runtime state. Runtime state includes hashed session tokens, expiry, and rate-limit counters. Production Compose requires PostgreSQL, secure cookies, and persistent storage; its shared JSONB row is protected by a transaction lock and serializes API work. The database mode coordinates processes but remains a centralized service and a throughput bottleneck.')
sub('C. Vote and receipt workflow')
para('A signed-in demo user selects an active poll option and submits the current authenticator code. The API checks the session, poll status, option, previous-vote marker, and one-time code. For each poll and demo account, the server computes an HMAC-SHA-256 pseudonym using the server ballot key and rejects a second vote with the same marker. The pseudonym is intended to avoid writing the demo code itself into the ballot marker; it is not an anonymous credential and does not prevent a privileged server operator from correlating application data.')
para('For an accepted vote, the server creates a cryptographically random 256-bit nonce and computes C = SHA-256(P || O || N), where P is the poll identifier, O is the selected option identifier, and N is the nonce. It appends a block containing the commitment and poll identifier, timestamp, index, and previous block hash. The private receipt returned to the browser contains the selected option, nonce, commitment, and block details. A receipt holder can recompute C and compare it with the commitment recorded by the server. The receipt is sensitive: it reveals the selected option and should not be shared.')
para('The verification endpoint locates a commitment and recomputes hash links across the local chain. It reports whether the commitment exists and whether the chain currently links consistently. It does not recompute the election tally from an independently published ballot set, prove that the choice was counted, or establish that the server’s files are the only authoritative copy.')

sub('D. End-to-end working')
para('The operational sequence is as follows. 1) Enrollment: a participant enters a made-up DEMO code, scans the generated QR in an authenticator app, and confirms enrollment with a current six-digit TOTP; the account seed is then stored encrypted. 2) Poll setup: a signed-in demo account creates a community poll with a title, options, and opening/closing times in India Standard Time, or starts a clearly fictional practice-election template. 3) Ballot submission: during the active window, the client sends the poll, selected option, and current TOTP over the session. The API rejects an invalid session, inactive poll, unknown option, reused poll-specific HMAC marker, or previously consumed OTP step. 4) Recording: after validation, the server generates a 32-byte random nonce, computes the commitment, appends a previous-hash-linked block, increments the option tally, and persists the poll data. A receipt is returned to the browser. 5) Confirmation and results: the voter can recompute the commitment from the private receipt and query the receipt endpoint for ledger presence and chain consistency. Aggregate results are released after the poll closes. The receipt endpoint does not prove tally correctness.')
para('API responses make these states visible to the interface: unauthenticated requests return 401; unknown polls or options return 404; closed polls or duplicate account votes return 409; invalid TOTP returns 400, while excessive failures are rate-limited with 429. Accepted votes return 201 with a private receipt. The dedicated results route is unavailable before completion (403), and a missing receipt is 404. However, the election list and detail serializers include per-option `votes` values before closure. Thus, the dedicated results gate does not provide live-tally secrecy across all routes. This is a code-level privacy limitation, not merely a theoretical threat.')

sub('E. Vote-processing algorithm')
para('Let U be the demo account, P the poll, O the chosen option, K the server ballot key, and N a fresh 32-byte nonce. The main processing logic is equivalent to the following algorithm: (1) require a valid session for U; (2) require P to be active and O to belong to P; (3) compute the per-poll nullifier V = HMAC-SHA-256(K, P ":" U) and reject if (P,V) already exists; (4) validate and consume the six-digit TOTP for U, rejecting a reused time step; (5) sample N using a cryptographically secure random generator and compute C = SHA-256(P "|" O "|" N); (6) append block B = (index, time, P, C, previousHash, blockHash), where blockHash = SHA-256(serialized B without blockHash); (7) increment tally[P,O], persist the state, and return a private receipt containing O, N, C, and block metadata. A failed check exits before the tally is changed. The audit API checks C is present and validates each block’s previous-hash link; it cannot independently reconstruct the choice or tally.')
sub('F. State lifecycle and consistency')
para('The vote transition touches related state: the TOTP account’s last accepted step, the poll tally, a ballot record, a chain block, a receipt identifier, and runtime authentication counters. In file mode, separate JSON files are written using the server process and the poll store uses a temporary-file rename, while account and runtime files use encrypted envelopes. This provides a practical local persistence path, but it is not a multi-file transactional database. An abrupt process or machine failure at an unlucky point can leave logically related files at different update stages; a backup should be taken with the server stopped.')
para('In PostgreSQL mode, a singleton JSONB document holds the logical shared state. Before API work, a transaction acquires a PostgreSQL advisory lock and row lock, restores the document into process memory, and persists a new snapshot before committing the response. This serializes requests and avoids concurrent in-process snapshots overwriting one another across app instances. It also means each request contends for one lock and rewrites a large aggregate document, so throughput and state size will not scale like normalized ballot tables. The database is not a validator network: it is one service under one operator’s administrative control.')
para('Poll lifecycle is represented by opening and closing timestamps, with an explicit early-close action restricted to the creator’s keyed organizer marker. A poll is open only within its configured interval and before manual closure. Ballot submission validates the poll’s current status immediately before writing. Results are guarded by the dedicated endpoint until completion, but the list/detail representations include totals at all stages. This difference between route-level lifecycle policy and serialized data illustrates why privacy review must examine every API response, not only the visually prominent results page.')
sub('G. API boundary and failure handling')
para('The API centralizes validation so that a browser cannot bypass the vote checks by altering the interface. Session-required routes return an authentication error when the cookie is absent or expired; invalid input produces a client error; inactive polls and repeat votes produce conflict responses; and rate-limited requests include a retry delay. Receipt lookup distinguishes a missing commitment from a present ballot whose block is absent. Readiness, export, and results use the chain-integrity predicate and withhold service after a detected mismatch. These are useful operational behaviors for a prototype, but a status code is not an audit record and a successful response does not independently prove a correct election outcome.')
sub('H. Deployment modes and service boundary')
para('The development workflow starts Vite and Express separately, while the production build serves static frontend assets and API routes from one Express process. Production startup requires persistent storage and a shared PostgreSQL configuration; Docker Compose supplies the database and a persistent volume. The app container runs non-root, read-only except mounted or temporary paths, with Linux capabilities dropped and a readiness health check. Security headers include content-type sniffing protection, framing restrictions, referrer and permissions policies, a production content-security policy, and HSTS. JSON bodies are limited to 16 KiB, API responses are marked no-store, and origin requests are restricted by the configured allowlist.')
para('These deployment choices reduce common configuration and container risks but do not establish election-grade availability. Compose does not provide database replication, off-site backup, automated failover, key rotation, dedicated monitoring, incident response, or independent administration. A PostgreSQL dump does not contain the encryption key, so a backup is useful only if the matching key is protected separately. Recovery is manual and should be rehearsed against a newly named database. This operational model is suitable for a supervised classroom or local demonstration when the data is fictional and the service is not represented as an official ballot.')

sub('F. Security mechanisms and limits')
# compact table
rows = [
    ('Mechanism', 'Implemented role', 'Limit in this prototype'),
    ('TOTP (30 s)', 'Confirms possession of authenticator seed; one accepted step.', 'Not identity proof or eligibility check.'),
    ('AES-256-GCM', 'Encrypts authenticator account data at rest.', 'Does not encrypt all ballot or tally data.'),
    ('HMAC-SHA-256', 'Creates per-poll duplicate-vote pseudonym.', 'Server-keyed marker; not unlinkability against server.'),
    ('SHA-256 commitment', 'Binds poll, option, and random nonce.', 'Not an encrypted ballot or proof of correct tally.'),
    ('Centralized hash chain', 'Links local commitment blocks; edits can be detected against intact history.', 'No consensus, independent replicas, or outside witness.'),
    ('PostgreSQL state lock', 'Serializes shared state updates across application processes.', 'Single database and one JSONB state row; no distributed election governance.'),
    ('Interim tally serialization', 'Election list and detail routes provide per-option totals.', 'Live option counts are exposed before the poll closes.'),
]
p=doc.add_paragraph(); p.paragraph_format.space_after=Pt(2); p.paragraph_format.space_before=Pt(1)
r=p.add_run('TABLE I. IMPLEMENTED MECHANISMS AND SCOPE'); r.bold=True; r.font.name='Times New Roman'; r.font.size=Pt(8); p.alignment=WD_ALIGN_PARAGRAPH.CENTER; p.paragraph_format.keep_with_next=True
t=doc.add_table(rows=0, cols=3); t.alignment=WD_TABLE_ALIGNMENT.CENTER; t.autofit=False
widths=[Inches(.92), Inches(1.23), Inches(1.12)]
for idx,row in enumerate(rows):
    cells=t.add_row().cells
    for j,txt in enumerate(row):
        cells[j].width=widths[j]; cells[j].vertical_alignment=WD_CELL_VERTICAL_ALIGNMENT.CENTER
        p=cells[j].paragraphs[0]; p.paragraph_format.space_after=Pt(1); p.paragraph_format.space_before=Pt(1); p.paragraph_format.line_spacing=1.0
        r=p.add_run(txt); r.font.name='Times New Roman'; r.font.size=Pt(7.6); r.bold=(idx==0)
        tcPr=cells[j]._tc.get_or_add_tcPr(); shd=OxmlElement('w:shd'); shd.set(qn('w:fill'), 'EAF0F6' if idx==0 else ('F7F8FA' if idx%2==1 else 'FFFFFF')); tcPr.append(shd)
        mar=OxmlElement('w:tcMar')
        for side,val in [('top','55'),('start','65'),('bottom','55'),('end','65')]:
            node=OxmlElement('w:'+side); node.set(qn('w:w'),val); node.set(qn('w:type'),'dxa'); mar.append(node)
        tcPr.append(mar)
    if idx==0:
        for c in cells:
            pr=c._tc.get_or_add_tcPr(); borders=OxmlElement('w:tcBorders')
            for side in ('top','left','bottom','right','insideH','insideV'):
                e=OxmlElement('w:'+side); e.set(qn('w:val'),'single'); e.set(qn('w:sz'),'4'); e.set(qn('w:color'),'AAB5C0'); borders.append(e)
            pr.append(borders)
    trPr=t.rows[-1]._tr.get_or_add_trPr(); trPr.append(OxmlElement('w:cantSplit'))

heading('IV. SECURITY ANALYSIS')
sub('A. Threat model')
para('The threat model includes malicious poll participants, remote guessing or replay attempts, and an operator with access to the host or data directory. The prototype aims to require a demo session and current TOTP, reject repeat demo-account votes, detect inconsistent chain links, and protect authenticator seeds at rest while the key remains secret. It provides no independent authority, validator network, electoral roll, or external audit.')
sub('B. What the cryptography establishes')
para('AES-256-GCM protects the persisted authenticator file if its local or configured BALLOT_KEY stays secret; losing the key can make records unusable. HMAC-SHA-256 creates a keyed, poll-specific duplicate marker but does not prevent server-side correlation. The random-nonce commitment binds the poll and option under SHA-256, but does not hide the selected option from the API, which updates server-side tallies.')
para('Each block includes the prior block hash, so changing a record without rebuilding the chain is detectable. An operator controlling the data can still rewrite the full chain absent an independent checkpoint. There are no peer nodes, consensus, smart contracts, or outside timestamping; consistent with NIST’s distributed-ledger definition, this is a local hash chain, not a blockchain [9].')
sub('C. Important non-goals and risks')
para('TOTP is not eligibility proof or coercion protection. The receipt reveals the choice and is transferable. The system lacks anonymous credentials, encrypted ballots, homomorphic tallying, zero-knowledge proofs, and independent tally verification. A compromised server can read choices, alter totals, suppress votes, or misreport status. File mode is single-instance; PostgreSQL mode serializes requests through one row and has one database failure domain. Neither mode provides a quorum, independent observers, or failover. Do not use it for confidential, binding, or public elections.')
para('There is also a usability/privacy tradeoff in the receipt model. The receipt’s nonce lets the holder recompute the commitment, but the receipt contains the selected option and is therefore revealing if copied or disclosed. If it is lost, the hash alone cannot recover the selection. A stronger remote-voting receipt should provide inclusion evidence without becoming transferable proof of vote choice, and its coercion and vote-selling risks would need explicit study.')
para('The API surface creates a further distinction between record privacy and count privacy. Commitment blocks do not contain the option identifier, but the election representation includes option-level counts, and the application server stores the underlying tally. A client can read interim totals through list/detail responses. A hash commitment only obscures information not already exposed through another route or side channel. These responses therefore weaken confidentiality of the aggregate outcome during an open poll even though the commitment string itself does not encode the choice.')
para('Integrity checking also has a limited reference point. The verifier recomputes block hashes from the current server-side state. If an operator rewrites the ballots, tallies, and entire chain consistently, no external signed checkpoint exists to contradict that history. The offline export verifier can catch internal inconsistencies after export but cannot establish that the export is complete or compare it with a trusted independent copy. A robust election design would publish a checkpoint to independently controlled observers and specify reconciliation and dispute procedures.')
para('An attacker analysis makes these limits concrete. A remote participant who guesses codes faces a temporary lockout after repeated failures, but a malicious participant can enroll multiple invented demo codes because the code namespace is not identity-bound. A person with a stolen authenticator seed can generate valid TOTP values; encryption at rest does not protect a seed already disclosed during enrollment or compromised on a device. A host administrator can inspect plaintext logical poll data and interim totals, or replace tally and ledger state together. A coercer can request the private receipt and see the selected option. None of these cases is prevented by linking commitment blocks. The controls address narrower events such as a repeated time-step code or an isolated edit that leaves an inconsistent chain.')
para('Ballot secrecy, receipt-freeness, and verifiability are separate goals. The commitment is hiding only while its nonce remains unknown and if the option space does not leak through other application data. The receipt intentionally provides the nonce and choice to its holder, so it is verifiable but transferable. A commitment lookup is individual evidence that a digest is represented; it is not end-to-end evidence that the voter’s intended choice was recorded and correctly included in a public tally. The prototype has no cast-as-intended challenge or publicly verifiable tally proof.')

sub('D. Threat-to-control assessment')
para('Table II summarizes which implemented control addresses each narrow threat and where the protection ends. The residual-risk column is part of the system result: several important voting requirements are intentionally unmet.')
p=doc.add_paragraph(); p.paragraph_format.space_after=Pt(2); p.paragraph_format.space_before=Pt(1)
r=p.add_run('TABLE II. THREATS, CONTROLS, AND RESIDUAL RISK'); r.bold=True; r.font.name='Times New Roman'; r.font.size=Pt(8); p.alignment=WD_ALIGN_PARAGRAPH.CENTER; p.paragraph_format.keep_with_next=True
rows2=[
    ('Threat / property', 'Implemented control', 'Residual risk'),
    ('OTP replay', 'Accepted time step stored per account.', 'Stolen seed/device; no identity proof.'),
    ('Repeat account vote', 'Poll-specific HMAC marker checked before tally.', 'A user can create multiple demo codes.'),
    ('Record modification', 'SHA-256 links between local blocks.', 'Host operator can rewrite full file/chain.'),
    ('Seed-file theft', 'AES-256-GCM encryption at rest.', 'Key compromise; choices/tallies are not encrypted.'),
    ('Coercion / vote selling', 'No dedicated control.', 'Receipt reveals choice; no revoting or deniability.'),
    ('Premature tally disclosure', 'Dedicated results route waits until completion.', 'List/detail routes still return live per-option counts.'),
]
t2=doc.add_table(rows=0, cols=3); t2.alignment=WD_TABLE_ALIGNMENT.CENTER; t2.autofit=False
for idx,row in enumerate(rows2):
    cells=t2.add_row().cells
    for j,txt in enumerate(row):
        cells[j].width=[Inches(1.0), Inches(1.22), Inches(1.08)][j]
        p=cells[j].paragraphs[0]; p.paragraph_format.space_after=Pt(1); p.paragraph_format.space_before=Pt(1); p.paragraph_format.line_spacing=1.0
        r=p.add_run(txt); r.font.name='Times New Roman'; r.font.size=Pt(8); r.bold=(idx==0)
        tcPr=cells[j]._tc.get_or_add_tcPr(); shd=OxmlElement('w:shd'); shd.set(qn('w:fill'), 'EAF0F6' if idx==0 else ('F7F8FA' if idx%2==1 else 'FFFFFF')); tcPr.append(shd)
        mar=OxmlElement('w:tcMar')
        for side,val in [('top','45'),('start','55'),('bottom','45'),('end','55')]:
            node=OxmlElement('w:'+side); node.set(qn('w:w'),val); node.set(qn('w:type'),'dxa'); mar.append(node)
        tcPr.append(mar)
    trPr=t2.rows[-1]._tr.get_or_add_trPr(); trPr.append(OxmlElement('w:cantSplit'))

heading('V. IMPLEMENTATION AND EVALUATION')
para('The UI supports poll browsing and creation, authenticator setup/sign-in, ballot selection, receipts, receipt checks, and post-close results. Fictional practice templates are clearly marked. Poll storage contains totals and ballot markers; the private receipt contains the choice and nonce.')
para('The backend also provides liveness and readiness endpoints. Readiness checks the persistent store and hash-chain integrity; failure prevents the application from treating votes, exports, or results as ready. JSON request size is limited to 16 KiB. Production headers include a content-security policy and related browser protections. Docker Compose runs the app as a non-root user, uses a read-only root filesystem, removes capabilities, and checks the readiness route. These are useful deployment safeguards for a demo service, but they do not make a compromised host or database trustworthy.')
para('The available development record includes a successful production build, backend syntax validation, local health/readiness responses, and rejection of demo-poll creation without a session. These checks confirm buildability, service startup, and one authorization boundary; they do not measure privacy, ballot correctness, resistance to a hostile host, or operational resilience. Table III separates observed checks from conclusions that cannot be drawn.')
rows3=[
    ('Check', 'Observed result', 'Interpretation'),
    ('Frontend production build', 'Build completed successfully.', 'Confirms assets compile; not security.'),
    ('Backend syntax', 'Node syntax check passed.', 'Confirms parse validity; not all paths.'),
    ('Health/readiness routes', 'Local endpoints returned HTTP 200.', 'Liveness/storage readiness only.'),
    ('Unauthenticated poll creation', 'Request rejected without session.', 'Confirms session gate on this route.'),
]
p=doc.add_paragraph(); p.paragraph_format.space_after=Pt(2); p.paragraph_format.space_before=Pt(1)
r=p.add_run('TABLE III. DEVELOPMENT VERIFICATION SUMMARY'); r.bold=True; r.font.name='Times New Roman'; r.font.size=Pt(8); p.alignment=WD_ALIGN_PARAGRAPH.CENTER; p.paragraph_format.keep_with_next=True
t3=doc.add_table(rows=0, cols=3); t3.alignment=WD_TABLE_ALIGNMENT.CENTER; t3.autofit=False
for idx,row in enumerate(rows3):
    cells=t3.add_row().cells
    for j,txt in enumerate(row):
        cells[j].width=[Inches(1.02), Inches(1.05), Inches(1.23)][j]
        p=cells[j].paragraphs[0]; p.paragraph_format.space_after=Pt(1); p.paragraph_format.space_before=Pt(1); p.paragraph_format.line_spacing=1.0
        r=p.add_run(txt); r.font.name='Times New Roman'; r.font.size=Pt(8); r.bold=(idx==0)
        tcPr=cells[j]._tc.get_or_add_tcPr(); shd=OxmlElement('w:shd'); shd.set(qn('w:fill'), 'EAF0F6' if idx==0 else ('F7F8FA' if idx%2==1 else 'FFFFFF')); tcPr.append(shd)
        mar=OxmlElement('w:tcMar')
        for side,val in [('top','45'),('start','55'),('bottom','45'),('end','55')]:
            node=OxmlElement('w:'+side); node.set(qn('w:w'),val); node.set(qn('w:type'),'dxa'); mar.append(node)
        tcPr.append(mar)
    trPr=t3.rows[-1]._tr.get_or_add_trPr(); trPr.append(OxmlElement('w:cantSplit'))
para('No benchmark, user study, accessibility audit, penetration test, independent review, or election simulation was conducted. A reproducible security evaluation would need defined adversaries, controlled datasets, independent observers, and separately measured usability, availability, and tally correctness.')
sub('A. Evaluation scope and reproducibility')
para('The evidence reported here is deliberately narrow. A production build demonstrates that the frontend bundle can be generated in the recorded environment. Source tracing establishes that the handlers contain a session gate on poll creation, require an active poll and a current TOTP for voting, maintain a poll-specific duplicate marker, and use a chain-integrity check before accepting votes and serving selected verification routes. This is implementation evidence, not evidence that every input, concurrency interleaving, browser, network, operating system, or deployment behaves correctly.')
para('The code-guided assessment used a traceability lens: each screen action was mapped to its route, each route to its persistent fields, and each security statement to the specific field or check that supports it. For example, the enrollment QR maps to an account seed and TOTP verifier; duplicate rejection maps to the keyed poll/account marker; receipt verification maps to commitment lookup and block-hash recomputation; and the tally view maps to per-option counts in the election serializer. Inspecting list/detail serializers alongside the result handler is what exposed the interim count behavior.')
para('A reproducible follow-up should record the exact commit identifier, Node.js and PostgreSQL versions, operating system, dependency lockfile, environment-variable names (never their secret values), and build command. It should seed synthetic accounts and polls, then exercise enrollment, successful and repeated OTPs, expired sessions, duplicate votes, poll boundaries, malformed requests, process restarts, concurrent vote attempts, database outages, backup verification, and restore into an isolated database. Results should include request counts, acceptance/rejection outcomes, latency distributions, storage growth, and recovery observations. No such benchmark values are claimed in this paper.')
sub('B. Property-to-evidence mapping')
para('It is useful to distinguish a feature label from a security property. “Authenticator protected” maps to possession of an enrolled secret plus session state, not identity. “One vote” maps to one accepted marker per demo identifier and poll, not a unique human. “Receipt verified” maps to commitment lookup and internal chain consistency, not correctness of the submitted choice or inclusion in the final count. “Tamper evident” maps to detecting an inconsistent current chain relative to its own stored history, not preventing a privileged full rewrite. This property-to-evidence mapping is the principal evaluation result of the code review.')
para('A future quantitative evaluation would need a benchmark harness with controlled concurrency and repeated runs, reporting median and tail latency, throughput, failure rate, database lock wait, and memory/storage use across poll sizes. Privacy assessment should separately inspect every serialized API field, browser state, logs, backups, and database snapshots. Formal protocol claims require a threat model and proof; operational claims require a controlled deployment and independent observers. The current app has not been evaluated by those methods.')
para('The code-guided assessment does not establish usability. A later study should ask participants to enroll an authenticator, identify a fictional poll, cast a choice, preserve the receipt, and explain what the receipt and ledger result mean. Researchers could measure completion time, error recovery, misinterpretation of the security language, assistive-technology compatibility, and performance across Indian language settings. Such a study should use fictional data, informed participation, and an approved protocol. Without this evidence, claims about simplicity or accessibility should remain design intent rather than measured findings.')
sub('C. Failure cases and expected behavior')
para('Several routine failure cases can be described from the implementation without implying that they have been exhaustively tested. If the authenticator code is malformed, outside the accepted time window, or repeats an already consumed step, the vote is rejected before tally mutation. If the poll is unknown or the option does not belong to it, the server rejects the request. A second accepted marker for the same demo account and poll is rejected. If the local chain is inconsistent, readiness fails and the vote, export, and results paths withhold a success response. If the key is lost or changed, encrypted records may be undecryptable and keyed markers will no longer be reproducible; the correct operational response is a key-preserving restore, not a new key paired with old data.')
para('Database-mode failures require particular care. The serialized state document and initialization marker are intentionally designed to prevent a missing row from silently triggering an import of old local files. Operators must restore a verified PostgreSQL backup and the matching key, then review the restored instance before switching traffic. The documented restore workflow creates a separately named database and leaves the final switch to the operator. This manual step reduces accidental replacement risk but is not equivalent to tested high availability or point-in-time recovery.')

heading('VI. LIMITATIONS AND FUTURE WORK')
para('Jana Vani demonstrates session confirmation, duplicate markers, commitment receipts, and local tamper evidence; it does not provide voter registration, one-person-one-vote assurance, ballot secrecy, distributed consensus, or an independent tally. The 2025–2026 proposals [1]–[5] address stronger properties but require full protocol design, review, governance, and legal authorization.')
para('Safe prototype extensions include organizer roles, multilingual accessibility, data-retention controls, backups, key rotation, and independent review. Public-election research would additionally require an authorized authority, formal threat model, verifiable tally, independent cryptographic assessment, and controlled pilot. These are future requirements, not existing features.')
para('Immediate prototype maintenance should address live tally exposure in list and detail responses, strengthen role boundaries for organizers, and make data retention and account lifecycle explicit. Additional work should measure backup restoration, key rotation, database recovery, accessibility, and concurrent vote handling. Privacy-preserving tallying would require a redesigned protocol rather than adding a blockchain label: encrypted ballots, eligibility credentials separated from vote records, robust duplicate-vote nullifiers, publicly auditable proofs, and independent key custody would all need coherent integration and formal analysis.')
para('The Indian public-election setting adds governance and legal requirements beyond software. ECI materials describe the official EVM/VVPAT polling process, and constitutional provisions assign Panchayat and Municipal election responsibilities to State Election Commissions [10], [11]. Any study intended to support such an election would require the authority responsible for that election, legal review, accessibility and language planning, physical and procedural controls, independent certification, incident response, audit trails, and a field-tested paper-compatible recovery plan. A community-poll prototype cannot substitute for these institutions or procedures.')
para('A practical research roadmap should proceed in stages. First, fix the information disclosure and document a data inventory. Second, establish organizer permissions, retention rules, export policy, and key lifecycle with independent review. Third, define measurable properties and adversaries before selecting cryptographic primitives; for example, distinguish individual ballot secrecy, eligibility, uniqueness, cast-as-intended, recorded-as-cast, and tallied-as-recorded. Fourth, prototype the redesigned protocol with synthetic data and publish a reproducible benchmark and audit evidence. Only after an authorized election authority requests such work could a regulated pilot be considered. Each stage has a stop condition: if a required property cannot be established by design and independent evidence, the system must remain a non-binding poll tool.')

heading('VII. CONCLUSION')
p=para('Following a vote through the code makes the prototype’s strengths and limits clear. TOTP confirmation, a keyed repeat-vote marker, a random-nonce commitment, and linked records provide useful demonstrations for community-poll software. The same walkthrough shows what is missing for public elections: identity and eligibility checks, ballot secrecy from the server, independent tally verification, and distributed oversight. Jana Vani is a learning prototype, not an official Indian voting platform, and must not be used to cast public-election ballots.')
p.paragraph_format.keep_together=True

heading('DATA AVAILABILITY AND DISCLOSURES')
para('The study uses source-code inspection and synthetic demo accounts; no real voter records or human-participant data were collected. The implementation is held in the project workspace; a stable public repository URL or archival DOI was not supplied and should be added by the authors if the venue requires it. Funding and conflict-of-interest statements must be completed by the submitting authors according to the target venue’s policy. Author names, affiliations, and contact details must likewise be supplied and verified before submission.', indent=False)

heading('REFERENCES')
refs = [
'[1] N. D. Sarier, “Efficient, usable and coercion-resistant blockchain-based e-voting,” Journal of Information Security and Applications, vol. 92, Art. no. 104074, 2025, doi: 10.1016/j.jisa.2025.104074.',
'[2] Q. Zheng, J. Ye, P. Li, and J. Lai, “Secure and editable: A blockchain voting system based on chameleon hash with ephemeral trapdoors,” IET Information Security, vol. 2025, no. 1, Art. no. 3915638, 2025, doi: 10.1049/ise2/3915638.',
'[3] M. Chaira, H. Cherroun, and S. Aouag, “An efficient and secure privacy-preserving e-voting system with blockchain, homomorphic encryption, and ZKP,” International Journal of Computers and Applications, vol. 47, no. 9, pp. 819–833, 2025, doi: 10.1080/1206212X.2025.2535679.',
'[4] T. Kraavi and J. Willemson, “Proving vote correctness in the IVXV internet voting system,” Scientific Reports, vol. 15, Art. no. 31793, 2025, doi: 10.1038/s41598-025-16764-1.',
'[5] J. Solanki and D. Meva, “A hybrid cryptographic blockchain framework using Hyperledger Fabric and zero knowledge proofs for secure and verifiable electronic voting,” Discover Internet of Things, vol. 6, Art. no. 159, 2026, doi: 10.1007/s43926-026-00471-y.',
'[6] E. Alsuwat, “Secure electronic voting system based on blockchain with dilithium authentication and zero-knowledge proof verification,” Scientific Reports, vol. 16, Art. no. 34189, 2026, doi: 10.1038/s41598-026-62925-1.',
'[7] O. Revelo Sánchez, A. Barón Salazar, and M. Bolaños González, “Democratic innovation: Systematic evaluation of blockchain-based electronic voting (2022–2025),” Technologies, vol. 14, no. 2, Art. no. 95, 2026, doi: 10.3390/technologies14020095.',
'[8] D. M’Raihi, S. Machani, M. Pei, and J. Rydell, “TOTP: Time-Based One-Time Password Algorithm,” RFC 6238, Internet Engineering Task Force, May 2011, doi: 10.17487/RFC6238.',
'[9] D. Yaga, P. Mell, N. Roby, and K. Scarfone, Blockchain Technology Overview, NIST Interagency/Internal Report 8202, Oct. 2018, doi: 10.6028/NIST.IR.8202.',
'[10] Government of India, The Constitution of India, arts. 243K and 243ZA, as amended. [Online]. Available: https://www.legislative.gov.in/static/uploads/2025/07/88cca69e868e50b217f855be2fb8bdba.pdf. Accessed: Nov. 13, 2026.',
'[11] Election Commission of India, “EVM FAQs” and “EVM-VVPAT.” [Online]. Available: https://www.eci.gov.in/evm-faqs/ and https://www.eci.gov.in/evm-vvpat. Accessed: Nov. 13, 2026.'
]
for i,ref in enumerate(refs):
    p=doc.add_paragraph(); p.paragraph_format.left_indent=Inches(.13); p.paragraph_format.first_line_indent=Inches(-.13); p.paragraph_format.space_after=Pt(2); p.paragraph_format.line_spacing=1.0; p.paragraph_format.keep_together=True
    r=p.add_run(ref); r.font.name='Times New Roman'; r.font.size=Pt(8.6)

# Terminate the two-column paper section explicitly so Word balances the last page.
tail_section=doc.add_section(WD_SECTION_START.CONTINUOUS)
tail_cols=tail_section._sectPr.xpath('./w:cols')[0]
tail_cols.set(qn('w:num'), '1')

# Keep title block together and set metadata
props=doc.core_properties
props.title='Jana Vani A TOTP Enabled Community Voting Prototype With Commitment Receipts and a Local Hash Chain'
props.subject='IEEE-style implementation study and related work review from 2025 to 2026'
props.author='[Author Name]'
props.keywords='Jana Vani, community voting, TOTP, hash chain, e-voting, India'

# Table font and paragraph widow control
for p in doc.paragraphs:
    pPr=p._p.get_or_add_pPr(); wc=OxmlElement('w:widowControl'); pPr.append(wc)

OUT.parent.mkdir(parents=True, exist_ok=True)
doc.save(OUT)
print(OUT)
