import { FooterSection } from "@/components/landing/footer-section";
import { Navigation } from "@/components/landing/navigation";
import { ClientsSection } from "@/components/landing/clients-section";
import { CtaSection } from "@/components/landing/cta-section";
import { HeroSection } from "@/components/landing/hero-section";
import { ProductSections } from "@/components/landing/product-sections";
import { ServicesSection } from "@/components/landing/services-section";
import { TeamSection } from "@/components/landing/team-section";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Klola Indonesia",
  description: "Managing People. Anywhere. Anytime",
};

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <Navigation />
      <HeroSection />
      <ServicesSection />
      <ProductSections />
      <TeamSection />
      <ClientsSection />
      <CtaSection />
      <FooterSection />
    </main>
  );
}
