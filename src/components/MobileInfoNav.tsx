import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";

/** Keeps the site’s information pages reachable on phones and tablets. */
export function MobileInfoNav() {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-t border-white/10 px-5 py-2 lg:hidden sm:px-8">
      <button type="button" aria-expanded={open} aria-controls="mobile-info-menu" onClick={() => setOpen((value) => !value)} className="civic-nav flex min-h-10 w-full items-center justify-between text-sm font-semibold">
        Explore Jana Vani <ChevronDown aria-hidden="true" className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <nav id="mobile-info-menu" aria-label="More pages" className="grid grid-cols-2 gap-2 pb-2 pt-1 text-sm font-semibold">
        <Link onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 hover:bg-white/10" to="/about">About</Link>
        <Link onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 hover:bg-white/10" to="/how-it-works">How it works</Link>
        <Link onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 hover:bg-white/10" to="/india-elections">India elections</Link>
        <Link onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 hover:bg-white/10" to="/security">Security</Link>
        <Link onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 hover:bg-white/10" to="/help">Help & contact</Link>
      </nav>}
    </div>
  );
}
