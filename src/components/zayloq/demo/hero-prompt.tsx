"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

const prompts = [
  "Build a premium online store for my fashion business in Jamaica.",
  "Create a booking website for my villa with online payments.",
  "Build a SaaS dashboard for my accounting company.",
  "Create a restaurant ordering platform with delivery.",
  "Build a mobile marketplace connecting buyers and sellers.",
];

export function HeroPrompt() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % prompts.length);
    }, 4200);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="mx-auto mt-12 max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="z-glass overflow-hidden rounded-[26px] p-2"
      >
        <div className="rounded-[21px] border border-white/[.06] bg-[#071426]/90 p-4 md:p-5">

          <div className="flex items-start gap-3">

            <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#00D4C6]/10 text-[#00D4C6]">
              <Sparkles size={17} />
            </div>

            <div className="min-h-[72px] flex-1">
              <div className="text-[10px] font-black uppercase tracking-[0.28em] text-white/25">
                Ask Zayloq
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="mt-2 text-left text-sm leading-6 text-white/70 md:text-base"
                >
                  {prompts[index]}
                </motion.div>
              </AnimatePresence>
            </div>

            <button
              aria-label="Build with Zayloq"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#06101f] transition hover:scale-105"
            >
              <ArrowUp size={18} />
            </button>

          </div>

          <div className="mt-3 flex flex-wrap gap-2 border-t border-white/[.05] pt-3">

            {["Website", "Commerce", "Web App", "Mobile App"].map((item) => (
              <span
                key={item}
                className="rounded-full border border-white/[.07] bg-white/[.025] px-3 py-1.5 text-[10px] font-bold text-white/35"
              >
                {item}
              </span>
            ))}

          </div>

        </div>
      </motion.div>
    </div>
  );
}
