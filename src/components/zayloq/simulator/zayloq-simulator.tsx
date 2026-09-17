"use client";

import {
  Check,
  ChevronRight,
  CirclePause,
  CirclePlay,
  Laptop,
  Monitor,
  RotateCcw,
  Smartphone,
  Sparkles,
  Tablet,
  WandSparkles,
} from "lucide-react";
import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import { classifyPrompt } from "./engine/classifier";
import { scenarios } from "./engine/scenarios";
import { buildTimeline } from "./engine/timeline";

import { SimulatorProgress } from "./simulator-progress";
import { SimulatorPreview } from "./simulator-preview";

import type {
  EditFlags,
  SimulatorDevice,
  SimulatorScenario,
} from "./types";

const presetOrder: SimulatorScenario[] = [
  "restaurant",
  "fashion",
  "villa",
  "business",
  "saas",
];

export function ZayloqSimulator() {
  const [prompt, setPrompt] = useState(
    scenarios.restaurant.prompt
  );

  const [scenarioId, setScenarioId] =
    useState<SimulatorScenario>("restaurant");

  const [stepIndex, setStepIndex] =
    useState(-1);

  const [started, setStarted] =
    useState(false);

  const [paused, setPaused] =
    useState(false);

  const [device, setDevice] =
    useState<SimulatorDevice>("desktop");

  const [edits, setEdits] =
    useState<EditFlags>({
      darkerHero: false,
      testimonials: false,
      whatsapp: false,
      payments: false,
    });

  const scenario =
    scenarios[scenarioId];

  const currentStep =
    stepIndex >= 0
      ? buildTimeline[stepIndex]
      : null;

  const progress =
    currentStep?.progress ?? 0;

  const complete =
    currentStep?.stage === "complete";

  const visiblePages = useMemo(() => {
    if (progress < 20) return 0;
    if (progress < 35) return 3;
    if (progress < 55) return 5;

    return scenario.pages.length;
  }, [progress, scenario.pages.length]);

  const visibleFeatures = useMemo(() => {
    if (progress < 28) return 0;
    if (progress < 55) return 2;
    if (progress < 72) return 4;

    return scenario.features.length;
  }, [progress, scenario.features.length]);

  useEffect(() => {
    if (
      !started ||
      paused ||
      complete ||
      stepIndex < 0
    ) {
      return;
    }

    const timeout = setTimeout(() => {
      setStepIndex((current) =>
        Math.min(
          current + 1,
          buildTimeline.length - 1
        )
      );
    }, 1150);

    return () =>
      clearTimeout(timeout);
  }, [
    started,
    paused,
    complete,
    stepIndex,
  ]);

  function startBuild(
    event?: FormEvent<HTMLFormElement>
  ) {
    event?.preventDefault();

    const classified =
      classifyPrompt(prompt);

    setScenarioId(classified);
    setStepIndex(0);
    setStarted(true);
    setPaused(false);

    setEdits({
      darkerHero: false,
      testimonials: false,
      whatsapp: false,
      payments: false,
    });
  }

  function selectPreset(
    id: SimulatorScenario
  ) {
    setScenarioId(id);
    setPrompt(scenarios[id].prompt);
    setStarted(false);
    setStepIndex(-1);
    setPaused(false);

    setEdits({
      darkerHero: false,
      testimonials: false,
      whatsapp: false,
      payments: false,
    });
  }

  function restart() {
    setStepIndex(0);
    setStarted(true);
    setPaused(false);

    setEdits({
      darkerHero: false,
      testimonials: false,
      whatsapp: false,
      payments: false,
    });
  }

  function skip() {
    setStarted(true);
    setPaused(false);

    setStepIndex(
      buildTimeline.length - 1
    );
  }

  return (
    <section
      id="simulator"
      className="mx-auto max-w-[1500px] px-4 py-28 md:px-6"
    >

      <div className="mx-auto mb-12 max-w-4xl text-center">

        <div className="text-xs font-black uppercase tracking-[0.35em] text-[#00D4C6]">
          Interactive Zayloq Experience
        </div>

        <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
          <div className="z-gradient rounded-full px-6 py-3 text-sm font-black uppercase tracking-[0.18em] text-[#06101f] shadow-[0_0_35px_rgba(0,212,198,.22)]">
            TRY DEMO
          </div>

          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.28em] text-[#00D4C6] md:text-xs">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#7CFF6B] shadow-[0_0_12px_rgba(124,255,107,.8)]" />
            Interactive AI Builder
          </div>
        </div>
<h2 className="mt-5 text-4xl font-black tracking-[-0.045em] md:text-7xl">
          Describe it.
          <br />
          <span className="z-gradient-text">
            Watch Zayloq build it.
          </span>
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-white/45">
          Experience how Zayloq transforms a business idea into
          architecture, design, functionality and a production-ready
          digital experience.
        </p>

      </div>

      <div className="z-glass overflow-hidden rounded-[32px]">

        <div className="flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-white/[.07] px-4 py-3 md:px-5">

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#007BFF] via-[#00D4C6] to-[#7CFF6B] text-sm font-black text-[#06101f]">
              Z
            </div>

            <div>
              <div className="text-xs font-black tracking-[.18em]">
                ZAYLOQ
              </div>

              <div className="text-[8px] uppercase tracking-[.2em] text-white/25">
                AI Build Simulator
              </div>
            </div>

          </div>

          <div className="flex items-center gap-2">

            {started && !complete && (
              <button
                onClick={() =>
                  setPaused((current) => !current)
                }
                className="flex items-center gap-2 rounded-lg border border-white/[.08] bg-white/[.03] px-3 py-2 text-[10px] font-bold text-white/50"
              >
                {paused ? (
                  <CirclePlay size={13} />
                ) : (
                  <CirclePause size={13} />
                )}

                {paused ? "Resume" : "Pause"}
              </button>
            )}

            {started && (
              <button
                onClick={restart}
                className="flex items-center gap-2 rounded-lg border border-white/[.08] bg-white/[.03] px-3 py-2 text-[10px] font-bold text-white/50"
              >
                <RotateCcw size={13} />
                Restart
              </button>
            )}

            {started && !complete && (
              <button
                onClick={skip}
                className="hidden rounded-lg border border-white/[.08] bg-white/[.03] px-3 py-2 text-[10px] font-bold text-white/40 sm:block"
              >
                Skip to result
              </button>
            )}

          </div>

        </div>

        <SimulatorProgress progress={progress} />

        {!started && (
          <div className="border-b border-white/[.07] p-4 md:p-6">

            <form
              onSubmit={startBuild}
              className="mx-auto max-w-4xl"
            >

              <div className="mb-3 flex items-center gap-2 text-xs font-black">
                <Sparkles
                  size={15}
                  className="text-[#00D4C6]"
                />
                What do you want to build?
              </div>

              <div className="rounded-[22px] border border-white/[.08] bg-white/[.025] p-4">

                <textarea
                  value={prompt}
                  onChange={(event) =>
                    setPrompt(event.target.value)
                  }
                  rows={4}
                  className="w-full resize-none bg-transparent text-sm leading-6 text-white/70 outline-none placeholder:text-white/20 md:text-base"
                  placeholder="Describe the website or business you want Zayloq to create..."
                />

                <div className="mt-4 flex justify-end">

                  <button
                    type="submit"
                    className="z-gradient flex items-center gap-2 rounded-xl px-5 py-3 text-xs font-black text-[#06101f]"
                  >
                    <WandSparkles size={15} />
                    BUILD WITH ZAYLOQ
                  </button>

                </div>

              </div>

              <div className="mt-5 flex flex-wrap justify-center gap-2">

                {presetOrder.map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() =>
                      selectPreset(id)
                    }
                    className={`rounded-full border px-3 py-2 text-[10px] font-bold transition ${
                      scenarioId === id
                        ? "border-[#00D4C6]/35 bg-[#00D4C6]/10 text-[#00D4C6]"
                        : "border-white/[.07] bg-white/[.02] text-white/35 hover:text-white/60"
                    }`}
                  >
                    {scenarios[id].title}
                  </button>
                ))}

              </div>

            </form>

          </div>
        )}

        {started && (
          <div className="grid min-h-[720px] xl:grid-cols-[330px_minmax(0,1fr)_270px]">

            {/* LEFT AI PANEL */}

            <aside className="border-b border-white/[.07] p-5 xl:border-b-0 xl:border-r">

              <div className="flex items-center gap-2 text-xs font-black">
                <Sparkles
                  size={15}
                  className="text-[#00D4C6]"
                />
                AI BUILD SESSION
              </div>

              <div className="mt-5 rounded-2xl border border-white/[.06] bg-white/[.025] p-4 text-xs leading-5 text-white/55">
                {prompt}
              </div>

              <div className="mt-6">

                <div className="text-[9px] font-black uppercase tracking-[.24em] text-white/20">
                  Current Action
                </div>

                <div className="mt-3 rounded-xl border border-[#00D4C6]/15 bg-[#00D4C6]/[.05] p-4">

                  <div className="text-[10px] font-black uppercase tracking-wider text-[#00D4C6]">
                    {currentStep?.label}
                  </div>

                  <div className="mt-2 text-xs leading-5 text-white/60">
                    {currentStep?.message}
                  </div>

                </div>

              </div>

              <div className="mt-6">

                <div className="text-[9px] font-black uppercase tracking-[.24em] text-white/20">
                  Detected Business
                </div>

                <div className="mt-3 space-y-3">

                  <InfoRow
                    label="Business"
                    value={scenario.businessName}
                  />

                  <InfoRow
                    label="Industry"
                    value={scenario.industry}
                  />

                  <InfoRow
                    label="Location"
                    value={scenario.location}
                  />

                  <InfoRow
                    label="Goal"
                    value={scenario.goal}
                  />

                </div>

              </div>

              {progress >= 36 && (
                <div className="mt-6">

                  <div className="text-[9px] font-black uppercase tracking-[.24em] text-white/20">
                    Design System
                  </div>

                  <div className="mt-3 flex gap-2">

                    {[
                      scenario.primary,
                      scenario.secondary,
                      scenario.background,
                    ].map((color) => (
                      <div
                        key={color}
                        className="h-8 flex-1 rounded-lg border border-white/10"
                        style={{
                          background: color,
                        }}
                      />
                    ))}

                  </div>

                  <div className="mt-3 text-[10px] text-white/35">
                    {scenario.style}
                  </div>

                </div>
              )}

            </aside>

            {/* CENTER PREVIEW */}

            <main className="min-w-0">

              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[.07] px-4 py-3">

                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-white/30">
                  <Monitor size={13} />
                  Live Website
                </div>

                <div className="flex rounded-lg border border-white/[.07] bg-white/[.025] p-1">

                  <DeviceButton
                    active={device === "desktop"}
                    onClick={() =>
                      setDevice("desktop")
                    }
                    icon={<Laptop size={13} />}
                  />

                  <DeviceButton
                    active={device === "tablet"}
                    onClick={() =>
                      setDevice("tablet")
                    }
                    icon={<Tablet size={13} />}
                  />

                  <DeviceButton
                    active={device === "mobile"}
                    onClick={() =>
                      setDevice("mobile")
                    }
                    icon={<Smartphone size={13} />}
                  />

                </div>

              </div>

              <SimulatorPreview
                scenario={scenario}
                progress={progress}
                device={device}
                edits={edits}
              />

            </main>

            {/* RIGHT PROJECT PANEL */}

            <aside className="border-t border-white/[.07] p-5 xl:border-l xl:border-t-0">

              <div className="text-[9px] font-black uppercase tracking-[.24em] text-white/20">
                Project
              </div>

              <div className="mt-2 text-sm font-black">
                {scenario.businessName}
              </div>

              <div className="mt-1 text-[10px] text-[#00D4C6]">
                {scenario.title}
              </div>

              <div className="mt-6">

                <PanelHeading>
                  Pages
                </PanelHeading>

                <div className="mt-3 space-y-2">

                  {scenario.pages
                    .slice(0, visiblePages)
                    .map((page) => (
                      <GeneratedItem
                        key={page}
                        label={page}
                      />
                    ))}

                </div>

              </div>

              <div className="mt-6">

                <PanelHeading>
                  Features
                </PanelHeading>

                <div className="mt-3 space-y-2">

                  {scenario.features
                    .slice(0, visibleFeatures)
                    .map((feature) => (
                      <GeneratedItem
                        key={feature}
                        label={feature}
                      />
                    ))}

                </div>

              </div>

              {progress >= 70 && (
                <div className="mt-6">

                  <PanelHeading>
                    Business System
                  </PanelHeading>

                  <div className="mt-3 space-y-2">

                    {scenario.database
                      .slice(0, 4)
                      .map((item) => (
                        <GeneratedItem
                          key={item}
                          label={item}
                        />
                      ))}

                  </div>

                </div>
              )}

              {progress >= 78 && (
                <div className="mt-6 rounded-xl border border-[#7CFF6B]/10 bg-[#7CFF6B]/[.04] p-3">

                  <div className="text-[9px] font-black uppercase tracking-wider text-[#7CFF6B]">
                    Regional Context
                  </div>

                  <div className="mt-2 text-[10px] leading-5 text-white/40">
                    Currency: {scenario.currency}
                    <br />
                    Location: {scenario.location}
                  </div>

                </div>
              )}

            </aside>

          </div>
        )}

        {complete && (
          <div className="border-t border-white/[.07] bg-[#06101f] p-5 md:p-7">

            <div className="grid gap-8 lg:grid-cols-[.7fr_1.3fr] lg:items-center">

              <div>

                <div className="flex items-center gap-2 text-[#7CFF6B]">
                  <Check size={16} />
                  <span className="text-[10px] font-black uppercase tracking-[.24em]">
                    Build Complete
                  </span>
                </div>

                <h3 className="mt-4 text-3xl font-black">
                  Your website is ready.
                </h3>

                <p className="mt-3 max-w-md text-sm leading-6 text-white/40">
                  Now continue evolving the project by telling
                  Zayloq what you want changed.
                </p>

              </div>

              <div>

                <div className="mb-3 text-[9px] font-black uppercase tracking-[.24em] text-white/20">
                  Edit with AI
                </div>

                <div className="flex flex-wrap gap-2">

                  <EditButton
                    active={edits.darkerHero}
                    onClick={() =>
                      setEdits((current) => ({
                        ...current,
                        darkerHero:
                          !current.darkerHero,
                      }))
                    }
                  >
                    Make the hero darker
                  </EditButton>

                  <EditButton
                    active={edits.testimonials}
                    onClick={() =>
                      setEdits((current) => ({
                        ...current,
                        testimonials:
                          !current.testimonials,
                      }))
                    }
                  >
                    Add testimonials
                  </EditButton>

                  <EditButton
                    active={edits.whatsapp}
                    onClick={() =>
                      setEdits((current) => ({
                        ...current,
                        whatsapp:
                          !current.whatsapp,
                      }))
                    }
                  >
                    Add WhatsApp
                  </EditButton>

                  <EditButton
                    active={edits.payments}
                    onClick={() =>
                      setEdits((current) => ({
                        ...current,
                        payments:
                          !current.payments,
                      }))
                    }
                  >
                    Add online payments
                  </EditButton>

                </div>

                <div className="mt-4 flex flex-wrap gap-3">

                  <button
                    onClick={() => {
                      setStarted(false);
                      setStepIndex(-1);
                    }}
                    className="flex items-center gap-2 rounded-xl border border-white/[.08] bg-white/[.03] px-4 py-3 text-[10px] font-black text-white/50"
                  >
                    <RotateCcw size={13} />
                    TRY ANOTHER IDEA
                  </button>

                  <a
                    href="#access"
                    className="z-gradient flex items-center gap-2 rounded-xl px-4 py-3 text-[10px] font-black text-[#06101f]"
                  >
                    JOIN EARLY ACCESS
                    <ChevronRight size={13} />
                  </a>

                </div>

              </div>

            </div>

          </div>
        )}

      </div>

    </section>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="text-[9px] uppercase tracking-wider text-white/20">
        {label}
      </div>

      <div className="mt-1 text-[11px] font-bold text-white/55">
        {value}
      </div>
    </div>
  );
}

function PanelHeading({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="text-[9px] font-black uppercase tracking-[.24em] text-white/20">
      {children}
    </div>
  );
}

function GeneratedItem({
  label,
}: {
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 text-[10px] text-white/40">

      <div className="flex h-4 w-4 items-center justify-center rounded-full bg-[#7CFF6B]/10 text-[#7CFF6B]">
        <Check size={9} />
      </div>

      {label}

    </div>
  );
}

function DeviceButton({
  active,
  onClick,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex h-8 w-9 items-center justify-center rounded-md transition ${
        active
          ? "bg-white text-[#06101f]"
          : "text-white/30 hover:text-white/60"
      }`}
    >
      {icon}
    </button>
  );
}

function EditButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-2 text-[10px] font-bold transition ${
        active
          ? "border-[#00D4C6]/40 bg-[#00D4C6]/10 text-[#00D4C6]"
          : "border-white/[.08] bg-white/[.025] text-white/40 hover:text-white/65"
      }`}
    >
      {children}
    </button>
  );
}




