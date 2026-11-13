import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { BrandLockup } from "@/components/BrandLockup";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/SiteFooter";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background">
      <div className="h-1 tricolor-rule" />
      <header className="civic-header border-b">
        <div className="container mx-auto px-4 py-3.5">
          <Link to="/" aria-label="Jana Vani home" className="inline-flex rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
            <BrandLockup />
          </Link>
        </div>
      </header>
      <main className="mx-auto grid min-h-[70vh] max-w-2xl place-items-center px-5 py-12">
        <section className="w-full rounded-2xl border border-border/70 bg-white p-8 text-center shadow-sm sm:p-12">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#bd6415]">404 · Page not found</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">We couldn’t find that page.</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">The link may be out of date, or the page may have moved. Head back to Jana Vani and try again.</p>
          <Button asChild className="mt-7">
            <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Jana Vani</Link>
          </Button>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
};

export default NotFound;
