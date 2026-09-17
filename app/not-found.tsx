import { NotFoundTerminal } from "@/components/motion/not-found/terminal";
import { Navigation } from "@/components/landing/navigation";
import { FooterSection } from "@/components/landing/footer-section";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <NotFoundTerminal
          title="Page not found"
          description="The page you are looking for moved, vanished, or never existed. Let's get you back on track."
          homeHref="/"
          homeLabel="Back home"
          browseHref="/#features"
          browseLabel="See capabilities"
        />
      </main>
    </div>
  );
}
