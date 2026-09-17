"use client";

import {
  Braces,
  Database,
  Eye,
  FolderTree,
  Layers3,
  Rocket,
  Settings2,
  Sparkles,
} from "lucide-react";

export function WorkspacePreview() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-28">

      <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-center">

        <div>

          <div className="text-xs font-black uppercase tracking-[0.35em] text-[#7CFF6B]">
            Build. Edit. Evolve.
          </div>

          <h2 className="mt-5 text-4xl font-black tracking-[-0.045em] md:text-6xl">
            Your software
            <br />
            <span className="text-white/30">
              never stops evolving.
            </span>
          </h2>

          <p className="mt-6 max-w-lg text-base leading-7 text-white/45">
            Zayloq is designed to understand your existing project so you can
            continue improving it through conversation instead of starting
            over.
          </p>

          <div className="mt-8 space-y-3">

            {[
              "Add customer reviews.",
              "Create a loyalty programme.",
              "Make the hero more premium.",
              "Add another branch location.",
            ].map((item) => (
              <div
                key={item}
                className="rounded-xl border border-white/[.07] bg-white/[.025] px-4 py-3 text-sm text-white/50"
              >
                “{item}”
              </div>
            ))}

          </div>

        </div>

        <div className="z-glass overflow-hidden rounded-[30px]">

          <div className="flex items-center justify-between border-b border-white/[.07] px-5 py-4">

            <div className="text-xs font-black tracking-[0.18em]">
              ZAYLOQ
            </div>

            <div className="flex items-center gap-2">

              <button className="flex items-center gap-2 rounded-lg border border-white/[.07] bg-white/[.03] px-3 py-2 text-[10px] font-bold text-white/45">
                <Eye size={13} />
                Preview
              </button>

              <button className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-[10px] font-black text-[#06101f]">
                <Rocket size={13} />
                Publish
              </button>

            </div>

          </div>

          <div className="grid min-h-[460px] md:grid-cols-[175px_1fr_150px]">

            <div className="hidden border-r border-white/[.07] p-4 md:block">

              <div className="mb-5 text-[9px] font-black uppercase tracking-[0.24em] text-white/20">
                Project
              </div>

              {[
                [FolderTree, "Pages"],
                [Layers3, "Components"],
                [Database, "Database"],
                [Braces, "API"],
                [Settings2, "Settings"],
              ].map(([Icon, label]) => {
                const Component = Icon as typeof FolderTree;

                return (
                  <div
                    key={label as string}
                    className="mb-1 flex items-center gap-2 rounded-lg px-2 py-2 text-[11px] text-white/40"
                  >
                    <Component size={13} />
                    {label as string}
                  </div>
                );
              })}

            </div>

            <div className="bg-[#eef4f7] p-5">

              <div className="flex h-full min-h-[390px] items-center justify-center rounded-2xl border border-[#06101f]/5 bg-white">

                <div className="text-center">

                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#06101f] text-[#00D4C6]">
                    <Sparkles size={22} />
                  </div>

                  <div className="mt-4 text-sm font-black text-[#06101f]">
                    Live Application Preview
                  </div>

                  <div className="mt-2 text-xs text-slate-400">
                    Your application updates as Zayloq builds.
                  </div>

                </div>

              </div>

            </div>

            <div className="hidden border-l border-white/[.07] p-4 md:block">

              <div className="text-[9px] font-black uppercase tracking-[0.24em] text-white/20">
                Status
              </div>

              <div className="mt-5 space-y-3">

                {[
                  ["Frontend", "Ready"],
                  ["Database", "Ready"],
                  ["API", "Ready"],
                  ["Build", "Passing"],
                ].map(([label, status]) => (
                  <div key={label}>
                    <div className="text-[10px] text-white/25">
                      {label}
                    </div>

                    <div className="mt-1 text-[10px] font-black text-[#7CFF6B]">
                      ● {status}
                    </div>
                  </div>
                ))}

              </div>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}
