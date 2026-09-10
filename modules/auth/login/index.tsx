"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import LogoMark from "./logo-mark";

export default function LoginPageLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-svh w-full flex-col items-center justify-center overflow-hidden bg-background px-4 py-12 sm:px-8 lg:flex-row">
      {/* Deep gradient orb — top right */}
      <div
        className="pointer-events-none absolute -right-1/3 -top-1/3 z-0 size-[90vh] rounded-full opacity-[0.07]"
        style={{
          background: "radial-gradient(circle, #0B3464 0%, transparent 70%)",
        }}
      />

      {/* Subtle noise overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "256px 256px",
        }}
      />

      {/* Left brand column — hidden on mobile */}
      <div className="hidden w-full max-w-md flex-col gap-10 pt-8 md:flex lg:w-1/2 lg:max-w-xl lg:pr-10">
        <div className="space-y-10">
          <LogoMark />

          <motion.div
            className="space-y-5 mt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="text-[2rem] font-semibold leading-[1.15] tracking-tight text-[#0B3464] sm:text-[2.5rem]">
              Managing People.
              <br />
              <span className="text-[#0B3464]/70">Anywhere. Anytime.</span>
            </h1>

            <p className="max-w-sm text-[15px] leading-relaxed text-[#0B3464]/60">
              Kelola tim, tiket, dan operasional perusahaan dalam satu portal — kapanpun, dimanapun.
            </p>
          </motion.div>
        </div>

        {/* Soft stat counters */}
        <motion.div
          className="flex items-center gap-8 text-xs text-[#0B3464]/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div>
            <span className="block text-lg font-semibold text-[#0B3464]">
              50+
            </span>
            Perusahaan aktif
          </div>
          <div className="h-8 w-px bg-[#0B3464]/10" />
          <div>
            <span className="block text-lg font-semibold text-[#0B3464]">
              10K+
            </span>
            Pengguna terhubung
          </div>
        </motion.div>
      </div>

      {/* Right form column */}
      <div className="z-10 w-full max-w-md lg:w-auto lg:flex-1">
        <motion.div
          className="mx-auto w-full max-w-sm"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Mobile inline brand */}
          <div className="mb-8 md:hidden">
            <LogoMark />
          </div>

          {children}
        </motion.div>
      </div>
    </div>
  );
}
