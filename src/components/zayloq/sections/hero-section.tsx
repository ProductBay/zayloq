"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import { HeroPrompt } from "@/components/zayloq/demo/hero-prompt";

export function HeroSection() {
  return (
    <section
      id="top"
      className="relative min-h-screen overflow-hidden px-5 pb-24 pt-40 md:pt-48"
    >
      <div className="z-grid absolute inset-0 opacity-35" />

      <div className="z-orb -left-48 top-10 bg-[#007BFF]" />
      <div className="z-orb -right-52 top-44 bg-[#00D4C6]" />

      <div className="pointer-events-none absolute inset-x-0 top-0 h-[700px] bg-[radial-gradient(circle_at_50%_0%,rgba(0,123,255,.09),transparent_65%)]" />

      <div className="relative mx-auto max-w-7xl">

        <div className="mx-auto max-w-6xl text-center">

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.04] px-4 py-2 text-xs font-bold text-white/55"
          >
            <Sparkles size={14} className="text-[#00D4C6]" />
            AI Business & Software Builder
            <span className="ml-1 rounded-full bg-[#7CFF6B]/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-[#7CFF6B]">
              Coming Soon
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="mt-8 text-[clamp(3.3rem,9vw,8.6rem)] font-black leading-[.87] tracking-[-0.07em]"
          >
            YOUR IDEA CAN
            <br />
            BECOME
            <br />
            <span className="z-gradient-text">
              SOFTWARE.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mx-auto mt-8 max-w-2xl text-base leading-7 text-white/45 md:text-lg"
          >
            Describe what you want to create. Zayloq architects, builds and
            launches production-ready websites, stores and applications
            through AI.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.27 }}
            className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >

            <a
              href="#access"
              className="z-gradient flex w-full items-center justify-center gap-2 rounded-xl px-6 py-4 text-sm font-black text-[#06101f] shadow-[0_10px_45px_rgba(0,212,198,.12)] transition hover:scale-[1.02] sm:w-auto"
            >
              GET EARLY ACCESS
              <ArrowRight size={17} />
            </a>

            <a
              href="#simulator"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[.035] px-6 py-4 text-sm font-bold text-white/70 transition hover:bg-white/[.07] sm:w-auto"
            >
              <Play size={15} />
              Watch Zayloq Build
            </a>

          </motion.div>

          <div className="mt-8 text-[10px] font-black uppercase tracking-[0.34em] text-white/20 md:text-xs">
            Built for the Caribbean. Engineered for the world.
          </div>

          <HeroPrompt />

        </div>

      </div>
    </section>
  );
}

