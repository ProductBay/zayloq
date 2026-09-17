import { EarlyAccessForm } from "@/components/zayloq/forms/early-access-form";

export function EarlyAccessSection() {
  return (
    <section id="access" className="mx-auto max-w-7xl px-5 pb-28 pt-10">

      <div className="relative overflow-hidden rounded-[38px] border border-white/[.08] bg-white/[.025] p-7 md:p-12 lg:p-16">

        <div className="absolute inset-0 bg-gradient-to-br from-[#007BFF]/10 via-transparent to-[#00D4C6]/10" />

        <div className="relative grid gap-14 lg:grid-cols-[.9fr_1.1fr] lg:items-center">

          <div>

            <div className="text-xs font-black uppercase tracking-[0.35em] text-[#00D4C6]">
              Zayloq Pioneer
            </div>

            <h2 className="mt-6 text-4xl font-black tracking-[-0.045em] md:text-6xl">
              Be among the first
              <br />
              <span className="text-white/30">
                to build differently.
              </span>
            </h2>

            <p className="mt-6 max-w-lg text-base leading-7 text-white/45">
              Join the Zayloq early-access community and help shape an AI
              creation platform built for Caribbean businesses and ready for
              the world.
            </p>

            <div className="mt-8 space-y-3 text-sm text-white/40">

              <div>✓ Early product access</div>
              <div>✓ Private beta invitations</div>
              <div>✓ Pioneer profile status</div>
              <div>✓ New-feature previews</div>

            </div>

          </div>

          <div className="z-glass rounded-[28px] p-5 md:p-7">

            <EarlyAccessForm />

          </div>

        </div>

      </div>

    </section>
  );
}
