import { Info, MessageCircle, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { InfoCard, InfoShell } from "@/components/InfoShell";

export default function About() {
  return <InfoShell eyebrow="About Jana Vani" title="A small space for community decisions" description="Jana Vani is a learning and demonstration project for creating non-binding polls in groups such as residents’ associations, student councils, clubs and community organisations.">
    <div className="grid gap-5 md:grid-cols-3">
      <InfoCard icon={<Info className="h-5 w-5"/>} title="What it can do">Create a poll, invite demo participants, record a response and review combined results after the poll closes.</InfoCard>
      <InfoCard icon={<ShieldCheck className="h-5 w-5"/>} title="What it cannot do" tone="green">It does not check voter eligibility, connect to electoral rolls or submit a vote in an Indian public election. Demo security features are not a certification.</InfoCard>
      <InfoCard icon={<MessageCircle className="h-5 w-5"/>} title="Questions or feedback" tone="navy">For help using the demo, visit the <Link className="font-semibold text-primary underline" to="/help">Help page</Link>. This project does not publish a support email address.</InfoCard>
    </div>
    <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">For official voter services, election schedules and results, use the links provided by the relevant Election Commission on our <Link className="font-semibold underline" to="/india-elections">India elections page</Link>.</p>
  </InfoShell>;
}
