"use client";

import { Check } from "lucide-react";

const stages = [
  { label: "Prompt", threshold: 0 },
  { label: "Plan", threshold: 15 },
  { label: "Design", threshold: 32 },
  { label: "Build", threshold: 48 },
  { label: "Connect", threshold: 70 },
  { label: "Test", threshold: 83 },
  { label: "Launch", threshold: 94 },
];

export function SimulatorProgress({
  progress,
}: {
  progress: number;
}) {
  return (
    <div className="border-b border-white/[.07] px-4 py-4 md:px-6">

      <div className="flex items-center justify-between gap-2">

        {stages.map((stage, index) => {
          const completed =
            progress > stage.threshold + 8;

          const active =
            progress >= stage.threshold &&
            !completed;

          return (
            <div
              key={stage.label}
              className="flex min-w-0 flex-1 items-center"
            >

              <div className="flex min-w-0 flex-col items-center">

                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full border text-[10px] font-black transition ${
                    completed
                      ? "border-[#7CFF6B] bg-[#7CFF6B] text-[#06101f]"
                      : active
                      ? "border-[#00D4C6] bg-[#00D4C6]/10 text-[#00D4C6] shadow-[0_0_20px_rgba(0,212,198,.22)]"
                      : "border-white/10 bg-white/[.03] text-white/25"
                  }`}
                >
                  {completed ? (
                    <Check size={12} />
                  ) : (
                    index + 1
                  )}
                </div>

                <span
                  className={`mt-2 hidden text-[8px] font-black uppercase tracking-wider sm:block ${
                    active
                      ? "text-[#00D4C6]"
                      : completed
                      ? "text-[#7CFF6B]"
                      : "text-white/20"
                  }`}
                >
                  {stage.label}
                </span>

              </div>

              {index < stages.length - 1 && (
                <div className="mx-2 h-px flex-1 bg-white/[.08]">
                  <div
                    className={`h-full transition-all duration-500 ${
                      completed
                        ? "w-full bg-[#7CFF6B]"
                        : "w-0"
                    }`}
                  />
                </div>
              )}

            </div>
          );
        })}

      </div>

    </div>
  );
}
