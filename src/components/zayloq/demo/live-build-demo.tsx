"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  Database,
  Globe2,
  LayoutDashboard,
  LoaderCircle,
  PackageCheck,
  Rocket,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";

const steps = [
  {
    label: "Understanding your business",
    icon: Sparkles,
  },
  {
    label: "Creating commerce architecture",
    icon: ShoppingBag,
  },
  {
    label: "Designing database",
    icon: Database,
  },
  {
    label: "Configuring authentication",
    icon: ShieldCheck,
  },
  {
    label: "Adding inventory + orders",
    icon: PackageCheck,
  },
  {
    label: "Building merchant dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Preparing deployment",
    icon: Globe2,
  },
  {
    label: "Application ready",
    icon: Rocket,
  },
];

export function LiveBuildDemo() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((current) => {
        if (current >= steps.length - 1) {
          return 0;
        }

        return current + 1;
      });
    }, 1300);

    return () => clearInterval(timer);
  }, []);

  return (
    <section id="demo" className="mx-auto max-w-7xl px-5 pb-28">

      <div className="mb-12 max-w-3xl">

        <div className="text-xs font-black uppercase tracking-[0.35em] text-[#00D4C6]">
          See Zayloq Think
        </div>

        <h2 className="mt-5 text-4xl font-black tracking-[-0.04em] md:text-6xl">
          From one sentence
          <br />
          <span className="text-white/30">
            to working software.
          </span>
        </h2>

      </div>

      <div className="relative">

        <div className="absolute -inset-6 rounded-[42px] bg-gradient-to-r from-[#007BFF]/10 via-[#00D4C6]/10 to-[#7CFF6B]/5 blur-3xl" />

        <div className="z-glass relative overflow-hidden rounded-[32px]">

          <div className="flex items-center justify-between border-b border-white/[.07] px-5 py-4">

            <div className="flex gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-white/15" />
              <div className="h-2.5 w-2.5 rounded-full bg-white/15" />
              <div className="h-2.5 w-2.5 rounded-full bg-white/15" />
            </div>

            <div className="rounded-full border border-white/[.08] bg-white/[.03] px-4 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-white/35">
              Zayloq Build Session
            </div>

            <div className="text-[10px] font-bold text-[#00D4C6]">
              ● LIVE
            </div>

          </div>

          <div className="grid min-h-[600px] lg:grid-cols-[370px_1fr]">

            <div className="border-b border-white/[.07] p-5 md:p-6 lg:border-b-0 lg:border-r">

              <div className="flex items-center gap-2 text-sm font-black">

                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00D4C6]/10 text-[#00D4C6]">
                  <Sparkles size={15} />
                </div>

                Zayloq AI

              </div>

              <div className="mt-5 rounded-2xl border border-white/[.07] bg-white/[.025] p-4 text-sm leading-6 text-white/65">
                Build a premium online fashion store for Jamaica with inventory,
                customer accounts, online payments and delivery.
              </div>

              <div className="mt-6 space-y-2">

                {steps.map(({ label, icon: Icon }, index) => {
                  const completed = index < activeStep;
                  const active = index === activeStep;

                  return (
                    <motion.div
                      key={label}
                      animate={{
                        opacity:
                          completed || active
                            ? 1
                            : 0.35,
                      }}
                      className={`flex items-center gap-3 rounded-xl border p-3 transition ${
                        active
                          ? "border-[#00D4C6]/25 bg-[#00D4C6]/[.06]"
                          : "border-white/[.04] bg-white/[.015]"
                      }`}
                    >

                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                          completed
                            ? "bg-[#7CFF6B]/10 text-[#7CFF6B]"
                            : active
                            ? "bg-[#00D4C6]/10 text-[#00D4C6]"
                            : "bg-white/[.04] text-white/25"
                        }`}
                      >
                        {active ? (
                          <LoaderCircle
                            size={15}
                            className="animate-spin"
                          />
                        ) : completed ? (
                          <Check size={15} />
                        ) : (
                          <Icon size={15} />
                        )}
                      </div>

                      <div className="flex-1 text-xs text-white/65">
                        {label}
                      </div>

                    </motion.div>
                  );
                })}

              </div>

            </div>

            <div className="relative overflow-hidden bg-[#eef4f7] p-4 text-[#06101f] md:p-8 lg:p-10">

              <div className="absolute right-5 top-5 z-10 rounded-full bg-[#071629]/5 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-[#071629]/50">
                Generated Preview
              </div>

              <AnimatePresence mode="wait">

                <motion.div
                  key={activeStep}
                  initial={{
                    opacity: 0.65,
                    scale: 0.995,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  transition={{ duration: 0.35 }}
                  className="mx-auto max-w-3xl"
                >

                  <div className="rounded-[28px] bg-white p-5 shadow-[0_30px_70px_rgba(0,20,40,.10)] md:p-7">

                    <div className="flex items-center justify-between">

                      <div className="text-sm font-black tracking-[0.18em]">
                        NOVA876
                      </div>

                      <div className="hidden gap-5 text-[9px] font-black uppercase tracking-wider text-slate-400 sm:flex">
                        <span>New</span>
                        <span>Shop</span>
                        <span>Collections</span>
                        <span>Cart</span>
                      </div>

                    </div>

                    <div className="relative mt-6 overflow-hidden rounded-[25px] bg-[#071629] p-7 text-white md:p-10">

                      <div className="absolute -right-20 -top-24 h-56 w-56 rounded-full bg-[#00D4C6]/15 blur-3xl" />

                      <div className="relative max-w-md">

                        <div className="text-[10px] font-black uppercase tracking-[0.30em] text-[#00D4C6]">
                          New Season / 2026
                        </div>

                        <h3 className="mt-4 text-4xl font-black tracking-[-0.05em] md:text-6xl">
                          Made to
                          <br />
                          stand out.
                        </h3>

                        <p className="mt-4 max-w-sm text-sm leading-6 text-white/45">
                          Modern Caribbean fashion designed for everyday
                          confidence.
                        </p>

                        <button className="mt-7 rounded-full bg-white px-5 py-3 text-[10px] font-black uppercase tracking-wider text-[#071629]">
                          Shop Collection
                        </button>

                      </div>

                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-3">

                      {[
                        "Essentials",
                        "New Drop",
                        "Island Edit",
                      ].map((item, index) => (
                        <div
                          key={item}
                          className="relative aspect-[.88] overflow-hidden rounded-2xl bg-gradient-to-br from-[#eef2f5] to-[#dce6eb] p-3"
                        >
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(0,212,198,.15),transparent_50%)]" />

                          <div className="relative flex h-full items-end">
                            <div>
                              <div className="text-[8px] uppercase tracking-wider text-slate-400">
                                Collection 0{index + 1}
                              </div>

                              <div className="mt-1 text-[11px] font-black md:text-xs">
                                {item}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                    </div>

                  </div>

                </motion.div>

              </AnimatePresence>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}
