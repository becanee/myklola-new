import { FooterSection } from '@/components/landing/footer-section';
import { Navigation } from '@/components/landing/navigation';
import RequestDemoModule from '@/modules/request-demo';

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navigation />

      {/* Spacer for fixed nav */}
      <div className="h-24 sm:h-28" />

      <RequestDemoModule />

      <FooterSection />
    </div>
  );
}
