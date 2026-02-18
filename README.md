# JANA-VANI: Secure Electronic Voting System

JANA-VANI is a blockchain-based secure voting platform designed for transparent, tamper-proof elections. It integrates voter ID validation, Aadhaar authentication, and captcha protection to ensure integrity and prevent fraud. Built with modern web technologies, it supports seamless user experience while maintaining voter privacy.

## Features

- **Voter ID Validation**: Pre-voting authentication using unique 10-character alphanumeric Voter IDs to ensure only eligible voters participate.
- **Captcha Protection**: Integrated captcha for new voter registrations to prevent bot attacks and automated abuse.
- **Aadhaar Integration**: Secure linking of Voter IDs with Aadhaar database for identity verification without storing personal data.
- **Pre-Voting Verification**: Multi-step process including Voter ID check, Aadhaar linkage (for new voters), and already-voted detection before accessing the ballot.
- **Blockchain Voting**: Votes are recorded on an immutable blockchain for transparency and auditability.
- **SMS Notifications**: Real-time alerts via AWS SNS for verification codes and voting confirmations.
- **Duplicate Prevention**: Ensures one-time voting per Voter ID.
- **Already Voted Detection**: Clear messaging and blocking for voters who have already cast their ballot.
- **Cryptographic Hashing**: Deterministic SHA-256 hashing of vote data for verifiable receipts without revealing choices.
- **Merkle Tree Verification**: Efficient proofs for batch vote validation and integrity checks.

## Voter ID Validation System

The Voter ID validation is the core security layer of JANA-VANI, ensuring only verified users can vote.

### Pre-Voting Authentication
- Users must enter a 10-character alphanumeric Voter ID (e.g., ABC1234567) before accessing candidate selection.
- System checks if the Voter ID is valid, linked to Aadhaar, and not already used for voting.

### Aadhaar Integration
- For new voters, Voter ID is securely linked to Aadhaar via API calls.
- No personal data is stored; only verification status is recorded.

### Captcha Protection
- During new voter registration or linkage, a captcha challenge prevents automated scripts.

### Duplicate Prevention
- Each Voter ID can only be used once for voting, enforced via database and blockchain checks.

### Already Voted Detection
- If a Voter ID has already voted, users see a message: "You have already cast your vote. Thank you for participating!"

### Blockchain Verification
- Voter ID validations are hashed and stored on the blockchain for immutable records and post-election audits.

## Cryptographic & Blockchain Verification

JANA-VANI uses advanced cryptography and blockchain for secure, verifiable voting.

### Cryptographic Hashing
- **Deterministic Vote Hashing**: Votes are canonicalized (sorted keys for objects) and hashed using SHA-256 to create unique, non-reversible receipts. This allows voters to verify their vote was recorded without revealing the choice.
  - Example: `hash = SHA256(canonicalize({voterId: "ABC1234567", candidateId: "1", timestamp: 1234567890}))`
- **Salt & Randomness**: Random hex salts added for session security where needed.

### Merkle Trees
- **Vote Aggregation**: Individual vote hashes are leaves in a Merkle tree. The root provides a compact commitment to all votes.
- **Proof Generation & Verification**: For any vote, a Merkle proof (sibling hashes and positions) allows efficient verification against the root without revealing other votes.
  - `verifyMerkleProof(leafHash, proof, root)` confirms inclusion.
- **Use Case**: Post-election audits can verify specific votes belong to the official tally.

### Blockchain Integration
- **Smart Contract (Voting.sol)**: Deployed on Ethereum-compatible chain (local Hardhat for dev).
  - Stores vote hashes and Voter IDs: `castVote(bytes32 voteHash, bytes32 voterId)`
  - Validates: Voter ID must be pre-added and not used.
  - Events: `VoteCast(address voter, bytes32 voteHash, bytes32 voterId)` for transparency.
- **Ethers.js Client**: Backend connects via JsonRpcProvider to local node (http://127.0.0.1:8545).
  - Signs and sends transactions with a wallet (mock private key).
  - Retrieves receipts for confirmation.
- **Flow**: Hash vote → Add Voter ID to contract → Cast on-chain → Store txHash in DB for verification.
- **Immutability**: Once on-chain, votes cannot be altered; totalVotes counter provides aggregate verification.

## Usage Guide

### 3-Step Voting Process

1. **Voter ID Verification**:
   - Enter your 10-character Voter ID.
   - System validates format and checks status (linked, new, already voted).

2. **Aadhaar Authentication (for New Voters)**:
   - If unlinked, provide Aadhaar details for secure verification.
   - Complete captcha to confirm humanity.
   - Receive SMS OTP for final linkage.

3. **Casting a Vote**:
   - After verification, select your candidate.
   - Vote is hashed, submitted to blockchain, and confirmed.
   - Receive hash receipt and txHash for personal verification.

To run the project locally:

```sh
git clone <YOUR_GIT_URL>
cd ballot-vault-protocol
npm install
# Install backend deps
cd backend && npm install && cd ..
# Install blockchain deps
cd blockchain && npm install && npx hardhat compile && cd ..
# Start blockchain node
cd blockchain && npx hardhat node & cd ..
# Start backend
cd backend && npm start & cd ..
npm run dev  # Frontend
```

**Note**: Add test Voter IDs to contract via owner wallet. Install ethers: `cd backend && npm i ethers`

## API Documentation

The backend API handles authentication, voting, and verification.

### Endpoints

- **GET /api/check-voter**
  - Check voter status by Voter ID.
  - Request: `?voterId=ABC1234567`
  - Response: `{ "status": "valid_linked" | "new" | "already_voted" | "invalid" }`

- **POST /api/link-voter-aadhaar**
  - Link Voter ID with Aadhaar.
  - Request: `{ "voterId": "ABC1234567", "aadhaarNumber": "123456789012", "captcha": "solution" }`
  - Response: `{ "success": true, "message": "Linked successfully" }`

- **POST /api/vote/cast**
  - Cast a vote (updated with Voter ID parameter).
  - Request: `{ "voterId": "ABC1234567", "candidateId": "1" }`
  - Response: `{ "success": true, "receipt": "0xabc...", "txHash": "0xdef..." }`

- **POST /api/aadhaar/initiate**
  - Send OTP to Aadhaar.
  - Request: `{ "aadhaarNumber": "123456789012" }`
  - Response: `{ "success": true, "message": "OTP sent" }`

- **POST /api/aadhaar/verify**
  - Verify OTP.
  - Request: `{ "aadhaarNumber": "123456789012", "otp": "123456" }`
  - Response: `{ "success": true, "message": "Verified" }`

- **GET /api/vote/verify/:hash**
  - Verify vote hash (DB + blockchain check).
  - Response: `{ "success": true, "vote": { "candidateId": "1", "date": "..." }, "blockchainVerified": true }`

All endpoints use JSON and require HTTPS in production.

## Testing

### Pre-configured Test Voter IDs

- **Valid Linked**: ABC1234567, XYZ9876543, VOTER0001, VOTER0002, VOTER0003
- **New Voters**: Any 10-character alphanumeric ID (e.g., TESTVOTER01)
- **Invalid**: Wrong format (e.g., ABC, 1234567890A)

### Test Scenarios

- **Already Voted**: Use ABC1234567 after simulating a vote → Expect "already_voted" status.
- **Valid Linked**: Use XYZ9876543 → Proceeds to voting.
- **New Voter**: Use TESTVOTER01 → Prompts for Aadhaar linkage and captcha.
- **Invalid Format**: Use INVALID → Returns error.
- **Blockchain Verification**: After vote, check /api/vote/verify/:hash for tx confirmation.
- **Merkle Proof**: Manually test utils/merkle.js with sample leaves.

Run tests:
- Frontend: `npm run test` (if configured).
- Backend: `cd backend && npm test`.
- Blockchain: `cd blockchain && npx hardhat test`.

## Security Features

- **Voter ID Privacy**: Validation performed without storing full personal data; only hashes are retained.
- **Captcha Security**: Mock reCAPTCHA integration for bot prevention during sensitive operations.
- **Enhanced Privacy Protection**: End-to-end encryption for votes, Aadhaar verification via secure APIs, and no logs of personal info.
- **Cryptographic Security**: SHA-256 for hashes, canonicalization prevents malleability attacks.
- **Blockchain Immutability**: All votes and validations are tamper-proof via smart contract.
- **Merkle Proofs**: Scalable verification without full disclosure.
- **SMS Security**: OTPs sent via AWS SNS with rate limiting.

## Technologies Used

This project is built with:

- **Frontend**: Vite, TypeScript, React, shadcn-ui, Tailwind CSS, Axios
- **Backend**: Node.js, Express, MongoDB (via Mongoose models), Crypto (built-in)
- **Blockchain**: Hardhat, Solidity (Voting.sol contract), Ethereum-compatible, Ethers.js
- **Integrations**: AWS SNS for SMS, Aadhaar API (mocked for testing)
- **Security**: Crypto utilities (SHA-256 hashing), Merkle trees for vote aggregation, Ethers for tx signing
- **Tools**: ESLint, PostCSS

## Documentation Highlights

- **Complete User Flow**: Step-by-step from Voter ID entry to vote confirmation.
- **API Reference**: All endpoints with examples above.
- **Testing Guide**: Specific scenarios and test data provided.
- **Security Overview**: Privacy-focused validation layers.
- **Architecture Details**: Frontend handles UI/UX, backend manages API/verification/hash gen, blockchain ensures integrity via contracts.

For contributions, see CONTRIBUTING.md (create if needed). Report issues via GitHub.

🗳️ Powered by Blockchain for Fair Elections!
