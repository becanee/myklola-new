import { FeaturesSection } from "@/components/landing/features-section";
import { FooterSection } from "@/components/landing/footer-section";
import { HeroSection } from "@/components/landing/hero-section";
import { Navigation } from "@/components/landing/navigation";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Portal — Klola Indonesia',
  description: 'Hub terpadu Klola Indonesia untuk eksplorasi demo produk, pelaporan tiket dukungan, dan koneksi langsung ke tim support.',
};

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-x-hidden noise-overlay">
      <Navigation />
      <HeroSection />
      <FeaturesSection />
      {/* <HowItWorksSection />
      <InfrastructureSection />
      <MetricsSection />
      <IntegrationsSection />
      <SecuritySection />
      <DevelopersSection />
      <TestimonialsSection />
      <PricingSection />
      <CtaSection /> */}
      <FooterSection />
    </main>
  );
}
