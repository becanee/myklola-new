import { Navigation } from '@/components/landing/navigation';
import { FooterSection } from '@/components/landing/footer-section';
import { DemoForm } from './demo-form';

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navigation />

      {/* Spacer for fixed nav */}
      <div className="h-24 sm:h-28" />

      <main>
        {/* Page header */}
        <section className="max-w-3xl mx-auto px-6 pt-12 pb-2 lg:pt-16">
          <p className="font-mono text-sm text-muted-foreground">Klola — Product demo</p>
          <h1 className="mt-3 text-4xl sm:text-5xl font-instrument tracking-tight text-foreground">
            Request a demo
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground max-w-2xl">
            Schedule a personalized walkthrough with our team. We&apos;ll tailor the session to your
            team&apos;s needs and show you exactly how Klola fits your workflow.
          </p>
        </section>

        {/* Form */}
        <section className="max-w-3xl mx-auto px-6 pt-10 pb-24">
          <DemoForm />
        </section>
      </main>

      <FooterSection />
    </div>
  );
}
