import { Link } from "react-router-dom";
import { AlertTriangle, Clock3, KeyRound, LockKeyhole, ShieldCheck, Vote, Hash } from "lucide-react";
import { InfoCard, InfoShell } from "@/components/InfoShell";

export default function Security() {
  return (
    <InfoShell eyebrow="Security and privacy" title="What this demo protects" description="Here’s what Jana Vani does to protect demo accounts and poll receipts, and where those protections stop. This is not a guarantee of election security.">
      <div className="grid gap-4 md:grid-cols-2">
        <InfoCard icon={<ShieldCheck className="h-5 w-5" />} title="What the demo does" tone="green">
          <ul className="space-y-3">
            <li className="flex gap-2"><CheckMark /> Codes in your authenticator app change every 30 seconds. The server allows a small difference between your phone’s clock and its own.</li>
            <li className="flex gap-2"><CheckMark /> Each valid code can be used only once for sign-in or to confirm a poll response.</li>
            <li className="flex gap-2"><CheckMark /> Five incorrect codes temporarily pause sign-in for that demo code and network address.</li>
            <li className="flex gap-2"><CheckMark /> The server limits how often someone can request authenticator setup.</li>
            <li className="flex gap-2"><CheckMark /> Sign-in uses a random, server-issued cookie that JavaScript can’t read and that expires after eight hours.</li>
            <li className="flex gap-2"><CheckMark /> Session tokens are stored as hashes. Session and rate-limit data is encrypted on disk and remains after a restart.</li>
            <li className="flex gap-2"><CheckMark /> Your browser doesn’t save the authenticator secret or sign-in token in local storage.</li>
            <li className="flex gap-2"><CheckMark /> Each response needs a fresh six-digit code. A demo account can respond once to each poll.</li>
            <li className="flex gap-2"><CheckMark /> A random secret is combined with the poll and choice to create a SHA-256 commitment. Only that commitment is added to the local hash chain.</li>
            <li className="flex gap-2"><CheckMark /> Poll totals are stored separately from the commitment entries.</li>
            <li className="flex gap-2"><CheckMark /> You can download the ledger and check its included links with the project’s offline verifier.</li>
            <li className="flex gap-2"><CheckMark /> The app checks the chain and receipt links. If it finds a mismatch, it pauses new responses and hides results.</li>
          </ul>
        </InfoCard>
        <InfoCard icon={<AlertTriangle className="h-5 w-5" />} title="What it doesn’t protect against" tone="saffron">
          <ul className="space-y-3">
            <li className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#bd6415]" /> Anyone can make a demo code. It isn’t checked against the voter register, so don’t enter your voter ID, Aadhaar number or phone number.</li>
            <li className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#bd6415]" /> The local-file setup allows only one server. The Docker setup uses one database and has no automatic backup failover.</li>
            <li className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#bd6415]" /> Poll data and totals live on this server. The hash chain is a local record, not a decentralized blockchain.</li>
            <li className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#bd6415]" /> There are no organizer roles, voter-register checks, independent audits or election-grade anonymous ballots.</li>
            <li className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#bd6415]" /> The receipt screen hides your choice at first. The full receipt includes it, so anyone who gets that file can see your selection.</li>
          </ul>
        </InfoCard>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <InfoCard icon={<KeyRound className="h-5 w-5" />} title="Google Authenticator" tone="navy">The QR code connects your demo account to Google Authenticator or another compatible app. You’ll need a current code to sign in and confirm a response.</InfoCard>
        <InfoCard icon={<Hash className="h-5 w-5" />} title="Your private receipt" tone="green">The full receipt contains your choice and a random secret. You can use them to check the commitment. Keep the file private: the hidden-by-default display doesn’t stop someone with the full receipt from seeing your choice.</InfoCard>
        <InfoCard icon={<LockKeyhole className="h-5 w-5" />} title="The local hash chain" tone="navy">Each entry links to the one before it, and you can check the exported links offline. But without a checkpoint shared elsewhere, someone who changes or removes part of this server’s record may not be detected. The chain doesn’t independently verify poll totals.</InfoCard>
        <InfoCard icon={<Vote className="h-5 w-5" />} title="Community polls only" tone="saffron">Jana Vani is for non-binding community polls and demonstrations. It can’t verify real voters or run an official election.</InfoCard>
      </div>

      <p className="mt-4 rounded-xl border border-[#e6d2b8] bg-[#fff8ef] px-5 py-4 text-sm leading-6 text-foreground">Jana Vani doesn’t collect Aadhaar numbers or send text messages. Aadhaar authentication and bulk SMS have separate approval and setup requirements. <a className="font-semibold text-primary underline underline-offset-4" href="https://uidai.gov.in/en/authentication-documents" target="_blank" rel="noreferrer">Read UIDAI’s guidance</a> · <a className="font-semibold text-primary underline underline-offset-4" href="https://www.trai.gov.in/advice-to-senders" target="_blank" rel="noreferrer">Read TRAI’s guidance</a></p>

      <p className="mt-7 rounded-xl border border-border bg-white px-5 py-4 text-sm leading-6 text-muted-foreground"><Clock3 className="mr-2 inline h-4 w-4 text-primary" />A real election system needs verified voter registration, secure operations, account recovery, independent security reviews and approval under the relevant election rules. <Link className="font-semibold text-primary underline underline-offset-4" to="/help">Visit the help page</Link> for more answers.</p>
    </InfoShell>
  );
}

function CheckMark() {
  return <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#18864b]" />;
}
