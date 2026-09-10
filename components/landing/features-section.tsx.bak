"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const features = [
  {
    number: "01",
    title: "Request Demo",
    description:
      "Experience our solutions firsthand. Schedule a personalized walkthrough tailored to your business needs.",
    visual: "deploy",
    path: "/demo",
  },
  {
    number: "02",
    title: "Open Tickets",
    description:
      "Submit and track technical issues or inquiries. Get updates and timely resolutions from our support team.",
    visual: "ai",
    path: "/contact",
  },
  {
    number: "03",
    title: " Help Desk",
    description:
      "Browse knowledge base guides, FAQs, and step-by-step documentation to find quick answers independently.",
    visual: "collab",
    path: "/contact",
  },
  {
    number: "04",
    title: "Contact Us",
    description:
      "Reach out directly to our team for general inquiries, partnerships, or immediate consultations.",
    visual: "security",
    path: "/contact",
  },
];

function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof features)[0];
  index: number;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.2 },
    );

    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={cardRef}
      className={`group relative transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <Link
        href={feature.path}
        className={`flex flex-col lg:flex-row gap-8 lg:gap-16 py-12 lg:py-20 ${index !== features.length - 1 ? "border-b" : ""}`}
      >
        {/* Number */}
        <div className="shrink-0">
          <span className="font-mono text-sm text-muted-foreground">
            {feature.number}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <h3 className="text-3xl lg:text-4xl font-display mb-4 group-hover:translate-x-2 transition-transform duration-500">
                {feature.title}
              </h3>
              <ArrowUpRight className="md:hidden w-8 h-8 transition-transform -ml-3 -mt-2.5 duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {feature.description}
            </p>
          </div>

          {/* Visual */}
          <div className="hidden md:flex justify-center lg:justify-end">
            <div className="w-48 h-40 flex items-center justify-center">
              <span className="inline-flex items-center justify-center w-14 h-14 rounded-full border border-foreground/15 text-foreground transition-all duration-500 group-hover:border-foreground group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110">
                <ArrowUpRight className="w-6 h-6 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

export function FeaturesSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 },
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="features" ref={sectionRef} className="relative py-24 lg:py-32">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="mb-16 lg:mb-24">
          <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
            <span className="w-8 h-px bg-foreground/30" />
            Capabilities
          </span>
          <h2
            className={`text-4xl lg:text-6xl font-display tracking-tight transition-all duration-700 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            Everything you need.
            <br />
            <span className="text-muted-foreground">
              Nothing you don&apos;t.
            </span>
          </h2>
        </div>

        {/* Features List */}
        <div>
          {features.map((feature, index) => (
            <FeatureCard key={feature.number} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
