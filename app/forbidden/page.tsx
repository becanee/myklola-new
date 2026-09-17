import { NotFoundTerminal } from "@/components/motion/not-found/terminal";

export default function Page() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <NotFoundTerminal
          title="Access Denied"
          description="Sorry, you don't have the necessary permissions to view this content"
          homeHref="/"
          homeLabel="Back home"
          browseHref="/#features"
          browseLabel="See capabilities"
        />
      </main>
    </div>
  );
}
