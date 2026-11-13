# Jana Vani user guide

Jana Vani is a demonstration app for non-binding polls in small groups. It is not operated by the Election Commission of India (ECI) or a State Election Commission (SEC), and it cannot accept or verify public-election votes. Use only fictional demo codes and non-sensitive poll choices.

## Sign in and set up Google Authenticator

1. Open the app and choose the demo sign-in flow.
2. Enter a made-up code in the format `DEMO` followed by six letters or digits (for example, `DEMO000001`). Never enter an Aadhaar number, EPIC/Voter ID, mobile number, or another personal identifier.
3. For a new account, scan the displayed QR code with Google Authenticator, then enter its current six-digit code. Save the setup secret only where you can protect it. Anyone who has the secret can generate codes for that demo account.
4. The app creates a session after a valid code. Sessions expire after eight hours; sign out to end yours sooner.

The account is self-claimed. It is not checked against a person, electoral roll, or government identity database. A local development-only authenticator reset exists for recovery during a demo; it is disabled in production.

## Create a community poll

Choose **Create a poll**, provide a title, optional description, type, at least two options, and opening and closing times. Titles are limited to 100 characters, descriptions to 500, option names to 80, and polls to 20 options. The close time must follow the opening time and be in the future when the poll is created. Dates are presented in India Standard Time. A signed-in account can create up to ten polls per hour under the current per-account/IP limit.

The poll creator can close their own poll early. There are no separate organizer, moderator, or election-official roles. A user who creates a poll is not thereby authorized to conduct a legally binding election.

## Vote and keep the receipt private

While a poll is open, select one option and enter the current authenticator code. The server checks the session, poll status, option, account's previous participation, and single-use TOTP step before accepting a ballot. A demo account can vote once in each poll. This is one vote per made-up account, not one vote per person.

After acceptance, the app shows a confirmation and private receipt. The receipt includes the selected option and a random secret used to recompute its SHA-256 commitment. Keep it private: sharing it reveals the choice and could make it usable as proof to another person. The hash by itself cannot reveal or recover the selected option.

The receipt lookup checks that the commitment exists in the app's local ledger and that the stored hash links currently validate. It does not prove that the server counted the choice, included every accepted ballot, or used a valid voter list.

## Results and ledger export

The results endpoint withholds the result response until a poll is completed. The current election listing and detail responses also include each option's vote count before closure; therefore, live choices/tallies are visible to users who can inspect those responses. Do not use this prototype for a poll where live tally secrecy matters. This behavior is documented as a known privacy limitation.

The ledger export contains poll labels and commitment blocks, not receipt secrets or demo-account nullifiers. `npm run verify:ledger -- <export-file>` checks the export's internal block links and contents. A valid export cannot prove it is complete, independently establish eligibility, or verify the tally.

## What the app does not do

- It does not issue or transmit SMS codes and does not collect or verify Aadhaar, EPIC/Voter ID, or mobile numbers.
- It does not connect to ECI or SEC systems, official electoral rolls, EVMs, or VVPAT.
- It does not provide ballot encryption from the server, anonymous credentials, coercion resistance, decentralized consensus, or an independently verified tally.
- It is not an official or legally binding voting service. For official voter services, use [ECI Voters' Service Portal](https://voters.eci.gov.in/) and the appropriate election authority.
