import { Link } from "react-router-dom";
import { BrandLockup } from "@/components/BrandLockup";

export function SiteFooter() {
  return <footer className="mt-auto border-t border-border/70 bg-white">
    <div className="mx-auto grid max-w-7xl gap-5 px-5 py-6 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-center">
      <div className="space-y-2">
        <BrandLockup />
        <p className="max-w-3xl text-xs leading-5 text-muted-foreground">Jana Vani is an independent community poll demo. It isn’t affiliated with the Election Commission of India or any State Election Commission, and it can’t cast official votes.</p>
      </div>
      <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-primary">
        <Link to="/about" className="hover:underline">About</Link><Link to="/how-it-works" className="hover:underline">How it works</Link><Link to="/security" className="hover:underline">Security</Link><Link to="/help" className="hover:underline">Help & contact</Link><Link to="/india-elections" className="hover:underline">Official election links</Link>
      </nav>
    </div>
  </footer>;
}
