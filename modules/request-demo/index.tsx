"use client";

import { useEffect, useRef, useState } from "react";
import { DemoForm } from "./comp-form";

function ScrollReveal({
  children,
  index = 0,
  className = "",
}: {
  children: React.ReactNode;
  index?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${className} ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
      style={{ transitionDelay: `${index * 120}ms` }}
    >
      {children}
    </div>
  );
}

export default function RequestDemoModule() {
  return (
    <main>
      {/* Hero block */}
      <section className="max-w-6xl mx-auto px-6 lg:px-8 pt-12 pb-16 lg:pt-16 lg:pb-20">
        <ScrollReveal>
          <div className="flex items-start gap-8">
            <span className="font-mono text-sm text-muted-foreground shrink-0 hidden sm:block mt-0.5">
              01
            </span>
            <div className="flex-1">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-instrument tracking-tight text-foreground">
                Request a demo
              </h1>
              <p className="mt-5 text-lg leading-relaxed text-muted-foreground max-w-lg">
                Schedule a personalized walkthrough with our team. Fill in the
                form below or reach us through any of the channels below.
              </p>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Form section */}
      <section className="max-w-6xl mx-auto px-6 lg:px-8 pb-24 lg:pb-32">
        <ScrollReveal>
          <div className="flex items-start gap-8">
            <span className="font-mono text-sm text-muted-foreground shrink-0 hidden sm:block mt-0.5">
              02
            </span>
            <div className="flex-1">
              <h2 className="text-2xl sm:text-3xl font-instrument tracking-tight text-foreground mb-8">
                Tell us about your needs
              </h2>
              <DemoForm />
            </div>
          </div>
        </ScrollReveal>
      </section>
    </main>
  );
}
