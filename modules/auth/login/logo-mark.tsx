"use client";

import { motion } from "motion/react";
import Link from "next/link";

export default function LogoMark({ dark }: { dark?: boolean }) {
  return (
    <Link href={'/'} className="mb-4">
      <motion.div
        className="relative z-10"
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex items-center gap-3">
          {/* Brand name */}
          <div className="flex flex-col">
            <motion.span
              className="text-xl font-semibold tracking-tight"
              style={{ color: dark ? "#fff" : "#0B3464" }}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <img src="logo-blue.png" alt="Klola Logo" className="w-24" />
            </motion.span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
