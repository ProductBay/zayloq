"use client";

import type {
  EditFlags,
  SimulatorDevice,
  SimulatorScenarioDefinition,
} from "./types";

type Props = {
  scenario: SimulatorScenarioDefinition;
  progress: number;
  device: SimulatorDevice;
  edits: EditFlags;
};

export function SimulatorPreview({
  scenario,
  progress,
  device,
  edits,
}: Props) {
  const widthClass =
    device === "mobile"
      ? "max-w-[390px]"
      : device === "tablet"
      ? "max-w-[720px]"
      : "max-w-full";

  return (
    <div className="flex h-full min-h-[650px] items-start justify-center overflow-auto bg-[#e9eff2] p-3 md:p-6">

      <div
        className={`w-full ${widthClass} overflow-hidden rounded-[22px] bg-white shadow-[0_30px_80px_rgba(0,20,40,.12)] transition-all duration-500`}
      >

        {progress < 15 ? (
          <BlankPreview />
        ) : (
          <GeneratedWebsite
            scenario={scenario}
            progress={progress}
            edits={edits}
          />
        )}

      </div>

    </div>
  );
}

function BlankPreview() {
  return (
    <div className="flex min-h-[600px] items-center justify-center bg-white">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-pulse rounded-xl bg-slate-100" />
        <div className="mt-4 text-xs font-bold text-slate-300">
          Zayloq is preparing your canvas...
        </div>
      </div>
    </div>
  );
}

function GeneratedWebsite({
  scenario,
  progress,
  edits,
}: {
  scenario: SimulatorScenarioDefinition;
  progress: number;
  edits: EditFlags;
}) {
  if (scenario.id === "restaurant") {
    return (
      <RestaurantSite
        scenario={scenario}
        progress={progress}
        edits={edits}
      />
    );
  }

  if (scenario.id === "fashion") {
    return (
      <FashionSite
        scenario={scenario}
        progress={progress}
        edits={edits}
      />
    );
  }

  if (scenario.id === "villa") {
    return (
      <VillaSite
        scenario={scenario}
        progress={progress}
        edits={edits}
      />
    );
  }

  if (scenario.id === "saas") {
    return (
      <SaasSite
        scenario={scenario}
        progress={progress}
        edits={edits}
      />
    );
  }

  return (
    <BusinessSite
      scenario={scenario}
      progress={progress}
      edits={edits}
    />
  );
}

function RestaurantSite({
  scenario,
  progress,
  edits,
}: {
  scenario: SimulatorScenarioDefinition;
  progress: number;
  edits: EditFlags;
}) {
  return (
    <div
      style={{
        background: edits.darkerHero
          ? "#090504"
          : scenario.background,
      }}
      className="min-h-[650px] text-white"
    >
      {progress >= 22 && (
        <div className="flex items-center justify-between px-6 py-5">
          <div className="font-black tracking-[.18em]">
            ISLAND FLAME
          </div>

          <div className="hidden gap-5 text-[9px] font-bold uppercase text-white/45 sm:flex">
            <span>Menu</span>
            <span>Reservations</span>
            <span>Delivery</span>
          </div>
        </div>
      )}

      {progress >= 40 && (
        <div className="relative overflow-hidden px-6 py-16 md:px-10 md:py-20">

          <div
            className="absolute right-[-80px] top-[-90px] h-72 w-72 rounded-full blur-3xl"
            style={{
              background: `${scenario.primary}33`,
            }}
          />

          <div className="relative max-w-lg">

            <div
              style={{ color: scenario.secondary }}
              className="text-[9px] font-black uppercase tracking-[.3em]"
            >
              Montego Bay • Jamaica
            </div>

            <h3 className="mt-4 text-4xl font-black leading-[.95] md:text-6xl">
              Caribbean flavour.
              <br />
              Fired differently.
            </h3>

            <p className="mt-5 max-w-md text-sm leading-6 text-white/50">
              Authentic island dining, bold flavours and
              unforgettable moments.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">

              <button
                style={{ background: scenario.primary }}
                className="rounded-full px-5 py-3 text-[10px] font-black uppercase text-white"
              >
                Order Online
              </button>

              <button className="rounded-full border border-white/20 px-5 py-3 text-[10px] font-black uppercase">
                Reserve a Table
              </button>

            </div>

          </div>
        </div>
      )}

      {progress >= 58 && (
        <div className="bg-[#fff8f0] px-6 py-8 text-[#28140e]">

          <div className="text-xl font-black">
            Popular Dishes
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              ["Jerk Chicken", "JMD $2,450"],
              ["Coconut Curry Shrimp", "JMD $3,200"],
              ["Flame Burger", "JMD $1,950"],
            ].map(([name, price]) => (
              <div
                key={name}
                className="rounded-2xl bg-white p-4 shadow-sm"
              >
                <div
                  style={{
                    background: `${scenario.primary}18`,
                  }}
                  className="aspect-[1.3] rounded-xl"
                />

                <div className="mt-3 text-xs font-black">
                  {name}
                </div>

                <div className="mt-1 text-[10px] text-black/45">
                  {price}
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {progress >= 72 && (
        <div className="grid gap-3 bg-[#fff8f0] px-6 pb-8 text-[#28140e] sm:grid-cols-3">
          {["DINE", "ORDER", "DELIVER"].map((item) => (
            <div
              key={item}
              className="rounded-xl border border-black/5 bg-white px-4 py-5 text-center text-[10px] font-black"
            >
              {item}
            </div>
          ))}
        </div>
      )}

      {edits.testimonials && (
        <div className="bg-white px-6 py-8 text-[#28140e]">
          <div className="text-lg font-black">
            Guests love Island Flame
          </div>

          <div className="mt-3 rounded-xl bg-[#fff8f0] p-4 text-xs leading-5 text-black/50">
            “Amazing food, beautiful atmosphere and seamless
            ordering.”
          </div>
        </div>
      )}

      {progress >= 95 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-6 py-5 text-[9px] text-white/35">
          <span>Island Flame © 2026</span>
          <span>
            {edits.whatsapp
              ? "WhatsApp Order Support"
              : "Delivered with SLYDE"}
          </span>
        </div>
      )}
    </div>
  );
}

function FashionSite({
  scenario,
  progress,
  edits,
}: {
  scenario: SimulatorScenarioDefinition;
  progress: number;
  edits: EditFlags;
}) {
  return (
    <div className="min-h-[650px] bg-[#f5f0e8] text-[#111]">

      {progress >= 22 && (
        <div className="flex items-center justify-between border-b border-black/5 px-6 py-5">
          <div className="font-black tracking-[.24em]">
            AURA876
          </div>

          <div className="flex gap-4 text-[9px] uppercase text-black/40">
            <span>Shop</span>
            <span>New</span>
            <span>Cart</span>
          </div>
        </div>
      )}

      {progress >= 40 && (
        <div
          className={`grid min-h-[330px] items-center gap-5 px-7 py-12 md:grid-cols-2 ${
            edits.darkerHero
              ? "bg-black text-white"
              : ""
          }`}
        >
          <div>
            <div className="text-[9px] font-black uppercase tracking-[.3em] text-[#987b52]">
              New Collection
            </div>

            <h3 className="mt-4 text-5xl font-black leading-[.9]">
              Island
              <br />
              Modern.
            </h3>

            <p className="mt-5 max-w-sm text-xs leading-5 opacity-50">
              Contemporary Caribbean fashion made for effortless
              confidence.
            </p>

            <button className="mt-6 rounded-full bg-black px-5 py-3 text-[9px] font-black uppercase text-white">
              Shop Collection
            </button>
          </div>

          <div
            style={{
              background: `linear-gradient(135deg, ${scenario.primary}, #ebe0cf)`,
            }}
            className="min-h-[250px] rounded-[24px]"
          />
        </div>
      )}

      {progress >= 58 && (
        <div className="px-6 py-8">

          <div className="text-lg font-black">
            New Arrivals
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3">
            {["Linen Edit", "Studio Set", "Sunday Dress"].map(
              (item, index) => (
                <div key={item}>
                  <div
                    className="aspect-[.82] rounded-xl"
                    style={{
                      background:
                        index === 0
                          ? "#ddd0bd"
                          : index === 1
                          ? "#c9b493"
                          : "#ede4d7",
                    }}
                  />

                  <div className="mt-2 text-[10px] font-black">
                    {item}
                  </div>

                  <div className="text-[9px] text-black/40">
                    JMD ${(index + 2) * 4500}
                  </div>
                </div>
              )
            )}
          </div>

        </div>
      )}

      {edits.testimonials && (
        <div className="mx-6 mb-6 rounded-2xl bg-white p-5 text-xs">
          “The easiest way I&apos;ve ever shopped local fashion.”
        </div>
      )}

      {progress >= 95 && (
        <div className="border-t border-black/10 px-6 py-5 text-[9px] text-black/35">
          Aura876 • Kingston, Jamaica
        </div>
      )}

    </div>
  );
}

function VillaSite({
  progress,
  edits,
}: {
  scenario: SimulatorScenarioDefinition;
  progress: number;
  edits: EditFlags;
}) {
  return (
    <div className="min-h-[650px] bg-[#f3eee5] text-[#13323c]">

      {progress >= 22 && (
        <div className="flex items-center justify-between px-6 py-5">
          <div className="font-black tracking-[.18em]">
            AZURE COVE
          </div>

          <div className="hidden gap-4 text-[9px] uppercase sm:flex">
            <span>Stay</span>
            <span>Experiences</span>
            <span>Book</span>
          </div>
        </div>
      )}

      {progress >= 40 && (
        <div
          className={`mx-4 overflow-hidden rounded-[28px] ${
            edits.darkerHero
              ? "bg-[#031b22]"
              : "bg-[#0b7185]"
          } px-7 py-16 text-white`}
        >

          <div className="max-w-md">

            <div className="text-[9px] font-black uppercase tracking-[.3em] text-[#d9c9a9]">
              Negril • Jamaica
            </div>

            <h3 className="mt-4 text-5xl font-black leading-[.92]">
              Your private
              <br />
              Caribbean escape.
            </h3>

            <p className="mt-5 text-xs leading-5 text-white/60">
              Ocean views, private luxury and unforgettable
              Jamaican hospitality.
            </p>

            <button className="mt-6 rounded-full bg-white px-5 py-3 text-[9px] font-black uppercase text-[#0b7185]">
              Check Availability
            </button>

          </div>

        </div>
      )}

      {progress >= 58 && (
        <div className="grid gap-3 px-5 py-7 sm:grid-cols-3">
          {[
            "Ocean Suite",
            "Private Pool",
            "Sunset Terrace",
          ].map((item) => (
            <div key={item}>
              <div className="aspect-[1.2] rounded-2xl bg-gradient-to-br from-[#a6d6da] to-[#e6d2ac]" />
              <div className="mt-2 text-[10px] font-black">
                {item}
              </div>
            </div>
          ))}
        </div>
      )}

      {progress >= 72 && (
        <div className="mx-5 mb-7 grid gap-3 rounded-2xl bg-white p-5 sm:grid-cols-3">
          <div>
            <div className="text-[8px] uppercase text-black/30">
              Check in
            </div>
            <div className="mt-1 text-[10px] font-black">
              Select date
            </div>
          </div>

          <div>
            <div className="text-[8px] uppercase text-black/30">
              Guests
            </div>
            <div className="mt-1 text-[10px] font-black">
              2 guests
            </div>
          </div>

          <button className="rounded-xl bg-[#0b7185] px-4 py-3 text-[9px] font-black text-white">
            Search Stay
          </button>
        </div>
      )}

      {edits.testimonials && (
        <div className="mx-5 mb-6 rounded-2xl bg-white p-5 text-xs">
          “A private slice of paradise.”
        </div>
      )}

    </div>
  );
}

function BusinessSite({
  progress,
  edits,
}: {
  scenario: SimulatorScenarioDefinition;
  progress: number;
  edits: EditFlags;
}) {
  return (
    <div className="min-h-[650px] bg-[#f5f5f2] text-[#17191a]">

      {progress >= 22 && (
        <div className="flex items-center justify-between bg-[#151718] px-6 py-5 text-white">
          <div className="font-black tracking-[.16em]">
            STONECRAFT
          </div>

          <div className="hidden gap-4 text-[9px] uppercase text-white/50 sm:flex">
            <span>Services</span>
            <span>Projects</span>
            <span>Quote</span>
          </div>
        </div>
      )}

      {progress >= 40 && (
        <div
          className={`px-7 py-16 text-white ${
            edits.darkerHero
              ? "bg-black"
              : "bg-[#202325]"
          }`}
        >
          <div className="max-w-xl">

            <div className="text-[9px] font-black uppercase tracking-[.3em] text-[#d5a84b]">
              Built with precision
            </div>

            <h3 className="mt-4 text-5xl font-black leading-[.94]">
              Building spaces
              <br />
              that endure.
            </h3>

            <p className="mt-5 max-w-md text-xs leading-5 text-white/50">
              Construction, renovation and project delivery
              engineered around quality.
            </p>

            <button className="mt-6 rounded-full bg-[#d5a84b] px-5 py-3 text-[9px] font-black uppercase text-black">
              Request a Quote
            </button>

          </div>
        </div>
      )}

      {progress >= 58 && (
        <div className="px-6 py-8">

          <div className="text-lg font-black">
            Selected Projects
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="aspect-[1.4] rounded-2xl bg-[#c9c7c1]" />
            <div className="aspect-[1.4] rounded-2xl bg-[#a9aaa6]" />
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              "Residential",
              "Commercial",
              "Renovations",
            ].map((item) => (
              <div
                key={item}
                className="rounded-xl border border-black/5 bg-white p-4 text-[10px] font-black"
              >
                {item}
              </div>
            ))}
          </div>

        </div>
      )}

      {edits.testimonials && (
        <div className="mx-6 mb-7 rounded-2xl bg-white p-5 text-xs shadow-sm">
          “Professional from planning to final handover.”
        </div>
      )}

    </div>
  );
}

function SaasSite({
  progress,
  edits,
}: {
  scenario: SimulatorScenarioDefinition;
  progress: number;
  edits: EditFlags;
}) {
  return (
    <div className="min-h-[650px] bg-[#090b16] text-white">

      {progress >= 22 && (
        <div className="flex items-center justify-between border-b border-white/5 px-6 py-5">
          <div className="font-black tracking-[.16em]">
            LEDGERLY
          </div>

          <div className="flex gap-4 text-[9px] text-white/40">
            <span>Product</span>
            <span>Pricing</span>
            <span>Login</span>
          </div>
        </div>
      )}

      {progress >= 40 && (
        <div
          className={`px-7 py-14 ${
            edits.darkerHero
              ? "bg-black"
              : ""
          }`}
        >

          <div className="mx-auto max-w-xl text-center">

            <div className="text-[9px] font-black uppercase tracking-[.3em] text-[#7c68ff]">
              Smarter financial operations
            </div>

            <h3 className="mt-4 text-5xl font-black leading-[.93]">
              Finance without
              <br />
              the friction.
            </h3>

            <p className="mx-auto mt-5 max-w-md text-xs leading-5 text-white/45">
              One intelligent workspace for accounting,
              reporting and business visibility.
            </p>

            <button className="mt-6 rounded-full bg-[#7c68ff] px-5 py-3 text-[9px] font-black uppercase">
              Start Free
            </button>

          </div>

        </div>
      )}

      {progress >= 58 && (
        <div className="mx-6 rounded-2xl border border-white/10 bg-white/[.04] p-5">

          <div className="flex items-center justify-between">
            <div className="text-xs font-black">
              Financial Overview
            </div>
            <div className="text-[8px] text-[#52d6ff]">
              ● LIVE
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3">
            {[
              "$42.8K Revenue",
              "$19.2K Expenses",
              "$23.6K Net",
            ].map((item) => (
              <div
                key={item}
                className="rounded-xl bg-white/[.05] p-4 text-[9px]"
              >
                {item}
              </div>
            ))}
          </div>

          <div className="mt-4 h-24 rounded-xl bg-gradient-to-r from-[#7c68ff]/20 to-[#52d6ff]/10" />

        </div>
      )}

      {edits.payments && (
        <div className="mx-6 mt-4 rounded-xl border border-[#7c68ff]/20 bg-[#7c68ff]/10 p-4 text-[10px]">
          Subscription payments enabled.
        </div>
      )}

    </div>
  );
}
